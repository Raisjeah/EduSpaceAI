'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Activity, Globe, BookOpen, BrainCircuit } from 'lucide-react';

const PRESETS = {
  default: [
    { text: "Menganalisis prompt...", icon: <Sparkles size={14} /> },
    { text: "Memproses informasi...", icon: <BrainCircuit size={14} /> },
    { text: "Menyusun kerangka jawaban...", icon: <Activity size={14} /> },
    { text: "Merumuskan kesimpulan...", icon: <BookOpen size={14} /> }
  ],
  'deep-search': [
    { text: "Query Analyzer: Membedah pertanyaan...", icon: <BrainCircuit size={14} /> },
    { text: "Tavily Node: Melakukan pencarian massal di web...", icon: <Globe size={14} /> },
    { text: "Jina Node: Mengekstrak konten dari sumber terpercaya...", icon: <BookOpen size={14} /> },
    { text: "Analyst Agent: Menyintesis data web...", icon: <Activity size={14} /> },
    { text: "Writer Agent: Menyusun jawaban final...", icon: <Sparkles size={14} /> }
  ]
};

export default function ThinkingIndicator({ agentId = 'default' }) {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = PRESETS[agentId] || PRESETS.default;

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 3000); // cycle every 3 seconds

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="flex flex-col gap-2 max-w-sm mb-4">
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20 shadow-sm w-fit">
        <div className="relative flex items-center justify-center w-6 h-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-indigo-200 border-t-indigo-600 dark:border-indigo-800 dark:border-t-indigo-400"
          />
          <motion.div
            key={stepIndex}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-indigo-600 dark:text-indigo-400"
          >
            {steps[stepIndex].icon}
          </motion.div>
        </div>

        <div className="h-5 overflow-hidden relative min-w-[220px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center"
            >
              <span className="text-[13px] font-semibold text-indigo-900 dark:text-indigo-300">
                {steps[stepIndex].text}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Steps Progress Track */}
      <div className="flex items-center gap-1 px-2">
        {steps.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 rounded-full flex-1 transition-all duration-500 ${
              idx <= stepIndex
                ? 'bg-indigo-500 dark:bg-indigo-400'
                : 'bg-slate-200 dark:bg-white/10'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
