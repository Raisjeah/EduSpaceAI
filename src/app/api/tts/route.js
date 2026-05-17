import { NextResponse } from 'next/server';
import { synthesizeSpeech, stripMarkdown } from '@/lib/hume';
import { getSessionUser } from '@/lib/session';

export async function POST(req) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Clean text for TTS
    const cleanText = stripMarkdown(text);

    // Call Hume AI to synthesize speech
    const base64Audio = await synthesizeSpeech(cleanText);

    return NextResponse.json({ audio: base64Audio });
  } catch (error) {
    console.error('[TTS_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
