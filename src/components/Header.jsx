'use client';

import { Menu, User, Sparkles, ArrowRight } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import Link from 'next/link';
import { useChat } from '@/context/ChatContext';
import { useLayout } from '@/context/LayoutContext';
import { useEffect, useState } from 'react';

export default function Header() {
  const { userId, user } = useAuth();
  const { activeChatTitle } = useChat();
  const { setIsSidebarOpen } = useLayout();
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

  return (
    <header className="flex justify-between items-center p-4 sticky top-0 z-50 bg-transparent pointer-events-none flex-none">
      {/* Center Title - only visible when scrolled */}
      <div className="absolute left-1/2 -translate-x-1/2 w-max pointer-events-none z-10">
          <h1 className={`px-4 py-1.5 rounded-full bg-white/70 dark:bg-[#0F0F0F]/70 backdrop-blur-md border border-slate-200/50 dark:border-white/5 shadow-sm text-[11px] font-bold text-slate-500 dark:text-gray-400 tracking-wide transition-all duration-500 ${isScrolled ? 'opacity-100 translate-y-2' : 'opacity-0 -translate-y-4'}`}>
            {activeChatTitle}
          </h1>
      </div>

      <div className="flex items-center gap-3 min-w-0">
        {!userId ? (
          <Link href="/" className="flex items-center gap-2 pointer-events-auto">
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
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 dark:bg-neutral-900/70 border border-neutral-200/60 dark:border-neutral-800/60 shadow-xl backdrop-blur-md text-slate-600 dark:text-gray-400 transition-all shrink-0 pointer-events-auto hover:scale-105"
          >
            <Menu size={20} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 flex-none justify-end">
        <div className="flex items-center gap-4 text-gray-400">
          {!userId && (
            <Link
              href="/auth/login"
              className="group inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-medium transition-colors pointer-events-auto"
            >
              Masuk
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}

          {userId && (
            <Link
              href="/pricing"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-neutral-900/70 border border-neutral-200/60 dark:border-neutral-800/60 shadow-xl backdrop-blur-md text-amber-600 dark:text-amber-500 text-xs font-bold hover:scale-105 transition-all pointer-events-auto"
            >
              <Sparkles size={14} />
              {user?.current_plan === 'FREE' ? 'Upgrade Pro' : user?.current_plan}
            </Link>
          )}

          {userId && (
            <Link href="/profile" title="Edit Profil" className="pointer-events-auto hover:scale-105 transition-all">
              <div className="w-10 h-10 rounded-full bg-white/80 dark:bg-neutral-900/70 flex items-center justify-center border border-neutral-200/60 dark:border-neutral-800/60 shadow-xl backdrop-blur-md hover:border-indigo-500/50 transition-all overflow-hidden">
                {user?.image ? (
                  <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={18} />
                )}
              </div>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
