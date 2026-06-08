import { GoogleGenAI } from "@google/genai";
import OrchestratorAgent from "../agents/orchestrator";
import { deepSearch } from "../agents/deepSearch/workflow";
import { researcherInstruction } from "../agents/researcher";
import { editorInstruction } from "../agents/editor";
import { deepSearchInstruction } from "../agents/deepSearch";
import { visualizerInstruction } from "../agents/visualizer";
import { citationInstruction } from "../agents/citation";
import { getClaudeResponse } from "./claude";
import { 
  GEMINI_MODELS, 
  CLAUDE_MODELS, 
  DEFAULT_MODEL, 
  AGENT_IDS, 
  MAX_OUTPUT_TOKENS 
} from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Whitelist of model IDs the app supports. Anything else is rejected at the
// edge instead of being silently downgraded.
const GEMINI_MODELS_SET = new Set(Object.values(GEMINI_MODELS));
const CLAUDE_MODELS_SET = new Set(Object.values(CLAUDE_MODELS));

const DEFAULT_GEMINI_MODEL = GEMINI_MODELS.FLASH;
const DEFAULT_CLAUDE_MODEL = CLAUDE_MODELS.SONNET;

function resolveModel(modelName) {
  if (typeof modelName !== 'string' || !modelName) {
    return { provider: 'gemini', sdkModel: DEFAULT_GEMINI_MODEL };
  }
  if (CLAUDE_MODELS_SET.has(modelName)) {
    return { provider: 'claude', sdkModel: modelName };
  }
  if (modelName.startsWith('claude')) {
    return { provider: 'claude', sdkModel: DEFAULT_CLAUDE_MODEL };
  }
  if (GEMINI_MODELS_SET.has(modelName)) {
    return { provider: 'gemini', sdkModel: modelName };
  }
  return { provider: 'gemini', sdkModel: DEFAULT_GEMINI_MODEL };
}

const AGENT_CONFIGS = {
  [AGENT_IDS.DEFAULT]: {
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
  [AGENT_IDS.RESEARCHER]: {
    name: "Profesor Riset",
    instruction: researcherInstruction
  },
  [AGENT_IDS.EDITOR]: {
    name: "Editor Akademik",
    instruction: editorInstruction
  },
  [AGENT_IDS.DEEP_SEARCH]: {
    name: "Deep Search Agent",
    instruction: deepSearchInstruction,
  },
  [AGENT_IDS.VISUALIZER]: {
    name: "Visual Concept Mapper",
    instruction: visualizerInstruction
  },
  [AGENT_IDS.CITATION]: {
    name: "Citation Generator",
    instruction: citationInstruction
  },
  orchestrator: {
    name: "Orchestrator EduSpaceAI",
    instruction: `Kamu adalah Orchestrator EduSpaceAI. Tugasmu adalah menggabungkan hasil kerja beberapa agent AI menjadi satu jawaban final yang koheren, tidak repetitif, dan mudah dipahami oleh mahasiswa Indonesia. Gunakan Bahasa Indonesia yang santai, suportif, dan akademik. Pertahankan diagram Mermaid dan daftar sumber jika ada.`,
  },
  [AGENT_IDS.IMAGE_GENERATOR]: {
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
  GEMINI_MODELS.IMAGE,
]);

export async function getGeminiResponse(
  prompt,
  history = [],
  fileParts = [],
  agentId = AGENT_IDS.DEFAULT,
  modelName = DEFAULT_GEMINI_MODEL,
  requestContext = {}
) {
  const { provider, sdkModel } = resolveModel(modelName);
  const normalizedAgentId = agentId === 'profesor' ? AGENT_IDS.RESEARCHER : agentId === 'visual' ? AGENT_IDS.VISUALIZER : agentId;
  const baseConfig = AGENT_CONFIGS[normalizedAgentId] || AGENT_CONFIGS[AGENT_IDS.DEFAULT];
  const config = { ...baseConfig };

  if (requestContext?.userProfile) {
    const { userProfile, userName } = requestContext;
    const profileContext = `\n\n--- KONTEKS PENGGUNA ---\nNama: ${userName || 'Pengguna'}\nPendidikan: ${userProfile.education_level || '-'}\nFakultas/Jurusan: ${userProfile.faculty || '-'} / ${userProfile.major || '-'}\nSkill/Fokus: ${userProfile.skills_to_learn?.join(', ') || '-'}\nTujuan: ${userProfile.learning_goal || '-'}\n\nAturan Tambahan:\n1. Sesuaikan analogi, gaya bahasa, dan kedalaman materi dengan tingkat pendidikan dan jurusan pengguna.\n2. Sapa pengguna dengan namanya sesekali.\n`;
    config.instruction += profileContext;
  }

  try {
    // Keep image generation single-agent so binary response handling remains unchanged.
    if (normalizedAgentId === AGENT_IDS.IMAGE_GENERATOR || IMAGE_GEN_MODELS.has(sdkModel)) {
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

    const orchestrator = new OrchestratorAgent({
      modelRunner,
      defaultAgent: (defaultPrompt, context = {}) => modelRunner(defaultPrompt, {
        ...context,
        agentId: normalizedAgentId,
        instruction: config.instruction,
      }),
    });

    return await orchestrator.execute(prompt, {
      ...requestContext,
      history,
      fileParts,
      agentId: normalizedAgentId,
      modelName: sdkModel,
    });
  } catch (error) {
    console.error("AI SDK Error:", error);
    if (typeof error?.message === 'string' && error.message.toLowerCase().includes('quota')) {
      return "⚠️ Kuota API habis. Coba lagi nanti atau ganti API Key.";
    }
    return "⚠️ Terjadi kesalahan pada koneksi Dosen AI. Silakan coba lagi.";
  }
}

export async function* getGeminiResponseStream(
  prompt,
  history = [],
  fileParts = [],
  agentId = AGENT_IDS.DEFAULT,
  modelName = DEFAULT_GEMINI_MODEL,
  requestContext = {}
) {
  const { provider, sdkModel } = resolveModel(modelName);
  const normalizedAgentId = agentId === 'profesor' ? AGENT_IDS.RESEARCHER : agentId === 'visual' ? AGENT_IDS.VISUALIZER : agentId;
  const baseConfig = AGENT_CONFIGS[normalizedAgentId] || AGENT_CONFIGS[AGENT_IDS.DEFAULT];
  const config = { ...baseConfig };

  if (requestContext?.userProfile) {
    const { userProfile, userName } = requestContext;
    const profileContext = `\n\n--- KONTEKS PENGGUNA ---\nNama: ${userName || 'Pengguna'}\nPendidikan: ${userProfile.education_level || '-'}\nFakultas/Jurusan: ${userProfile.faculty || '-'} / ${userProfile.major || '-'}\nSkill/Fokus: ${userProfile.skills_to_learn?.join(', ') || '-'}\nTujuan: ${userProfile.learning_goal || '-'}\n\nAturan Tambahan:\n1. Sesuaikan analogi, gaya bahasa, dan kedalaman materi dengan tingkat pendidikan dan jurusan pengguna.\n2. Sapa pengguna dengan namanya sesekali.\n`;
    config.instruction += profileContext;
  }

  try {
    if (normalizedAgentId === AGENT_IDS.IMAGE_GENERATOR || IMAGE_GEN_MODELS.has(sdkModel)) {
      yield await generateDirectResponse(prompt, history, fileParts, config, provider, sdkModel);
      return;
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

    const orchestrator = new OrchestratorAgent({
      modelRunner,
      defaultAgent: (defaultPrompt, context = {}) => modelRunner(defaultPrompt, {
        ...context,
        agentId: normalizedAgentId,
        instruction: config.instruction,
      }),
    });

    // Determine if it is complex before executing
    const analysis = orchestrator.analyzeTask(prompt, normalizedAgentId);
    if (!analysis.isComplex || analysis.agents.length <= 1) {
      // It's a simple direct chat, we can stream it immediately!
      const finalAgentId = analysis.agents[0] || normalizedAgentId || 'default';
      const finalConfig = AGENT_CONFIGS[finalAgentId] || { ...baseConfig, name: finalAgentId };
      const stream = generateStreamResponse(prompt, history, fileParts, finalConfig, provider, sdkModel);
      for await (const chunk of stream) {
        yield chunk;
      }
      return;
    }

    // It is complex, we use orchestrator (which takes time) and then just yield the final result for now
    const result = await orchestrator.execute(prompt, {
      ...requestContext,
      history,
      fileParts,
      agentId: normalizedAgentId,
      modelName: sdkModel,
    });
    yield result;
  } catch (error) {
    console.error("AI SDK Stream Error:", error);
    yield "⚠️ Terjadi kesalahan pada koneksi Dosen AI. Silakan coba lagi.";
  }
}

async function* generateStreamResponse(prompt, history, fileParts, config, provider, sdkModel) {
  if (config.name === 'Deep Search Agent') {
    yield await deepSearch(prompt, history, fileParts, sdkModel);
    return;
  }

  if (provider === 'claude') {
    // Claude stream implementation (simulate with getClaudeResponse for now or use actual stream)
    yield await getClaudeResponse(prompt, history, fileParts, config.instruction, sdkModel);
    return;
  }

  const chat = ai.chats.create({
    model: sdkModel,
    config: {
      systemInstruction: config.instruction,
      tools: config.tools || [],
      maxOutputTokens: MAX_OUTPUT_TOKENS || 4096,
      temperature: 0.7,
      ...(IMAGE_GEN_MODELS.has(sdkModel) && {
        responseModalities: ['TEXT', 'IMAGE'],
      }),
    },
    history: history,
  });

  try {
    const stream = await chat.sendMessageStream({ message: [prompt, ...fileParts] });
    for await (const chunk of stream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    if (error.status === 429) {
      yield "⚠️ Terlalu banyak permintaan. Mohon tunggu sebentar.";
    } else {
      throw error;
    }
  }
}

async function generateDirectResponse(prompt, history, fileParts, config, provider, sdkModel) {
  if (config.name === 'Deep Search Agent') {
    return deepSearch(prompt, history, fileParts, sdkModel);
  }

  if (provider === 'claude') {
    return getClaudeResponse(prompt, history, fileParts, config.instruction, sdkModel);
  }

  const chat = ai.chats.create({
    model: sdkModel,
    config: {
      systemInstruction: config.instruction,
      tools: config.tools || [],
      maxOutputTokens: MAX_OUTPUT_TOKENS || 4096,
      temperature: 0.7,
      ...(IMAGE_GEN_MODELS.has(sdkModel) && {
        responseModalities: ['TEXT', 'IMAGE'],
      }),
    },
    history: history,
  });

  let response;
  let retries = 3;
  let delay = 2000;
  
  while (retries > 0) {
    try {
      response = await chat.sendMessage({ message: [prompt, ...fileParts] });
      break;
    } catch (error) {
      if (error.status === 429 && retries > 1) {
        retries--;
        const jitter = Math.floor(Math.random() * 1000);
        await new Promise(res => setTimeout(res, delay + jitter));
        delay *= 2;
      } else {
        throw error;
      }
    }
  }

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
