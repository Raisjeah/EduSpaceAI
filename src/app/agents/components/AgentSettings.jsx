'use client';

import { Settings, SlidersHorizontal, ToggleRight } from 'lucide-react';

const SETTINGS = [
  { label: 'Auto Orchestration', description: 'Aktifkan pemilihan agent otomatis berdasarkan intent pengguna.', enabled: true },
  { label: 'Shared Memory', description: 'Simpan konteks workflow terakhir untuk sintesis lintas agent.', enabled: true },
  { label: 'Citation Validation', description: 'Wajibkan catatan validasi saat membuat daftar pustaka.', enabled: true },
  { label: 'Verbose Logs', description: 'Tampilkan log eksekusi detail untuk debugging workflow.', enabled: false },
];

export default function AgentSettings() {
  return (
    <section className="bg-white dark:bg-[#151515] rounded-3xl border border-slate-100 dark:border-white/5 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
          <Settings size={24} />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">Agent Configuration</h3>
          <p className="text-sm text-slate-500 dark:text-gray-400">Pengaturan dummy untuk rancangan UI/UX Agent Hub.</p>
        </div>
      </div>

      <div className="space-y-3">
        {SETTINGS.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
            <div className="flex items-start gap-3">
              <SlidersHorizontal size={18} className="text-slate-400 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</div>
                <div className="text-xs text-slate-500 dark:text-gray-400">{item.description}</div>
              </div>
            </div>
            <button
              type="button"
              className={`shrink-0 ${item.enabled ? 'text-indigo-500' : 'text-slate-300 dark:text-gray-600'}`}
              aria-label={`${item.enabled ? 'Nonaktifkan' : 'Aktifkan'} ${item.label}`}
            >
              <ToggleRight size={28} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
