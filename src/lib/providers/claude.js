import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODELS, MAX_OUTPUT_TOKENS } from '../constants';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DEFAULT_CLAUDE_MODEL = CLAUDE_MODELS.SONNET;

export async function getClaudeResponse(prompt, history, fileParts, systemInstruction, modelName = DEFAULT_CLAUDE_MODEL) {
  try {
    const messages = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.parts[0].text
    }));

    let content = [];

    // Handle images for Claude
    if (fileParts.length > 0) {
      for (const part of fileParts) {
        if (part.inlineData) {
          content.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: part.inlineData.mimeType,
              data: part.inlineData.data,
            },
          });
        }
      }
    }

    content.push({ type: 'text', text: prompt });

    messages.push({ role: 'user', content });

    const response = await anthropic.messages.create({
      model: modelName,
      max_tokens: MAX_OUTPUT_TOKENS || 4096,
      system: systemInstruction,
      messages: messages,
    });

    return response.content[0].text;
  } catch (error) {
    console.error("Claude SDK Error:", error);
    throw error;
  }
}
