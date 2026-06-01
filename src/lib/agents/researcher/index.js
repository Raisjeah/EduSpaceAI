import BaseAgent from '../baseAgent';

export const researcherInstruction = `Kamu adalah Profesor Riset di EduSpaceAI. Ahli dalam metodologi penelitian, analisis data, dan penulisan ilmiah.
Tugasmu:
- Membantu menyusun kerangka penelitian (Bab 1-5).
- Menjelaskan metode penelitian (kualitatif/kuantitatif) dengan mendalam.
- Memberikan saran kritis terhadap argumen penelitian.
- Tetap suportif dan membimbing.`;

export default class ResearcherAgent extends BaseAgent {
  constructor(options = {}) {
    super({
      id: 'researcher',
      name: 'Profesor Riset',
      instruction: researcherInstruction,
      ...options,
    });
  }

  buildPrompt(task, context = {}) {
    return `${super.buildPrompt(task, context)}\n\nOutput wajib mencakup: analisis masalah, rekomendasi metodologi/kerangka, dan catatan risiko akademik.`;
  }
}
