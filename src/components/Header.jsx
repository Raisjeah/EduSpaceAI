'use client';

import { Menu, User, Sparkles, ArrowRight, X } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import Link from 'next/link';
import { useChat } from '@/context/ChatContext';
import { useLayout } from '@/context/LayoutContext';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { userId, user } = useAuth();
  const { activeChatTitle } = useChat();
  const { isSidebarOpen, setIsSidebarOpen } = useLayout();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = (e) => {
      // Listen to scroll events on the chat container (if it exists)
      const target = e.target;
      if (target.classList && target.classList.contains('custom-scrollbar')) {
        setIsScrolled(target.scrollTop > 10);
      } else {
        const scrollY = window.scrollY;
        setIsScrolled(scrollY > 10);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    return () => window.removeEventListener('scroll', handleScroll, { capture: true });
  }, []);

  const isDashboardPage = pathname.startsWith('/project') || pathname.startsWith('/tools');

  return (
    <header className="flex justify-between items-center p-4 sticky top-0 z-50 bg-transparent pointer-events-none flex-none">
      {/* Center Title - only visible when scrolled and not on dashboard */}
      {!isDashboardPage && (
        <div className="absolute left-1/2 -translate-x-1/2 w-max pointer-events-none z-10" aria-live="polite">
            <h1 className={`px-4 py-1.5 rounded-full bg-white/70 dark:bg-[#0F0F0F]/70 backdrop-blur-md border border-slate-200/50 dark:border-white/5 shadow-sm text-[11px] font-bold text-slate-500 dark:text-gray-400 tracking-wide transition-all duration-500 ${isScrolled ? 'opacity-100 translate-y-2' : 'opacity-0 -translate-y-4'}`}>
              {activeChatTitle}
            </h1>
        </div>
      )}

      <div className="flex items-center gap-3 min-w-0">
        {!userId ? (
          <Link href="/" className="flex items-center gap-2 pointer-events-auto" aria-label="EduSpaceAI Home">
             <div className="w-10 h-10 flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="EduSpaceAI Logo"
                  className="w-full h-full object-contain invert dark:invert-0"
                />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white hidden sm:block">EduSpaceAI</span>
          </Link>
        ) : (
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label={isSidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-neutral-900/80 border border-neutral-800/50 shadow-xl backdrop-blur-md text-white transition-all shrink-0 pointer-events-auto hover:scale-105"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}
      </div>

      <nav className="flex items-center gap-3 flex-none justify-end" aria-label="Header Navigation">
        <div className="flex items-center gap-4 text-gray-400">
          {!userId && (
            <Link
              href="/auth/login"
              aria-label="Masuk ke akun"
              className="group inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-medium transition-colors pointer-events-auto"
            >
              Masuk
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}

          {userId && !isDashboardPage && (
            <>
              <Link
                href="/pricing"
                aria-label={`Upgrade Pro - Plan saat ini: ${user?.current_plan || 'FREE'}`}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-800/50 shadow-xl backdrop-blur-md text-amber-500 text-xs font-bold hover:scale-105 transition-all pointer-events-auto"
              >
                <Sparkles size={14} />
                {user?.current_plan === 'FREE' ? 'Upgrade Pro' : user?.current_plan}
              </Link>

              <Link href="/profile" title="Edit Profil" aria-label="Lihat profil" className="pointer-events-auto hover:scale-105 transition-all">
                <div className="w-11 h-11 rounded-full bg-neutral-900/80 flex items-center justify-center border border-neutral-800/50 shadow-xl backdrop-blur-md hover:border-indigo-500/50 transition-all overflow-hidden">
                  {user?.image ? (
                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={18} className="text-white" />
                  )}
                </div>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
