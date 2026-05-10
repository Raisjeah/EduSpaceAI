'use server';
import dbConnect from '@/lib/mongodb';
import Chat from '@/models/Chat';
import Project from '@/models/Project';
import UserMemory from '@/models/UserMemory';
import { getGeminiResponse } from '@/lib/gemini';
import { extractFileContent } from './fileActions';
import { checkUsageLimit, getModelByPlan, TIERS } from '@/lib/subscription';
import { getSessionUser } from '@/lib/session';

// 1. Fungsi Simpan Chat
export async function saveChat(role, text, userId, chatId, projectId = null) {
  try {
    await dbConnect();
    const newChat = new Chat({ 
      role, 
      text, 
      userId, 
      chatId: chatId || 'default',
      projectId
    });
    await newChat.save();
    return { success: true };
  } catch (error) {
    console.error("Gagal simpan chat ke DB:", error);
    return { success: false };
  }
}

// 2. Fungsi Kirim Pesan
export async function sendMessage(formData) {
  let prompt = formData.get('prompt') || '';
  const skipSave = formData.get('skipSave') === 'true';
  const file = formData.get('file');
  const projectId = formData.get('projectId');
  const chatId = formData.get('chatId') || `chat_${Date.now()}`;

  if (!prompt && !file) return { error: "Prompt kosong!" };

  try {
    await dbConnect();
    const user = await getSessionUser();
    if (!user) return { success: false, error: "Sesi berakhir. Silakan login kembali." };

    const userId = user._id.toString();

    // A. Check Usage Limit
    const usage = await checkUsageLimit(user);
    if (!usage.allowed) {
      return {
        success: false,
        error: `Batas pesan harian tercapai (${usage.limit} pesan/hari). Silakan upgrade ke paket yang lebih tinggi.`
      };
    }

    let fileParts = [];
    let agentId = 'default';

    // Jika ada projectId, ambil agentId dari project
    if (projectId) {
      const project = await Project.findById(projectId).lean();
      if (project) {
        agentId = project.agentId;
      }
    }

    // B. Handle File Upload
    if (file && file.size > 0) {
      if (user.current_plan === TIERS.FREE) {
        return { success: false, error: "Upload file hanya tersedia untuk pengguna Premium." };
      }

      if (file.type.startsWith('image/')) {
        const bytes = await file.arrayBuffer();
        const base64Data = Buffer.from(bytes).toString('base64');
        fileParts.push({
          inlineData: {
            data: base64Data,
            mimeType: file.type
          }
        });
        if (!prompt) prompt = "Tolong jelaskan gambar ini.";
      } else {
        // fileActions will handle size check with getSessionUser internally or we can pass it
        formData.append('userId', userId);
        const extractionResult = await extractFileContent(formData);
        if (extractionResult.success) {
          prompt = `[Konteks Dokumen: ${extractionResult.fileName}]\n${extractionResult.content}\n\nPertanyaan: ${prompt || 'Tolong ringkas dokumen ini.'}`;
        } else {
          return { success: false, error: extractionResult.error };
        }
      }
    }

    // C. Long-term Memory for ULTRA
    if (user.current_plan === TIERS.ULTRA) {
      const memories = await UserMemory.find({ user_id: userId }).limit(5).sort({ created_at: -1 }).lean();
      if (memories.length > 0) {
        const memoryContext = memories.map(m => `[Memory: ${m.title}]\n${m.content}`).join('\n\n');
        prompt = `[Konteks Memori Proyek]\n${memoryContext}\n\n${prompt}`;
      }

      // Logic to automatically save memory for ULTRA
      if (prompt.toLowerCase().includes("simpan ini ke memori") || prompt.toLowerCase().includes("ingat ini")) {
        const memoryContent = prompt.replace(/simpan ini ke memori|ingat ini/gi, '').trim();
        if (memoryContent) {
           await UserMemory.create({
             user_id: userId,
             title: `Memory ${new Date().toLocaleDateString()}`,
             content: memoryContent
           });
        }
      }
    }

    // D. Model Routing
    const modelName = getModelByPlan(user.current_plan);

    // E. History
    const previousMessages = await Chat.find({ userId, chatId })
      .sort({ createdAt: 1 })
      .lean();

    const historyMessages = skipSave ? previousMessages.slice(0, -1) : previousMessages;

    const historyForGemini = historyMessages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    if (!skipSave) {
      await saveChat('user', prompt, userId, chatId, projectId);
    }

    // F. Get AI Response
    const aiResponse = await getGeminiResponse(prompt, historyForGemini, fileParts, agentId, modelName);

    await saveChat('model', aiResponse, userId, chatId, projectId);

    return { 
      success: true, 
      aiResponse, 
      chatId 
    };

  } catch (error) {
    console.error("Error di sendMessage:", error);
    return { success: false, error: "Dosen AI sedang gangguan." };
  }
}

// 3. Fungsi List History untuk Sidebar
export async function getChatHistory(userId, projectId = null) {
  if (!userId) return [];
  try {
    await dbConnect();
    const match = { userId };
    if (projectId) {
      match.projectId = projectId;
    } else {
      match.projectId = { $in: [null, undefined] };
    }

    const chats = await Chat.aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $group: {
          _id: "$chatId",
          lastMessage: { $first: "$text" },
          createdAt: { $first: "$createdAt" }
      }},
      { $sort: { createdAt: -1 } }
    ]);

    return chats.map(chat => ({
      _id: chat._id,
      text: chat.lastMessage.length > 30 
        ? chat.lastMessage.substring(0, 30) + "..." 
        : chat.lastMessage,
      createdAt: chat.createdAt?.toString(),
    }));
  } catch (error) {
    console.error("Gagal ambil history:", error);
    return [];
  }
}

// 4. Fungsi Ambil Detail Chat saat History diklik
export async function getChatDetails(chatId, userId) {
  try {
    await dbConnect();
    const messages = await Chat.find({ chatId, userId }).sort({ createdAt: 1 }).lean();
    return messages.map(m => ({
        ...m,
        _id: m._id.toString()
    }));
  } catch (error) {
    return [];
  }
}
