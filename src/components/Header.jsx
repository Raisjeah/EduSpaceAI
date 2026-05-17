'use client';

import { Menu, User, Sparkles } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import Link from 'next/link';
import { useChat } from '@/context/ChatContext';

export default function Header({ setIsSidebarOpen }) {
  const { userId, user } = useAuth();
  const { activeChatTitle } = useChat();

  return (
    <header className="flex justify-between items-center p-4 sticky top-0 z-20 bg-white dark:bg-[#0F0F0F] border-b border-slate-200 dark:border-[#1E1E1E] flex-none transition-colors duration-200">
      <div className="flex items-center gap-3 min-w-0">
        {!userId ? (
          <Link href="/" className="flex items-center gap-2">
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
          <>
            <button onClick={() => setIsSidebarOpen(true)} className="text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0">
              <Menu size={20} />
            </button>
            <div className="flex flex-col min-w-0">
               <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[120px] sm:max-w-[200px] md:max-w-[300px]">
                 {activeChatTitle}
               </h1>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-3 flex-none justify-end">
        <div className="flex items-center gap-4 text-gray-400">
          {!userId && (
            <Link
              href="/auth/login"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-900/20"
            >
              Coba Sekarang
            </Link>
          )}

          {userId && (
            <Link
              href="/pricing"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 text-xs font-bold hover:bg-amber-500/20 transition-all"
            >
              <Sparkles size={14} />
              {user?.current_plan === 'FREE' ? 'Upgrade Pro' : user?.current_plan}
            </Link>
          )}

          {userId && (
            <Link href="/profile" title="Edit Profil" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1A1A1A] flex items-center justify-center border border-slate-200 dark:border-[#333] hover:border-indigo-500/50 transition-all overflow-hidden">
                {user?.image ? (
                  <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={16} />
                )}
              </div>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
