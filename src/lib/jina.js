import { URL } from 'url';
import dns from 'dns';
import { promisify } from 'util';

const lookup = promisify(dns.lookup);

async function isSafeUrl(urlStr) {
  try {
    const parsed = new URL(urlStr);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;

    const hostname = parsed.hostname.toLowerCase();
    if (['localhost', 'internal', 'metadata.google.internal'].includes(hostname)) return false;

    const { address } = await lookup(hostname);

    const isPrivate =
      address.startsWith('10.') ||
      address.startsWith('192.168.') ||
      address.startsWith('172.16.') ||
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const headers = {
      "Accept": "application/json",
      "X-Return-Format": "text",
      "X-Timeout": "8",
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

    const contentType = response.headers.get('content-type') || '';
    let extractedText = '';

    if (contentType.includes('application/json')) {
      const json = await response.json();
      // Jina JSON response format: { data: { content: "...", title: "..." } }
      extractedText = json?.data?.content || json?.content || json?.text || JSON.stringify(json);
    } else {
      extractedText = await response.text();
    }

    // Clean up common Jina artifacts
    extractedText = extractedText
      .replace(/^Title:.*\n/m, '')        // Remove duplicate title line
      .replace(/^URL Source:.*\n/m, '')     // Remove URL source line
      .replace(/^Markdown Content:\n/m, '') // Remove "Markdown Content:" header
      .replace(/\n{3,}/g, '\n\n')          // Collapse excessive newlines
      .trim();

    // Limit content size to prevent token explosion
    if (extractedText.length > 12000) {
      extractedText = extractedText.substring(0, 12000) + "\n\n... [Konten Dipotong]";
    }

    return {
      url: url,
      extractedContent: extractedText
    };
  } catch (error) {
    console.error(`Jina Reader Error for ${url}:`, error.message);
    return {
      url: url,
      extractedContent: `Gagal mengambil konten dari ${url}. Error: ${error.message}`
    };
  }
}
