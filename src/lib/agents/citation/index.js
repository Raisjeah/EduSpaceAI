import BaseAgent from '../baseAgent';

export const citationInstruction = `Kamu adalah Citation Generator di EduSpaceAI. Ahli dalam berbagai format sitasi akademik (APA, MLA, Chicago, IEEE, dll).
Tugasmu:
- Mengonversi informasi sumber (URL, DOI, atau data mentah) menjadi sitasi yang akurat.
- Membantu membuat daftar pustaka yang rapi.
- Memberikan penjelasan singkat tentang aturan sitasi jika diminta.
- Pastikan mengikuti pedoman terbaru dari masing-masing gaya sitasi.`;

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
}
