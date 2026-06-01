'use client';

import { BarChart3, CheckCircle, Clock, TrendingUp } from 'lucide-react';

const stats = {
  totalTasks: 1234,
  avgResponseTime: 3.2,
  successRate: 94.5,
  topAgents: [
    { id: 'researcher', name: 'Profesor Riset', tasks: 456, successRate: 96, trend: 8 },
    { id: 'editor', name: 'Editor Akademik', tasks: 321, successRate: 95, trend: 6 },
    { id: 'deep-search', name: 'Deep Search', tasks: 289, successRate: 92, trend: 4 },
    { id: 'citation', name: 'Citation Generator', tasks: 168, successRate: 98, trend: 9 },
  ],
};

const metricCards = [
  {
    label: 'Total Tasks',
    value: stats.totalTasks,
    delta: '+12%',
    icon: BarChart3,
    color: 'indigo',
  },
  {
    label: 'Avg Response Time',
    value: `${stats.avgResponseTime}s`,
    delta: '-0.5s',
    icon: Clock,
    color: 'amber',
  },
  {
    label: 'Success Rate',
    value: `${stats.successRate}%`,
    delta: '+2%',
    icon: CheckCircle,
    color: 'green',
  },
  {
    label: 'Top Agent',
    value: stats.topAgents[0].name,
    delta: 'Best',
    icon: TrendingUp,
    color: 'purple',
  },
];

const colorClasses = {
  indigo: 'bg-indigo-500/10 text-indigo-500',
  amber: 'bg-amber-500/10 text-amber-500',
  green: 'bg-green-500/10 text-green-500',
  purple: 'bg-purple-500/10 text-purple-500',
};

export default function AgentStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((metric) => {
        const Icon = metric.icon;
        return (
          <div key={metric.label} className="bg-white dark:bg-[#151515] rounded-3xl border border-slate-100 dark:border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[metric.color]}`}>
                <Icon size={24} />
              </div>
              <span className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full">{metric.delta}</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{metric.value}</div>
            <div className="text-sm text-slate-500">{metric.label}</div>
          </div>
        );
      })}

      <div className="md:col-span-2 lg:col-span-4 bg-white dark:bg-[#151515] rounded-3xl border border-slate-100 dark:border-white/5 p-6">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Top Agents</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-slate-100 dark:border-white/10">
                <th className="pb-3 font-medium">Agent</th>
                <th className="pb-3 font-medium">Tasks</th>
                <th className="pb-3 font-medium">Success Rate</th>
                <th className="pb-3 font-medium">Trend</th>
              </tr>
            </thead>
            <tbody>
              {stats.topAgents.map((agent) => (
                <tr key={agent.id} className="border-b border-slate-50 dark:border-white/5 last:border-0">
                  <td className="py-3 text-sm font-medium text-slate-900 dark:text-white">{agent.name}</td>
                  <td className="py-3 text-sm text-slate-600 dark:text-gray-400">{agent.tasks}</td>
                  <td className="py-3 text-sm text-slate-600 dark:text-gray-400">{agent.successRate}%</td>
                  <td className="py-3"><span className="text-xs text-green-500">↑ {agent.trend}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
