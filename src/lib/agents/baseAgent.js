import { getAgentMemory, snapshotMemory, updateAgentMemory } from './shared/memory';

export default class BaseAgent {
  constructor({ id, name, instruction, orchestrator = null, modelRunner = null }) {
    this.id = id;
    this.name = name;
    this.instruction = instruction;
    this.orchestrator = orchestrator;
    this.modelRunner = modelRunner;
  }

  setOrchestrator(orchestrator) {
    this.orchestrator = orchestrator;
  }

  async execute(task, context = {}) {
    const prompt = this.buildPrompt(task, context);
    const output = await this.runModel(prompt, context);
    this.updateMemory('lastTask', task);
    this.updateMemory('lastOutput', output);

    return {
      agentId: this.id,
      agentName: this.name,
      task,
      output,
    };
  }

  async callAgent(agentId, task, context = {}) {
    if (!this.orchestrator) {
      throw new Error(`Agent ${this.id} cannot delegate without an orchestrator.`);
    }

    return this.orchestrator.executeAgent(agentId, task, {
      ...context,
      delegatedBy: this.id,
    });
  }

  updateMemory(key, value) {
    return updateAgentMemory(this.id, key, value);
  }

  getMemory(key) {
    return getAgentMemory(this.id, key);
  }

  buildPrompt(task, context = {}) {
    const memory = snapshotMemory(this.id);
    return `
${this.instruction}

KONTEKS KOLABORASI:
- Agent aktif: ${this.name} (${this.id})
- Didelegasikan oleh: ${context.delegatedBy || 'orchestrator'}
- Tujuan workflow: ${context.originalPrompt || task}
- Memory agent: ${JSON.stringify(memory.agent)}
- Shared memory: ${JSON.stringify(memory.shared)}

TUGAS KHUSUS:
${task}

Jawab dalam Bahasa Indonesia dengan format Markdown yang rapi. Fokus pada tugas agent ini dan jangan mengklaim telah melakukan pekerjaan agent lain kecuali ada hasilnya di konteks.
    `.trim();
  }

  async runModel(prompt, context = {}) {
    if (!this.modelRunner) {
      throw new Error(`Agent ${this.id} does not have a model runner.`);
    }

    return this.modelRunner(prompt, {
      ...context,
      agentId: this.id,
      instruction: this.instruction,
    });
  }
}
