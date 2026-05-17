'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Lock, Zap, Search, PenTool, Sparkles, Star, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MODELS_DATA = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini-2.5-flash',
    description: 'Untuk respons cepat/simpel',
    label: 'Fastest',
    tier: 'FREE',
    icon: <Zap size={14} className="text-emerald-400" />,
    provider: 'Google',
    color: 'emerald'
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini-2.5-pro',
    description: 'Untuk analisis akademik mendalam',
    tier: 'CLASSIC',
    icon: <Search size={14} className="text-blue-400" />,
    provider: 'Google',
    color: 'blue'
  },
  {
    id: 'gemini-3.1-pro',
    name: 'Gemini-3.1-pro',
    description: 'Model paling cerdas untuk riset kompleks',
    label: 'Best for Research',
    tier: 'PRO',
    icon: <Sparkles size={14} className="text-indigo-400" />,
    provider: 'Google',
    color: 'indigo'
  },
  {
    id: 'claude-4-6-sonnet',
    name: 'Claude Sonnet 4.6',
    description: 'Untuk penulisan kreatif & koding',
    tier: 'ULTRA',
    icon: <PenTool size={14} className="text-orange-400" />,
    provider: 'Anthropic',
    color: 'orange'
  },
  {
    id: 'gemini-3-pro-image-preview',
    name: 'Nano Banana (Image)',
    description: 'Generasi gambar canggih dengan Imagen 3',
    tier: 'ULTRA',
    icon: <Rocket size={14} className="text-amber-500" />,
    provider: 'Google',
    color: 'amber'
  },
];

const TIER_RANK = {
  'FREE': 0,
  'CLASSIC': 1,
  'PRO': 2,
  'ULTRA': 3,
};

const TIER_COLORS = {
  'FREE': 'bg-emerald-500/10 text-emerald-500',
  'CLASSIC': 'bg-blue-500/10 text-blue-500',
  'PRO': 'bg-indigo-500/10 text-indigo-500',
  'ULTRA': 'bg-amber-500/10 text-amber-500',
};

export default function ModelSelector({ currentPlan, selectedModel, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeModel = MODELS_DATA.find(m => m.id === selectedModel) || MODELS_DATA[0];
  const userRank = TIER_RANK[currentPlan] || 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-[#1A1A1A] hover:bg-slate-50 dark:hover:bg-[#222] border border-slate-200 dark:border-[#333] rounded-xl transition-all text-[12px] font-bold text-slate-700 dark:text-gray-200 shadow-sm hover:shadow-md"
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center">
            {activeModel.icon}
          </div>
          <span>{activeModel.name}</span>
        </div>
        <ChevronDown size={14} className={`transition-transform duration-300 text-slate-400 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full right-0 mb-3 w-80 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl bg-white/95 dark:bg-[#1A1A1A]/95"
          >
            <div className="p-2.5 space-y-1.5">
              <div className="px-3 py-2">
                <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Pilih Model AI</p>
              </div>

              {MODELS_DATA.map((model) => {
                const isLocked = TIER_RANK[model.tier] > userRank;
                const isSelected = selectedModel === model.id;

                return (
                  <button
                    key={model.id}
                    disabled={isLocked}
                    onClick={() => {
                      onSelect(model.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex flex-col p-3 rounded-xl transition-all text-left group relative ${
                      isSelected
                        ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border border-indigo-200/50 dark:border-indigo-500/30'
                        : 'hover:bg-slate-50 dark:hover:bg-[#252525] border border-transparent'
                    } ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${
                          isSelected ? 'bg-indigo-100 dark:bg-indigo-500/20' : 'bg-slate-100 dark:bg-[#333]'
                        }`}>
                          {model.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[13px] font-bold ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-gray-200'}`}>
                              {model.name}
                            </span>
                            {model.label && (
                              <span className="text-[8px] px-1.5 py-0.5 bg-indigo-500 text-white rounded-full font-bold uppercase tracking-wider">
                                {model.label}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-gray-400 line-clamp-1">
                            {model.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isLocked ? (
                          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#333] text-slate-400">
                            <Lock size={12} />
                          </div>
                        ) : isSelected && (
                          <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-[38px] mt-1">
                      <span className="text-[9px] text-slate-400 dark:text-gray-500 uppercase font-medium">{model.provider}</span>
                      <span className="text-[9px] text-slate-300 dark:text-gray-600">•</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${TIER_COLORS[model.tier]}`}>
                        {model.tier}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-3 border-t border-slate-100 dark:border-[#333] bg-slate-50/50 dark:bg-[#151515] flex items-center justify-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
               <p className="text-[10px] text-slate-500 dark:text-gray-400 font-medium">
                 Model switching aktif • Konteks terjaga
               </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
