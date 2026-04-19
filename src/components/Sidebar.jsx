'use client';

import { Plus, Wrench, User, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getChatHistory } from '@/app/actions/chatActions';

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen, setCurrentView, userId }) {
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    if (userId) {
      getChatHistory(userId).then(setChatHistory);
    }
  }, [userId]);

  const uniqueTitles = [...new Set(
    chatHistory.filter(h => h.role === 'user').map(item => item.text.substring(0, 25) + "...")
  )].slice(-5);

  return (
    <aside className={`
      fixed top-0 left-0 h-full z-50 bg-[#1F1F1F] border-r border-[#2A2A2A]
      transform transition-transform duration-300 ease-in-out flex-shrink-0
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      w-[240px] md:relative md:translate-x-0 md:w-[240px]
    `}>
      <div className="flex flex-col h-full p-4">
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
              <Menu size={18} />
            </button>
            <span className="font-bold text-[13px] text-white">EduSpaceAI</span>
          </div>
        </div>

        <button 
          onClick={() => setCurrentView('chat')}
          className="flex items-center gap-2 w-fit px-3 py-1.5 hover:bg-[#2A2A2A] rounded-full transition-colors mb-6 text-gray-300 border border-[#333]"
        >
          <Plus size={14} /> <span className="text-[11px] font-medium">New Chat</span>
        </button>

        <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
          <div onClick={() => setCurrentView('tools')} className="flex items-center gap-3 p-2 text-gray-400 hover:text-white hover:bg-[#2A2A2A] rounded-lg cursor-pointer transition-colors text-[11px] font-medium">
            <Wrench size={14} /> Tools & File Editor
          </div>
          
          <div className="mt-6 mb-2 px-2 text-[9px] font-bold text-gray-500 tracking-widest uppercase">History</div>
          {uniqueTitles.length === 0 ? (
            <div className="px-2 py-1 text-[10px] text-gray-600 italic">Belum ada riwayat</div>
          ) : (
            uniqueTitles.map((title, i) => (
              <div key={i} className="px-2 py-1.5 text-[11px] text-gray-400 truncate hover:text-white cursor-pointer transition-colors border-l-2 border-transparent hover:border-indigo-500">
                {title}
              </div>
            ))
          )}
        </nav>

        <div className="mt-auto pt-4 border-t border-[#2A2A2A] flex items-center gap-3 px-2">
          <div className="w-6 h-6 rounded-full bg-[#333] flex items-center justify-center"><User size={12} className="text-gray-400" /></div>
          <span className="text-[11px] font-medium text-gray-300">Rais Dev</span>
        </div>
      </div>
    </aside>
  );
}
