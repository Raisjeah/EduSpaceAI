'use client';

import { Menu, Search, User, X, Sparkles } from 'lucide-react';
import { useState } from 'react';
import useAuth from '@/hooks/useAuth';
import Link from 'next/link';

export default function Header({ setIsSidebarOpen }) {
  const { searchQuery, setSearchQuery, userId, user } = useAuth();
  const [isSearchActive, setIsSearchActive] = useState(false);

  return (
    <header className="flex justify-between items-center p-4 sticky top-0 z-20 bg-white dark:bg-[#0F0F0F] border-b border-slate-200 dark:border-[#1E1E1E] flex-none transition-colors duration-200">
      <div className="flex items-center gap-3">
        {!userId ? (
          <Link href="/" className="flex items-center gap-2 group">
             <div className="w-9 h-9 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110">
                <img
                  src="/logo.png"
                  alt="EduSpaceAI Logo"
                  className="w-full h-full object-contain dark:invert-0 invert transition-all duration-300"
                />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white hidden sm:block">EduSpaceAI</span>
          </Link>
        ) : (
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors md:hidden">
            <Menu size={20} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 flex-1 justify-end">
        {userId && (
          <div className={`flex items-center transition-all duration-300 overflow-hidden ${isSearchActive ? 'flex-1 max-w-md' : 'w-0'}`}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari riwayat..."
              className="w-full bg-slate-100 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] rounded-full py-1.5 px-4 text-base text-slate-900 dark:text-white outline-none focus:border-indigo-500/50 transition-colors"
              autoFocus={isSearchActive}
            />
          </div>
        )}

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
            <button
              onClick={() => {
                setIsSearchActive(!isSearchActive);
                if (isSearchActive) setSearchQuery('');
              }}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {isSearchActive ? <X size={18} /> : <Search size={18} />}
            </button>
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
