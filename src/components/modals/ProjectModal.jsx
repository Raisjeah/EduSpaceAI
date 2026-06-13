'use client';

import { useState, useEffect, useTransition } from 'react';
import { X, Rocket, Search, BookOpen, Edit3, Loader2 } from 'lucide-react';
import { createProject } from '@/app/actions/projectActions';
import { useRouter } from 'next/navigation';

export default function ProjectModal({ isOpen, onClose, userId }) {
  const [name, setName] = useState('');
  const [agentId, setAgentId] = useState('deep-search');
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const agents = [
    { id: 'deep-search', name: 'Deep Search', desc: 'Ahli Real-time Search', icon: <Search size={18} /> },
    { id: 'researcher', name: 'Profesor Riset', desc: 'Ahli Metodologi', icon: <BookOpen size={18} /> },
    { id: 'editor', name: 'Editor Akademik', desc: 'Koreksi Bahasa', icon: <Edit3 size={18} /> },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    const result = await createProject(name, agentId);

    if (result.success) {
      startTransition(() => {
        onClose();
        setName('');
        setAgentId('default');
        setIsLoading(false);
        setErrorMsg('');
        router.push(`/project/${result.project._id}`);
      });
    } else {
      setIsLoading(false);
      setErrorMsg(result.error || 'Terjadi kesalahan. Coba lagi.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-md rounded-3xl border border-slate-200 dark:border-[#333] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 transition-colors" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-[#333]">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Buat Agent Baru</h2>
          <button onClick={onClose} aria-label="Tutup modal" className="text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errorMsg && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm">
              {errorMsg}
            </div>
          )}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-2">Nama Agent Workspace</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Misal: Skripsi Bab 1 atau Riset AI"
              className="w-full bg-slate-50 dark:bg-[#242424] border border-slate-200 dark:border-[#333] rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-gray-200 focus:outline-none focus:border-indigo-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-3">Pilih Agent</label>
            <div className="grid grid-cols-2 gap-3">
              {agents.map((agent) => (
                <button
                  type="button"
                  key={agent.id}
                  onClick={() => setAgentId(agent.id)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all flex flex-col gap-2 bg-transparent text-left appearance-none ${
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
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-900/20 transition-all"
          >
            {isLoading ? <><Loader2 size={16} className="inline animate-spin mr-2" />Sedang Membuat...</> : 'Create Agent Workspace'}
          </button>
        </form>
      </div>
    </div>
  );
}
