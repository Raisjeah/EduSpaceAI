export function summarizeAgentResults(results = []) {
  return results
    .map((result) => `### ${result.agentName}\n${result.output}`)
    .join('\n\n');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesApaCitationContext(normalized) {
  return (
    /\bapa\b\s*(style|7|6|edisi|edition|format)/i.test(normalized) ||
    /\b(format|gaya|style|sitasi|citation|referensi|reference|daftar pustaka|bibliografi)\b.{0,40}\bapa\b/i.test(normalized) ||
    /\bapa\b.{0,40}\b(format|style|sitasi|citation|referensi|reference|daftar pustaka|bibliografi)\b/i.test(normalized)
  );
}

export function hasAnyKeyword(text, keywords = []) {
  const normalized = text.toLowerCase();

  return keywords.some((keyword) => {
    const normalizedKeyword = keyword.toLowerCase();

    if (normalizedKeyword === 'apa') {
      return matchesApaCitationContext(normalized);
    }

    const keywordRegex = new RegExp(`\\b${escapeRegExp(normalizedKeyword)}\\b`, 'i');
    return keywordRegex.test(normalized);
  });
}
