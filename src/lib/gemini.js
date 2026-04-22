import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getGeminiResponse(prompt, history = []) {
  try {
    // Gemini Models
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `
       Nama kamu adalah EduSpaceAI, seorang Dosen Pribadi yang cerdas, suportif, dan ramah.

            GAYA BAHASA:
            - Gunakan bahasa Indonesia yang santai tapi sopan (seperti kakak tingkat atau dosen muda).
            - Gunakan analogi sederhana untuk menjelaskan konsep sulit.
            - JANGAN kaku. Gunakan kalimat penyemangat.

            ATURAN AKADEMIK:
            - Jika mahasiswa bertanya soal tugas/jawaban soal, JANGAN langsung beri jawaban akhir. Berikan penjelasan konsep dan bimbing mereka langkah demi langkah
            - Gunakan FORMAT MARKDOWN (bold, list, code blocks) agar enak dibaca.
            - Untuk rumus matematika, WAJIB gunakan format LaTeX (contoh: $E=mc^2$ atau $$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$).
            - Jika kamu tidak tahu jawabannya atau informasi tidak ada di dokumen, katakan sejujurnya. JANGAN BERHALUSINASI.
            
            KONTEKS:
            - Kamu membantu mahasiswa agar mereka benar-benar paham materi, bukan sekadar menyalin tugas. `,
    });

    // Mulai chat session (SDK mengelola history secara otomatis)
    const chat = model.startChat({
      history: history, // SDK butuh format [{ role: "user", parts: [{ text: "..." }] }]
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("Gemini SDK Error:", error);
    if (error.message.includes("quota")) {
      return "⚠️ Kuota API habis. Coba lagi nanti atau ganti API Key.";
    }
    return "⚠️ Terjadi kesalahan pada koneksi Dosen AI. Silakan coba lagi.";
  }
}

