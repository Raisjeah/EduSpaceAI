'use client';

import { useState, useTransition } from 'react';
import { X } from 'lucide-react';
import { createProject } from '@/app/actions/projectActions';
import { useRouter } from 'next/navigation';

export default function ProjectModal({ isOpen, onClose, userId }) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    const result = await createProject(name, 'default');

    if (result.success) {
      startTransition(() => {
        onClose();
        setName('');
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
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Buat Workspace Baru</h2>
          <button onClick={onClose} className="text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-2">Nama Workspace</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Misal: Skripsi Bab 1 atau Riset AI"
              className="w-full bg-slate-50 dark:bg-[#242424] border border-slate-200 dark:border-[#333] rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-gray-200 focus:outline-none focus:border-indigo-500 transition-all"
              required
            />
          </div>

          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-500/20">
            <p className="text-xs text-slate-600 dark:text-gray-400">
              Agent dapat dipilih langsung di chat. Workspace ini fokus menyimpan konteks proyek dan memakai EduSpaceAI sebagai default awal.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-900/20 transition-all"
          >
            {isLoading ? 'Sedang Membuat...' : 'Buat Workspace'}
          </button>
        </form>
      </div>
    </div>
  );
}
