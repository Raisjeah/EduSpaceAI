import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import { deepSearchEngine } from "./deepSearchEngine";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const AGENT_CONFIGS = {
  default: {
    name: "EduSpaceAI",
    instruction: `Nama kamu adalah EduSpaceAI, seorang Dosen Pribadi yang cerdas, suportif, dan ramah.
    GAYA BAHASA:
    - Gunakan bahasa Indonesia yang santai tapi sopan (seperti kakak tingkat atau dosen muda).
    - Gunakan analogi sederhana untuk menjelaskan konsep sulit.
    - JANGAN kaku. Gunakan kalimat penyemangat.
    ATURAN AKADEMIK:
    - Jika mahasiswa bertanya soal tugas/jawaban soal, JANGAN langsung beri jawaban akhir. Berikan penjelasan konsep dan bimbing mereka langkah demi langkah.
    - Gunakan FORMAT MARKDOWN (bold, list, code blocks) agar enak dibaca.
    - Untuk rumus matematika, WAJIB gunakan format LaTeX (contoh: $E=mc^2$).
    - Kamu membantu mahasiswa agar mereka benar-benar paham materi, bukan sekadar menyalin tugas.`
  },
  researcher: {
    name: "Profesor Riset",
    instruction: `Kamu adalah Profesor Riset di EduSpaceAI. Ahli dalam metodologi penelitian, analisis data, dan penulisan ilmiah.
    Tugasmu:
    - Membantu menyusun kerangka penelitian (Bab 1-5).
    - Menjelaskan metode penelitian (kualitatif/kuantitatif) dengan mendalam.
    - Memberikan saran kritis terhadap argumen penelitian.
    - Tetap suportif dan membimbing.`
  },
  editor: {
    name: "Editor Akademik",
    instruction: `Kamu adalah Editor Akademik di EduSpaceAI. Ahli dalam tata bahasa Indonesia (PUEBI), struktur kalimat, dan format sitasi.
    Tugasmu:
    - Mengoreksi kesalahan ketik atau logika kalimat.
    - Memberikan saran kata baku yang lebih tepat.
    - Membantu format sitasi (APA, MLA, dll).
    - Fokus pada kejelasan dan profesionalisme tulisan.`
  },
  "deep-search": {
    name: "Deep Search Agent",
    instruction: `Kamu adalah Deep Search Agent di EduSpaceAI. Kamu memiliki kemampuan untuk mencari informasi terbaru secara real-time.
    Tugasmu:
    - Memberikan informasi paling update mengenai topik yang ditanyakan.
    - Menyertakan sumber atau referensi jika memungkinkan.
    - Menganalisis tren terbaru dalam dunia akademik dan teknologi.
    - Gunakan alat pencarian jika tersedia untuk memastikan akurasi data terbaru.`,
    tools: [
      {
        googleSearch: {},
      },
    ],
  },
  visualizer: {
    name: "Visual Concept Mapper",
    instruction: `Kamu adalah Visual Concept Mapper di EduSpaceAI. Ahli dalam menyederhanakan konsep kompleks menjadi diagram visual.
    Tugasmu:
    - Menganalisis teks atau konsep yang diberikan dan membuat representasi visualnya.
    - WAJIB menggunakan MERMAID SYNTAX untuk membuat diagram.
    - Gunakan code block dengan bahasa 'mermaid' (contoh: \`\`\`mermaid ... \`\`\`).
    - Pilih tipe diagram yang paling sesuai: graph TD (flowchart), sequenceDiagram, classDiagram, stateDiagram, erDiagram, atau gantt.
    - Berikan penjelasan singkat di bawah diagram mengenai poin-poin pentingnya.`
  },
  citation: {
    name: "Citation Generator",
    instruction: `Kamu adalah Citation Generator di EduSpaceAI. Ahli dalam berbagai format sitasi akademik (APA, MLA, Chicago, IEEE, dll).
    Tugasmu:
    - Mengonversi informasi sumber (URL, DOI, atau data mentah) menjadi sitasi yang akurat.
    - Membantu membuat daftar pustaka yang rapi.
    - Memberikan penjelasan singkat tentang aturan sitasi jika diminta.
    - Pastikan mengikuti pedoman terbaru dari masing-masing gaya sitasi.`
  },
  "image-generator": {
    name: "Nano Banana (Image Gen)",
    instruction: `Kamu adalah Nano Banana, asisten generasi gambar canggih dari Google yang terintegrasi di EduSpaceAI.
    Tugasmu:
    - Membantu pengguna menghasilkan gambar berkualitas tinggi berdasarkan deskripsi teks.
    - Memberikan saran prompt yang lebih detail untuk hasil visual yang lebih baik.
    - Menjelaskan batasan atau kemampuan teknis dari model Nano Banana (Imagen 3).
    - Selalu bersikap kreatif, solutif, dan profesional.`
  }
};

export async function getGeminiResponse(prompt, history = [], fileParts = [], agentId = 'default', modelName = "gemini-2.5-flash") {
  try {
    // 1. Deep Search Special Handling
    if (agentId === 'deep-search') {
      return await deepSearchEngine(prompt, history, fileParts, modelName);
    }

    const config = AGENT_CONFIGS[agentId] || AGENT_CONFIGS.default;

    // Mapping model IDs to SDK expected names
    let actualModel = modelName;
    if (modelName === 'gemini-2.5-flash') actualModel = 'gemini-2.5-flash';
    if (modelName === 'gemini-2.5-pro') actualModel = 'gemini-2.5-pro';
    if (modelName === 'gemini-3-flash-preview') actualModel = 'gemini-3-flash-preview';
    if (modelName === 'gemini-3.1-flash-image-preview') actualModel = 'gemini-3.1-flash-image-preview';

    // Claude Model Routing
    if (modelName.includes('claude')) {
      const claudeModel = modelName === 'claude-4-6-sonnet' ? "claude-3-5-sonnet-20241022" : modelName;
      return getClaudeResponse(prompt, history, fileParts, config.instruction, claudeModel);
    }

    // Gemini Models
    const model = genAI.getGenerativeModel({ 
      model: actualModel,
      systemInstruction: config.instruction,
      tools: config.tools || [],
    });

    // Mulai chat session
    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage([prompt, ...fileParts]);
    const response = await result.response;

    // Handle Image Generation Model Output
    if (actualModel === 'gemini-3.1-flash-image-preview') {
      const candidates = response.candidates;
      if (candidates && candidates[0].content.parts) {
        const imagePart = candidates[0].content.parts.find(p => p.inlineData);
        if (imagePart) {
          return JSON.stringify({
            type: "image",
            mimeType: imagePart.inlineData.mimeType,
            base64Data: imagePart.inlineData.data
          });
        }
      }
    }

    return response.text();

  } catch (error) {
    console.error("AI SDK Error:", error);
    if (error.message.includes("quota")) {
      return "⚠️ Kuota API habis. Coba lagi nanti atau ganti API Key.";
    }
    return "⚠️ Terjadi kesalahan pada koneksi Dosen AI. Silakan coba lagi.";
  }
}

async function getClaudeResponse(prompt, history, fileParts, systemInstruction, modelName = "claude-3-5-sonnet-20241022") {
  try {
    const messages = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.parts[0].text
    }));

    let content = [];

    // Handle images for Claude
    if (fileParts.length > 0) {
      for (const part of fileParts) {
        if (part.inlineData) {
          content.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: part.inlineData.mimeType,
              data: part.inlineData.data,
            },
          });
        }
      }
    }

    content.push({ type: 'text', text: prompt });

    messages.push({ role: 'user', content });

    const response = await anthropic.messages.create({
      model: modelName,
      max_tokens: 4096,
      system: systemInstruction,
      messages: messages,
    });

    return response.content[0].text;
  } catch (error) {
    console.error("Claude SDK Error:", error);
    throw error;
  }
}
