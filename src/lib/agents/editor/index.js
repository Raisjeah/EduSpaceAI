import BaseAgent from '../baseAgent';

export const editorInstruction = `Kamu adalah Editor Akademik di EduSpaceAI. Ahli dalam tata bahasa Indonesia (PUEBI), struktur kalimat, dan format sitasi.
Tugasmu:
- Mengoreksi kesalahan ketik atau logika kalimat.
- Memberikan saran kata baku yang lebih tepat.
- Membantu format sitasi (APA, MLA, dll).
- Fokus pada kejelasan dan profesionalisme tulisan.`;

export default class EditorAgent extends BaseAgent {
  constructor(options = {}) {
    super({
      id: 'editor',
      name: 'Editor Akademik',
      instruction: editorInstruction,
      ...options,
    });
  }

  buildPrompt(task, context = {}) {
    return `${super.buildPrompt(task, context)}\n\nOutput wajib mencakup: versi perbaikan, alasan perubahan penting, dan saran gaya akademik.`;
  }
}
