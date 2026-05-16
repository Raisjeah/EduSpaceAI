export async function fetchPageContent(url) {
  try {
    const jinaUrl = `https://r.jina.ai/${url}`;

    // Timeout protection: 10 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(jinaUrl, {
      signal: controller.signal,
      headers: {
        "Accept": "text/event-stream", // Jina prefers this or markdown
      }
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
