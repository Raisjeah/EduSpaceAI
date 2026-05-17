'use client';

import { motion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ThinkingIndicator() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 90) return oldProgress;
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 90);
      });
    }, 800);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 p-4 bg-slate-50 dark:bg-[#1A1A1A] rounded-2xl border border-slate-200 dark:border-[#333] w-fit min-w-[240px] shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <BrainCircuit size={16} className="text-indigo-500 animate-pulse" />
          </div>
          <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping opacity-50" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-900 dark:text-white">
            Dosen AI sedang berpikir...
          </p>
          <p className="text-[10px] text-slate-500">
            Menganalisis & menyusun jawaban
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-slate-200 dark:bg-[#333] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
}
