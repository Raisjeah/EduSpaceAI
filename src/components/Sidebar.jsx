'use client';

import { Plus, Wrench, User, Menu, MessageSquare, LogOut, Briefcase, Rocket, Search, BookOpen, Edit3 } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
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
  const { user, searchQuery, fetchUser, showNotification } = useAuth();

  // Optimistic History Update: Refetch history when route changes
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      // Jalankan fetch secara paralel untuk performa lebih cepat
      const isProjectRoute = pathname.startsWith('/project/');
      const projectIdFromPath = isProjectRoute ? pathname.split('/')[2] : null;
      const projectIdFromQuery = searchParams.get('projectId');
      const projectId = projectIdFromPath || projectIdFromQuery;

      try {
        const [history, userProjects] = await Promise.all([
          getChatHistory(userId, projectId),
          getProjects(userId)
        ]);

        setChatGroups(history);
        setProjects(userProjects);
      } catch (error) {
        console.error("Gagal memuat data sidebar:", error);
      }
    };

    fetchData();
  }, [userId, pathname, searchParams]);

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
    showNotification('Keluar');
    router.push('/');
    router.refresh();
  };

  const getAgentIcon = (agentId) => {
    switch (agentId) {
      case 'deep-search': return <Search size={14} className="text-blue-400" />;
      case 'researcher': return <BookOpen size={14} className="text-green-400" />;
      case 'editor': return <Edit3 size={14} className="text-amber-400" />;
      default: return <Rocket size={14} className="text-indigo-400" />;
    }
  };

  const isProjectContext = pathname.startsWith('/project/') || searchParams.has('projectId');

  return (
    <>
      <aside className={`
        fixed top-0 left-0 h-full z-50 bg-white dark:bg-[#0F0F0F] border-r border-slate-200 dark:border-[#1E1E1E]
        transform transition-transform duration-300 ease-in-out flex-shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        w-[260px] md:relative md:translate-x-0 md:w-[260px] transition-colors duration-200
      `}>
        <div className="flex flex-col h-full p-4">
          {/* Header / Brand */}
          <div className="flex items-center justify-between mb-6 px-2">
            <Link href="/" className="flex items-center gap-2" onClick={closeSidebarOnMobile}>
              <span className="font-bold text-[14px] text-slate-900 dark:text-white tracking-tight transition-colors">EduSpaceAI</span>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <Menu size={18} />
            </button>
          </div>

          {/* Button New Chat / New Project */}
          <div className="flex flex-col gap-2 mb-6">
            <Link
              href="/"
              onClick={closeSidebarOnMobile}
              className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all text-white shadow-lg shadow-indigo-900/20"
            >
              <Plus size={16} /> <span className="text-[12px] font-semibold">Percakapan Baru</span>
            </Link>
            <button
              onClick={() => { setIsProjectModalOpen(true); closeSidebarOnMobile(); }}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] hover:bg-slate-200 dark:hover:bg-[#242424] rounded-xl transition-all text-slate-600 dark:text-gray-300"
            >
              <Briefcase size={14} /> <span className="text-[11px] font-semibold">Agent Baru</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <Link
              href="/tools"
              onClick={closeSidebarOnMobile}
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
                    return (
                      <Link
                        key={project._id}
                        href={`/project/${project._id}`}
                        onClick={closeSidebarOnMobile}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] transition-all ${
                          isActive ? 'bg-indigo-600/10 text-indigo-600 dark:text-white border-l-2 border-indigo-500' : 'text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-[#151515] hover:text-slate-900 dark:hover:text-gray-200'
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

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-2">
              {filteredChatGroups.length === 0 ? (
                <div className="px-3 py-4 text-[11px] text-slate-500 dark:text-gray-600 italic text-center bg-slate-50 dark:bg-[#151515] rounded-xl border border-dashed border-slate-200 dark:border-[#222]">
                  {searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada percakapan'}
                </div>
              ) : (
                filteredChatGroups.map((group) => {
                  const isActive = pathname.includes(`/chat/${group._id}`);
                  // Pertahankan context project saat klik history
                  const currentProjectId = (pathname.startsWith('/project/') ? pathname.split('/')[2] : null) || searchParams.get('projectId');
                  const href = `/chat/${group._id}${currentProjectId ? `?projectId=${currentProjectId}` : ''}`;

                  return (
                    <Link
                      key={group._id}
                      href={href}
                      onClick={closeSidebarOnMobile}
                      className={`group flex items-center gap-3 px-3 py-3 text-[12px] rounded-xl cursor-pointer transition-all border-l-4 ${
                        isActive
                        ? 'bg-slate-100 dark:bg-[#1A1A1A] text-slate-900 dark:text-white border-indigo-500'
                        : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:bg-slate-50 dark:hover:bg-[#151515] border-transparent'
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
                  onClick={closeSidebarOnMobile}
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
