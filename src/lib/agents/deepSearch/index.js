import BaseAgent from '../baseAgent';
import { deepSearchEngine } from './workflow';

export const deepSearchInstruction = `Kamu adalah Deep Search Agent di EduSpaceAI. Kamu memiliki kemampuan untuk mencari informasi terbaru secara real-time.
Tugasmu:
- Memberikan informasi paling update mengenai topik yang ditanyakan.
- Menyertakan sumber atau referensi jika memungkinkan.
- Menganalisis tren terbaru dalam dunia akademik dan teknologi.
- Gunakan alat pencarian jika tersedia untuk memastikan akurasi data terbaru.`;

export default class DeepSearchAgent extends BaseAgent {
  constructor(options = {}) {
    super({
      id: 'deep-search',
      name: 'Deep Search Agent',
      instruction: deepSearchInstruction,
      ...options,
    });
  }

  async execute(task, context = {}) {
    const output = await deepSearchEngine(
      task,
      context.history || [],
      context.fileParts || [],
      context.modelName
    );

    this.updateMemory('lastTask', task);
    this.updateMemory('lastOutput', output);

    return {
      agentId: this.id,
      agentName: this.name,
      task,
      output,
    };
  }
}
