'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from 'next-themes';

const navLinks = [
  { href: '#fitur', label: 'Fitur' },
  { href: '#agen', label: 'Agen' },
  { href: '#cara-kerja', label: 'Cara kerja' },
  { href: '#faq', label: 'FAQ' },
];

export default function NavbarLanding() {
  const [isOpen, setIsOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const closeDrawer = () => setIsOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[9000] px-4 py-3 pointer-events-none">
      <div className="max-w-6xl mx-auto flex items-center justify-between rounded-full border border-white/20 bg-white/70 dark:bg-black/40 backdrop-blur-xl shadow-lg shadow-black/5 px-3 py-2 pointer-events-auto">
        <Link href="/" className="flex items-center gap-2" onClick={closeDrawer}>
          <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white/60 dark:bg-white/10 border border-white/20 overflow-hidden">
            <Image src="/logo.png" alt="EduSpaceAI Logo" width={24} height={24} className="object-contain invert dark:invert-0" />
          </span>
          <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">EduSpaceAI</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 py-2 rounded-full text-sm text-slate-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-black/5 dark:hover:bg-white/10 transition-all"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 transition-all"
            aria-label="Ganti tema"
          >
            {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link
            href="/auth/login"
            className="hidden sm:inline-flex items-center justify-center px-5 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-all"
          >
            Masuk
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            className="relative z-[10000] md:hidden w-10 h-10 rounded-full flex items-center justify-center text-slate-800 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all"
            aria-label={isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Tutup menu navigasi"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm md:hidden pointer-events-auto"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="fixed top-0 right-0 z-[9999] h-[100dvh] w-[80%] max-w-[320px] sm:max-w-sm bg-white dark:bg-[#111111] border-l border-slate-200 dark:border-white/10 shadow-2xl md:hidden pointer-events-auto p-5"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Image src="/logo.png" alt="EduSpaceAI Logo" width={32} height={32} className="object-contain invert dark:invert-0" />
                  <span className="font-bold text-slate-900 dark:text-white">EduSpaceAI</span>
                </div>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                  aria-label="Tutup menu navigasi"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={closeDrawer}
                    className="px-4 py-3 rounded-2xl text-sm font-medium text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <Link
                href="/auth/login"
                onClick={closeDrawer}
                className="mt-8 inline-flex w-full items-center justify-center px-5 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition-all"
              >
                Mulai / Masuk
              </Link>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
