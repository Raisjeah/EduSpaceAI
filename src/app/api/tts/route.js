import { NextResponse } from 'next/server';
import { synthesizeSpeech } from '@/lib/hume';

export async function POST(req) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Call Hume AI to synthesize speech
    const base64Audio = await synthesizeSpeech(text);

    return NextResponse.json({ audio: base64Audio });
  } catch (error) {
    console.error('[TTS_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
