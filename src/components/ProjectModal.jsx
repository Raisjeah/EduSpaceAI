'use client';

import { useState, useTransition } from 'react';
import { X, Rocket, Search, BookOpen, Edit3 } from 'lucide-react';
import { createProject } from '@/app/actions/projectActions';
import { useRouter } from 'next/navigation';

export default function ProjectModal({ isOpen, onClose, userId }) {
  const [name, setName] = useState('');
  const [agentId, setAgentId] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const agents = [
    { id: 'default', name: 'EduSpaceAI', desc: 'Dosen Umum', icon: <Rocket size={18} /> },
    { id: 'deep-search', name: 'Deep Search', desc: 'Ahli Real-time Search', icon: <Search size={18} /> },
    { id: 'researcher', name: 'Profesor Riset', desc: 'Ahli Metodologi', icon: <BookOpen size={18} /> },
    { id: 'editor', name: 'Editor Akademik', desc: 'Koreksi Bahasa', icon: <Edit3 size={18} /> },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    // Use the selected agent's name as the default project name along with a timestamp
    const selectedAgent = agents.find(a => a.id === agentId);
    const defaultName = `${selectedAgent?.name || 'Agent'} Session`;

    const result = await createProject(defaultName, agentId);

    if (result.success) {
      startTransition(() => {
        onClose();
        setAgentId('default');
        setIsLoading(false);
        router.push(`/project/${result.project._id}`);
      });
    } else {
      setIsLoading(false);
      alert(result.error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-md rounded-3xl border border-slate-200 dark:border-[#333] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 transition-colors">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-[#333]">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pilih Agent</h2>
          <button onClick={onClose} className="text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-3">Daftar Agent</label>
            <div className="grid grid-cols-2 gap-3">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => setAgentId(agent.id)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all flex flex-col gap-2 ${
                    agentId === agent.id
                    ? 'bg-indigo-600/10 border-indigo-500'
                    : 'bg-slate-50 dark:bg-[#242424] border-slate-200 dark:border-[#333] hover:border-slate-400 dark:hover:border-gray-500'
                  }`}
                >
                  <div className={`${agentId === agent.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-gray-400'}`}>
                    {agent.icon}
                  </div>
                  <div>
                    <div className="text-[12px] font-bold text-slate-800 dark:text-gray-200">{agent.name}</div>
                    <div className="text-[9px] text-slate-500 dark:text-gray-500">{agent.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-900/20 transition-all"
          >
            {isLoading ? 'Sedang Memulai...' : 'Mulai Sesi Agent'}
          </button>
        </form>
      </div>
    </div>
  );
}
