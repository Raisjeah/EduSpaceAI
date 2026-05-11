'use client';

import Link from 'next/link';
import { Mail, MessageCircle, Linkedin, ArrowRight, Github } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative flex-none py-20 border-t border-slate-200 dark:border-[#1E1E1E] bg-white dark:bg-[#0F0F0F] transition-colors">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand & Mission */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 flex items-center justify-center overflow-hidden">
                <img
                  src="/logo.png"
                  alt="EduSpaceAI Logo"
                  className="w-full h-full object-contain dark:invert-0 invert transition-all duration-300"
                />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">EduSpaceAI</span>
            </div>
            <p className="text-slate-500 dark:text-gray-400 max-w-sm mb-8 leading-relaxed">
              Membangun masa depan riset akademik dengan kecerdasan buatan. Kami membantu peneliti dan mahasiswa mencapai potensi maksimal mereka dengan integritas dan efisiensi.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="mailto:eduspaceai@gmail.com"
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1A1A1A] flex items-center justify-center text-slate-600 dark:text-gray-400 hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-600 transition-all"
                title="Email Support"
              >
                <Mail size={18} />
              </a>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1A1A1A] flex items-center justify-center text-slate-600 dark:text-gray-400 hover:bg-green-500 hover:text-white dark:hover:bg-green-600 transition-all"
                title="WhatsApp Support"
              >
                <MessageCircle size={18} />
              </a>
              <a
                href="https://linkedin.com/in/yourprofile"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1A1A1A] flex items-center justify-center text-slate-600 dark:text-gray-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-700 transition-all"
                title="LinkedIn Profile"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-xs">Layanan</h4>
            <ul className="space-y-4">
              <li><Link href="/" className="text-slate-500 dark:text-gray-400 hover:text-indigo-500 transition-colors text-sm">Beranda</Link></li>
              <li><Link href="/pricing" className="text-slate-500 dark:text-gray-400 hover:text-indigo-500 transition-colors text-sm">Harga & Paket</Link></li>
              <li><Link href="/auth/login" className="text-slate-500 dark:text-gray-400 hover:text-indigo-500 transition-colors text-sm">Masuk / Daftar</Link></li>
              <li><Link href="/tools" className="text-slate-500 dark:text-gray-400 hover:text-indigo-500 transition-colors text-sm">Alat Akademik</Link></li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-xs">Legal & Bantuan</h4>
            <ul className="space-y-4">
              <li><Link href="/terms" className="text-slate-500 dark:text-gray-400 hover:text-indigo-500 transition-colors text-sm">Syarat & Ketentuan</Link></li>
              <li><Link href="/privacy" className="text-slate-500 dark:text-gray-400 hover:text-indigo-500 transition-colors text-sm">Kebijakan Privasi</Link></li>
              <li><a href="mailto:eduspaceai@gmail.com" className="text-slate-500 dark:text-gray-400 hover:text-indigo-500 transition-colors text-sm">Developer Support</a></li>
              <li><Link href="/#features" className="text-slate-500 dark:text-gray-400 hover:text-indigo-500 transition-colors text-sm">Bantuan</Link></li>
            </ul>
          </div>
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl bg-indigo-600 p-8 md:p-12 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 mb-16"
        >
          <div className="relative z-10 text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Siap untuk mulai riset?</h3>
            <p className="text-indigo-100 opacity-80">Bergabunglah dengan ribuan mahasiswa lainnya hari ini.</p>
          </div>
          <Link
            href="/auth/login"
            className="relative z-10 flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-lg shadow-black/10"
          >
            Coba Sekarang <ArrowRight size={18} />
          </Link>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 blur-2xl rounded-full -translate-x-1/3 translate-y-1/3"></div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-100 dark:border-[#1E1E1E]">
          <p className="text-slate-400 dark:text-gray-500 text-sm mb-4 md:mb-0">
            © {currentYear} EduSpaceAI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
             <span className="text-xs text-slate-400 dark:text-gray-500 italic">Made with ❤️ for academic integrity</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
