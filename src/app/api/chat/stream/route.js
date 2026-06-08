import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Chat from '@/models/Chat';
import Project from '@/models/Project';
import UserMemory from '@/models/UserMemory';
import { getGeminiResponseStream } from '@/lib/providers/gemini';
import { extractFileContent } from '@/app/actions/fileActions';
import { checkUsageLimit, getModelByPlan, checkFeatureAccess, isModelAllowed } from '@/lib/core/subscription';
import { getSessionUser } from '@/lib/core/session';

function sanitizeUserContent(text) {
  if (!text) return "";
  return text
    .replace(/(?:ignore|disregard|skip|forget|delete|reset)\b.*?\b(?:instructions|prompt|rules|context|previous)/gi, "[INSTRUCTION_FILTERED]")
    .replace(/\b(system prompt|assistant:|developer:|user:|act as|you are a|instruction:|output:|input:|respond as)\b/gi, "[KEYWORD_FILTERED]")
    .replace(/[^\x20-\x7E\s\r\n]/g, ""); 
}

const rateLimitMap = new Map();
function isRateLimited(userId) {
  const now = Date.now();
  const limitWindow = 10000; // 10 detik
  const maxRequests = 3; // Max 3 request per 10 detik
  
  if (!rateLimitMap.has(userId)) {
    rateLimitMap.set(userId, { count: 1, firstRequest: now });
    return false;
  }
  
  const record = rateLimitMap.get(userId);
  if (now - record.firstRequest > limitWindow) {
    rateLimitMap.set(userId, { count: 1, firstRequest: now });
    return false;
  }
  
  record.count += 1;
  if (record.count > maxRequests) return true;
  return false;
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    let prompt = formData.get('prompt') || '';
    const skipSave = formData.get('skipSave') === 'true';
    const file = formData.get('file');
    const projectId = formData.get('projectId');
    const chatId = formData.get('chatId') || `chat_${Date.now()}`;
    const requestedModel = formData.get('modelId');

    if (!prompt && !file) return NextResponse.json({ error: "Prompt kosong!" }, { status: 400 });

    await dbConnect();
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Sesi berakhir. Silakan login kembali." }, { status: 401 });

    const userId = user._id.toString();

    if (isRateLimited(userId)) {
      return NextResponse.json({ error: "Terlalu banyak request. Harap tunggu beberapa detik." }, { status: 429 });
    }

    const [usage, project] = await Promise.all([
      checkUsageLimit(user),
      projectId ? Project.findOne({ _id: projectId, userId }).lean() : Promise.resolve(null)
    ]);

    if (!usage.allowed) {
      return NextResponse.json({ error: `Batas pesan harian tercapai (${usage.limit} pesan/hari).` }, { status: 403 });
    }

    let fileParts = [];
    let agentId = project?.agentId || 'default';

    const [hasMemoryAccess, hasImageAccess, hasFileAccess] = await Promise.all([
      checkFeatureAccess(user, 'long_memory'),
      checkFeatureAccess(user, 'image_upload'),
      checkFeatureAccess(user, 'file_upload')
    ]);

    if (file && file.size > 0) {
      const isImage = file.type.startsWith('image/');
      const hasAccess = isImage ? hasImageAccess : hasFileAccess;

      if (!hasAccess) {
        return NextResponse.json({ error: isImage ? "Upload gambar hanya tersedia untuk pengguna Premium." : "Upload file hanya tersedia untuk pengguna Premium." }, { status: 403 });
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
        formData.append('userId', userId);
        const extractionResult = await extractFileContent(formData);
        if (extractionResult.success) {
          const sanitizedDocContent = sanitizeUserContent(extractionResult.content);
          prompt = `[Konteks Dokumen: ${extractionResult.fileName}]\n${sanitizedDocContent}\n\nPertanyaan: ${prompt || 'Tolong ringkas dokumen ini.'}`;
        } else {
          return NextResponse.json({ error: extractionResult.error }, { status: 400 });
        }
      }
    }

    if (hasMemoryAccess) {
      const memories = await UserMemory.find({ user_id: userId }).limit(5).sort({ created_at: -1 }).lean();
      if (memories.length > 0) {
        const memoryContext = memories.map(m => `[Memory: ${m.title}]\n${m.content}`).join('\n\n');
        prompt = `[Konteks Memori Proyek]\n${memoryContext}\n\n${prompt}`;
      }

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

    let modelName = requestedModel || getModelByPlan(user.current_plan);
    if (requestedModel && !isModelAllowed(user.current_plan, requestedModel)) {
       modelName = getModelByPlan(user.current_plan);
    }

    const previousMessages = await Chat.find({ userId, chatId }).sort({ createdAt: -1 }).limit(50).lean();
    previousMessages.reverse();

    const historyMessages = skipSave ? previousMessages.slice(0, -1) : previousMessages;
    const historyForGemini = historyMessages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    if (!skipSave) {
      await new Chat({ role: 'user', text: prompt, userId, chatId, projectId }).save();
    }

    let aiResponse = formData.get('preGeneratedResponse');

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = "";

          if (aiResponse) {
             // If we already have a response, just stream it out
             const chunks = aiResponse.split(/(?<=\s+)/);
             for (const chunk of chunks) {
                fullResponse += chunk;
                controller.enqueue(new TextEncoder().encode(chunk));
                await new Promise(r => setTimeout(r, 20)); // simulated streaming
             }
          } else {
             const aiStream = await getGeminiResponseStream(prompt, historyForGemini, fileParts, agentId, modelName, {
               userId, chatId, projectId, userProfile: user.profile, userName: user.name,
             });

             for await (const chunk of aiStream) {
               fullResponse += chunk;
               controller.enqueue(new TextEncoder().encode(chunk));
             }
          }
          
          if (!skipSave && fullResponse.length > 0) {
             await new Chat({ role: 'model', text: fullResponse, userId, chatId, projectId }).save();
          }
        } catch (err) {
          console.error("Stream error:", err);
          controller.enqueue(new TextEncoder().encode("\n\n⚠️ Terjadi kesalahan saat generate stream."));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain',
        'Transfer-Encoding': 'chunked'
      }
    });

  } catch (error) {
    console.error("API Chat Stream Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal" }, { status: 500 });
  }
}
