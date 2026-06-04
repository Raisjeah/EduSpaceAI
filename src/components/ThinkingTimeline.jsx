'use client';

import { motion } from 'framer-motion';

export default function ThinkingTimeline({ currentIndex, states }) {
  return (
    <div className="flex flex-col gap-3 px-2 py-2">
      {states.map((state, idx) => {
        const isPast = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const isFuture = idx > currentIndex;

        return (
          <div key={state} className={`flex items-center gap-3 transition-opacity duration-500 ${isFuture ? 'opacity-30' : 'opacity-100'}`}>
            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
              isPast ? 'bg-blue-500/40' : 
              isCurrent ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] scale-125' : 
              'bg-slate-300 dark:bg-slate-700'
            }`} />
            <span className={`text-[12.5px] font-medium transition-colors duration-500 ${
              isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
            }`}>
              {state}
            </span>
          </div>
        );
      })}
    </div>
  );
}
