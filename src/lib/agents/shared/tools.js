export function summarizeAgentResults(results = []) {
  return results
    .map((result) => `### ${result.agentName}\n${result.output}`)
    .join('\n\n');
}

export function hasAnyKeyword(text, keywords = []) {
  const normalized = text.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
}
