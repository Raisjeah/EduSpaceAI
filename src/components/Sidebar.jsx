'use client';

import { Plus, Wrench, User, Menu, MessageSquare, LogOut, Briefcase, Rocket, Search, BookOpen, Edit3, Mic, Trash2 } from 'lucide-react';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useLayout } from '@/context/LayoutContext';
import { getChatHistory, deleteChatHistory } from '@/app/actions/chatActions';
import { logout } from '@/app/actions/authActions';
import { getProjects } from '@/app/actions/projectActions';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import useAuth from '@/hooks/useAuth';

export default function Sidebar({ 
  userId
}) {
  const { isSidebarOpen, setIsSidebarOpen, isProjectModalOpen, setIsProjectModalOpen } = useLayout();
  const [chatGroups, setChatGroups] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, searchQuery, setSearchQuery, fetchUser, showNotification } = useAuth();
  const lastFetchRef = useRef({ userId: null, projectId: null, pathname: null });


  // Projects jarang berubah, jadi cukup fetch saat user berubah
  useEffect(() => {
    let isMounted = true;
    const fetchProjects = async () => {
      if (!userId) return;
      try {
        const userProjects = await getProjects();
        if (isMounted) {
          setProjects(userProjects);
        }
      } catch (error) {
        console.error("Gagal memuat project:", error);
      }
    };

    fetchProjects();
    return () => { isMounted = false; };
  }, [userId]);

  const isProjectRoute = pathname.startsWith('/project/');
  const projectIdFromPath = isProjectRoute ? pathname.split('/')[2] : null;
  const projectIdFromQuery = searchParams.get('projectId');
  const activeProjectId = projectIdFromPath || projectIdFromQuery;

  // History chat di-refresh berdasarkan konteks project aktif
  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      if (!userId) return;

      // Cek apakah data sudah pernah di-fetch untuk konteks yang sama
      if (
        lastFetchRef.current.userId === userId &&
        lastFetchRef.current.projectId === activeProjectId &&
        lastFetchRef.current.pathname === pathname
      ) {
        return;
      }

      try {
        setIsLoadingHistory(true);
        const history = await getChatHistory(activeProjectId);
        if (isMounted) {
          setChatGroups(history);
          lastFetchRef.current = { userId, projectId: activeProjectId, pathname };
          setIsLoadingHistory(false);
        }
      } catch (error) {
        console.error("Gagal memuat history chat:", error);
        if (isMounted) setIsLoadingHistory(false);
      }
    };

    fetchHistory();
    return () => { isMounted = false; };
  }, [userId, activeProjectId, pathname]);

  const groupedChatHistory = useMemo(() => {
    // Filter history based on mode: if projectId exists, only show chats for that project.
    // If no projectId, only show chats without project.
    let currentHistory = chatGroups;
    if (activeProjectId) {
      currentHistory = chatGroups.filter(chat => chat.projectId === activeProjectId);
    } else {
      currentHistory = chatGroups.filter(chat => !chat.projectId);
    }

    const filtered = !searchQuery.trim()
      ? currentHistory
      : currentHistory.filter(chat => chat.text.toLowerCase().includes(searchQuery.toLowerCase()));

    const groups = {
      today: { label: 'Hari Ini', items: [] },
      yesterday: { label: 'Kemarin', items: [] },
      last7Days: { label: '7 Hari Terakhir', items: [] },
      older: { label: 'Sebelumnya', items: [] }
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);

    filtered.forEach(chat => {
      const chatDate = new Date(chat.createdAt || Date.now());
      const chatDay = new Date(chatDate.getFullYear(), chatDate.getMonth(), chatDate.getDate());

      if (chatDay.getTime() === today.getTime()) {
        groups.today.items.push(chat);
      } else if (chatDay.getTime() === yesterday.getTime()) {
        groups.yesterday.items.push(chat);
      } else if (chatDay.getTime() >= last7Days.getTime()) {
        groups.last7Days.items.push(chat);
      } else {
        groups.older.items.push(chat);
      }
    });

    return Object.values(groups).filter(g => g.items.length > 0);
  }, [chatGroups, searchQuery]);

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    await fetchUser();
    showNotification('Keluar');
    router.push('/');
  };

  const handleDeleteChat = async (e, chatId) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm('Hapus percakapan ini secara permanen?')) {
      try {
        const result = await deleteChatHistory(chatId);
        if (result.success) {
          setChatGroups(prev => prev.filter(chat => chat._id !== chatId));
          showNotification('Percakapan dihapus');
          if (pathname.includes(`/chat/${chatId}`)) {
            router.push('/');
          }
        }
      } catch (err) {
        console.error("Gagal menghapus:", err);
      }
    }
  };

  const getAgentIcon = (agentId) => {
    switch (agentId) {
      case 'deep-search': return <Search size={14} className="text-blue-400" />;
      case 'researcher': return <BookOpen size={14} className="text-green-400" />;
      case 'editor': return <Edit3 size={14} className="text-amber-400" />;
      default: return <Rocket size={14} className="text-indigo-400" />;
    }
  };

  const getAgentTheme = (agentId) => {
    switch (agentId) {
      case 'deep-search': return {
        active: 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-500',
        hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/10'
      };
      case 'researcher': return {
        active: 'bg-green-600/10 text-green-600 dark:text-green-400 border-green-500',
        hover: 'hover:bg-green-50 dark:hover:bg-green-900/10'
      };
      case 'editor': return {
        active: 'bg-amber-600/10 text-amber-600 dark:text-amber-400 border-amber-500',
        hover: 'hover:bg-amber-50 dark:hover:bg-amber-900/10'
      };
      default: return {
        active: 'bg-indigo-600/10 text-indigo-600 dark:text-white border-indigo-500',
        hover: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/10'
      };
    }
  };

  const isProjectContext = pathname.startsWith('/project/') || searchParams.has('projectId');

  return (
    <>
      <aside
        aria-label="Sidebar Percakapan"
        className={`
        fixed top-0 left-0 h-full z-50
        bg-white dark:bg-[#0F0F0F]
        border-r border-neutral-200/50 dark:border-neutral-800/50
        transform transition-transform duration-300 ease-in-out flex-shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        w-[85vw] max-w-[280px] sm:w-[280px] transition-colors duration-200
      `}>
        <div className="flex flex-col h-full p-4">
          {/* Spacer for floating header button area */}
          <div className="h-14 md:hidden" />

          {/* Button New Chat */}
          <div className="flex flex-col gap-0.5 mb-6">
            <Link
              href="/"
              onClick={closeSidebar}
              aria-label="Mulai percakapan baru"
              className="flex items-center gap-3 w-full px-3 py-2 text-[13px] font-medium text-slate-700 dark:text-gray-300 hover:bg-white/5 dark:hover:bg-white/5 transition-all"
            >
              <Plus size={18} className="text-slate-500 dark:text-gray-400" />
              <span>Percakapan baru</span>
            </Link>

            {/* Search Input In Sidebar */}
            <div className="relative mt-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari history..."
                aria-label="Cari riwayat percakapan"
                className="w-full liquid-glass rounded-xl py-2 pl-8 pr-3 sm:pr-4 text-[11px] sm:text-[12px] text-slate-900 dark:text-white outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 flex flex-col min-h-0 overflow-hidden" aria-label="Riwayat Percakapan">
            <div className="mt-4 mb-3 px-3 text-[10px] font-bold text-slate-400 dark:text-gray-500 tracking-[0.1em] uppercase" aria-hidden="true">
              {isProjectContext ? 'Riwayat Agent' : 'Riwayat Belajar'}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
              {isLoadingHistory ? (
                <div className="space-y-4 px-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="space-y-2 animate-pulse">
                      <div className="h-2 w-12 bg-slate-100 dark:bg-white/5 rounded" />
                      <div className="h-8 w-full bg-slate-100 dark:bg-white/5 rounded-lg" />
                      <div className="h-8 w-full bg-slate-100 dark:bg-white/5 rounded-lg opacity-60" />
                    </div>
                  ))}
                </div>
              ) : groupedChatHistory.length === 0 ? (
                <div className="px-3 py-4 text-[11px] text-slate-500 dark:text-gray-600 italic text-center bg-slate-50 dark:bg-[#151515] rounded-xl border border-dashed border-slate-200 dark:border-[#222]">
                  {searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada percakapan'}
                </div>
              ) : (
                groupedChatHistory.map((group) => (
                  <div key={group.label} className="space-y-1">
                    <div className="px-3 py-1 text-[9px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-wider" aria-hidden="true">{group.label}</div>
                    {group.items.map((chat) => {
                      const isActive = pathname.includes(`/chat/${chat._id}`);
                      const currentProjectId = (pathname.startsWith('/project/') ? pathname.split('/')[2] : null) || searchParams.get('projectId');
                      const href = `/chat/${chat._id}${currentProjectId ? `?projectId=${currentProjectId}` : ''}`;

                      return (
                        <Link
                          key={chat._id}
                          href={href}
                          onClick={closeSidebar}
                          aria-current={isActive ? "page" : undefined}
                          className={`group relative flex items-center gap-3 px-3 py-2 text-[13px] cursor-pointer transition-all ${
                            isActive
                            ? 'text-slate-900 dark:text-white font-semibold'
                            : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200'
                          }`}
                        >
                          <MessageSquare size={14} className={isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-indigo-400/50'} aria-hidden="true" />
                          <span className="truncate flex-1">{chat.text}</span>
                          <button
                            onClick={(e) => handleDeleteChat(e, chat._id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-md transition-all shrink-0"
                            title="Hapus chat"
                            aria-label={`Hapus percakapan: ${chat.text}`}
                          >
                            <Trash2 size={12} />
                          </button>
                        </Link>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </nav>

          {/* User Profile or Login Button */}
          <footer className="mt-auto pt-4 border-t border-white/10">
            {userId ? (
              <div className="space-y-4 px-2 py-3 bg-white/5 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg overflow-hidden border border-white/20" aria-hidden="true">
                      {user?.image ? (
                        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={14} className="text-white" />
                      )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[12px] font-bold text-slate-800 dark:text-gray-200 truncate max-w-[120px]">{user?.name || 'Anon'}</span>
                        <span className="text-[9px] font-medium text-indigo-500 dark:text-indigo-400">{user?.current_plan || 'FREE'}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  aria-label="Keluar dari akun"
                  className="flex items-center gap-3 w-full p-3 text-[12px] font-medium text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-500/5 dark:hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <LogOut size={16} />
                  <span>Keluar</span>
                </button>
              </div>
            ) : (
              <div className="px-2">
                <Link
                  href="/auth/login"
                  onClick={closeSidebar}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 dark:bg-[#1A1A1A] hover:bg-slate-200 dark:hover:bg-[#252525] border border-slate-200 dark:border-[#2A2A2A] text-slate-700 dark:text-gray-200 rounded-xl transition-all text-[12px] font-semibold"
                >
                  Login / Daftar
                </Link>
              </div>
            )}
          </footer>
        </div>
      </aside>

    </>
  );
}
