'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Workflow } from 'lucide-react';
import { AGENT_LIST, getAgentIcon, getAgentTheme } from '@/lib/agentUtils';

export default function AgentSelector({ currentAgent = 'default', onSelect, projectId }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAgentChange = (agentId) => {
    onSelect(agentId);
    setIsOpen(false);
  };

  const handleOpenAgentHub = () => {
    router.push('/agents');
    setIsOpen(false);
  };

  const currentAgentData = AGENT_LIST.find((agent) => agent.id === currentAgent) || AGENT_LIST[0];
  const theme = getAgentTheme(currentAgent);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${theme.softBg} ${theme.text} border ${theme.border} transition-all hover:scale-[1.02]`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {getAgentIcon(currentAgent, 14)}
        <span className="text-[10px] font-bold uppercase tracking-wider max-w-[110px] truncate">{currentAgentData.name}</span>
        <ChevronDown size={14} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 sm:left-0 sm:right-auto mb-2 w-64 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] rounded-xl shadow-xl overflow-hidden z-50">
          <div className="p-2 space-y-1">
            {AGENT_LIST.map((agent) => (
              <button
                key={agent.id}
                type="button"
                onClick={() => handleAgentChange(agent.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  currentAgent === agent.id
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                    : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-gray-300'
                }`}
                role="menuitem"
              >
                {getAgentIcon(agent.id, 16)}
                <div className="text-left min-w-0">
                  <div className="text-sm font-semibold truncate">{agent.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{agent.desc}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="border-t border-slate-200 dark:border-[#333] p-2">
            <button
              type="button"
              onClick={handleOpenAgentHub}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-gray-400 transition-all"
            >
              <Workflow size={14} />
              <span className="text-xs font-medium">Buka Agent Hub</span>
              {projectId && <span className="ml-auto text-[9px] text-slate-400">Workspace</span>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
