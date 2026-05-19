'use client';

import Link from 'next/link';
import { Mail, Linkedin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative flex-none py-16 border-t border-slate-200 dark:border-[#1E1E1E] bg-white dark:bg-[#0F0F0F]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-16">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="EduSpaceAI"
                  className="w-full h-full object-contain invert dark:invert-0"
                />
              </div>
              <span className="font-semibold text-base tracking-tight text-slate-900 dark:text-white">
                EduSpaceAI
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-gray-400 max-w-sm leading-relaxed">
              Asisten riset akademik untuk mahasiswa dan peneliti. Cepat, fokus, dan dapat diverifikasi.
            </p>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-[11px] font-medium text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-5">
              Produk
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Harga
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-sm text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Masuk
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="text-[11px] font-medium text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-5">
              Legal & Bantuan
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="text-sm text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <a href="mailto:eduspaceai@gmail.com" className="text-sm text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Hubungi Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-8 border-t border-slate-100 dark:border-[#1A1A1A]">
          <p className="text-xs text-slate-400 dark:text-gray-500">
            © {currentYear} EduSpaceAI. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <a
              href="mailto:eduspaceai@gmail.com"
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-[#1F1F1F] hover:border-slate-300 dark:hover:border-[#2A2A2A] hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Email"
            >
              <Mail size={15} strokeWidth={1.5} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-[#1F1F1F] hover:border-slate-300 dark:hover:border-[#2A2A2A] hover:text-slate-900 dark:hover:text-white transition-colors"
              title="LinkedIn"
            >
              <Linkedin size={15} strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
