'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Loader2, Sparkles, Search, BookOpen, Edit3, Code, FileText, CheckCircle2, Globe, AlertCircle, Play, Square } from 'lucide-react';

export default function ModernThinking({ 
  status, 
  states, 
  currentIndex, 
  agentId = 'default', 
  isDone = false, 
  mode = 'agent', // 'simple' | 'agent'
  hitlData = null,
  onHitlAction = null
}) {
  const [isExpanded, setIsExpanded] = useState(!isDone);

  if (mode === 'simple') {
    return (
      <div className="flex items-center gap-1.5 px-3 py-2 max-w-fit">
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
          className="w-1.5 h-1.5 rounded-full bg-indigo-500"
        />
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
          className="w-1.5 h-1.5 rounded-full bg-indigo-500/70"
        />
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
          className="w-1.5 h-1.5 rounded-full bg-indigo-500/40"
        />
      </div>
    );
  }

  const getAgentIcon = () => {
    switch (agentId) {
      case 'deep-search': return <Search size={14} />;
      case 'researcher': return <BookOpen size={14} />;
      case 'editor': return <Edit3 size={14} />;
      case 'visualizer': return <Code size={14} />;
      case 'citation': return <FileText size={14} />;
      default: return <Sparkles size={14} />;
    }
  };

  const getAgentTheme = () => {
    switch (agentId) {
      case 'deep-search': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'researcher': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'editor': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'visualizer': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'citation': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
    }
  };

  const hasMultipleStates = states && states.length > 0;

  return (
    <div className="flex flex-col mb-4 max-w-2xl bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-4 py-3 w-full hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group cursor-pointer border-b border-transparent data-[expanded=true]:border-slate-100 dark:data-[expanded=true]:border-[#222]"
        data-expanded={isExpanded}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? "Sembunyikan detail" : "Tampilkan detail"}
      >
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-7 h-7 rounded-lg border ${getAgentTheme()} ${!isDone && !hitlData ? 'animate-pulse' : ''}`}>
            {isDone ? <CheckCircle2 size={14} /> : getAgentIcon()}
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[13px] font-bold text-slate-800 dark:text-gray-200 leading-tight">
              {hitlData ? 'Membutuhkan Arahan Anda' : isDone ? 'Proses Selesai' : 'Agen Sedang Bekerja'}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-gray-400 font-medium">
              {status || (isDone ? 'Semua tugas telah diselesaikan' : 'Memproses instruksi...')}
            </span>
          </div>
        </div>
        
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-gray-200 ml-4"
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden bg-slate-50 dark:bg-[#151515]"
          >
            <div className="p-4 flex flex-col gap-3">
              {hasMultipleStates ? (
                <div className="flex flex-col gap-3 relative">
                  <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-slate-200 dark:bg-[#333] rounded-full" />
                  {states.map((state, idx) => {
                    const isPast = idx < currentIndex;
                    const isCurrent = idx === currentIndex;
                    const isFuture = idx > currentIndex;
                    
                    return (
                      <div key={idx} className={`flex items-start gap-3 relative z-10 ${isFuture ? 'opacity-40' : 'opacity-100'}`}>
                        <div className="mt-0.5 shrink-0 bg-slate-50 dark:bg-[#151515] py-1">
                          {isPast ? (
                            <CheckCircle2 size={16} className="text-emerald-500" />
                          ) : isCurrent ? (
                            hitlData ? (
                              <AlertCircle size={16} className="text-amber-500 animate-pulse" />
                            ) : (
                              <Loader2 size={16} className="text-indigo-500 animate-spin" />
                            )
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-[#444] bg-slate-50 dark:bg-[#151515]" />
                          )}
                        </div>
                        <span className={`text-[12px] leading-relaxed pt-1 ${isCurrent ? 'text-slate-800 dark:text-gray-100 font-semibold' : 'text-slate-600 dark:text-gray-400 font-medium'}`}>
                          {state}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Loader2 size={14} className="text-indigo-500 animate-spin" />
                  <span className="text-[12px] text-slate-800 dark:text-gray-100 font-medium">
                    {status}
                  </span>
                </div>
              )}

              {/* HITL UI (Human-in-the-Loop) */}
              {hitlData && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 p-3 bg-white dark:bg-[#1A1A1A] border border-amber-200 dark:border-amber-900/30 rounded-xl shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Globe size={14} className="text-amber-600 dark:text-amber-500" />
                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Temuan Deep Search</span>
                  </div>
                  <p className="text-[12px] text-slate-600 dark:text-gray-300 mb-3 font-medium">
                    Agen telah menemukan {hitlData.sources?.length || 0} sumber referensi. Apakah Anda ingin agen melanjutkan membaca dan menganalisis sumber-sumber ini?
                  </p>
                  
                  {hitlData.sources && hitlData.sources.length > 0 && (
                    <div className="flex flex-col gap-1.5 mb-4 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                      {hitlData.sources.map((src, i) => (
                        <div key={i} className="flex flex-col p-2 rounded-lg bg-slate-50 dark:bg-[#222] border border-slate-100 dark:border-[#333]">
                          <span className="text-[11px] font-semibold text-slate-800 dark:text-gray-200 line-clamp-1">{src.title}</span>
                          <span className="text-[10px] text-slate-500 dark:text-gray-500 line-clamp-1">{src.domain || src.url}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => onHitlAction && onHitlAction('continue')}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-[11px] font-bold transition-all shadow-sm"
                    >
                      <Play size={12} /> Lanjutkan Analisis
                    </button>
                    <button
                      onClick={() => onHitlAction && onHitlAction('stop')}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-white dark:bg-[#222] hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-[#333] hover:border-red-200 dark:hover:border-red-900/50 px-3 py-2 rounded-lg text-[11px] font-bold transition-all"
                    >
                      <Square size={12} /> Berhenti di Sini
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
