import { GoogleGenAI } from "@google/genai";
import Anthropic from "@anthropic-ai/sdk";
import OrchestratorAgent from "./agents/orchestrator";
import { deepSearchEngine } from "./agents/deepSearch/workflow";
import { researcherInstruction } from "./agents/researcher";
import { editorInstruction } from "./agents/editor";
import { deepSearchInstruction } from "./agents/deepSearch";
import { visualizerInstruction } from "./agents/visualizer";
import { citationInstruction } from "./agents/citation";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

let orchestratorInstance = null;
let activeModelRunner = null;
let activeDefaultAgent = null;

function getOrchestrator(modelRunner, defaultAgent) {
  activeModelRunner = modelRunner;
  activeDefaultAgent = defaultAgent;

  if (!orchestratorInstance) {
    orchestratorInstance = new OrchestratorAgent({
      modelRunner: (...args) => activeModelRunner(...args),
      defaultAgent: (...args) => activeDefaultAgent(...args),
    });
  }

  return orchestratorInstance;
}

// Whitelist of model IDs the app supports. Anything else is rejected at the
// edge instead of being silently downgraded.
const GEMINI_MODELS = new Set([
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.5-flash-image',
]);

const CLAUDE_MODELS = new Set([
  'claude-sonnet-4-6',
]);

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const DEFAULT_CLAUDE_MODEL = 'claude-sonnet-4-6';

function resolveModel(modelName) {
  if (typeof modelName !== 'string' || !modelName) {
    return { provider: 'gemini', sdkModel: DEFAULT_GEMINI_MODEL };
  }
  if (CLAUDE_MODELS.has(modelName)) {
    return { provider: 'claude', sdkModel: modelName };
  }
  if (modelName.startsWith('claude')) {
    return { provider: 'claude', sdkModel: DEFAULT_CLAUDE_MODEL };
  }
  if (GEMINI_MODELS.has(modelName)) {
    return { provider: 'gemini', sdkModel: modelName };
  }
  return { provider: 'gemini', sdkModel: DEFAULT_GEMINI_MODEL };
}

export const AGENT_CONFIGS = {
  default: {
    name: "EduSpaceAI",
    instruction: `Nama kamu adalah EduSpaceAI, seorang Dosen Pribadi yang cerdas, suportif, dan ramah.
    GAYA BAHASA:
    - Gunakan bahasa Indonesia yang santai tapi sopan (seperti kakak tingkat atau dosen muda).
    - Gunakan analogi sederhana untuk menjelaskan konsep sulit.
    - JANGAN kaku. Gunakan kalimat penyemangat.
    ATURAN AKADEMIK:
    - Jika mahasiswa bertanya soal tugas/jawaban soal, JANGAN langsung beri jawaban akhir. Berikan penjelasan konsep dan bimbing mereka langkah demi langkah.
    - Gunakan FORMAT MARKDOWN (bold, list, code blocks) agar enak dibaca.
    - Untuk rumus matematika, WAJIB gunakan format LaTeX (contoh: $E=mc^2$).
    - Kamu membantu mahasiswa agar mereka benar-benar paham materi, bukan sekadar menyalin tugas.`
  },
  researcher: {
    name: "Profesor Riset",
    instruction: researcherInstruction
  },
  editor: {
    name: "Editor Akademik",
    instruction: editorInstruction
  },
  "deep-search": {
    name: "Deep Search Agent",
    instruction: deepSearchInstruction,
    tools: [
      {
        googleSearch: {},
      },
    ],
  },
  visualizer: {
    name: "Visual Concept Mapper",
    instruction: visualizerInstruction
  },
  citation: {
    name: "Citation Generator",
    instruction: citationInstruction
  },
  "image-generator": {
    name: "Nano Banana (Image Gen)",
    instruction: `Kamu adalah Nano Banana, asisten generasi gambar canggih dari Google yang terintegrasi di EduSpaceAI.
    Tugasmu:
    - Membantu pengguna menghasilkan gambar berkualitas tinggi berdasarkan deskripsi teks.
    - Memberikan saran prompt yang lebih detail untuk hasil visual yang lebih baik.
    - Menjelaskan batasan atau kemampuan teknis dari model Nano Banana (Imagen 3).
    - Selalu bersikap kreatif, solutif, dan profesional.`
  }
};

// Models yang support image generation output
const IMAGE_GEN_MODELS = new Set([
  'gemini-2.5-flash-image',
]);

export async function getGeminiResponse(
  prompt,
  history = [],
  fileParts = [],
  agentId = 'default',
  modelName = DEFAULT_GEMINI_MODEL,
  requestContext = {}
) {
  const { provider, sdkModel } = resolveModel(modelName);
  const normalizedAgentId = agentId === 'profesor' ? 'researcher' : agentId === 'visual' ? 'visualizer' : agentId;
  const config = AGENT_CONFIGS[normalizedAgentId] || AGENT_CONFIGS.default;

  try {
    // Keep image generation single-agent so binary response handling remains unchanged.
    if (normalizedAgentId === 'image-generator' || IMAGE_GEN_MODELS.has(sdkModel)) {
      return generateDirectResponse(prompt, history, fileParts, config, provider, sdkModel);
    }

    const modelRunner = (agentPrompt, context = {}) => {
      const baseConfig = AGENT_CONFIGS[context.agentId] || {
        name: context.agentId || config.name,
        instruction: config.instruction,
      };
      const agentConfig = {
        ...baseConfig,
        instruction: context.instruction || baseConfig.instruction,
      };

      return generateDirectResponse(
        agentPrompt,
        context.history || history,
        context.fileParts || fileParts,
        agentConfig,
        provider,
        context.modelName || sdkModel
      );
    };

    const orchestrator = getOrchestrator(
      modelRunner,
      (defaultPrompt, context = {}) => modelRunner(defaultPrompt, {
        ...context,
        agentId: normalizedAgentId,
        instruction: config.instruction,
      })
    );

    return await orchestrator.execute(prompt, {
      ...requestContext,
      history,
      fileParts,
      agentId: normalizedAgentId,
      modelName: sdkModel,
      projectId: requestContext.projectId || requestContext.project?._id,
      chatId: requestContext.chatId || requestContext.project?._id,
      isManualSelection: requestContext.isManualSelection || requestContext.manualSelection || false,
    });
  } catch (error) {
    console.error("AI SDK Error:", error);
    if (typeof error?.message === 'string' && error.message.toLowerCase().includes('quota')) {
      return "⚠️ Kuota API habis. Coba lagi nanti atau ganti API Key.";
    }
    return "⚠️ Terjadi kesalahan pada koneksi Dosen AI. Silakan coba lagi.";
  }
}

async function generateDirectResponse(prompt, history, fileParts, config, provider, sdkModel) {
  if (config.name === 'Deep Search Agent') {
    return deepSearchEngine(prompt, history, fileParts, sdkModel);
  }

  if (provider === 'claude') {
    return getClaudeResponse(prompt, history, fileParts, config.instruction, sdkModel);
  }

  const chat = ai.chats.create({
    model: sdkModel,
    config: {
      systemInstruction: config.instruction,
      tools: config.tools || [],
      maxOutputTokens: 4096,
      temperature: 0.7,
      ...(IMAGE_GEN_MODELS.has(sdkModel) && {
        responseModalities: ['TEXT', 'IMAGE'],
      }),
    },
    history: history,
  });

  const response = await chat.sendMessage({ message: [prompt, ...fileParts] });

  if (IMAGE_GEN_MODELS.has(sdkModel)) {
    const candidates = response.candidates;
    if (candidates && candidates[0]?.content?.parts) {
      const imagePart = candidates[0].content.parts.find((part) => part.inlineData);
      if (imagePart) {
        return JSON.stringify({
          type: "image",
          mimeType: imagePart.inlineData.mimeType,
          base64Data: imagePart.inlineData.data,
        });
      }
    }
  }

  return response.text;
}

async function getClaudeResponse(prompt, history, fileParts, systemInstruction, modelName = DEFAULT_CLAUDE_MODEL) {
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
      max_tokens: 4096,
      system: systemInstruction,
      messages: messages,
    });

    return response.content[0].text;
  } catch (error) {
    console.error("Claude SDK Error:", error);
    throw error;
  }
}

