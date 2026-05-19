import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { checkUsageLimit } from "@/lib/subscription";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY_2 });

function pcmToWav(pcmBuffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16) {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmBuffer.length;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const buffer = Buffer.alloc(totalSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(totalSize - 8, 4);
  buffer.write('WAVE', 8);

  // fmt sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  pcmBuffer.copy(buffer, 44);

  return buffer;
}

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
      model: "gemini-2.5-flash-preview-tts",
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

    // Ekstrak data dan tipe dengan aman
    const audioPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!audioPart || !audioPart.inlineData) {
      console.error("Gemini TTS Response:", JSON.stringify(response));
      throw new Error("Audio data missing");
    }

    const base64Data = audioPart.inlineData.data;
    const audioBuffer = Buffer.from(base64Data, "base64");
    const mimeType = audioPart.inlineData.mimeType || "";

    let finalBuffer = audioBuffer;
    let contentType = mimeType;

    if (mimeType.includes("L16") || mimeType.includes("pcm") || mimeType === "audio/raw") {
      const rateMatch = mimeType.match(/rate=(\d+)/);
      const sampleRate = rateMatch ? parseInt(rateMatch[1]) : 24000;
      finalBuffer = pcmToWav(audioBuffer, sampleRate);
      contentType = "audio/wav";
    } else if (!mimeType || !mimeType.startsWith("audio/")) {
      finalBuffer = pcmToWav(audioBuffer, 24000);
      contentType = "audio/wav";
    }

    return new Response(finalBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-cache"
      }
    });
  } catch (error) {
    console.error("TTS API Error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan internal pada server" },
      { status: 500 }
    );
  }
}
