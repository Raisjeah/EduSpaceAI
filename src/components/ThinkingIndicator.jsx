'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function ThinkingIndicator({ status = "Dosen AI sedang berpikir..." }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-brand-background dark:bg-white/5 border border-brand-border dark:border-white/5 w-fit shadow-elevation-1">
      <div className="flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-brand-primary"
        >
          <Sparkles size={16} />
        </motion.div>
      </div>
      <div className="h-4 overflow-hidden relative min-w-[200px]">
        <AnimatePresence mode="wait">
          <motion.span
            key={status}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-[12px] font-medium text-slate-600 dark:text-gray-400 absolute inset-0"
          >
            {status}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
