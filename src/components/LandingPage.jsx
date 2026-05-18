'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  BookOpen,
  Edit3,
  Workflow,
  Plus,
  Minus,
} from 'lucide-react';
import Footer from '@/components/Footer';

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5, ease: 'easeOut' },
};

const capabilities = [
  {
    title: 'Pemahaman konteks penuh',
    description:
      'Upload draf skripsi, jurnal, atau dataset. AI membaca seluruh dokumen lalu menjawab berdasarkan isinya, bukan asumsi.',
  },
  {
    title: 'Referensi yang bisa diverifikasi',
    description:
      'Agen Deep Search menelusuri database akademik dan internet, lalu mengembalikan sumber lengkap yang bisa kamu buka langsung.',
  },
  {
    title: 'Penulisan sesuai kaidah PUEBI',
    description:
      'Editor akademik membantu memperbaiki ejaan, tata bahasa, dan format sitasi tanpa mengubah arah penulisanmu.',
  },
];

const agents = [
  {
    name: 'Profesor Riset',
    role: 'Metodologi & kerangka penulisan',
    description:
      'Diskusikan rumusan masalah, hipotesis, dan struktur bab. Cocok untuk menyusun proposal hingga laporan akhir.',
  },
  {
    name: 'Deep Search',
    role: 'Pencarian sumber akademik',
    description:
      'Telusuri jurnal terbaru dengan kata kunci spesifik. Hasil dirangkum lengkap dengan sumber asli.',
  },
  {
    name: 'Editor Akademik',
    role: 'PUEBI, parafrase, sitasi',
    description:
      'Periksa tata bahasa, perbaiki parafrase, dan format APA/MLA. Tulisanmu tetap, hanya lebih rapi.',
  },
  {
    name: 'Visual Mapper',
    role: 'Diagram & alur penelitian',
    description:
      'Ubah teori atau alur metodologi menjadi diagram Mermaid yang mudah dibaca untuk presentasi.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Buka workspace',
    description:
      'Mulai dari obrolan baru atau buat workspace khusus untuk proyek skripsi maupun jurnal.',
  },
  {
    number: '02',
    title: 'Pilih agen yang tepat',
    description:
      'Setiap agen punya keahlian berbeda. Pilih sesuai kebutuhan: riset, sumber, edit, atau visualisasi.',
  },
  {
    number: '03',
    title: 'Diskusi, perbaiki, ekspor',
    description:
      'Lanjutkan obrolan dengan konteks penuh dokumenmu. Ekspor hasil kapan saja dalam format yang siap dipakai.',
  },
];

const faqs = [
  {
    q: 'Apakah EduSpaceAI gratis?',
    a: 'Ya. Paket Free tersedia tanpa kartu kredit dan cukup untuk memulai. Paket berbayar membuka akses ke model lebih kuat, upload file, dan memori proyek.',
  },
  {
    q: 'Bagaimana dengan privasi dokumen saya?',
    a: 'Dokumen yang kamu unggah hanya dipakai untuk konteks obrolanmu sendiri. Kami tidak membagikannya ke pihak ketiga dan tidak memakainya untuk melatih model publik.',
  },
  {
    q: 'Apakah referensi yang diberikan valid?',
    a: 'Agen Deep Search selalu menyertakan tautan sumber asli sehingga kamu bisa memverifikasi langsung ke jurnal atau situsnya. Hindari memakai sumber tanpa membacanya terlebih dahulu.',
  },
  {
    q: 'Apakah ini menggantikan dosen pembimbing?',
    a: 'Tidak. EduSpaceAI adalah alat bantu untuk brainstorming, korektor, dan akselerator riset. Keputusan akademik tetap ada padamu dan pembimbingmu.',
  },
  {
    q: 'Bisa dipakai untuk tugas selain skripsi?',
    a: 'Bisa. Banyak pengguna memakainya untuk makalah, esai, laporan praktikum, hingga draf jurnal internasional.',
  },
];

function SectionLabel({ children }) {
  return (
    <div className="text-[11px] font-medium text-slate-400 dark:text-gray-500 tracking-[0.2em] uppercase mb-4">
      /{children}
    </div>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar bg-white dark:bg-[#0F0F0F] text-slate-900 dark:text-gray-200">
      {/* Hero */}
      <section className="relative flex-none pt-24 md:pt-36 pb-20 md:pb-28 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="text-[11px] font-medium text-slate-400 dark:text-gray-500 tracking-[0.2em] uppercase mb-6">
              /asisten riset akademik
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-semibold tracking-[-0.02em] leading-[1.05] text-slate-900 dark:text-white mb-8 max-w-4xl">
              Riset akademik yang lebih terstruktur, dari draf sampai sidang.
            </h1>
            <p className="text-lg md:text-xl text-slate-500 dark:text-gray-400 leading-relaxed max-w-2xl mb-10">
              EduSpaceAI membantumu menulis skripsi dan jurnal dengan agen AI yang memahami konteks dokumenmu, mencarikan referensi yang valid, dan menjaga gaya bahasamu tetap sesuai kaidah.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-3 mb-6">
              <Link
                href="/auth/login"
                className="group flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-medium text-sm transition-opacity hover:opacity-90"
              >
                Mulai gratis
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/pricing"
                className="flex items-center justify-center gap-2 px-6 py-3 text-slate-600 dark:text-gray-300 rounded-full font-medium text-sm border border-slate-200 dark:border-[#2A2A2A] hover:border-slate-300 dark:hover:border-[#3A3A3A] transition-colors"
              >
                Lihat harga
              </Link>
            </div>
            <p className="text-sm text-slate-400 dark:text-gray-500">
              Tanpa kartu kredit. Cukup masuk dengan akun Google.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="relative flex-none py-20 md:py-28 px-6 border-t border-slate-100 dark:border-[#1A1A1A]">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="max-w-2xl mb-16">
            <SectionLabel>kemampuan</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.01em] text-slate-900 dark:text-white leading-tight">
              Dirancang untuk pekerjaan akademik, bukan obrolan umum.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-100 dark:bg-[#1A1A1A] border-t border-b border-slate-100 dark:border-[#1A1A1A]">
            {capabilities.map((item, i) => (
              <motion.div
                key={item.title}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.05 }}
                className="bg-white dark:bg-[#0F0F0F] p-8 md:p-10"
              >
                <div className="text-xs font-medium text-slate-400 dark:text-gray-500 tabular-nums mb-6">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 leading-snug">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Agents */}
      <section id="features" className="relative flex-none py-20 md:py-28 px-6 border-t border-slate-100 dark:border-[#1A1A1A] bg-slate-50/40 dark:bg-[#0A0A0A]/40">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="max-w-2xl mb-16">
            <SectionLabel>agen spesialis</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.01em] text-slate-900 dark:text-white leading-tight mb-4">
              Empat agen, satu workspace.
            </h2>
            <p className="text-base text-slate-500 dark:text-gray-400 leading-relaxed">
              Setiap agen punya peran spesifik dalam alur riset. Berpindah di antaranya tanpa kehilangan konteks obrolan.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((agent, i) => {
              const Icon = [BookOpen, Search, Edit3, Workflow][i];
              return (
                <motion.div
                  key={agent.name}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.05 }}
                  className="group p-8 rounded-2xl border border-slate-200 dark:border-[#1F1F1F] bg-white dark:bg-[#121212] hover:border-slate-300 dark:hover:border-[#2A2A2A] transition-colors"
                >
                  <div className="flex items-start justify-between mb-8">
                    <Icon size={20} className="text-slate-400 dark:text-gray-500" strokeWidth={1.5} />
                    <span className="text-[10px] font-medium text-slate-400 dark:text-gray-500 tracking-[0.15em] uppercase tabular-nums">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                    {agent.name}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-gray-500 mb-4">
                    {agent.role}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed">
                    {agent.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative flex-none py-20 md:py-28 px-6 border-t border-slate-100 dark:border-[#1A1A1A]">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="max-w-2xl mb-16">
            <SectionLabel>cara kerja</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.01em] text-slate-900 dark:text-white leading-tight">
              Tiga langkah, satu workspace.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.05 }}
                className="relative"
              >
                <div className="text-[11px] font-medium text-slate-400 dark:text-gray-500 tracking-[0.2em] uppercase tabular-nums mb-6 pb-6 border-b border-slate-100 dark:border-[#1F1F1F]">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 leading-snug">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative flex-none py-20 md:py-28 px-6 border-t border-slate-100 dark:border-[#1A1A1A] bg-slate-50/40 dark:bg-[#0A0A0A]/40">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp} className="mb-12">
            <SectionLabel>pertanyaan umum</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.01em] text-slate-900 dark:text-white leading-tight">
              Hal-hal yang sering ditanyakan.
            </h2>
          </motion.div>

          <div className="border-t border-slate-200 dark:border-[#1F1F1F]">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={faq.q}
                  className="border-b border-slate-200 dark:border-[#1F1F1F]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : i)}
                    className="w-full py-6 flex items-center justify-between gap-6 text-left group"
                  >
                    <span className="text-base md:text-lg font-medium text-slate-900 dark:text-white group-hover:text-slate-600 dark:group-hover:text-gray-300 transition-colors">
                      {faq.q}
                    </span>
                    <span className="flex-shrink-0 text-slate-400 dark:text-gray-500">
                      {isOpen ? <Minus size={18} strokeWidth={1.5} /> : <Plus size={18} strokeWidth={1.5} />}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <p className="pb-6 pr-12 text-sm md:text-base text-slate-500 dark:text-gray-400 leading-relaxed">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative flex-none py-24 md:py-32 px-6 border-t border-slate-100 dark:border-[#1A1A1A]">
        <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center">
          <div className="text-[11px] font-medium text-slate-400 dark:text-gray-500 tracking-[0.2em] uppercase mb-4">
            /mulai sekarang
          </div>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.02em] text-slate-900 dark:text-white leading-tight mb-6">
            Selesaikan riset berikutnya dengan lebih tenang.
          </h2>
          <p className="text-base md:text-lg text-slate-500 dark:text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Buat akun gratis dan coba workspace EduSpaceAI dalam hitungan menit.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/auth/login"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-medium text-sm transition-opacity hover:opacity-90"
            >
              Mulai gratis
              <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
