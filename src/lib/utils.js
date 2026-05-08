/**
 * Extracts hostname or IP from a URL or string.
 * @param {string} input - The input string (URL or host).
 * @returns {string} - Cleaned hostname or IP.
 */
export function extractTarget(input) {
  if (!input) return '';

  let target = input.trim();

  // Check if it's a URL
  try {
    if (target.startsWith('http://') || target.startsWith('https://')) {
      const url = new URL(target);
      return url.hostname;
    }
  } catch (e) {
    // If URL parsing fails, continue with string manipulation
  }

  // Remove protocol if present but URL failed (e.g. invalid URL)
  target = target.replace(/^(https?:\/\/)/, '');

  // Remove path and query parameters
  target = target.split('/')[0].split('?')[0].split('#')[0];

  // Remove port if present
  target = target.split(':')[0];

  return target;
}

/**
 * Parses a prompt to check for 'ai-pentest' command.
 * @param {string} prompt - The user prompt.
 * @returns {object|null} - { command: 'ai-pentest', target: '...' } or null.
 */
export function parsePentestCommand(prompt) {
  if (!prompt) return null;

  const trimmed = prompt.trim();
  const match = trimmed.match(/^ai-pentest\s+(.+)$/i);

  if (match) {
    const rawTarget = match[1].trim();
    const target = extractTarget(rawTarget);
    return {
      command: 'ai-pentest',
      target: target,
      originalTarget: rawTarget
    };
  }

  return null;
}
