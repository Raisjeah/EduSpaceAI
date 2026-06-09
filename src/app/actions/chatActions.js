'use server';
import dbConnect from '@/lib/db/mongodb';
import Chat from '@/models/Chat';
import Project from '@/models/Project';
import UserMemory from '@/models/UserMemory';
import { getGeminiResponse } from '@/lib/providers';
import { extractFileContentLogic } from '@/lib/core/fileParser';
import { checkUsageLimit, getModelByPlan, TIERS, checkFeatureAccess, isModelAllowed, getCachedPlan, checkWindowUsage } from '@/lib/core/subscription';
import { getSessionUser } from '@/lib/core/session';

// Sanitization function for user content to prevent prompt injection
function sanitizeUserContent(text) {
  if (!text) return "";
  return text
    .replace(/(?:ignore|disregard|skip|forget|delete|reset)\b.*?\b(?:instructions|prompt|rules|context|previous)/gi, "[INSTRUCTION_FILTERED]")
    .replace(/\b(system prompt|assistant:|developer:|user:|act as|you are a|instruction:|output:|input:|respond as)\b/gi, "[KEYWORD_FILTERED]")
    .replace(/[^\x20-\x7E\s\r\n]/g, ""); // Remove non-printable characters
}

// 1. Fungsi Simpan Chat
export async function saveChat(role, text, chatId, projectId = null) {
  try {
    const user = await getSessionUser();
    if (!user) return { success: false, error: "Sesi berakhir." };
    const userId = user._id.toString();

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
  const requestedModel = formData.get('modelId');

  if (!prompt && !file) return { error: "Prompt kosong!" };

  try {
    await dbConnect();
    const user = await getSessionUser();
    if (!user) return { success: false, error: "Sesi berakhir. Silakan login kembali." };

    const userId = user._id.toString();

    // A. Parallel Database calls
    const [usage, project] = await Promise.all([
      checkUsageLimit(user),
      projectId ? Project.findOne({ _id: projectId, userId }).lean() : Promise.resolve(null)
    ]);

    if (!usage.allowed) {
      return {
        success: false,
        error: `Batas pesan harian tercapai (${usage.limit} pesan/hari). Silakan upgrade ke paket yang lebih tinggi.`
      };
    }

    let fileParts = [];
    let agentId = project?.agentId || 'default';

    // Cek agent request limit jika menggunakan agent (bukan default)
    if (agentId && agentId !== 'default') {
      const planDoc = await getCachedPlan(user.current_plan);
      if (!planDoc?.agent_enabled) {
        return { success: false, error: 'Fitur AI Agent tidak tersedia di paket Anda.' };
      }
      if (planDoc.agent_requests_per_window !== -1) {
        const agentCheck = await checkWindowUsage(
          userId,
          'agent_request',
          planDoc.agent_window_hours,
          planDoc.agent_requests_per_window,
          1
        );
        if (!agentCheck.allowed) {
          return {
            success: false,
            error: `Batas request Agent tercapai (${planDoc.agent_requests_per_window} req/${planDoc.agent_window_hours} jam). Reset pada ${new Date(agentCheck.windowResetAt).toLocaleTimeString('id-ID')}.`,
          };
        }
      }
    }

    // B. & C. Feature Access & Memory check in parallel
    const [hasMemoryAccess, hasImageAccess, hasFileAccess] = await Promise.all([
      checkFeatureAccess(user, 'long_memory'),
      checkFeatureAccess(user, 'image_upload'),
      checkFeatureAccess(user, 'file_upload')
    ]);

    // B. Handle File Upload
    if (file && file.size > 0) {
      const isImage = file.type.startsWith('image/');
      const hasAccess = isImage ? hasImageAccess : hasFileAccess;

      if (!hasAccess) {
        return {
          success: false,
          error: isImage ? "Upload gambar hanya tersedia untuk pengguna Premium." : "Upload file hanya tersedia untuk pengguna Premium."
        };
      }

      // Cek window limit untuk file upload
      const planDoc = await getCachedPlan(user.current_plan);
      if (planDoc.file_upload_per_window !== -1 && planDoc.file_upload_per_window > 0) {
        const fileCheck = await checkWindowUsage(
          userId,
          'file_upload',
          planDoc.file_upload_window_hours,
          planDoc.file_upload_per_window,
          1
        );
        if (!fileCheck.allowed) {
          return {
            success: false,
            error: `Batas upload file tercapai (${planDoc.file_upload_per_window} file/${planDoc.file_upload_window_hours} jam). Reset pada ${new Date(fileCheck.windowResetAt).toLocaleTimeString('id-ID')}.`,
          };
        }
      }

      if (isImage) {
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
        const extractionResult = await extractFileContentLogic(formData);
        if (extractionResult.success) {
          const sanitizedDocContent = sanitizeUserContent(extractionResult.content);
          prompt = `[Konteks Dokumen: ${extractionResult.fileName}]\n${sanitizedDocContent}\n\nPertanyaan: ${prompt || 'Tolong ringkas dokumen ini.'}`;
        } else {
          return { success: false, error: extractionResult.error };
        }
      }
    }

    // C. Long-term Memory retrieval
    if (hasMemoryAccess) {
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

    // D. Model Routing & Validation
    let modelName = requestedModel || getModelByPlan(user.current_plan);

    // Ensure user has access to the requested model
    if (requestedModel && !isModelAllowed(user.current_plan, requestedModel)) {
       modelName = getModelByPlan(user.current_plan);
    }

    // E. History - Limit to last 50 messages to prevent performance bottleneck
    const previousMessages = await Chat.find({ userId, chatId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    previousMessages.reverse();

    const historyMessages = skipSave ? previousMessages.slice(0, -1) : previousMessages;

    const historyForGemini = historyMessages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const promises = [];
    let aiResponse = formData.get('preGeneratedResponse');

    // F. Get AI Response Promise
    const aiPromise = aiResponse
      ? Promise.resolve(aiResponse)
      : getGeminiResponse(prompt, historyForGemini, fileParts, agentId, modelName, {
          userId,
          chatId,
          projectId,
          userProfile: user.profile,
          userName: user.name,
        }).then(res => { aiResponse = res; return res; });

    promises.push(aiPromise);

    // Prepare User Save promise
    if (!skipSave) {
      promises.push(saveChat('user', prompt, chatId, projectId));
    }

    // Await both simultaneously
    await Promise.all(promises);

    // Fire-and-forget the final save to reduce latency, but MUST include a catch
    if (!skipSave) {
      saveChat('model', aiResponse, chatId, projectId).catch(console.error);
    }

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
export async function getChatHistory(projectId = null) {
  try {
    const user = await getSessionUser();
    if (!user) return [];
    const userId = user._id.toString();

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
      projectId: projectId
    }));
  } catch (error) {
    console.error("Gagal ambil history:", error);
    return [];
  }
}

// 5. Fungsi Hapus History Chat
export async function deleteChatHistory(chatId) {
  try {
    const user = await getSessionUser();
    if (!user) return { success: false, error: "Sesi berakhir." };
    const userId = user._id.toString();

    await dbConnect();
    const result = await Chat.deleteMany({ chatId, userId });

    return {
      success: true,
      deletedCount: result.deletedCount
    };
  } catch (error) {
    console.error("Gagal menghapus history:", error);
    return { success: false, error: "Gagal menghapus percakapan." };
  }
}

// 4. Fungsi Ambil Detail Chat saat History diklik
export async function getChatDetails(chatId) {
  try {
    const user = await getSessionUser();
    if (!user) return [];
    const userId = user._id.toString();

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
