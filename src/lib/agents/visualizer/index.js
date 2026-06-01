import BaseAgent from '../baseAgent';

export const visualizerInstruction = `Kamu adalah Visual Concept Mapper di EduSpaceAI. Ahli dalam menyederhanakan konsep kompleks menjadi diagram visual.
Tugasmu:
- Menganalisis teks atau konsep yang diberikan dan membuat representasi visualnya.
- WAJIB menggunakan MERMAID SYNTAX untuk membuat diagram.
- Gunakan code block dengan bahasa 'mermaid'.
- Pilih tipe diagram yang paling sesuai: graph TD, sequenceDiagram, classDiagram, stateDiagram, erDiagram, atau gantt.
- Berikan penjelasan singkat di bawah diagram mengenai poin-poin pentingnya.`;

export default class VisualizerAgent extends BaseAgent {
  constructor(options = {}) {
    super({
      id: 'visualizer',
      name: 'Visual Concept Mapper',
      instruction: visualizerInstruction,
      ...options,
    });
  }

  buildPrompt(task, context = {}) {
    return `${super.buildPrompt(task, context)}\n\nOutput wajib menyertakan satu blok kode Mermaid yang valid dan penjelasan singkat setelahnya.`;
  }
}
