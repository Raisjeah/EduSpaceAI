import { GoogleGenerativeAI } from "@google/generative-ai";
import { search } from "./tavily";
import { fetchPageContent } from "./jina";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function deepSearchEngine(userQuery, history = [], fileParts = [], modelName = "gemini-2.5-flash") {
  try {
    // Using gemini-2.5-flash for faster intermediate steps
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Format fileParts for context awareness
    const fileContext = fileParts.length > 0
      ? `\n\nASSET TAMBAHAN (Gambar/File):\n(User telah mengunggah ${fileParts.length} file yang dilampirkan dalam pesan ini sebagai referensi visual atau data.)`
      : "";

    // Format history for context awareness
    const historyContext = history.length > 0
      ? history.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.parts[0].text}`).join('\n')
      : "No previous history.";

    // STEP 1: QUERY ANALYZER
    const analyzerPrompt = `
      Sebagai Query Analyzer, tugasmu adalah membedah pertanyaan pengguna dan menghasilkan 3-5 query pencarian yang dioptimalkan untuk mencari informasi terbaru di web.

      KONTEKS PERCAKAPAN:
      ${historyContext}

      PERTANYAAN TERBARU PENGGUNA: "${userQuery}"

      Format output WAJIB JSON array of strings saja.
      Contoh: ["query 1", "query 2", "query 3"]
    `;

    const analyzerResult = await model.generateContent(analyzerPrompt);
    const analyzerText = analyzerResult.response.text();
    let subQueries = [];

    try {
      const cleanedJson = analyzerText.replace(/```json|```/gi, '').trim();
      const parsed = JSON.parse(cleanedJson);

      if (Array.isArray(parsed)) {
        subQueries = parsed;
      } else if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.queries)) {
          subQueries = parsed.queries;
        } else if (Array.isArray(parsed.subQueries)) {
          subQueries = parsed.subQueries;
        } else {
          throw new Error("Parsed JSON object does not contain a valid queries array");
        }
      } else {
        throw new Error("Parsed JSON is neither an array nor a valid object");
      }
    } catch (e) {
      console.error("Failed to parse sub-queries, falling back to original query:", e.message);
      subQueries = [userQuery];
    }

    // STEP 2: PARALLEL TAVILY SEARCH
    const searchPromises = subQueries.map(q => search(q));
    const searchResultsArrays = await Promise.all(searchPromises);

    // Flatten and remove duplicates by URL
    const allResults = searchResultsArrays.flat();
    const uniqueResults = [];
    const seenUrls = new Set();

    for (const res of allResults) {
      if (res.url && !seenUrls.has(res.url)) {
        seenUrls.add(res.url);
        uniqueResults.push(res);
      }
    }

    // Take top 5 results for detailed reading
    const topResults = uniqueResults.slice(0, 5);

    // STEP 3: JINA CONTENT EXTRACTION
    const extractionPromises = topResults.map(res => fetchPageContent(res.url));
    const extractedContexts = await Promise.all(extractionPromises);

    const structuredContext = extractedContexts.map((ctx, idx) => {
      const originalResult = topResults[idx];
      return `
[Source ${idx + 1}]
Title: ${originalResult.title}
URL: ${ctx.url}
Content:
${ctx.extractedContent}
---
      `;
    }).join('\n');

    // STEP 4: ANALYST AGENT
    const analystPrompt = `
      Tugasmu adalah menganalisis kumpulan konten web berikut untuk menjawab pertanyaan pengguna dengan mempertimbangkan konteks percakapan sebelumnya.
      ${fileContext}

      KONTEKS PERCAKAPAN:
      ${historyContext}

      ATURAN KETAT:
      1. HANYA gunakan informasi dari konteks yang disediakan.
      2. JANGAN mengarang fakta atau referensi (NO HALLUCINATION).
      3. Jika informasi tidak ditemukan, katakan "Tidak ditemukan di sumber yang tersedia".
      4. Bandingkan sumber jika ada informasi yang bertentangan.
      5. Deteksi konflik antar sumber jika ada.

      KONTEKS WEB:
      ${structuredContext}

      PERTANYAAN PENGGUNA:
      "${userQuery}"

      Berikan analisis yang bersih dan faktual dalam Bahasa Indonesia.
    `;

    const analystResult = await model.generateContent(analystPrompt);
    const factualContext = analystResult.response.text();

    // STEP 5: WRITER AGENT
    const writerPrompt = `
      Kamu adalah EduSpaceAI, seorang dosen muda yang cerdas, edukatif, dan ramah.
      Tugasmu adalah menulis jawaban final berdasarkan analisis data yang diberikan dan konteks percakapan.
      ${fileContext}

      GAYA BAHASA:
      - Seperti dosen muda yang pintar (smart young lecturer).
      - Edukatif dan mudah dipahami.
      - Gunakan Bahasa Indonesia yang sopan tapi santai.

      STRUKTUR JAWABAN:
      ## Jawaban Utama
      (Ringkasan jawaban langsung)

      ## Penjelasan Detail
      (Pembahasan mendalam berdasarkan data)

      ## Insight Tambahan
      (Tambahan perspektif atau tren terkait)

      ## Kesimpulan
      (Sintesis akhir)

      ## Sumber
      (Daftar URL yang digunakan)

      KONTEKS PERCAKAPAN:
      ${historyContext}

      ANALISIS DATA WEB:
      ${factualContext}

      PERTANYAAN PENGGUNA:
      "${userQuery}"
    `;

    // Determine final model for Writer Agent
    let finalModelName = "gemini-2.5-flash";
    if (modelName.includes('gemini')) {
      finalModelName = modelName;
    }

    const finalModel = genAI.getGenerativeModel({ model: finalModelName });
    const finalResult = await finalModel.generateContent([writerPrompt, ...fileParts]);
    return finalResult.response.text();

  } catch (error) {
    console.error("Deep Search Engine Error:", error);
    return "Maaf, terjadi kesalahan saat melakukan riset mendalam. Silakan coba lagi nanti.";
  }
}
