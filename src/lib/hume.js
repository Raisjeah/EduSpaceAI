/**
 * Hume AI TTS Library for EduSpaceAI
 * Handles communication with Hume AI Octave TTS API
 */

const HUME_API_KEY = process.env.HUME_API_KEY;
const HUME_BASE_URL = 'https://api.hume.ai/v0/tts';

/**
 * Synthesizes text into speech using Hume AI
 * @param {string} text - The text to be converted to speech
 * @returns {Promise<string>} - Base64 encoded audio data
 */
export async function synthesizeSpeech(text) {
  if (!HUME_API_KEY) {
    throw new Error('HUME_API_KEY is not configured');
  }

  if (!text || text.trim().length === 0) {
    throw new Error('Text is required for TTS');
  }

  try {
    const response = await fetch(HUME_BASE_URL, {
      method: 'POST',
      headers: {
        'X-Hume-Api-Key': HUME_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        utterances: [
          {
            text: text,
          },
        ],
        format: {
          type: 'mp3',
        },
        num_generations: 1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Hume API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.generations || data.generations.length === 0) {
      throw new Error('No audio generation received from Hume AI');
    }

    return data.generations[0].audio;
  } catch (error) {
    console.error('Hume TTS Error:', error);
    throw error;
  }
}
