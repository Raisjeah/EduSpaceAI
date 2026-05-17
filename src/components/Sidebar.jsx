'use client';

import { Plus, Wrench, User, Menu, MessageSquare, LogOut, Briefcase, Rocket, Search, BookOpen, Edit3 } from 'lucide-react';
import { useEffect, useState, useMemo, useRef } from 'react';
import { getChatHistory } from '@/app/actions/chatActions';
import { logout } from '@/app/actions/authActions';
import { getProjects } from '@/app/actions/projectActions';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import ProjectModal from './ProjectModal';

export default function Sidebar({ 
  isSidebarOpen, 
  setIsSidebarOpen, 
  userId
}) {
  const [chatGroups, setChatGroups] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, searchQuery, setSearchQuery, fetchUser, showNotification } = useAuth();
  const lastFetchRef = useRef({ userId: null, projectId: null, pathname: null });

  const isProjectRoute = pathname.startsWith('/project/');
  const projectIdFromPath = isProjectRoute ? pathname.split('/')[2] : null;
  const projectIdFromQuery = searchParams.get('projectId');
  const activeProjectId = projectIdFromPath || projectIdFromQuery;

  // Projects jarang berubah, jadi cukup fetch saat user berubah
  useEffect(() => {
    let isMounted = true;
    const fetchProjects = async () => {
      if (!userId) return;
      try {
        const userProjects = await getProjects(userId);
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
        const history = await getChatHistory(userId, activeProjectId);
        if (isMounted) {
          setChatGroups(history);
          lastFetchRef.current = { userId, projectId: activeProjectId, pathname };
        }
      } catch (error) {
        console.error("Gagal memuat history chat:", error);
      }
    };

    fetchHistory();
    return () => { isMounted = false; };
  }, [userId, activeProjectId, pathname]);

  const groupedChatHistory = useMemo(() => {
    const filtered = !searchQuery.trim()
      ? chatGroups
      : chatGroups.filter(group => group.text.toLowerCase().includes(searchQuery.toLowerCase()));

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
      <aside className={`
        fixed top-0 left-0 h-full z-50 bg-white dark:bg-[#0F0F0F] border-r border-slate-200 dark:border-[#1E1E1E]
        transform transition-transform duration-300 ease-in-out flex-shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        w-[280px] transition-colors duration-200
      `}>
        <div className="flex flex-col h-full p-4">
          {/* Header / Brand */}
          <div className="flex items-center justify-between mb-6 px-2">
            <Link href="/" className="flex items-center gap-2" onClick={closeSidebar}>
              <div className="w-10 h-10 flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="EduSpaceAI Logo"
                  className="w-full h-full object-contain invert dark:invert-0"
                />
              </div>
              <span className="font-bold text-[14px] text-slate-900 dark:text-white tracking-tight transition-colors">EduSpaceAI</span>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <Menu size={18} />
            </button>
          </div>

          {/* Button New Chat / New Project */}
          <div className="flex flex-col gap-2 mb-6">
            <Link
              href="/"
              onClick={closeSidebar}
              className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all text-white shadow-lg shadow-indigo-900/20"
            >
              <Plus size={16} /> <span className="text-[12px] font-semibold">Percakapan Baru</span>
            </Link>
            <button
              onClick={() => { setIsProjectModalOpen(true); closeSidebar(); }}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] hover:bg-slate-200 dark:hover:bg-[#242424] rounded-xl transition-all text-slate-600 dark:text-gray-300"
            >
              <Briefcase size={14} /> <span className="text-[11px] font-semibold">Agent Baru</span>
            </button>

            {/* Search Input In Sidebar */}
            <div className="relative mt-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari history..."
                className="w-full bg-slate-100 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] rounded-xl py-2 pl-9 pr-4 text-[12px] text-slate-900 dark:text-white outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <Link
              href="/tools"
              onClick={closeSidebar}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all text-[12px] mb-2 ${
                pathname === '/tools'
                ? 'bg-slate-100 dark:bg-[#1A1A1A] text-slate-900 dark:text-white'
                : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1A1A1A]'
              }`}
            >
              <Wrench size={16} /> <span className="font-medium">Tools & File Editor</span>
            </Link>

            {/* Projects Section */}
            {projects.length > 0 && (
              <div className="mt-4 mb-2">
                <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 dark:text-gray-500 tracking-[0.1em] uppercase">WorkSpace Agents</div>
                <div className="space-y-1 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                  {projects.map(project => {
                    const isPathActive = pathname === `/project/${project._id}`;
                    const isQueryActive = searchParams.get('projectId') === project._id;
                    const isActive = isPathActive || isQueryActive;
                    const theme = getAgentTheme(project.agentId);
                    return (
                      <Link
                        key={project._id}
                        href={`/project/${project._id}`}
                        onClick={closeSidebar}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] transition-all border-l-2 ${
                          isActive
                          ? theme.active
                          : `text-slate-500 dark:text-gray-400 ${theme.hover} hover:text-slate-900 dark:hover:text-gray-200 border-transparent`
                        }`}
                      >
                        {getAgentIcon(project.agentId)}
                        <span className="truncate">{project.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="mt-4 mb-3 px-3 text-[10px] font-bold text-slate-400 dark:text-gray-500 tracking-[0.1em] uppercase">
              {isProjectContext ? 'Riwayat Agent' : 'Riwayat Belajar'}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
              {groupedChatHistory.length === 0 ? (
                <div className="px-3 py-4 text-[11px] text-slate-500 dark:text-gray-600 italic text-center bg-slate-50 dark:bg-[#151515] rounded-xl border border-dashed border-slate-200 dark:border-[#222]">
                  {searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada percakapan'}
                </div>
              ) : (
                groupedChatHistory.map((group) => (
                  <div key={group.label} className="space-y-1">
                    <div className="px-3 py-1 text-[9px] font-bold text-slate-400 dark:text-gray-600 uppercase tracking-wider">{group.label}</div>
                    {group.items.map((chat) => {
                      const isActive = pathname.includes(`/chat/${chat._id}`);
                      const currentProjectId = (pathname.startsWith('/project/') ? pathname.split('/')[2] : null) || searchParams.get('projectId');
                      const href = `/chat/${chat._id}${currentProjectId ? `?projectId=${currentProjectId}` : ''}`;

                      return (
                        <Link
                          key={chat._id}
                          href={href}
                          onClick={closeSidebar}
                          className={`group flex items-center gap-3 px-3 py-2.5 text-[12px] rounded-xl cursor-pointer transition-all border-l-4 ${
                            isActive
                            ? 'bg-slate-100 dark:bg-[#1A1A1A] text-slate-900 dark:text-white border-indigo-500'
                            : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:bg-slate-50 dark:hover:bg-[#151515] border-transparent'
                          }`}
                        >
                          <MessageSquare size={14} className={isActive ? 'text-indigo-400' : 'text-gray-600 group-hover:text-indigo-400/50'} />
                          <span className="truncate flex-1">{chat.text}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </nav>

          {/* User Profile or Login Button */}
          <div className="mt-auto pt-4 border-t border-slate-200 dark:border-[#1E1E1E]">
            {userId ? (
              <div className="space-y-4 px-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-inner overflow-hidden">
                      {user?.image ? (
                        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={14} className="text-white" />
                      )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[12px] font-bold text-slate-800 dark:text-gray-200 truncate max-w-[120px]">{user?.name || 'Anon'}</span>
                        <span className="text-[9px] text-slate-400 dark:text-gray-500">Free Account</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
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
          </div>
        </div>
      </aside>

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        userId={userId}
      />
    </>
  );
}
