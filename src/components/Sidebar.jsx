'use client';

import { Plus, Wrench, User, Menu, MessageSquare, LogOut } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { getChatHistory } from '@/app/actions/chatActions';
import { logout } from '@/app/actions/authActions';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';

export default function Sidebar({ 
  isSidebarOpen, 
  setIsSidebarOpen, 
  userId
}) {
  const [chatGroups, setChatGroups] = useState([]);
  const pathname = usePathname();
  const router = useRouter();
  const { user, searchQuery, fetchUser } = useAuth();

  // 1. Ambil history yang sudah dikelompokkan berdasarkan chatId dari database
  const fetchHistory = async () => {
    if (userId) {
      const history = await getChatHistory(userId);
      setChatGroups(history);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [userId, pathname]);

  const filteredChatGroups = useMemo(() => {
    if (!searchQuery.trim()) return chatGroups;
    return chatGroups.filter(group =>
      group.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chatGroups, searchQuery]);

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    await fetchUser();
    router.push('/');
    router.refresh();
  };

  return (
    <aside className={`
      fixed top-0 left-0 h-full z-50 bg-[#0F0F0F] border-r border-[#1E1E1E]
      transform transition-transform duration-300 ease-in-out flex-shrink-0
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      w-[260px] md:relative md:translate-x-0 md:w-[260px]
    `}>
      <div className="flex flex-col h-full p-4">
        {/* Header / Brand */}
        <div className="flex items-center justify-between mb-6 px-2">
          <Link href="/" className="flex items-center gap-2" onClick={closeSidebarOnMobile}>
            <span className="font-bold text-[14px] text-white tracking-tight">EduSpaceAI</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <Menu size={18} />
          </button>
        </div>

        {/* Button New Chat */}
        <Link
          href="/"
          onClick={closeSidebarOnMobile}
          className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all mb-6 text-white shadow-lg shadow-indigo-900/20"
        >
          <Plus size={16} /> <span className="text-[12px] font-semibold">Percakapan Baru</span>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col min-h-0">
          <Link
            href="/tools"
            onClick={closeSidebarOnMobile}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all text-[12px] mb-2 ${
              pathname === '/tools'
              ? 'bg-[#1A1A1A] text-white'
              : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'
            }`}
          >
            <Wrench size={16} /> <span className="font-medium">Tools & File Editor</span>
          </Link>
          
          <div className="mt-4 mb-3 px-3 text-[10px] font-bold text-gray-500 tracking-[0.1em] uppercase">Riwayat Belajar</div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-2">
            {filteredChatGroups.length === 0 ? (
              <div className="px-3 py-4 text-[11px] text-gray-600 italic text-center bg-[#151515] rounded-xl border border-dashed border-[#222]">
                {searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada percakapan'}
              </div>
            ) : (
              filteredChatGroups.map((group) => {
                const isActive = pathname === `/chat/${group._id}`;
                return (
                  <Link
                    key={group._id}
                    href={`/chat/${group._id}`}
                    onClick={closeSidebarOnMobile}
                    className={`group flex items-center gap-3 px-3 py-3 text-[12px] rounded-xl cursor-pointer transition-all border-l-4 ${
                      isActive
                      ? 'bg-[#1A1A1A] text-white border-indigo-500'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#151515] border-transparent'
                    }`}
                  >
                    <MessageSquare size={14} className={isActive ? 'text-indigo-400' : 'text-gray-600'} />
                    <span className="truncate flex-1">{group.text}</span>
                  </Link>
                );
              })
            )}
          </div>
        </nav>

        {/* User Profile or Login Button */}
        <div className="mt-auto pt-4 border-t border-[#1E1E1E]">
          {userId ? (
            <div className="space-y-4 px-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-inner">
                      <User size={14} className="text-white" />
                  </div>
                  <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-gray-200 truncate max-w-[120px]">{user?.name || 'Anon'}</span>
                      <span className="text-[9px] text-gray-500">Free Account</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full p-3 text-[12px] font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
              >
                <LogOut size={16} />
                <span>Keluar</span>
              </button>
            </div>
          ) : (
            <div className="px-2">
              <Link
                href="/auth/login"
                onClick={closeSidebarOnMobile}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#1A1A1A] hover:bg-[#252525] border border-[#2A2A2A] text-gray-200 rounded-xl transition-all text-[12px] font-semibold"
              >
                Login / Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
