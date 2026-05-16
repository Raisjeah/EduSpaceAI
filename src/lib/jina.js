export async function fetchPageContent(url) {
  try {
    const jinaUrl = `https://r.jina.ai/${url}`;

    // Timeout protection: 10 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const headers = {
      "Accept": "text/event-stream",
    };

    if (process.env.JINA_API_KEY) {
      headers["Authorization"] = `Bearer ${process.env.JINA_API_KEY}`;
    }

    const response = await fetch(jinaUrl, {
      signal: controller.signal,
      headers: headers
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Jina Reader failed with status: ${response.status}`);
    }

    let text = await response.text();

    // Limit content size to ~15,000 characters to prevent token explosion
    if (text.length > 15000) {
      text = text.substring(0, 15000) + "... [Content Truncated]";
    }

    return {
      url: url,
      extractedContent: text
    };
  } catch (error) {
    console.error(`Jina Reader Error for ${url}:`, error.message);
    return {
      url: url,
      extractedContent: `Gagal mengambil konten dari ${url}. Error: ${error.message}`
    };
  }
}
