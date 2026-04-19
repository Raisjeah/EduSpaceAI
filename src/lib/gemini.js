const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`;

async function fetchGemini(prompt, attempt = 1) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // timeout 15 detik

    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: "Kamu adalah EduSpaceAI. Jawab ringkas." }] },
        generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, AI sedang sibuk.";
  } catch (error) {
    console.error(`Gemini attempt ${attempt} failed:`, error.message);
    if (attempt < 3) {
      // Tunggu 2 detik lalu coba lagi
      await new Promise(resolve => setTimeout(resolve, 2000));
      return fetchGemini(prompt, attempt + 1);
    }
    return "⚠️ Gagal terhubung ke server AI setelah beberapa percobaan. Coba lagi nanti.";
  }
}

export async function getGeminiResponse(prompt) {
  return fetchGemini(prompt);
}
