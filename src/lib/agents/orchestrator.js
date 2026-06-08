import DeepSearchAgent from './deepSearch';
import ResearcherAgent from './researcher';
import EditorAgent from './editor';
import CitationAgent from './citation';
import VisualizerAgent from './visualizer';
import { deepSearchKeywords } from './deepSearch/tools';
import { researcherKeywords } from './researcher/tools';
import { editorKeywords } from './editor/tools';
import { citationKeywords } from './citation/tools';
import { visualizerKeywords } from './visualizer/tools';
import { hasAnyKeyword, summarizeAgentResults } from './shared/tools';
import { updateSharedMemory } from './shared/memory';

const AGENT_KEYWORDS = {
  researcher: researcherKeywords,
  editor: editorKeywords,
  citation: citationKeywords,
  visualizer: visualizerKeywords,
  'deep-search': deepSearchKeywords,
};

const AGENT_TASKS = {
  researcher: 'Analisis kebutuhan riset, struktur akademik, metodologi, dan substansi argumen dari permintaan pengguna.',
  editor: 'Perbaiki kejelasan, tata bahasa, PUEBI, struktur kalimat, dan gaya akademik dari materi pengguna.',
  citation: 'Identifikasi kebutuhan referensi/sitasi, susun format sitasi, dan beri catatan validasi sumber.',
  visualizer: 'Ubah konsep, proses, atau struktur jawaban menjadi diagram Mermaid yang mudah dipahami.',
  'deep-search': 'Cari dan rangkum informasi terbaru serta sumber web yang relevan untuk menjawab permintaan pengguna.',
};

const COMPLEXITY_MARKERS = [
  'sekaligus',
  'lengkap dengan',
  'mendalam',
  'bandingkan',
  'analisis mendalam',
  'buatkan lengkap',
  'sertakan sumber',
  'dengan diagram',
  'dengan sitasi',
  'riset lengkap',
];

export default class OrchestratorAgent {
  constructor({ modelRunner, defaultAgent }) {
    this.modelRunner = modelRunner;
    this.defaultAgent = defaultAgent;
    this.agents = new Map();

    [
      new ResearcherAgent({ modelRunner }),
      new EditorAgent({ modelRunner }),
      new CitationAgent({ modelRunner }),
      new VisualizerAgent({ modelRunner }),
      new DeepSearchAgent({ modelRunner }),
    ].forEach((agent) => this.registerAgent(agent));
  }

  registerAgent(agent) {
    agent.setOrchestrator(this);
    this.agents.set(agent.id, agent);
  }

  analyzeTask(prompt, requestedAgentId = 'default') {
    const normalizedPrompt = prompt.toLowerCase();
    const selectedAgents = new Set();

    if (requestedAgentId && requestedAgentId !== 'default') {
      selectedAgents.add(requestedAgentId);
    }

    Object.entries(AGENT_KEYWORDS).forEach(([agentId, keywords]) => {
      if (hasAnyKeyword(normalizedPrompt, keywords)) {
        selectedAgents.add(agentId);
      }
    });

    if (selectedAgents.has('deep-search')) {
      selectedAgents.add('citation');
    }

    const markerCount = COMPLEXITY_MARKERS.filter((marker) => normalizedPrompt.includes(marker)).length;
    const isLongPrompt = normalizedPrompt.split(/\s+/).length > 50;
    const isComplex = selectedAgents.size > 1 || markerCount >= 2 || isLongPrompt;

    if (!isComplex && selectedAgents.size === 0) {
      return {
        isComplex: false,
        agents: [requestedAgentId || 'default'],
        reason: 'Permintaan sederhana cukup dijawab oleh agent aktif.',
      };
    }

    if (isComplex && selectedAgents.size === 0) {
      selectedAgents.add('researcher');
      selectedAgents.add('editor');
    }

    return {
      isComplex,
      agents: [...selectedAgents].filter((agentId) => this.agents.has(agentId)),
      reason: `Terdeteksi ${selectedAgents.size} kebutuhan agent dan ${markerCount} indikator kompleksitas.`,
    };
  }

  async execute(prompt, context = {}) {
    const analysis = this.analyzeTask(prompt, context.agentId);

    if (!analysis.isComplex || analysis.agents.length <= 1) {
      const agentId = analysis.agents[0] || context.agentId || 'default';
      if (agentId !== 'default' && this.agents.has(agentId)) {
        const result = await this.executeAgent(agentId, prompt, context);
        return result.output;
      }
      return this.defaultAgent(prompt, context);
    }

    updateSharedMemory('lastWorkflow', {
      prompt,
      agents: analysis.agents,
      reason: analysis.reason,
      startedAt: new Date().toISOString(),
    }, context);

    // Stage 1: agent independen dijalankan paralel
    const SEQUENTIAL_AGENTS = ['deep-search', 'citation'];
    const independentAgents = analysis.agents.filter(id => !SEQUENTIAL_AGENTS.includes(id));

    const stage1Settled = await Promise.allSettled(
      independentAgents.map(agentId => {
        const delegatedTask = `${AGENT_TASKS[agentId]}\n\nPermintaan pengguna:\n${prompt}`;
        return this.executeAgent(agentId, delegatedTask, { ...context, originalPrompt: prompt });
      })
    );

    const stage1Results = stage1Settled.map((result, index) => {
      if (result.status === 'fulfilled') return result.value;
      const agentId = independentAgents[index];
      return {
        agentId,
        agentName: this.agents.get(agentId)?.name || agentId,
        task: AGENT_TASKS[agentId],
        output: `Agent gagal: ${result.reason?.message || result.reason}`,
      };
    });

    // Stage 2: deep-search dulu, lalu citation dengan sumber dari deep-search
    const stage2Results = [];

    if (analysis.agents.includes('deep-search')) {
      const deepSearchTask = `${AGENT_TASKS['deep-search']}\n\nPermintaan pengguna:\n${prompt}`;
      let deepSearchResult;
      try {
        deepSearchResult = await this.executeAgent('deep-search', deepSearchTask, { ...context, originalPrompt: prompt });
      } catch (err) {
        deepSearchResult = {
          agentId: 'deep-search',
          agentName: 'Deep Search Agent',
          task: deepSearchTask,
          output: `Agent gagal: ${err?.message || err}`,
        };
      }
      stage2Results.push(deepSearchResult);

      if (analysis.agents.includes('citation')) {
        const citationTask = `${AGENT_TASKS['citation']}\n\nPermintaan pengguna:\n${prompt}\n\nSumber dari Deep Search:\n${deepSearchResult.output}`;
        let citationResult;
        try {
          citationResult = await this.executeAgent('citation', citationTask, { ...context, originalPrompt: prompt });
        } catch (err) {
          citationResult = {
            agentId: 'citation',
            agentName: 'Citation Generator',
            task: citationTask,
            output: `Agent gagal: ${err?.message || err}`,
          };
        }
        stage2Results.push(citationResult);
      }
    } else if (analysis.agents.includes('citation')) {
      const citationTask = `${AGENT_TASKS['citation']}\n\nPermintaan pengguna:\n${prompt}`;
      let citationResult;
      try {
        citationResult = await this.executeAgent('citation', citationTask, { ...context, originalPrompt: prompt });
      } catch (err) {
        citationResult = {
          agentId: 'citation',
          agentName: 'Citation Generator',
          task: citationTask,
          output: `Agent gagal: ${err?.message || err}`,
        };
      }
      stage2Results.push(citationResult);
    }

    const allResults = [...stage1Results, ...stage2Results];

    updateSharedMemory(
      'lastWorkflowResults',
      allResults.map(({ agentId, agentName, task }) => ({ agentId, agentName, task })),
      context
    );

    return this.synthesizeResults(prompt, allResults, context, analysis);
  }

  async executeAgent(agentId, task, context = {}) {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Unknown agent: ${agentId}`);
    }

    return agent.execute(task, context);
  }

  async synthesizeResults(prompt, results, context = {}, analysis = {}) {
    const collaborationContext = summarizeAgentResults(results);
    const synthesisPrompt = `
Kamu adalah Orchestrator EduSpaceAI yang menggabungkan hasil kerja multi-agent menjadi satu jawaban final untuk mahasiswa Indonesia.

PERMINTAAN PENGGUNA:
${prompt}

ANALISIS WORKFLOW:
${analysis.reason || '-'}
Agent terlibat: ${results.map((result) => result.agentName).join(', ')}

HASIL MASING-MASING AGENT:
${collaborationContext}

TUGAS SINTESIS:
- Gabungkan hasil agent menjadi jawaban final yang koheren, tidak repetitif, dan mudah diikuti.
- Jika ada diagram Mermaid dari Visualizer, pertahankan blok diagramnya.
- Jika ada sumber/sitasi dari Deep Search atau Citation, pertahankan daftar sumbernya.
- Tandai bagian hasil kolaborasi dengan ringkas, tanpa membocorkan prompt internal.
- Gunakan Bahasa Indonesia yang santai, suportif, dan akademik.
    `.trim();

    return this.modelRunner(synthesisPrompt, {
      ...context,
      agentId: 'orchestrator',
      instruction: 'Orchestrator EduSpaceAI untuk sintesis hasil multi-agent.',
    });
  }
}
