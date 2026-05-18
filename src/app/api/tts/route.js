import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Teks diperlukan" }, { status: 400 });
    }

    // Gunakan model gemini-2.5-flash-tts sesuai permintaan
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-tts",
    });

    // Panggil model dengan konfigurasi suara "Kore"
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Kore",
            },
          },
        },
      },
    });

    const response = await result.response;

    // Ambil bagian audio dari respons
    const audioPart = response.candidates?.[0]?.content?.parts?.find(
      (part) => part.inlineData && part.inlineData.mimeType.startsWith("audio/")
    );

    if (!audioPart) {
      console.error("Gemini TTS Response:", JSON.stringify(response));
      throw new Error("Gagal mendapatkan data audio dari Gemini");
    }

    const audioBuffer = Buffer.from(audioPart.inlineData.data, "base64");

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": audioPart.inlineData.mimeType || "audio/wav",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("TTS API Error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan internal pada server" },
      { status: 500 }
    );
  }
}
