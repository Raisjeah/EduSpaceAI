import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { checkUsageLimit } from "@/lib/subscription";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Sesi berakhir. Silakan login kembali." }, { status: 401 });
    }

    const usage = await checkUsageLimit(user);
    if (!usage.allowed) {
      return NextResponse.json(
        { error: `Batas pesan harian tercapai (${usage.limit} pesan/hari). Silakan upgrade ke paket yang lebih tinggi.` },
        { status: 429 }
      );
    }

    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Teks diperlukan" }, { status: 400 });
    }

    // Gunakan model gemini-2.5-flash-tts sesuai permintaan
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview",
      contents: [{ role: "user", parts: [{ text }] }],
      config: {
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
