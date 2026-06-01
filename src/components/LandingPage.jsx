'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Search,
  BookOpen,
  Edit3,
  Workflow,
  Plus,
  Minus,
} from 'lucide-react';
import Footer from '@/components/Footer';
import FloatingOrbs from './FloatingOrbs';
import NavbarLanding from '@/components/NavbarLanding';

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5, ease: 'easeOut' },
};

const agentModes = [
  { id: 'researcher', label: 'Profesor', placeholder: 'Bantu rumuskan masalah skripsi tentang pemasaran digital...' },
  { id: 'deep-search', label: 'Deep Search', placeholder: 'Cari jurnal Scopus terbaru tentang machine learning di pendidikan...' },
  { id: 'editor', label: 'Editor', placeholder: 'Perbaiki parafrase paragraf metodologi penelitian...' },
  { id: 'visualizer', label: 'Visual', placeholder: 'Buat diagram alur kerangka penelitian kuantitatif...' },
];

const suggestedPrompts = [
  'Cara membuat batasan masalah?',
  'Tips mencari jurnal Scopus?',
  'Bagaimana parafrase sesuai PUEBI?',
];

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
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState(0);
  const [activeMode, setActiveMode] = useState(agentModes[0].id);
  const [prompt, setPrompt] = useState('');

  const activeModeData = agentModes.find((m) => m.id === activeMode) ?? agentModes[0];

  const goToLoginWithPrompt = (q, agentId = activeMode) => {
    const params = new URLSearchParams();
    const trimmed = (q ?? '').trim();

    if (trimmed) {
      params.set('prompt', trimmed);
    }
    params.set('agent', agentId);

    router.push(`/auth/login?${params.toString()}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    goToLoginWithPrompt(prompt, activeModeData.id);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar bg-transparent text-slate-900 dark:text-gray-200">
      <NavbarLanding />
      {/* Hero */}
      <section className="relative flex-none pt-24 md:pt-32 pb-20 md:pb-28 px-6 overflow-hidden">
        {/* Animated Gradient Background with Floating Orbs */}
        <div className="hidden md:block">
          <FloatingOrbs />
        </div>

        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center liquid-glass p-8 md:p-12 rounded-[32px] mb-12"
          >
            <div className="text-[11px] font-medium text-indigo-500 dark:text-indigo-400 tracking-[0.2em] uppercase mb-6">
              /asisten riset akademik
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.02em] leading-[1.05] text-slate-900 dark:text-white mb-6">
              Riset akademik yang lebih terstruktur, dari draf sampai sidang.
            </h1>
            <p className="text-base md:text-lg text-slate-500 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
              Agen AI yang memahami konteks dokumenmu, mencarikan referensi valid, dan menjaga gaya bahasa tetap sesuai kaidah.
            </p>
          </motion.div>

          {/* Chat input mock */}
          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            onSubmit={handleSubmit}
            className="relative rounded-2xl border border-white/20 bg-white/10 dark:bg-black/20 backdrop-blur-xl shadow-2xl p-3"
          >
            <div className="flex flex-wrap gap-1.5 mb-3 px-1">
              {agentModes.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setActiveMode(mode.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                    activeMode === mode.id
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                      : 'text-slate-500 dark:text-gray-400 border border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            <div className="flex items-end gap-2 px-1 pb-1">
              <input
                name="prompt"
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={activeModeData.placeholder}
                className="flex-1 bg-transparent outline-none text-sm md:text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 py-2 min-w-0"
              />
              <button
                type="submit"
                aria-label="Kirim pertanyaan"
                className="w-9 h-9 flex-shrink-0 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:scale-105 text-white flex items-center justify-center transition-all shadow-lg shadow-indigo-600/20"
              >
                <ArrowUp size={16} />
              </button>
            </div>
          </motion.form>

          {/* Suggested prompts */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 flex flex-wrap gap-2 justify-center"
          >
            {suggestedPrompts.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => goToLoginWithPrompt(p, activeModeData.id)}
                className="text-xs text-slate-600 dark:text-gray-300 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-indigo-500/30 transition-all"
              >
                {p}
              </button>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/auth/login"
              className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:shadow-indigo-500/40 text-white rounded-full text-sm font-bold transition-all w-full sm:w-auto shadow-xl"
            >
              Mulai gratis
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-slate-700 dark:text-white bg-white/5 dark:bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-bold transition-all w-full sm:w-auto hover:bg-white/20"
            >
              Lihat harga
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-4 text-xs text-slate-400 dark:text-gray-500 text-center"
          >
            Tanpa kartu kredit. Cukup masuk dengan akun Google.
          </motion.p>
        </div>
      </section>

      {/* Capabilities */}
      <section id="fitur" className="relative flex-none py-20 md:py-28 px-6 border-t border-slate-100 dark:border-[#1A1A1A]">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="max-w-2xl mb-16">
            <SectionLabel>kemampuan</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.01em] text-slate-900 dark:text-white leading-tight">
              Dirancang untuk pekerjaan akademik, bukan obrolan umum.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {capabilities.map((item, i) => (
              <motion.div
                key={item.title}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.05 }}
                className="liquid-glass p-8 md:p-10 rounded-[24px]"
              >
                <div className="text-xs font-bold text-indigo-500 dark:text-indigo-400 tabular-nums mb-6">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 leading-snug">
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
      <section id="agen" className="relative flex-none py-20 md:py-28 px-6 border-t border-slate-100 dark:border-[#1A1A1A] bg-slate-50/40 dark:bg-[#0A0A0A]/40">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agents.map((agent, i) => {
              const Icon = [BookOpen, Search, Edit3, Workflow][i];
              return (
                <motion.div
                  key={agent.name}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.05 }}
                  className="liquid-glass group p-8 rounded-[24px] hover:border-indigo-500/30 transition-all duration-300 hover:translate-y-[-4px]"
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Icon size={20} strokeWidth={2} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 tracking-[0.15em] uppercase tabular-nums">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    {agent.name}
                  </h3>
                  <p className="text-xs font-medium text-indigo-500 dark:text-indigo-400/80 mb-4 uppercase tracking-wider">
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
      <section id="cara-kerja" className="relative flex-none py-20 md:py-28 px-6 border-t border-slate-100 dark:border-[#1A1A1A]">
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
                <div className="text-[11px] font-medium text-indigo-500/80 dark:text-indigo-400/80 tracking-[0.2em] uppercase tabular-nums mb-6 pb-6 border-b border-slate-100 dark:border-[#1F1F1F]">
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
      <section id="faq" className="relative flex-none py-20 md:py-28 px-6 border-t border-slate-100 dark:border-[#1A1A1A] bg-slate-50/40 dark:bg-[#0A0A0A]/40">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp} className="mb-12">
            <SectionLabel>pertanyaan umum</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.01em] text-slate-900 dark:text-white leading-tight">
              Hal-hal yang sering ditanyakan.
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : i)}
                    className="w-full px-6 py-6 flex items-center justify-between gap-6 text-left group"
                  >
                    <span className="text-base md:text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                      {faq.q}
                    </span>
                    <span className={`flex-shrink-0 transition-all duration-300 ${isOpen ? 'text-indigo-500 rotate-180' : 'text-slate-400 dark:text-gray-500'}`}>
                      {isOpen ? <Minus size={18} strokeWidth={2} /> : <Plus size={18} strokeWidth={2} />}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <p className="px-6 pb-6 text-sm md:text-base text-slate-500 dark:text-gray-400 leading-relaxed">
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
      <section className="relative flex-none py-24 md:py-32 px-6 overflow-hidden">
        <div className="hidden md:block">
          <FloatingOrbs />
        </div>
        <motion.div {...fadeUp} className="max-w-4xl mx-auto text-center liquid-glass p-12 md:p-20 rounded-[40px]">
          <div className="text-[11px] font-bold text-indigo-500 dark:text-indigo-400 tracking-[0.2em] uppercase mb-6">
            /mulai sekarang
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-[-0.02em] text-slate-900 dark:text-white leading-tight mb-8">
            Selesaikan riset berikutnya dengan lebih tenang.
          </h2>
          <p className="text-base md:text-lg text-slate-500 dark:text-gray-400 max-w-xl mx-auto mb-12 leading-relaxed">
            Buat akun gratis dan coba workspace EduSpaceAI dalam hitungan menit.
          </p>
          <div className="flex items-center justify-center">
            <Link
              href="/auth/login"
              className="group inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:shadow-indigo-500/40 text-white rounded-full text-base font-bold transition-all shadow-xl"
            >
              Mulai gratis sekarang
              <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
