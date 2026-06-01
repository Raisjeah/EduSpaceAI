'use client';

import Link from 'next/link';
import { Activity, CheckCircle, Clock, Settings } from 'lucide-react';
import { getAgentDescription, getAgentIcon, getAgentName, getAgentTheme } from '@/lib/agentUtils';

const AGENT_STATS = {
  default: { tasksCompleted: 128, avgTime: 2.1, successRate: 97 },
  researcher: { tasksCompleted: 456, avgTime: 4.8, successRate: 96 },
  editor: { tasksCompleted: 321, avgTime: 2.9, successRate: 95 },
  'deep-search': { tasksCompleted: 289, avgTime: 6.4, successRate: 92 },
  citation: { tasksCompleted: 168, avgTime: 1.8, successRate: 98 },
  visualizer: { tasksCompleted: 94, avgTime: 3.6, successRate: 94 },
};

export default function AgentCard({ agentId }) {
  const theme = getAgentTheme(agentId);
  const stats = AGENT_STATS[agentId] || AGENT_STATS.default;

  return (
    <article className="bg-white dark:bg-[#151515] rounded-3xl border border-slate-100 dark:border-white/5 p-6 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-900/5 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-12 h-12 rounded-xl ${theme.bg} flex items-center justify-center text-white shadow-lg shadow-slate-900/10 shrink-0`}>
            {getAgentIcon(agentId, 20)}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white truncate">{getAgentName(agentId)}</h3>
            <span className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Aktif
            </span>
          </div>
        </div>
        <button
          type="button"
          className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-all"
          aria-label={`Buka pengaturan ${getAgentName(agentId)}`}
        >
          <Settings size={16} className="text-slate-400" />
        </button>
      </div>

      <p className="text-sm text-slate-500 dark:text-gray-400 mb-4 line-clamp-2 min-h-[2.5rem]">
        {getAgentDescription(agentId)}
      </p>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-slate-50 dark:bg-white/5 rounded-xl">
          <Activity size={14} className="mx-auto mb-1 text-slate-400" />
          <div className="text-lg font-bold text-slate-900 dark:text-white">{stats.tasksCompleted}</div>
          <div className="text-[10px] text-slate-500">Tasks</div>
        </div>
        <div className="text-center p-2 bg-slate-50 dark:bg-white/5 rounded-xl">
          <Clock size={14} className="mx-auto mb-1 text-slate-400" />
          <div className="text-lg font-bold text-slate-900 dark:text-white">{stats.avgTime}s</div>
          <div className="text-[10px] text-slate-500">Avg Time</div>
        </div>
        <div className="text-center p-2 bg-slate-50 dark:bg-white/5 rounded-xl">
          <CheckCircle size={14} className="mx-auto mb-1 text-slate-400" />
          <div className="text-lg font-bold text-slate-900 dark:text-white">{stats.successRate}%</div>
          <div className="text-[10px] text-slate-500">Success</div>
        </div>
      </div>

      <div className="flex gap-2">
        <Link href={`/?agent=${agentId}`} className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium text-center hover:bg-indigo-700 transition-all">
          Mulai Chat
        </Link>
        <button type="button" className="px-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
          View Logs
        </button>
      </div>
    </article>
  );
}
