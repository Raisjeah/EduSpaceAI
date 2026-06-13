'use client';

import { useEffect } from 'react';
import { Sparkles, X, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function UpgradeModal({ isOpen, onClose, featureName, limit }) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-white dark:bg-[#1A1A1A] rounded-3xl border border-slate-200 dark:border-gray-800 shadow-2xl overflow-hidden transition-all animate-in fade-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="relative p-6 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
            aria-label="Tutup modal"
          >
            <X size={20} />
          </button>

          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="text-indigo-600 dark:text-indigo-400" size={32} />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Batas {featureName} Tercapai
          </h2>
          <p className="text-slate-500 dark:text-gray-400 text-sm">
            Tingkatkan ke paket Premium untuk mendapatkan akses penuh dan fitur unggulan lainnya.
          </p>
        </div>

        {/* Benefits */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#0F0F0F] border-y border-slate-100 dark:border-gray-800">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-gray-300">
              <CheckCircle2 size={18} className="text-indigo-500" />
              <span>Model AI Tercanggih (Gemini 3.1 & Claude 4.6)</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-gray-300">
              <CheckCircle2 size={18} className="text-indigo-500" />
              <span>Hingga 500+ pesan per hari</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-gray-300">
              <CheckCircle2 size={18} className="text-indigo-500" />
              <span>Memori Proyek Jangka Panjang</span>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="p-6 flex flex-col gap-3">
          <Link
            href="/pricing"
            onClick={onClose}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold py-3 rounded-2xl text-center shadow-lg shadow-indigo-600/20 transition-all"
          >
            Lihat Paket Premium
          </Link>
          <button
            onClick={onClose}
            className="w-full py-3 text-sm font-medium text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Nanti Saja
          </button>
        </div>
      </div>
    </div>
  );
}
