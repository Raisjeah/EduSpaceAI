'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export default function ThinkingIndicator({ status = "Understanding question" }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col gap-1.5 px-2 py-1 w-fit min-w-[220px]">
      <div className="h-[20px] overflow-hidden relative">
        {/* Text crossfade transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="text-[13px] font-medium text-slate-700 dark:text-blue-100/90 absolute inset-0 tracking-wide flex items-center"
          >
            {status}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Shimmer underline with soft blue glow */}
      <div className="h-[1px] w-full bg-slate-200 dark:bg-blue-900/40 overflow-hidden relative shadow-[0_0_10px_rgba(59,130,246,0.1)] dark:shadow-[0_0_12px_rgba(96,165,250,0.15)]">
        <motion.div
          animate={{ x: ['-100%', '300%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-blue-500/80 dark:via-blue-400 to-transparent"
        />
      </div>
    </div>
  );
}
