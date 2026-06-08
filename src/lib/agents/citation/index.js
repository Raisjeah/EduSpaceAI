import BaseAgent from '../baseAgent';

export const citationInstruction = `Kamu adalah Citation Generator di EduSpaceAI. Ahli dalam berbagai format sitasi akademik (APA, MLA, Chicago, IEEE, dll).
Tugasmu:
- Mengonversi informasi sumber (URL, DOI, atau data mentah) menjadi sitasi yang akurat.
- Membantu membuat daftar pustaka yang rapi.
- Memberikan penjelasan singkat tentang aturan sitasi jika diminta.
- Pastikan mengikuti pedoman terbaru dari masing-masing gaya sitasi.`;

async function lookupDOI(doi) {
  try {
    const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
      headers: { 'User-Agent': 'EduSpaceAI/1.0 (mailto:support@eduspaceai.com)' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.message || null;
  } catch {
    return null;
  }
}

export default class CitationAgent extends BaseAgent {
  constructor(options = {}) {
    super({
      id: 'citation',
      name: 'Citation Generator',
      instruction: citationInstruction,
      ...options,
    });
  }

  buildPrompt(task, context = {}) {
    return `${super.buildPrompt(task, context)}\n\nOutput wajib mencakup sitasi yang bisa disalin, gaya sitasi yang digunakan, dan catatan data sumber yang masih kurang jika ada.`;
  }

  async execute(task, context = {}) {
    // Deteksi DOI dalam task dan enrich dengan metadata CrossRef
    const doiMatch = task.match(/\b10\.\d{4,}\/\S+/);
    let enrichedTask = task;
    if (doiMatch) {
      const metadata = await lookupDOI(doiMatch[0]);
      if (metadata) {
        const title = metadata.title?.[0] || '-';
        const authors = (metadata.author || []).map(a => `${a.given || ''} ${a.family || ''}`.trim()).join(', ') || '-';
        const year = metadata.published?.['date-parts']?.[0]?.[0] || '-';
        const journal = metadata['container-title']?.[0] || '-';
        enrichedTask += `\n\nMetadata DOI dari CrossRef:\n- Judul: ${title}\n- Penulis: ${authors}\n- Tahun: ${year}\n- Jurnal: ${journal}\n- DOI: ${doiMatch[0]}`;
      }
    }
    return super.execute(enrichedTask, context);
  }
}
