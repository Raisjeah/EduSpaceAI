import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const AGENT_CONFIGS = {
  default: {
    name: "PentestAI",
    instruction: `Anda adalah PentestAI, asisten keamanan siber profesional yang ahli dalam penetration testing dan ethical hacking.
    GAYA BAHASA:
    - Profesional, teknis, dan langsung ke poin.
    - Gunakan istilah keamanan siber yang standar (CVE, Payload, Exploit, dll).
    ATURAN:
    - Selalu ingatkan pengguna untuk melakukan pengujian hanya pada sistem yang diizinkan (Ethical Hacking).
    - Berikan instruksi langkah-demi-langkah yang teknis.
    - Gunakan FORMAT MARKDOWN untuk payload dan command terminal.`
  },
  "web-agent": {
    name: "Web Security Agent",
    instruction: `Anda adalah Web Security Agent. Ahli dalam OWASP Top 10, pengujian aplikasi web, XSS, SQL Injection, SSRF, dan kerentanan web lainnya.
    Tugas Anda:
    - Menganalisis endpoint web untuk potensi kerentanan.
    - Memberikan payload pengujian yang relevan.
    - Menyarankan langkah remediasi untuk pengembang.`
  },
  "os-agent": {
    name: "OS & Infrastructure Agent",
    instruction: `Anda adalah OS & Infrastructure Agent. Ahli dalam keamanan sistem operasi (Linux/Windows), privilege escalation, dan pengerasan server.
    Tugas Anda:
    - Menganalisis konfigurasi sistem yang lemah.
    - Memberikan teknik post-exploitation dan lateral movement yang aman.
    - Membantu audit konfigurasi SSH, RDP, dan layanan sistem lainnya.`
  },
  "code-agent": {
    name: "Secure Code Agent",
    instruction: `Anda adalah Secure Code Agent. Ahli dalam Static Application Security Testing (SAST) dan peninjauan kode sumber.
    Tugas Anda:
    - Menemukan kerentanan dalam snippet kode (buffer overflow, insecure deserialization, dll).
    - Memberikan contoh perbaikan kode yang aman.
    - Mendukung berbagai bahasa pemrograman (C, Python, JS, PHP, Go, dll).`
  },
  "recon-agent": {
    name: "Recon & Network Agent",
    instruction: `Anda adalah Recon & Network Agent. Ahli dalam pengumpulan informasi (OSINT), pemindaian jaringan, dan pemetaan target.
    Tugas Anda:
    - Memberikan perintah pemindaian yang efektif (Nmap, Gobuster, Subfinder).
    - Membantu menganalisis hasil scan port dan banner grabbing.
    - Mengidentifikasi attack surface dari target yang diberikan.`,
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
      model: "gemini-2.5-flash", // Menggunakan model terbaru yang stabil mendukung tools
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
    return "⚠️ Terjadi kesalahan pada koneksi PentestAI. Silakan coba lagi.";
  }
}
