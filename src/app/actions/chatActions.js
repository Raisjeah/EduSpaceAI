'use server';
import dbConnect from '@/lib/mongodb';
import Chat from '@/models/Chat';
import Project from '@/models/Project';
import { getGeminiResponse } from '@/lib/gemini';
import { extractFileContent } from './fileActions';

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

// 2. Fungsi Kirim Pesan (Versi SDK Friendly)
export async function sendMessage(formData) {
  const userId = formData.get('userId');
  let prompt = formData.get('prompt') || '';
  const skipSave = formData.get('skipSave') === 'true';
  const file = formData.get('file');
  const projectId = formData.get('projectId');
  // Ambil chatId dari frontend, jika tidak ada buat baru
  const chatId = formData.get('chatId') || `chat_${Date.now()}`;

  if (!prompt && !file) return { error: "Prompt kosong!" };

  try {
    let fileParts = [];
    let agentId = 'default';

    await dbConnect();

    // Jika ada projectId, ambil agentId dari project
    if (projectId) {
      const project = await Project.findById(projectId).lean();
      if (project) {
        agentId = project.agentId;
      }
    }

    // Jika ada file yang diupload
    if (file && file.size > 0) {
      if (file.type.startsWith('image/')) {
        // Handle Image
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
        // Handle Document (PDF, DOCX, etc.)
        const extractionResult = await extractFileContent(formData);
        if (extractionResult.success) {
          prompt = `[Konteks Dokumen: ${extractionResult.fileName}]\n${extractionResult.content}\n\nPertanyaan: ${prompt || 'Tolong ringkas dokumen ini.'}`;
        }
      }
    }

    // Rate Limiting: Max 10 messages per minute
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const messageCount = await Chat.countDocuments({
      userId,
      role: 'user',
      createdAt: { $gte: oneMinuteAgo }
    });

    if (messageCount >= 10) {
      return {
        success: false,
        error: "Batas pesan tercapai (10 pesan/menit). Silakan tunggu sebentar."
      };
    }

    // A. Ambil History untuk Konteks AI (Memory)
    const previousMessages = await Chat.find({ userId, chatId })
      .sort({ createdAt: 1 })
      .lean();

    // B. Format History agar Sesuai dengan SDK (@google/generative-ai)
    // Jika skipSave true, berarti prompt sudah ada di DB (pesan terakhir), jangan masukkan ke history
    const historyMessages = skipSave ? previousMessages.slice(0, -1) : previousMessages;

    const historyForGemini = historyMessages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // C. Simpan pesan User ke Database dulu jika belum ada
    if (!skipSave) {
      await saveChat('user', prompt, userId, chatId, projectId);
    }

    // D. Panggil Gemini SDK
    const aiResponse = await getGeminiResponse(prompt, historyForGemini, fileParts, agentId);

    // E. Simpan respon AI ke Database
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
  try {
    await dbConnect();
    const match = { userId };
    if (projectId) {
      match.projectId = projectId;
    } else {
      // Jika projectId null, ambil chat yang tidak punya projectId atau projectId null (Global Chat)
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
