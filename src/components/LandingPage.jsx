'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, GraduationCap, Layout, Shield, Sparkles, Briefcase, Plus, Search, Zap, CheckCircle, BookOpen, Edit3, Star, ChevronDown, ChevronUp, Check } from 'lucide-react';
import Footer from '@/components/Footer';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [playgroundResponse, setPlaygroundResponse] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sampleResponses = {
    "Cara membuat batasan masalah?": "Untuk membuat batasan masalah yang baik, Anda harus: \n1. Fokus pada variabel utama penelitian.\n2. Tentukan lokasi atau ruang lingkup penelitian.\n3. Batasi periode waktu yang diteliti.\n4. Pilih populasi atau subjek yang spesifik. \n\nContoh: 'Penelitian ini dibatasi pada mahasiswa semester akhir di Universitas Indonesia tahun akademik 2023/2024'.",
    "Tips mencari jurnal Scopus?": "Mencari jurnal Scopus bisa dilakukan dengan:\n1. Menggunakan database Scopus.com atau ScimagoJR.\n2. Mencari dengan kata kunci spesifik menggunakan operator Boolean (AND, OR).\n3. Memeriksa Quartile (Q1-Q4) jurnal tersebut.\n4. Memastikan jurnal tidak masuk dalam daftar predator (Beall's List).",
    "Bagaimana cara parafrase PUEBI?": "Parafrase sesuai PUEBI dilakukan dengan:\n1. Mengganti sinonim kata tanpa mengubah makna.\n2. Mengubah struktur kalimat (aktif ke pasif atau sebaliknya).\n3. Memastikan tanda baca dan ejaan tetap mengikuti kaidah PUEBI terbaru.\n4. Selalu mencantumkan sumber asli untuk menghindari plagiarisme.",
    "default": "Pertanyaan menarik! Sebagai Profesor AI, saya menyarankan Anda untuk merumuskan pertanyaan dengan lebih spesifik agar saya bisa memberikan jawaban yang lebih mendalam dan teknis sesuai kaidah akademik."
  };

  const handlePlaygroundSubmit = (query) => {
    if (!query || isTyping) return;

    const response = sampleResponses[query] || sampleResponses["default"];
    setPlaygroundResponse(response);
    setDisplayedText('');
    setIsTyping(true);

    let index = 0;
    const interval = setInterval(() => {
      if (index < response.length) {
        setDisplayedText(prev => prev + response.charAt(index));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 20);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.2 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar bg-white dark:bg-[#0F0F0F] text-slate-900 dark:text-gray-200 transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative flex-none pt-28 md:pt-40 pb-20 md:pb-32 overflow-hidden bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-indigo-500/5 animate-liquid-flow bg-[length:200%_200%]">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full"
          ></motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full"
          ></motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-8 leading-[1.1] px-2 max-w-4xl mx-auto"
          >
            Selesaikan Skripsi & Jurnal <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400">
              Lebih Cepat dengan AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Dosen AI pribadi yang membantu riset, olah data, dan sitasi secara otomatis. Satu workspace cerdas untuk seluruh perjalanan akademikmu.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.3 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full">
              <Link
                href="/auth/login"
                className="group w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-900/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                Mulai Gratis
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#demo"
                className="text-indigo-600 dark:text-indigo-400 font-bold text-lg flex items-center gap-2 hover:gap-3 transition-all"
              >
                Lihat Demo
                <ArrowRight size={20} />
              </Link>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">
              Tidak perlu kartu kredit • Mulai gratis sekarang
            </p>
          </motion.div>

          {/* Trust Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.2, delay: 0.5 }}
            className="mt-20 pt-10 border-t border-slate-100 dark:border-white/5"
          >
            <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-8">Trust by students from</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-30 grayscale contrast-125">
              {['UI', 'ITB', 'UGM', 'BINUS', 'UNPAD'].map(uni => (
                <div key={uni} className="flex items-center gap-2 font-black text-xl text-slate-400 dark:text-gray-500">
                   {uni}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof & Statistics */}
      <section className="relative flex-none py-16 border-y border-slate-100 dark:border-[#1E1E1E] bg-slate-50/50 dark:bg-[#0A0A0A]/50 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
             <div className="flex flex-col items-center">
                <span className="text-3xl md:text-4xl font-black text-indigo-600 dark:text-indigo-400">10k+</span>
                <span className="text-xs md:text-sm text-slate-500 dark:text-gray-500 font-bold uppercase tracking-widest mt-2 text-center">Mahasiswa Terbantu</span>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-3xl md:text-4xl font-black text-purple-600 dark:text-purple-400">1.2jt+</span>
                <span className="text-xs md:text-sm text-slate-500 dark:text-gray-500 font-bold uppercase tracking-widest mt-2 text-center">Analisis Dokumen</span>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-3xl md:text-4xl font-black text-blue-600 dark:text-blue-400">98%</span>
                <span className="text-xs md:text-sm text-slate-500 dark:text-gray-500 font-bold uppercase tracking-widest mt-2 text-center">Akurasi Akademik</span>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-3xl md:text-4xl font-black text-amber-600 dark:text-amber-400">500+</span>
                <span className="text-xs md:text-sm text-slate-500 dark:text-gray-500 font-bold uppercase tracking-widest mt-2 text-center">Lolos Sidang</span>
             </div>
          </div>
        </div>
      </section>

      {/* Step by Step Section */}
      <section className="relative flex-none py-24 px-6 bg-white dark:bg-[#0F0F0F] transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-5xl font-bold mb-4">Mulai Riset dalam 3 Langkah</h2>
             <p className="text-slate-500 dark:text-gray-400 font-medium uppercase tracking-widest text-xs">Alur kerja akademik yang disederhanakan</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
             <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 dark:bg-white/5 backdrop-blur-md border border-indigo-600/20 dark:border-white/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-black mb-6 shadow-xl">1</div>
                <h3 className="text-xl font-bold mb-3">Upload Dokumen</h3>
                <p className="text-slate-500 dark:text-gray-400 text-sm max-w-[60ch]">Unggah PDF atau Word. AI akan mengekstrak data dan memahami konteks risetmu.</p>
             </div>
             <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 dark:bg-white/5 backdrop-blur-md border border-indigo-600/20 dark:border-white/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-black mb-6 shadow-xl">2</div>
                <h3 className="text-xl font-bold mb-3">Deep Analysis</h3>
                <p className="text-slate-500 dark:text-gray-400 text-sm max-w-[60ch]">Gunakan Deep Search untuk menemukan referensi jurnal yang valid dan relevan.</p>
             </div>
             <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 dark:bg-white/5 backdrop-blur-md border border-indigo-600/20 dark:border-white/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-black mb-6 shadow-xl">3</div>
                <h3 className="text-xl font-bold mb-3">Sempurnakan Draf</h3>
                <p className="text-slate-500 dark:text-gray-400 text-sm max-w-[60ch]">Edit tulisanmu dengan bimbingan langsung dari Profesor AI di workspace cerdas.</p>
             </div>
             {/* Connection line for desktop */}
             <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-slate-100 dark:via-white/5 to-transparent -z-0" />
          </div>
        </div>
      </section>

      {/* Value-Heavy Benefit Cards */}
      <section id="features" className="relative flex-none py-24 md:py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Fokus pada Hasil, Bukan Sekadar Fitur</h2>
            <p className="text-slate-500 dark:text-gray-400 max-w-2xl mx-auto">AI kami dirancang untuk membantu Anda mencapai target akademik dengan standar tinggi.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Efisiensi Riset",
                description: "Selesaikan draf skripsi dan jurnal 3x lebih cepat dengan bimbingan terstruktur dari Profesor AI.",
                icon: <Zap className="text-indigo-500" />
              },
              {
                title: "Kualitas Akademik",
                description: "Pastikan tulisan Anda memenuhi standar PUEBI dan sitasi yang akurat tanpa risiko plagiarisme.",
                icon: <Shield className="text-purple-500" />
              },
              {
                title: "Akses 24/7",
                description: "Dapatkan bantuan konsultasi metodologi dan olah data kapan saja tanpa harus menunggu jam kerja.",
                icon: <Sparkles className="text-amber-500" />
              }
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.2, delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="relative p-8 rounded-[24px] bg-slate-50 dark:bg-white/5 backdrop-blur-[16px] border border-slate-200 dark:border-white/10 transition-all group overflow-hidden"
              >
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-white/5">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed max-w-[65ch]">
                  {benefit.description}
                </p>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full group-hover:bg-indigo-500/10 transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Playground */}
      <section className="relative flex-none py-24 px-6 bg-white dark:bg-[#0F0F0F] transition-colors overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="bg-indigo-600 rounded-[2.5rem] p-8 md:p-12 text-center relative overflow-hidden shadow-2xl shadow-indigo-900/40">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Coba Tanya Dosen AI</h2>
              <p className="text-indigo-100 mb-8 max-w-xl mx-auto">Tulis pertanyaan akademikmu dan lihat bagaimana AI kami merespons secara cerdas.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
                {[
                  "Cara membuat batasan masalah?",
                  "Tips mencari jurnal Scopus?",
                  "Bagaimana cara parafrase PUEBI?"
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      const input = document.getElementById('playground-input');
                      if (input) {
                        input.value = q;
                        handlePlaygroundSubmit(q);
                      }
                    }}
                    className="text-xs font-semibold px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition-all backdrop-blur-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <div className="max-w-2xl mx-auto relative group mb-6">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handlePlaygroundSubmit(e.target.elements.query.value);
                }}>
                  <input
                    id="playground-input"
                    name="query"
                    type="text"
                    placeholder="Contoh: Bagaimana cara membuat batasan masalah yang baik?"
                    className="w-full bg-white/10 border border-white/20 rounded-2xl py-5 px-6 text-white placeholder-indigo-200 outline-none focus:bg-white/20 focus:border-white/40 transition-all shadow-inner pr-36"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 bg-white text-indigo-600 px-6 rounded-xl font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                  >
                    Tanya AI <ArrowRight size={18} />
                  </button>
                </form>
              </div>

              <AnimatePresence mode="wait">
                {playgroundResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-6 text-left border border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                        <Sparkles size={12} className="text-indigo-600" />
                      </div>
                      <span className="text-xs font-bold text-indigo-100 uppercase tracking-wider">Respons Profesor AI</span>
                    </div>
                    <p className="text-indigo-50 text-sm leading-relaxed whitespace-pre-wrap">
                      {displayedText}
                    </p>
                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                       <Link href="/auth/login" className="text-xs font-bold text-white underline underline-offset-4 flex items-center gap-1">
                          Lanjutkan Diskusi Lengkap <ArrowRight size={12} />
                       </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="mt-6 text-[10px] text-indigo-200 font-medium uppercase tracking-widest">Daftar gratis untuk mendapatkan akses ke ribuan referensi akademik</p>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/10 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative flex-none py-24 px-6 bg-slate-50/50 dark:bg-[#0A0A0A]/50 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Apa Kata Mereka?</h2>
            <p className="text-slate-500 dark:text-gray-400 max-w-2xl mx-auto">Ribuan mahasiswa telah membuktikan kemudahan riset dengan EduSpaceAI.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Andini Putri",
                major: "Sastra Indonesia, UI",
                quote: "EduSpaceAI sangat membantu saya dalam merapikan sitasi dan memastikan PUEBI saya benar. Skripsi saya selesai jauh lebih cepat dari target!",
                rating: 5
              },
              {
                name: "Budi Santoso",
                major: "Teknik Informatika, ITB",
                quote: "Fitur Deep Search-nya luar biasa. Menemukan referensi jurnal internasional yang relevan jadi sangat mudah dan terarah.",
                rating: 5
              },
              {
                name: "Siti Aminah",
                major: "Manajemen, UGM",
                quote: "Dosen AI-nya beneran kayak konsultasi sama profesor sungguhan. Logika penelitian saya jadi lebih kuat setelah dibantu di sini.",
                rating: 5
              }
            ].map((t, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-[#151515] p-8 rounded-3xl border border-slate-200 dark:border-[#2A2A2A] shadow-sm"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} size={16} className="fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-slate-600 dark:text-gray-300 italic mb-6 leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{t.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-gray-500">{t.major}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section id="demo" className="relative flex-none py-20 md:py-32 px-6 bg-white dark:bg-[#0F0F0F] transition-colors border-t border-slate-100 dark:border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-[24px] border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 backdrop-blur-[16px] p-4 shadow-2xl shadow-indigo-500/5 overflow-hidden group transition-all">
            {/* Window Controls */}
            <div className="flex gap-1.5 mb-4 px-2">
              <div className="w-3 h-3 rounded-full bg-red-500/20 group-hover:bg-red-500/50 transition-colors"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 group-hover:bg-yellow-500/50 transition-colors"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/20 group-hover:bg-green-500/50 transition-colors"></div>
            </div>

            {/* Enhanced Dashboard Preview (Cool Banner) */}
            <div className="aspect-video bg-slate-50 dark:bg-[#0F0F0F] rounded-xl overflow-hidden flex relative border border-slate-100 dark:border-transparent transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 dark:from-indigo-600/10 via-transparent to-purple-600/5 dark:to-purple-600/10"></div>

              <div className="w-48 border-r border-slate-200 dark:border-[#1E1E1E] p-4 hidden md:block relative z-10 bg-white/50 dark:bg-[#0F0F0F]/50 backdrop-blur-sm transition-colors">
                <div className="h-4 w-24 bg-gradient-to-r from-indigo-500 to-purple-500 rounded mb-8 opacity-50"></div>
                <div className="space-y-3">
                  <div className="h-8 w-full bg-indigo-50 dark:bg-indigo-600/20 rounded-lg border border-indigo-100 dark:border-indigo-500/20 flex items-center px-3">
                    <div className="w-3 h-3 rounded bg-indigo-400 mr-2"></div>
                    <div className="h-1.5 w-12 bg-indigo-400/50 rounded"></div>
                  </div>
                  <div className="h-8 w-full bg-white dark:bg-[#1E1E1E] rounded-lg border border-slate-200 dark:border-white/5 flex items-center px-3">
                    <div className="w-3 h-3 rounded bg-slate-300 dark:bg-gray-600 mr-2"></div>
                    <div className="h-1.5 w-16 bg-slate-200 dark:bg-gray-600 rounded"></div>
                  </div>
                  <div className="h-8 w-full bg-white dark:bg-[#1E1E1E] rounded-lg border border-slate-200 dark:border-white/5 flex items-center px-3">
                    <div className="w-3 h-3 rounded bg-slate-300 dark:bg-gray-600 mr-2"></div>
                    <div className="h-1.5 w-10 bg-slate-200 dark:bg-gray-600 rounded"></div>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-8 flex flex-col relative z-10">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <div className="h-4 w-32 bg-slate-200 dark:bg-white/10 rounded"></div>
                </div>

                <div className="space-y-6 max-w-lg">
                  <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-4 border border-slate-200 dark:border-white/5 shadow-xl transition-colors">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white">A</div>
                      <div className="space-y-2 flex-1">
                        <div className="h-2 w-full bg-slate-100 dark:bg-white/10 rounded"></div>
                        <div className="h-2 w-3/4 bg-slate-100 dark:bg-white/10 rounded"></div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white">Edu</div>
                      <div className="bg-indigo-50 dark:bg-indigo-600/10 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-500/20 flex-1">
                        <div className="h-2 w-full bg-indigo-200 dark:bg-indigo-400/30 rounded mb-2"></div>
                        <div className="h-2 w-5/6 bg-indigo-200 dark:bg-indigo-400/30 rounded mb-2"></div>
                        <div className="h-2 w-4/6 bg-indigo-200 dark:bg-indigo-400/30 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex items-center gap-4 bg-slate-100 dark:bg-[#1A1A1A] p-3 rounded-2xl border border-slate-200 dark:border-white/5 transition-colors">
                   <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-transparent"><Plus size={16} className="text-slate-400 dark:text-gray-500" /></div>
                   <div className="flex-1 h-3 bg-slate-200 dark:bg-white/5 rounded-full"></div>
                   <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20"><ArrowRight size={18} className="text-white" /></div>
                </div>
              </div>

              {/* Floating Element for visual flair */}
              <div className="absolute top-1/4 right-8 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full"></div>
              <div className="absolute bottom-1/4 left-1/4 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full"></div>
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          </div>
        </div>
      </section>


      {/* Comparison Table Section */}
      <section className="relative flex-none py-24 px-6 bg-white dark:bg-[#0F0F0F] transition-colors">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Kenapa EduSpaceAI?</h2>
            <p className="text-slate-500 dark:text-gray-400 max-w-[65ch] mx-auto">Perbandingan fitur akademik kami dengan alat AI generik untuk kebutuhan riset Anda.</p>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 backdrop-blur-[16px] shadow-2xl shadow-indigo-500/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-white/5">
                  <th className="p-6 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Fitur Utama</th>
                  <th className="p-6 text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">EduSpaceAI</th>
                  <th className="p-6 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">AI Generik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {[
                  { feature: "Bimbingan Metodologi", edu: true, other: false },
                  { feature: "Pencarian Jurnal Valid", edu: true, other: "Terbatas" },
                  { feature: "Cek PUEBI & Plagiasi", edu: true, other: false },
                  { feature: "Visualisasi Diagram", edu: true, other: "Hanya Teks" },
                  { feature: "Kerahasiaan Data Riset", edu: "Terjamin", other: "Risiko Tinggi" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-6 font-semibold text-slate-700 dark:text-gray-300">{row.feature}</td>
                    <td className="p-6">
                      {row.edu === true ? <div className="flex items-center gap-2 text-green-500 font-bold"><Check size={20} /> Ada</div> : <span className="font-bold text-indigo-500">{row.edu}</span>}
                    </td>
                    <td className="p-6 text-slate-400 dark:text-gray-500">
                      {row.other === false ? "Tidak Ada" : row.other}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Brief Pricing Section */}
      <section className="relative flex-none py-24 px-6 bg-white dark:bg-[#0F0F0F] transition-colors border-t border-slate-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Pilih Paket Belajar Kamu</h2>
            <p className="text-slate-500 dark:text-gray-400 max-w-2xl mx-auto italic">Tingkatkan produktivitas riset dengan kekuatan AI tercanggih.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: 'FREE', price: '0', features: ['Gemini 2.5 Flash', '20 pesan / hari', 'Konteks pendek'] },
              { name: 'PRO', price: '100.000', recommended: true, features: ['Gemini 3.1 Pro', '500 pesan / hari', 'Advanced AI Agent', 'Pencarian Internet'] },
              { name: 'ULTRA', price: '200.000', features: ['Claude 4.6 Sonnet', 'Unlimited Fair Usage', 'Respon Prioritas'] }
            ].map((plan, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className={`relative p-8 rounded-[24px] border ${plan.recommended ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-600/5 shadow-2xl' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 backdrop-blur-[16px]'} transition-all`}
              >
                {plan.recommended && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">Paling Populer</div>}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-sm font-bold mr-1">Rp</span>
                  <span className="text-3xl font-black">{plan.price}</span>
                  <span className="text-xs text-slate-500">/bulan</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
                      <Check size={14} className="text-green-500" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/pricing" className={`block w-full py-3 rounded-xl font-bold text-center transition-all ${plan.recommended ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90'}`}>
                   Lihat Detail
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative flex-none py-24 px-6 bg-white dark:bg-[#0F0F0F] transition-colors">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Pertanyaan Umum</h2>
            <p className="text-slate-500 dark:text-gray-400 italic">Segala hal yang perlu Anda ketahui tentang EduSpaceAI.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Apakah EduSpaceAI gratis digunakan?",
                a: "Ya! Kami menyediakan paket FREE yang sangat cukup untuk memulai riset. Anda juga bisa upgrade ke paket Premium untuk akses model AI yang lebih cerdas dan kuota harian yang lebih besar."
              },
              {
                q: "Bagaimana dengan privasi data dokumen saya?",
                a: "Kami menjamin kerahasiaan 100%. Dokumen yang Anda unggah hanya digunakan untuk analisis konteks obrolan Anda dan tidak akan dibagikan kepada pihak ketiga atau digunakan untuk melatih model AI publik."
              },
              {
                q: "Apakah referensi jurnal yang diberikan valid?",
                a: "Sangat valid. Agen Deep Search kami terintegrasi dengan database akademik terpercaya dan selalu memberikan link sumber jurnal asli sehingga Anda bisa memverifikasinya secara langsung."
              },
              {
                q: "Bisakah digunakan untuk tugas selain skripsi?",
                a: "Tentu bisa! EduSpaceAI dirancang untuk semua kebutuhan akademik, mulai dari tugas harian, makalah, esai, hingga penulisan jurnal internasional (Scopus)."
              },
              {
                q: "Apakah bimbingan AI ini legal secara akademik?",
                a: "EduSpaceAI adalah alat bantu (asisten), bukan pengganti proses berpikir. Gunakan AI sebagai teman brainstorming dan korektor tata bahasa untuk meningkatkan kualitas karya Anda sendiri."
              }
            ].map((faq, i) => (
              <div key={i} className="border border-slate-200 dark:border-white/10 rounded-[24px] overflow-hidden bg-white dark:bg-black/20 backdrop-blur-[16px]">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <span className="font-bold text-slate-800 dark:text-white">{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={20} className="text-indigo-500" /> : <ChevronDown size={20} className="text-slate-400" />}
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 text-slate-600 dark:text-gray-400 text-sm leading-relaxed border-t border-slate-100 dark:border-white/5">
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

      {/* Final CTA Section */}
      <section className="relative flex-none py-24 px-6 bg-white dark:bg-[#0F0F0F] transition-colors overflow-hidden">
        <div className="max-w-4xl mx-auto">
           <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 0.2 }}
             className="relative rounded-[32px] bg-indigo-600 p-12 md:p-20 text-center overflow-hidden shadow-2xl shadow-indigo-500/20"
           >
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                  Siap Menyelesaikan <br className="hidden md:block" /> Riset Kamu Sekarang?
                </h2>
                <p className="text-indigo-100 mb-10 max-w-xl mx-auto text-lg">
                  Bergabunglah dengan ribuan mahasiswa lainnya dan rasakan kemudahan riset dengan bimbingan Profesor AI.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <Link
                    href="/auth/login"
                    className="w-full sm:w-auto px-10 py-5 bg-white text-indigo-600 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                  >
                    Mulai Sekarang
                  </Link>
                  <Link
                    href="#demo"
                    className="text-white font-bold text-lg flex items-center gap-2 hover:gap-3 transition-all"
                  >
                    Lihat Hasil Contoh <ArrowRight size={20} />
                  </Link>
                </div>
              </div>

              {/* Decorative Background Elements */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500 via-transparent to-purple-500 opacity-50" />
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 blur-3xl rounded-full" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-400/20 blur-3xl rounded-full" />
           </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-8 rounded-3xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-[#2A2A2A] hover:border-indigo-500/30 transition-all group shadow-sm dark:shadow-none">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#1E1E1E] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
      <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
