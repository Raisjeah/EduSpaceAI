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
        <div className="absolute left-1/2 -translate-x-1/2 w-max pointer-events-none z-10">
            <h1 className={`px-4 py-1.5 rounded-full bg-brand-surface/70 dark:bg-brand-text/70 backdrop-blur-md border border-brand-border dark:border-white/5 shadow-elevation-1 text-[11px] font-bold text-slate-500 dark:text-gray-400 tracking-wide transition-all duration-500 ${isScrolled ? 'opacity-100 translate-y-2' : 'opacity-0 -translate-y-4'}`}>
              {activeChatTitle}
            </h1>
        </div>
      )}

      <div className="flex items-center gap-3 min-w-0">
        {!userId ? (
          <Link href="/" className="flex items-center gap-2 pointer-events-auto group">
             <div className="w-10 h-10 flex items-center justify-center transition-transform group-hover:scale-110">
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
            className="w-11 h-11 flex items-center justify-center rounded-full bg-brand-text border border-white/10 shadow-elevation-2 backdrop-blur-md text-white transition-all shrink-0 pointer-events-auto hover:scale-105"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 flex-none justify-end">
        <div className="flex items-center gap-4 text-gray-400">
          {!userId && (
            <Link
              href="/auth/login"
              className="group inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-brand-primary/10 hover:bg-brand-primary/15 border border-brand-primary/20 text-brand-primary dark:text-blue-400 text-sm font-bold transition-colors pointer-events-auto shadow-elevation-1"
            >
              Masuk
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}

          {userId && !isDashboardPage && (
            <>
              <Link
                href="/pricing"
                className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-brand-text border border-white/10 shadow-elevation-2 backdrop-blur-md text-amber-400 text-xs font-black hover:scale-105 transition-all pointer-events-auto"
              >
                <Sparkles size={14} />
                {user?.current_plan === 'FREE' ? 'UPGRADE PRO' : user?.current_plan}
              </Link>

              <Link href="/profile" title="Edit Profil" className="pointer-events-auto hover:scale-105 transition-all">
                <div className="w-11 h-11 rounded-full bg-brand-text flex items-center justify-center border border-white/10 shadow-elevation-2 backdrop-blur-md hover:border-brand-primary transition-all overflow-hidden">
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
      </div>
    </header>
  );
}
