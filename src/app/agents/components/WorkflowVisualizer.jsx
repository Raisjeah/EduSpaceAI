'use client';

import { Workflow } from 'lucide-react';
import { getAgentIcon, getAgentTheme } from '@/lib/agentUtils';
import ActivityTimeline from './ActivityTimeline';

const ACTIVE_WORKFLOWS = [
  {
    id: 'paper-ai-education',
    query: 'Buatkan paper tentang AI di pendidikan',
    agents: ['researcher', 'editor', 'citation'],
    status: 'running',
    startTime: '10:24 UTC',
    activities: [
      { agent: 'researcher', task: 'Mencari referensi jurnal', status: 'completed', time: '2 menit yang lalu' },
      { agent: 'editor', task: 'Menulis draft paper', status: 'running', time: 'Sedang berjalan...' },
      { agent: 'citation', task: 'Format sitasi APA', status: 'pending', time: 'Menunggu hasil editor' },
    ],
  },
  {
    id: 'deep-search-literature',
    query: 'Analisis tren pembelajaran adaptif terbaru dengan sumber',
    agents: ['deep-search', 'researcher'],
    status: 'completed',
    startTime: '09:58 UTC',
    activities: [
      { agent: 'deep-search', task: 'Mengumpulkan sumber web terbaru', status: 'completed', time: '14 menit yang lalu' },
      { agent: 'researcher', task: 'Merangkum implikasi akademik', status: 'completed', time: '11 menit yang lalu' },
    ],
  },
];

export default function WorkflowVisualizer() {
  return (
    <div className="space-y-6">
      {ACTIVE_WORKFLOWS.map((workflow) => (
        <section key={workflow.id} className="bg-white dark:bg-[#151515] rounded-3xl border border-slate-100 dark:border-white/5 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">{workflow.query}</h3>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  workflow.status === 'running'
                    ? 'bg-amber-500/10 text-amber-500'
                    : 'bg-green-500/10 text-green-500'
                }`}>
                  {workflow.status === 'running' ? 'Running' : 'Completed'}
                </span>
                <span className="text-xs text-slate-500">Started {workflow.startTime}</span>
              </div>
            </div>
          </div>

          <div className="relative p-6 md:p-8 bg-slate-50 dark:bg-white/5 rounded-2xl mb-6 overflow-x-auto">
            <div className="flex items-center min-w-[620px]">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-900/20">
                  <Workflow size={24} />
                </div>
                <span className="text-xs mt-2 text-slate-600 dark:text-gray-400">Orchestrator</span>
              </div>

              <div className="flex-1 h-0.5 bg-slate-200 dark:bg-white/10 relative mx-4">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              </div>

              <div className="flex gap-4 shrink-0">
                {workflow.agents.map((agentId) => {
                  const theme = getAgentTheme(agentId);
                  return (
                    <div key={agentId} className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${theme.bg}`}>
                        {getAgentIcon(agentId, 18)}
                      </div>
                      <span className="text-[10px] mt-1 text-slate-600 dark:text-gray-400 capitalize">
                        {agentId.replace('-', ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <ActivityTimeline activities={workflow.activities} />
        </section>
      ))}

      {ACTIVE_WORKFLOWS.length === 0 && (
        <div className="text-center py-12">
          <Workflow size={48} className="mx-auto text-slate-300 dark:text-gray-600 mb-4" />
          <p className="text-slate-500 dark:text-gray-400">Tidak ada workflow aktif</p>
        </div>
      )}
    </div>
  );
}
