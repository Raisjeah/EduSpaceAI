'use client';

import { useState } from 'react';
import AgentCard from './components/AgentCard';
import WorkflowVisualizer from './components/WorkflowVisualizer';
import AgentStats from './components/AgentStats';
import AgentSettings from './components/AgentSettings';

const AGENT_IDS = ['default', 'researcher', 'editor', 'deep-search', 'citation', 'visualizer'];
const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'workflows', label: 'Workflows' },
  { id: 'stats', label: 'Statistics' },
  { id: 'settings', label: 'Settings' },
];

export default function AgentHubPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 bg-slate-50 dark:bg-[#0F0F0F]">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Agent Hub</h1>
            <p className="text-slate-500 dark:text-gray-400">Kelola dan monitor semua agent AI-mu</p>
          </div>
          <button type="button" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20">
            Buat Workflow Baru
          </button>
        </div>

        <div className="flex gap-2 border-b border-slate-200 dark:border-white/10 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600'
                  : 'text-slate-600 dark:text-gray-400 border-transparent hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AGENT_IDS.map((agentId) => (
              <AgentCard key={agentId} agentId={agentId} />
            ))}
          </div>
        )}

        {activeTab === 'workflows' && <WorkflowVisualizer />}
        {activeTab === 'stats' && <AgentStats />}
        {activeTab === 'settings' && <AgentSettings />}
      </div>
    </div>
  );
}
