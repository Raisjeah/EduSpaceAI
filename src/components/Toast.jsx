'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const DURATION = 3000;

export default function Toast({ message, type = 'success', onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    setIsVisible(true);
    
    // Progress bar animation
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 16);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, DURATION);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      border: 'border-emerald-200 dark:border-emerald-500/20',
      text: 'text-emerald-700 dark:text-emerald-400',
      bar: 'bg-emerald-500',
    },
    error: {
      icon: XCircle,
      bg: 'bg-red-50 dark:bg-red-500/10',
      border: 'border-red-200 dark:border-red-500/20',
      text: 'text-red-700 dark:text-red-400',
      bar: 'bg-red-500',
    },
    info: {
      icon: Info,
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      border: 'border-blue-200 dark:border-blue-500/20',
      text: 'text-blue-700 dark:text-blue-400',
      bar: 'bg-blue-500',
    },
  };

  const c = config[type] || config.success;
  const Icon = c.icon;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed top-4 sm:top-6 pt-[env(safe-area-inset-top)] left-1/2 -translate-x-1/2 z-[100] max-w-sm w-full px-4 transition-all duration-300 transform ${
        isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-6 opacity-0 scale-95'
      }`}
    >
      <div className={`relative overflow-hidden flex items-center gap-3 px-4 py-3.5 rounded-2xl border shadow-2xl backdrop-blur-md ${c.bg} ${c.border}`}>
        <Icon size={18} className={c.text} />
        <span className={`text-sm font-semibold flex-1 ${c.text}`}>{message}</span>
        <button
          aria-label="Tutup notifikasi"
          onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }}
          className={`opacity-60 hover:opacity-100 transition-opacity ${c.text}`}
        >
          <X size={15} />
        </button>
        {/* Progress bar */}
        <div
          className={`absolute bottom-0 left-0 h-[2px] ${c.bar} transition-none`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
