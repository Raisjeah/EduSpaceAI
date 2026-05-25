import { GoogleGenAI } from "@google/genai";
import { deepSearchEngine } from "@/lib/providers/deepSearch";
import { getClaudeResponse } from "@/lib/providers/claude";
import { AGENT_IDS, GEMINI_MODELS, CLAUDE_MODELS, DEFAULT_MODEL, MAX_OUTPUT_TOKENS } from "@/lib/constants";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const DEFAULT_GEMINI_MODEL = DEFAULT_MODEL;
const DEFAULT_CLAUDE_MODEL = CLAUDE_MODELS.SONNET;

function resolveModel(modelName) {
  if (typeof modelName !== 'string' || !modelName) {
    return { provider: 'gemini', sdkModel: DEFAULT_GEMINI_MODEL };
  }

  const isClaude = Object.values(CLAUDE_MODELS).includes(modelName);
  if (isClaude) {
    return { provider: 'claude', sdkModel: modelName };
  }

  if (modelName.startsWith('claude')) {
    return { provider: 'claude', sdkModel: DEFAULT_CLAUDE_MODEL };
  }

  const isGemini = Object.values(GEMINI_MODELS).includes(modelName);
  if (isGemini) {
    return { provider: 'gemini', sdkModel: modelName };
  }

  return { provider: 'gemini', sdkModel: DEFAULT_GEMINI_MODEL };
}

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
    instruction: `Kamu adalah Nano Banana, asisten generasi gambar canggih dari Google yang terintegrated di EduSpaceAI.
    Tugasmu:
    - Membantu pengguna menghasilkan gambar berkualitas tinggi berdasarkan deskripsi teks.
    - Memberikan saran prompt yang lebih detail untuk hasil visual yang lebih baik.
    - Menjelaskan batasan atau kemampuan teknis dari model Nano Banana (Imagen 3).
    - Selalu bersikap kreatif, solutif, dan profesional.`
  }
};

export async function getGeminiResponse(prompt, history = [], fileParts = [], agentId = AGENT_IDS.DEFAULT, modelName = DEFAULT_GEMINI_MODEL) {
  const config = AGENT_CONFIGS[agentId] || AGENT_CONFIGS.default;
  const { provider, sdkModel } = resolveModel(modelName);

  try {
    // 1. Deep Search Special Handling
    if (agentId === AGENT_IDS.DEEP_SEARCH) {
      return await deepSearchEngine(prompt, history, fileParts, sdkModel);
    }

    if (provider === 'claude') {
      return getClaudeResponse(prompt, history, fileParts, config.instruction, sdkModel);
    }

    // Gemini Models
    const chat = ai.chats.create({
      model: sdkModel,
      config: {
        systemInstruction: config.instruction,
        tools: config.tools || [],
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        temperature: 0.7,
      },
      history: history,
    });

    const response = await chat.sendMessage({ message: [prompt, ...fileParts] });

    // Image-generation model output (base64 inline data).
    if (sdkModel === GEMINI_MODELS.IMAGE) {
      const candidates = response.candidates;
      if (candidates && candidates[0]?.content?.parts) {
        const imagePart = candidates[0].content.parts.find((p) => p.inlineData);
        if (imagePart) {
          return JSON.stringify({
            type: "image",
            mimeType: imagePart.inlineData.mimeType,
            base64Data: imagePart.inlineData.data,
          });
        }
      }
    }

    return response.text;
  } catch (error) {
    console.error("AI SDK Error:", error);
    if (typeof error?.message === 'string' && error.message.toLowerCase().includes('quota')) {
      return "⚠️ Kuota API habis. Coba lagi nanti atau ganti API Key.";
    }
    return "⚠️ Terjadi kesalahan pada koneksi Dosen AI. Silakan coba lagi.";
  }
}
