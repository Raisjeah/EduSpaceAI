'use client';

import Link from 'next/link';
import { Mail, MessageCircle } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex-none border-t border-slate-100 dark:border-[#1A1A1A] bg-white dark:bg-[#0F0F0F] transition-colors">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="EduSpaceAI"
                  className="w-full h-full object-contain invert dark:invert-0"
                />
              </div>
              <span className="font-bold text-base text-slate-900 dark:text-white">EduSpaceAI</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed max-w-xs">
              Platform riset akademik berbasis AI untuk mahasiswa dan peneliti.
            </p>
          </div>

          {/* Layanan */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-xs uppercase tracking-wider">Layanan</h4>
            <ul className="space-y-2.5">
              <li><Link href="/" className="text-sm text-slate-500 dark:text-gray-400 hover:text-indigo-500 transition-colors">Beranda</Link></li>
              <li><Link href="/pricing" className="text-sm text-slate-500 dark:text-gray-400 hover:text-indigo-500 transition-colors">Harga</Link></li>
              <li><Link href="/tools" className="text-sm text-slate-500 dark:text-gray-400 hover:text-indigo-500 transition-colors">Alat Akademik</Link></li>
              <li><Link href="/auth/login" className="text-sm text-slate-500 dark:text-gray-400 hover:text-indigo-500 transition-colors">Masuk</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-xs uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2.5">
              <li><Link href="/terms" className="text-sm text-slate-500 dark:text-gray-400 hover:text-indigo-500 transition-colors">Syarat & Ketentuan</Link></li>
              <li><Link href="/privacy" className="text-sm text-slate-500 dark:text-gray-400 hover:text-indigo-500 transition-colors">Kebijakan Privasi</Link></li>
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-xs uppercase tracking-wider">Kontak</h4>
            <div className="flex items-center gap-3">
              <a
                href="mailto:eduspaceai@gmail.com"
                className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-[#151515] border border-slate-100 dark:border-[#1E1E1E] flex items-center justify-center text-slate-500 dark:text-gray-400 hover:text-indigo-500 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all"
                title="Email"
              >
                <Mail size={16} />
              </a>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-[#151515] border border-slate-100 dark:border-[#1E1E1E] flex items-center justify-center text-slate-500 dark:text-gray-400 hover:text-green-500 hover:border-green-200 dark:hover:border-green-500/30 transition-all"
                title="WhatsApp"
              >
                <MessageCircle size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-slate-100 dark:border-[#1A1A1A]">
          <p className="text-xs text-slate-400 dark:text-gray-500">
            &copy; {currentYear} EduSpaceAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
