'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  CheckCircle,
  Clock,
  MessageCircle,
  RefreshCw,
  TrendingUp,
  Workflow,
  XCircle,
} from 'lucide-react';
import { AGENT_DISPLAY_CONFIGS, AGENT_LIST, getAgentIcon, getAgentTheme } from '@/lib/agentUtils';

const TIMEFRAMES = [
  { id: '1d', label: '24 Jam' },
  { id: '7d', label: '7 Hari' },
  { id: '30d', label: '30 Hari' },
  { id: 'all', label: 'Semua' },
];

async function fetchAgentStats(timeframe) {
  const response = await fetch(`/api/agents/activity?timeRange=${timeframe}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch agent stats');
  }

  return response.json();
}

function formatDuration(ms) {
  if (!ms) return '-';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

function getStatusIcon(status) {
  switch (status) {
    case 'completed':
      return <CheckCircle size={14} className="text-green-500" />;
    case 'failed':
      return <XCircle size={14} className="text-red-500" />;
    case 'started':
    case 'running':
      return <Clock size={14} className="text-amber-500" />;
    default:
      return <Clock size={14} className="text-slate-400" />;
  }
}

function getAgentName(agentId) {
  if (agentId === 'orchestrator') return 'Orchestrator';
  return AGENT_DISPLAY_CONFIGS[agentId]?.name || agentId;
}

export default function AgentHubPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [timeframe, setTimeframe] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const statsData = await fetchAgentStats(timeframe);
      setStats(statsData);
    } catch (fetchError) {
      console.error('Error fetching agent activity data:', fetchError);
      setError('Gagal memuat data aktivitas agent. Coba refresh lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [timeframe]);

  const totalStats = stats?.totals || {
    totalTasks: 0,
    avgExecutionTime: 0,
    successRate: 0,
  };
  const perAgentStats = stats?.perAgent || [];
  const recentActivities = stats?.recentActivities || [];
  const successRate = `${(totalStats.successRate || 0).toFixed(0)}%`;
  const handleStartChat = (agentId) => {
    router.push(agentId === 'default' ? '/' : `/?agent=${agentId}`);
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-[#0F0F0F]">
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-[#1A1A1A]/95 backdrop-blur-xl border-b border-slate-200 dark:border-[#333]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Workflow size={20} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Agent Hub</h1>
                <p className="text-sm text-slate-500 dark:text-gray-400 truncate">Monitor aktivitas agent dari workflow nyata</p>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchData}
              disabled={isLoading}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all disabled:opacity-50"
              aria-label="Refresh agent activity"
            >
              <RefreshCw size={18} className={`text-slate-600 dark:text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {TIMEFRAMES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTimeframe(item.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                timeframe === item.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-[#1A1A1A] text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-[#333]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {AGENT_LIST.map((agent) => {
            const theme = getAgentTheme(agent.id);
            const agentStats = perAgentStats.find((item) => item.agentId === agent.id || item._id === agent.id);
            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => handleStartChat(agent.id)}
                className="group text-left bg-white dark:bg-[#1A1A1A] rounded-2xl border border-slate-200 dark:border-[#333] p-5 hover:border-indigo-500/40 hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-xl ${theme.softBg} ${theme.text} border ${theme.border} flex items-center justify-center`}>
                    {getAgentIcon(agent.id, 20)}
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Mulai Chat <MessageCircle size={13} />
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{agent.name}</h2>
                <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">{AGENT_DISPLAY_CONFIGS[agent.id]?.description || agent.desc}</p>
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="rounded-xl bg-slate-50 dark:bg-white/[0.04] p-2">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{agentStats?.tasksCompleted || 0}</div>
                    <div className="text-[10px] text-slate-500">Tasks</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-white/[0.04] p-2">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{formatDuration(agentStats?.avgTime)}</div>
                    <div className="text-[10px] text-slate-500">Avg</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-white/[0.04] p-2">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{(agentStats?.successRate || 0).toFixed(0)}%</div>
                    <div className="text-[10px] text-slate-500">Success</div>
                  </div>
                </div>
              </button>
            );
          })}
        </section>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-slate-200 dark:border-[#333] p-4">
            <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 text-sm mb-1">
              <BarChart3 size={14} />
              <span>Total Aktivitas</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalStats.totalTasks}</div>
          </div>
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-slate-200 dark:border-[#333] p-4">
            <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 text-sm mb-1">
              <Clock size={14} />
              <span>Avg Time</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{formatDuration(totalStats.avgExecutionTime)}</div>
          </div>
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-slate-200 dark:border-[#333] p-4">
            <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 text-sm mb-1">
              <CheckCircle size={14} />
              <span>Success Rate</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{successRate}</div>
          </div>
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-slate-200 dark:border-[#333] p-4">
            <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 text-sm mb-1">
              <TrendingUp size={14} />
              <span>Active Agents</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{perAgentStats.length}</div>
          </div>
        </div>

        <section className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-slate-200 dark:border-[#333] p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Statistik per Agent</h2>
          {perAgentStats.length > 0 ? (
            <div className="space-y-3">
              {perAgentStats.map((stat) => {
                const theme = getAgentTheme(stat.agentId);
                return (
                  <div
                    key={stat.agentId}
                    className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/[0.06]"
                  >
                    <div className={`w-10 h-10 rounded-lg ${theme.softBg} border ${theme.border} ${theme.text} flex items-center justify-center shrink-0`}>
                      {getAgentIcon(stat.agentId, 18)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-900 dark:text-white">{getAgentName(stat.agentId)}</span>
                        <span className="text-xs text-slate-500 dark:text-gray-500">{stat.tasksCompleted}x digunakan</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-gray-500">
                        <span>Avg: {formatDuration(stat.avgTime)}</span>
                        <span>Success: {stat.successRate.toFixed(0)}%</span>
                        <span>Runs: {stat.tasksCompleted}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-gray-400">Belum ada statistik agent untuk timeframe ini.</p>
          )}
        </section>

        <section className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-slate-200 dark:border-[#333] p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Aktivitas Terbaru</h2>
          {recentActivities.length > 0 ? (
            <div className="space-y-2">
              {recentActivities.map((activity) => (
                <div
                  key={activity._id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                >
                  <div className="mt-0.5">{getStatusIcon(activity.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900 dark:text-white text-sm">{getAgentName(activity.agentId)}</span>
                      {activity.delegatedAgents?.length > 1 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          Multi-Agent
                        </span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 capitalize">
                        {activity.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-gray-400 line-clamp-2">{activity.task}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] text-slate-500 dark:text-gray-500">
                      <span>{new Date(activity.timestamp).toLocaleString('id-ID')}</span>
                      {activity.executionTime ? <span>• {formatDuration(activity.executionTime)}</span> : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-gray-400">Belum ada aktivitas agent.</p>
          )}
        </section>

        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-2">Memuat data...</p>
          </div>
        )}
      </div>
    </div>
  );
}
