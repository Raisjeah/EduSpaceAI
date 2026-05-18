'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Search, BookOpen, Edit3, Sparkles, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import Footer from '@/components/Footer';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const features = [
    {
      icon: <Search size={22} />,
      label: 'Deep Search',
      title: 'Cari Referensi Akademik',
      description: 'Telusuri database akademik dan temukan jurnal terpercaya secara otomatis dengan AI.',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      icon: <BookOpen size={22} />,
      label: 'Profesor Riset',
      title: 'Bimbingan Metodologi',
      description: 'Konsultasi struktur Bab 1-5, kerangka berpikir, dan metodologi penelitian.',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      icon: <Edit3 size={22} />,
      label: 'Editor Akademik',
      title: 'Perbaiki Tata Bahasa',
      description: 'Cek PUEBI, parafrase, dan format sitasi APA/MLA secara otomatis.',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
  ];

  const steps = [
    { number: '01', title: 'Upload Dokumen', description: 'Unggah draf skripsi, jurnal, atau dokumen akademik Anda.' },
    { number: '02', title: 'Pilih Agen AI', description: 'Gunakan agen spesialis sesuai kebutuhan riset Anda.' },
    { number: '03', title: 'Dapatkan Hasil', description: 'Terima bimbingan, referensi, dan perbaikan secara instan.' },
  ];

  const faqs = [
    {
      q: 'Apakah EduSpaceAI gratis?',
      a: 'Ya, tersedia paket gratis untuk memulai. Upgrade ke Premium untuk akses model AI lebih cerdas dan kuota lebih besar.',
    },
    {
      q: 'Bagaimana dengan privasi dokumen saya?',
      a: 'Dokumen Anda hanya digunakan untuk konteks percakapan dan tidak dibagikan ke pihak ketiga.',
    },
    {
      q: 'Apakah referensi jurnal yang diberikan valid?',
      a: 'Deep Search terintegrasi dengan database akademik terpercaya dan selalu menyertakan link sumber asli.',
    },
    {
      q: 'Bisa digunakan selain untuk skripsi?',
      a: 'Tentu. EduSpaceAI mendukung semua kebutuhan akademik: makalah, esai, hingga jurnal internasional.',
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar bg-white dark:bg-[#0F0F0F] text-slate-900 dark:text-gray-200 transition-colors duration-200">

      {/* Hero */}
      <section className="relative flex-none pt-24 sm:pt-32 md:pt-40 pb-20 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-20%] left-[10%] w-[40%] h-[40%] bg-indigo-500/8 dark:bg-indigo-500/5 blur-[100px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[10%] w-[35%] h-[35%] bg-purple-500/8 dark:bg-purple-500/5 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-medium mb-8"
          >
            <Sparkles size={14} />
            Platform Riset Akademik AI
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.15]"
          >
            Asisten AI untuk{' '}
            <span className="text-indigo-600 dark:text-indigo-400">riset akademik</span> Anda
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Dari pencarian jurnal, bimbingan metodologi, hingga pengecekan tata bahasa
            &mdash; selesaikan skripsi dan jurnal Anda lebih cepat.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              href="/auth/login"
              className="group flex items-center justify-center gap-2 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all"
            >
              Mulai Gratis
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="px-7 py-3.5 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white rounded-xl font-semibold text-sm transition-colors"
            >
              Lihat Fitur
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-xs text-slate-400 dark:text-gray-500"
          >
            Gratis untuk memulai &middot; Tanpa kartu kredit
          </motion.p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative flex-none py-20 md:py-28 px-6 border-t border-slate-100 dark:border-[#1A1A1A]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              Agen AI spesialis akademik
            </h2>
            <p className="text-slate-500 dark:text-gray-400 max-w-lg mx-auto text-sm sm:text-base">
              Setiap agen dirancang khusus untuk membantu tahapan riset yang berbeda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group p-6 rounded-2xl border border-slate-100 dark:border-[#1E1E1E] bg-white dark:bg-[#0F0F0F] hover:border-slate-200 dark:hover:border-[#2A2A2A] transition-all"
              >
                <div className={`w-10 h-10 rounded-xl ${f.bg} ${f.color} flex items-center justify-center mb-5`}>
                  {f.icon}
                </div>
                <p className={`text-[11px] font-semibold uppercase tracking-wider ${f.color} mb-2`}>{f.label}</p>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative flex-none py-20 md:py-28 px-6 bg-slate-50/80 dark:bg-[#0A0A0A] border-t border-slate-100 dark:border-[#1A1A1A]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              Cara kerja
            </h2>
            <p className="text-slate-500 dark:text-gray-400 max-w-lg mx-auto text-sm sm:text-base">
              Tiga langkah sederhana untuk memulai riset Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-indigo-600/20 dark:text-indigo-400/15 mb-4">{s.number}</div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-model */}
      <section className="relative flex-none py-20 md:py-28 px-6 border-t border-slate-100 dark:border-[#1A1A1A]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-medium mb-6">
                <Zap size={14} />
                Multi-Model AI
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
                Pilih model AI terbaik
              </h2>
              <p className="text-slate-500 dark:text-gray-400 text-sm sm:text-base leading-relaxed mb-6">
                Pindah antar Gemini dan Claude dalam satu klik. Gunakan model tercepat untuk tugas sederhana, atau model terpintar untuk analisis mendalam.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:gap-3 transition-all"
              >
                Coba sekarang <ArrowRight size={16} />
              </Link>
            </div>
            <div className="flex-1 w-full max-w-sm">
              <div className="rounded-2xl border border-slate-100 dark:border-[#1E1E1E] bg-white dark:bg-[#0F0F0F] p-6 space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <Sparkles size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Gemini</p>
                    <p className="text-[11px] text-slate-500 dark:text-gray-400">Cepat & efisien</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-[#151515] border border-slate-100 dark:border-[#1E1E1E]">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                    <Zap size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Claude</p>
                    <p className="text-[11px] text-slate-500 dark:text-gray-400">Analisis mendalam</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative flex-none py-20 md:py-28 px-6 bg-slate-50/80 dark:bg-[#0A0A0A] border-t border-slate-100 dark:border-[#1A1A1A]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              Pertanyaan umum
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-slate-100 dark:border-[#1E1E1E] bg-white dark:bg-[#0F0F0F] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#151515] transition-colors"
                >
                  <span className="font-medium text-sm text-slate-800 dark:text-white pr-4">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp size={18} className="text-indigo-500 shrink-0" />
                    : <ChevronDown size={18} className="text-slate-400 shrink-0" />
                  }
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 text-sm text-slate-500 dark:text-gray-400 leading-relaxed border-t border-slate-50 dark:border-[#1A1A1A] pt-3">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative flex-none py-20 md:py-28 px-6 border-t border-slate-100 dark:border-[#1A1A1A]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
            Siap memulai riset?
          </h2>
          <p className="text-slate-500 dark:text-gray-400 mb-8 text-sm sm:text-base">
            Bergabung dan selesaikan skripsi Anda lebih cepat dengan bantuan AI.
          </p>
          <Link
            href="/auth/login"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all"
          >
            Mulai Gratis
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <p className="mt-4 text-xs text-slate-400 dark:text-gray-500">
            Tanpa kartu kredit &middot; Langsung pakai
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
