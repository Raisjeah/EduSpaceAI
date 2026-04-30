import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
  }
};

export async function getGeminiResponse(prompt, history = [], fileParts = [], agentId = 'default') {
  try {
    const config = AGENT_CONFIGS[agentId] || AGENT_CONFIGS.default;

    // Gemini Models
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-pro", // Menggunakan model terbaru yang stabil mendukung tools
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

    // Jika menggunakan googleSearch, groundingMetadata mungkin tersedia
    // Tapi untuk output teks sederhana, response.text() sudah cukup.
    return response.text();

  } catch (error) {
    console.error("Gemini SDK Error:", error);
    if (error.message.includes("quota")) {
      return "⚠️ Kuota API habis. Coba lagi nanti atau ganti API Key.";
    }
    return "⚠️ Terjadi kesalahan pada koneksi Dosen AI. Silakan coba lagi.";
  }
}
