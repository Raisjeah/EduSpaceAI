import { URL } from 'url';
import dns from 'dns';
import { promisify } from 'util';

const lookup = promisify(dns.lookup);

async function isSafeUrl(urlStr) {
  try {
    const parsed = new URL(urlStr);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;

    // Block common internal hostnames
    const hostname = parsed.hostname.toLowerCase();
    if (['localhost', 'internal', 'metadata.google.internal'].includes(hostname)) return false;

    const { address } = await lookup(hostname);

    // Private/Reserved IPv4 ranges
    const isPrivate =
      address.startsWith('10.') ||
      address.startsWith('192.168.') ||
      address.startsWith('172.16.') || // Simplification, strictly 172.16.0.0/12
      address.startsWith('169.254.') ||
      address.startsWith('127.') ||
      address === '0.0.0.0' ||
      address === '::1';

    return !isPrivate;
  } catch (e) {
    return false;
  }
}

export async function fetchPageContent(url) {
  try {
    if (!(await isSafeUrl(url))) {
      throw new Error("URL tidak aman atau terlarang.");
    }

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
