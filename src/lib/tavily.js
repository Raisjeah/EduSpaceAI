export async function search(query) {
  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: query,
        search_depth: "advanced",
        include_answer: true,
        max_results: 5,
      }),
    });

    const data = await response.json();

    if (!data.results) {
      console.error("Tavily Search Error:", data);
      return [];
    }

    return data.results.map((result) => ({
      title: result.title,
      url: result.url,
      content: result.content,
    }));
  } catch (error) {
    console.error("Tavily Search Exception:", error);
    return [];
  }
}
