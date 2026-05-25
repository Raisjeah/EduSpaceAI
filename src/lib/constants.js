// Model names
export const GEMINI_MODELS = {
  FLASH: 'gemini-2.5-flash',
  PRO: 'gemini-2.5-pro',
  IMAGE: 'gemini-2.5-flash-image',
};

export const CLAUDE_MODELS = {
  SONNET: 'claude-sonnet-4-6',
};

export const DEFAULT_MODEL = GEMINI_MODELS.FLASH;

// Agent IDs
export const AGENT_IDS = {
  DEFAULT: 'default',
  RESEARCHER: 'researcher',
  EDITOR: 'editor',
  DEEP_SEARCH: 'deep-search',
  VISUALIZER: 'visualizer',
  CITATION: 'citation',
  IMAGE_GENERATOR: 'image-generator',
};

// App config
export const APP_NAME = 'EduSpaceAI';
export const MAX_OUTPUT_TOKENS = 4096;
export const AUDIO_INPUT_SAMPLE_RATE = 16000;
export const AUDIO_OUTPUT_SAMPLE_RATE = 24000;
