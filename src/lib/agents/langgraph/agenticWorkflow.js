import { StateGraph, END } from "@langchain/langgraph";
import { GoogleGenAI } from "@google/genai";
import { search } from "../../tavily";
import { fetchPageContent } from "../../jina";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const graphState = {
  userQuery: { value: (x, y) => y ? y : x, default: () => "" },
  historyContext: { value: (x, y) => y ? y : x, default: () => "" },
  fileContext: { value: (x, y) => y ? y : x, default: () => "" },
  modelName: { value: (x, y) => y ? y : x, default: () => "gemini-2.5-flash" },
  fileParts: { value: (x, y) => y ? y : x, default: () => [] },
  subQueries: { value: (x, y) => y ? y : x, default: () => [] },
  searchResults: { value: (x, y) => y ? y : x, default: () => [] },
  extractedContext: { value: (x, y) => y ? y : x, default: () => "" },
  analysisResult: { value: (x, y) => y ? y : x, default: () => "" },
  finalResponse: { value: (x, y) => y ? y : x, default: () => "" }
};

// Node 1: Query Analyzer
async function analyzeQuery(state) {
  const { userQuery, historyContext } = state;
  const analyzerPrompt = `
    Sebagai Query Analyzer, tugasmu adalah membedah pertanyaan pengguna dan menghasilkan 3-5 query pencarian yang dioptimalkan untuk mencari informasi terbaru di web.
    KONTEKS PERCAKAPAN:
    ${historyContext}
    PERTANYAAN TERBARU PENGGUNA: "${userQuery}"
    Format output WAJIB JSON array of strings.
    Contoh: ["query 1", "query 2", "query 3"]
  `;

  try {
    const analyzerResult = await ai.models.generateContent({
      model: state.modelName,
      contents: analyzerPrompt,
      config: { responseMimeType: "application/json" }
    });
    const parsed = JSON.parse(analyzerResult.text.replace(/\`\`\`json|\`\`\`/gi, '').trim());
    const subQueries = Array.isArray(parsed) ? parsed : [userQuery];
    return { subQueries };
  } catch (e) {
    return { subQueries: [userQuery] };
  }
}

// Node 2: Web Search
async function executeSearch(state) {
  const { subQueries, userQuery } = state;
  const searchResultsSettled = await Promise.allSettled(
    subQueries.map(q => search(q))
  );

  const searchResultsArrays = searchResultsSettled
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);

  const allResults = searchResultsArrays.flat();
  const uniqueResults = [];
  const seenUrls = new Set();

  for (const res of allResults) {
    if (res.url && !seenUrls.has(res.url)) {
      seenUrls.add(res.url);
      uniqueResults.push(res);
    }
  }

  const rerankedResults = uniqueResults
    .map(res => {
      let score = 0;
      const queryTerms = userQuery.toLowerCase().split(/\s+/);
      const title = (res.title || "").toLowerCase();
      const content = (res.content || "").toLowerCase();
      queryTerms.forEach(term => {
        if (title.includes(term)) score += 10;
        if (content.includes(term)) score += 2;
      });
      if (res.url.includes('click') || res.url.includes('ads') || res.url.includes('promo')) score -= 20;
      return { ...res, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return { searchResults: rerankedResults };
}

// Node 3: Content Fetch
async function fetchContent(state) {
  const { searchResults } = state;
  const extractionResultsSettled = await Promise.allSettled(
    searchResults.map(res => fetchPageContent(res.url))
  );

  const extractedContexts = extractionResultsSettled
    .map((res, idx) => {
      if (res.status === 'fulfilled') return res.value;
      return { url: searchResults[idx].url, extractedContent: "Gagal mengambil konten." };
    });

  const structuredContext = extractedContexts.map((ctx, idx) => {
    const originalResult = searchResults[idx];
    const cleanContent = (ctx.extractedContent || "").replace(/[^\x20-\x7E\s\r\n]/g, "").substring(0, 10000);
    return `[Source ${idx + 1}]
Title: ${originalResult.title}
URL: ${ctx.url}
Content:
${cleanContent}
---`;
  }).join('\n');

  return { extractedContext: structuredContext };
}

// Node 4: Analyst
async function analyzeContent(state) {
  const { extractedContext, userQuery, historyContext, fileContext, modelName, fileParts } = state;
  const analystPrompt = `
    Tugasmu adalah menganalisis kumpulan konten web berikut untuk menjawab pertanyaan pengguna dengan mempertimbangkan konteks percakapan sebelumnya.
    ${fileContext}
    KONTEKS PERCAKAPAN:
    ${historyContext}
    ATURAN KETAT:
    1. HANYA gunakan informasi dari KONTEKS WEB yang disediakan.
    2. JANGAN mengarang fakta.
    KONTEKS WEB:
    ${extractedContext}
    PERTANYAAN PENGGUNA:
    "${userQuery}"
  `;

  try {
    const analystResult = await ai.models.generateContent({
      model: modelName,
      contents: [analystPrompt, ...fileParts]
    });
    return { analysisResult: analystResult.text };
  } catch (e) {
    return { analysisResult: "Analisis gagal: " + e.message };
  }
}

// Node 5: Writer
async function writeFinalResponse(state) {
  const { analysisResult, searchResults, userQuery, historyContext, fileContext, modelName, fileParts } = state;
  const verifiedSources = searchResults.map(r => `- ${r.title}: ${r.url}`).join('\n');
  const writerPrompt = `
    Kamu adalah EduSpaceAI. Tugasmu adalah menulis jawaban final berdasarkan ANALISIS DATA WEB yang diberikan.
    ${fileContext}
    ATURAN:
    - Gunakan daftar sumber yang diverifikasi di bawah untuk bagian ## Sumber.
    STRUKTUR JAWABAN:
    ## Jawaban Utama
    ## Penjelasan Detail
    ## Sumber
    ${verifiedSources}

    KONTEKS PERCAKAPAN:
    ${historyContext}
    ANALISIS DATA WEB:
    ${analysisResult}
    PERTANYAAN PENGGUNA:
    "${userQuery}"
  `;

  try {
    const finalResult = await ai.models.generateContent({
      model: modelName,
      contents: [writerPrompt, ...fileParts]
    });
    return { finalResponse: finalResult.text };
  } catch (e) {
    return { finalResponse: "Maaf, terjadi kesalahan saat menyusun jawaban akhir." };
  }
}

const builder = new StateGraph({ channels: graphState })
  .addNode("analyzeQuery", analyzeQuery)
  .addNode("executeSearch", executeSearch)
  .addNode("fetchContent", fetchContent)
  .addNode("analyzeContent", analyzeContent)
  .addNode("writeFinalResponse", writeFinalResponse)
  .addEdge("analyzeQuery", "executeSearch")
  .addEdge("executeSearch", "fetchContent")
  .addEdge("fetchContent", "analyzeContent")
  .addEdge("analyzeContent", "writeFinalResponse")
  .addEdge("writeFinalResponse", END)
  .setEntryPoint("analyzeQuery");

export const agenticWorkflow = builder.compile();
