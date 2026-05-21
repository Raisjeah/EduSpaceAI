'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Lock, Zap, Search, PenTool, Sparkles } from 'lucide-react';

const MODELS_DATA = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini-2.5-flash',
    description: 'Untuk respons cepat/simpel',
    label: 'Fastest',
    tier: 'FREE',
    icon: <Zap size={14} className="text-amber-400" />,
    provider: 'Google'
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini-2.5-pro',
    description: 'Untuk analisis akademik mendalam',
    tier: 'CLASSIC',
    icon: <Search size={14} className="text-blue-400" />,
    provider: 'Google'
  },
  {
    id: 'gemini-3.1-pro',
    name: 'Gemini-3.1-pro',
    description: 'Model paling cerdas untuk riset kompleks',
    label: 'Best for Research',
    tier: 'PRO',
    icon: <Sparkles size={14} className="text-indigo-400" />,
    provider: 'Google'
  },
  {
    id: 'claude-4-6-sonnet',
    name: 'Claude Sonnet 4.6',
    description: 'Untuk penulisan kreatif & koding',
    tier: 'ULTRA',
    icon: <PenTool size={14} className="text-orange-400" />,
    provider: 'Anthropic'
  },
  {
    id: 'gemini-3-pro-image-preview',
    name: 'Nano Banana (Image)',
    description: 'Generasi gambar canggih dengan Imagen 3',
    tier: 'ULTRA',
    icon: <Sparkles size={14} className="text-amber-500" />,
    provider: 'Google'
  },
];

const TIER_RANK = {
  'FREE': 0,
  'CLASSIC': 1,
  'PRO': 2,
  'ULTRA': 3,
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
        className="flex items-center gap-2 px-2 py-1.5 bg-neutral-900/5 dark:bg-white/5 hover:bg-neutral-900/10 dark:hover:bg-white/10 border border-transparent rounded-lg transition-all text-[11px] font-bold text-slate-600 dark:text-gray-400"
      >
        <span className="flex items-center gap-1.5 shrink-0">
          {activeModel.icon}
          <span className="hidden sm:inline">{activeModel.name}</span>
        </span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-4 w-[280px] sm:w-[320px] max-w-[85vw] bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="p-2 space-y-1">
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
                  className={`w-full flex flex-col p-2.5 rounded-lg transition-all text-left group ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30'
                      : 'hover:bg-slate-50 dark:hover:bg-[#252525] border border-transparent'
                  } ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded ${isSelected ? 'bg-indigo-100 dark:bg-indigo-500/20' : 'bg-slate-100 dark:bg-[#333]'}`}>
                        {model.icon}
                      </div>
                      <span className={`text-[13px] font-semibold ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-gray-200'}`}>
                        {model.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {model.label && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full font-bold uppercase tracking-wider">
                          {model.label}
                        </span>
                      )}
                      {isLocked && <Lock size={12} className="text-slate-400 dark:text-gray-500" />}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400 ml-7 line-clamp-1">
                    {model.description}
                  </p>
                  <div className="flex items-center gap-1.5 ml-7 mt-1">
                    <span className="text-[9px] text-slate-400 dark:text-gray-500 uppercase tracking-tight">{model.provider}</span>
                    <span className="text-[9px] text-slate-300 dark:text-gray-600">•</span>
                    <span className={`text-[9px] font-bold ${isLocked ? 'text-amber-500' : 'text-green-500'}`}>
                      {model.tier === 'FREE' ? 'Gratis' : `${model.tier} Plan`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="p-2 border-t border-slate-100 dark:border-[#333] bg-slate-50/50 dark:bg-[#151515]">
             <p className="text-[10px] text-center text-slate-400 dark:text-gray-500 italic">
               Model switching mempertahankan konteks percakapan.
             </p>
          </div>
        </div>
      )}
    </div>
  );
}
