import { GoogleGenAI } from "@google/genai";
import { agenticWorkflow } from "../langgraph/agenticWorkflow";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Whitelist of model IDs supported by deep-search reasoning loops.
// Image-only models cannot be used here, so they are not listed.
const VALID_MODELS = new Set([
  'gemini-2.5-flash',
  'gemini-2.5-pro',
]);

/**
 * Coerce the requested model to a valid Gemini text-generation slug.
 * Unknown models fall back to gemini-2.5-flash without silently changing tiers.
 */
function getValidModelName(modelName) {
  if (typeof modelName === 'string' && VALID_MODELS.has(modelName)) {
    return modelName;
  }
  return 'gemini-2.5-flash';
}

// ✅ NEW: Timeout wrapper for API calls
function withTimeout(promise, timeoutMs, label = 'Operation') {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timeout after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}

export async function deepSearchEngine(userQuery, history = [], fileParts = [], modelName = "gemini-2.5-flash") {
  try {
    const selectedModelName = getValidModelName(modelName);

    // Format fileParts for context awareness
    const fileContext = fileParts.length > 0
      ? `\n\nASSET TAMBAHAN (Gambar/File):\n(User telah mengunggah ${fileParts.length} file yang dilampirkan dalam pesan ini sebagai referensi visual atau data.)`
      : "";

    // Safe history processing for context awareness
    const historyContext = history.length > 0
      ? history.map(h => {
          const role = h.role === 'user' ? 'User' : 'Assistant';
          const textPart = h.parts?.find(p => p.text)?.text || "";
          const hasMedia = h.parts?.some(p => p.inlineData || p.fileData);
          return `${role}: ${textPart}${hasMedia ? ' [Media Attached]' : ''}`;
        }).join('\n')
      : "No previous history.";

    // Invoke the LangGraph workflow instead of manual monolithic steps
    const initialState = {
      userQuery,
      historyContext,
      fileContext,
      modelName: selectedModelName,
      fileParts
    };

    // We execute the graph
    const resultState = await withTimeout(
      agenticWorkflow.invoke(initialState),
      45000, // 45 seconds total timeout for all steps
      'Agentic Workflow'
    );

    return resultState.finalResponse;

  } catch (error) {
    console.error("Deep Search Engine Error:", error);
    return "Maaf, terjadi kesalahan saat melakukan riset mendalam. Silakan coba lagi nanti.";
  }
}
