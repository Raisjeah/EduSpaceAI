'use client';

import { Menu, Sparkles, ArrowRight, X, Settings } from 'lucide-react';
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
      const target = e.target;
      if (target.classList && target.classList.contains('custom-scrollbar')) {
        setIsScrolled(target.scrollTop > 10);
      } else {
        setIsScrolled(window.scrollY > 10);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    return () => window.removeEventListener('scroll', handleScroll, { capture: true });
  }, []);

  const isDashboardPage = pathname.startsWith('/project') || pathname.startsWith('/tools');

  return (
    // Header selalu transparan — hanya garis bawah tipis saat scroll
    <header className={`
      flex justify-between items-center px-3 py-2.5
      sticky top-0 z-50 flex-none pointer-events-none
      bg-transparent transition-all duration-300
      ${isScrolled ? 'border-b border-white/5' : 'border-b border-transparent'}
    `}>

      {/* Center Title — muncul saat scroll, style teks biasa */}
      {!isDashboardPage && (
        <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-10">
          <span className={`
            text-[13px] font-semibold text-slate-700 dark:text-gray-200
            transition-all duration-300
            ${isScrolled ? 'opacity-100' : 'opacity-0'}
          `}>
            {activeChatTitle}
          </span>
        </div>
      )}

      {/* Left — Logo / Hamburger */}
      <div className="flex items-center min-w-0">
        {userId && (
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-700 dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-all pointer-events-auto"
          >
            {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        )}
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-1.5 flex-none">
        {userId && !isDashboardPage && (
          <>
            <Link
              href="/pricing"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-amber-500 dark:text-amber-400 text-xs font-bold hover:bg-black/10 dark:hover:bg-white/10 transition-all pointer-events-auto"
            >
              <Sparkles size={13} />
              {user?.current_plan === 'FREE' ? 'Upgrade' : user?.current_plan}
            </Link>

            <Link href="/dashboard" title="Pengaturan" className="pointer-events-auto">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-all">
                <Settings size={20} />
              </div>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
