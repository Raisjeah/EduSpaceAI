'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, GraduationCap, Layout, Shield, Sparkles, Briefcase, Plus, Search, Zap, CheckCircle, BookOpen, Edit3 } from 'lucide-react';
import Footer from '@/components/Footer';

export default function LandingPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
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
      <section className="relative flex-none pt-28 md:pt-40 pb-20 md:pb-32 overflow-hidden">
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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-8 transition-colors"
          >
            <Sparkles size={16} />
            <span>EduSpaceAI v1.2 - Asisten Riset Akademik AI Terdepan</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-8 leading-[1.1] px-2"
          >
            Selesaikan Skripsi & Jurnal <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400">
              3x Lebih Cepat
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-500 dark:text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Dosen AI pribadi yang memahami konteks risetmu. Dari cari judul, olah data, hingga cek PUEBI — semua dalam satu workspace cerdas.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/auth/login"
              className="group flex items-center gap-2 px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-900/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              Coba Sekarang
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="px-10 py-5 bg-white dark:bg-[#1A1A1A] hover:bg-slate-50 dark:hover:bg-[#252525] text-slate-600 dark:text-gray-300 rounded-2xl font-bold text-lg transition-all border border-slate-200 dark:border-[#2A2A2A] hover:border-slate-300 dark:hover:border-[#3A3A3A]"
            >
              Pelajari Fitur
            </Link>
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
             <h2 className="text-3xl md:text-5xl font-bold mb-4">Cara Kerja EduSpaceAI</h2>
             <p className="text-slate-500 dark:text-gray-400 font-medium uppercase tracking-widest text-xs">Alur riset yang lebih cerdas</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
             <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-black mb-6 shadow-lg shadow-indigo-500/40">1</div>
                <h3 className="text-xl font-bold mb-3">Upload Draf/Jurnal</h3>
                <p className="text-slate-500 dark:text-gray-400 text-sm">Unggah file PDF, Word, atau Excel. AI akan langsung mengekstrak dan memahami konteks isinya.</p>
             </div>
             <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center text-2xl font-black mb-6 shadow-lg shadow-purple-500/40">2</div>
                <h3 className="text-xl font-bold mb-3">Analisis & Cari Referensi</h3>
                <p className="text-slate-500 dark:text-gray-400 text-sm">Gunakan Agen Deep Search untuk mencari referensi jurnal pendukung yang valid dan terbaru.</p>
             </div>
             <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-amber-600 text-white flex items-center justify-center text-2xl font-black mb-6 shadow-lg shadow-amber-500/40">3</div>
                <h3 className="text-xl font-bold mb-3">Edit & Sempurnakan</h3>
                <p className="text-slate-500 dark:text-gray-400 text-sm">Sempurnakan draf di Editor cerdas dengan bimbingan langsung dari Profesor Riset AI.</p>
             </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features - Agent Profiles */}
      <section id="features" className="relative flex-none py-24 md:py-32 px-6 overflow-hidden bg-slate-50/50 dark:bg-[#0A0A0A]/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Pilih Agen Spesialis Anda</h2>
            <p className="text-slate-500 dark:text-gray-400 max-w-2xl mx-auto">Bekerja sama dengan AI yang memiliki kepribadian dan keahlian spesifik.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[350px]">
            {/* Deep Search - Large Card */}
            <motion.div
              whileHover={{ y: -5 }}
              className="md:col-span-2 md:row-span-1 relative overflow-hidden rounded-3xl border border-slate-200 dark:border-[#2A2A2A] bg-gradient-to-br from-white to-slate-50 dark:from-[#151515] dark:to-[#0A0A0A] p-8 group transition-all shadow-sm"
            >
              <div className="relative z-10 h-full flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">Search & Discovery</div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">Deep Search Agent</h3>
                  <p className="text-slate-500 dark:text-gray-400 text-base mb-6">
                    Ahli dalam menelusuri internet dan database akademik untuk menemukan informasi terbaru, tren teknologi, dan referensi jurnal terpercaya.
                  </p>
                  <div className="flex items-center gap-3">
                     <div className="flex -space-x-2">
                        {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-gray-800 border-2 border-white dark:border-[#151515]" />)}
                     </div>
                     <span className="text-[11px] text-slate-400 font-medium">Digunakan oleh 5k+ peneliti</span>
                  </div>
                </div>
                <div className="hidden md:flex flex-col justify-center items-center w-48 bg-blue-600/5 rounded-2xl border border-blue-500/20 p-6 relative overflow-hidden">
                   <Search size={64} className="text-blue-500 mb-4" />
                   <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-transparent via-blue-500/5 to-transparent animate-shimmer" />
                </div>
              </div>
            </motion.div>

            {/* Researcher Profile */}
            <motion.div
              whileHover={{ y: -5 }}
              className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-[#2A2A2A] bg-white dark:bg-[#151515] p-8 transition-all shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6 text-green-500">
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                Profesor Riset
                <span className="px-2 py-0.5 text-[9px] bg-green-600 text-white rounded-full uppercase tracking-wider">Expert</span>
              </h3>
              <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed">
                Spesialis metodologi dan kerangka berpikir. Membimbingmu menyusun Bab 1-5 dengan logika penelitian yang kuat dan sistematis.
              </p>
            </motion.div>

            {/* Editor Profile */}
            <motion.div
              whileHover={{ y: -5 }}
              className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-[#2A2A2A] bg-white dark:bg-[#151515] p-8 transition-all shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 text-amber-500">
                <Edit3 size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Editor Akademik</h3>
              <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed">
                Ahli dalam PUEBI, tata bahasa, dan format sitasi (APA, MLA). Memastikan tulisanmu terdengar profesional dan bebas plagiasi.
              </p>
            </motion.div>

             {/* Visualizer Profile */}
             <motion.div
              whileHover={{ y: -5 }}
              className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-[#2A2A2A] bg-white dark:bg-[#151515] p-8 transition-all shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-500">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Visual Mapper</h3>
              <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed">
                Mengubah teori yang rumit menjadi diagram visual (Mermaid) yang mudah dipahami untuk presentasi dan draf jurnalmu.
              </p>
            </motion.div>

             {/* Multi-model Support */}
             <motion.div
              whileHover={{ y: -5 }}
              className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-[#2A2A2A] bg-white dark:bg-[#151515] p-8 transition-all shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 text-purple-500">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Multi-model Switching</h3>
              <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed">
                Pindah antar model AI terbaik (Gemini & Claude) sesuai kebutuhan. Gunakan model tercepat atau yang paling cerdas dalam satu klik.
              </p>
            </motion.div>
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

                 <div className="max-w-2xl mx-auto relative group">
                    <input
                       type="text"
                       placeholder="Contoh: Bagaimana cara membuat batasan masalah yang baik?"
                       className="w-full bg-white/10 border border-white/20 rounded-2xl py-5 px-6 text-white placeholder-indigo-200 outline-none focus:bg-white/20 focus:border-white/40 transition-all shadow-inner"
                    />
                    <Link
                      href="/auth/login"
                      className="absolute right-2 top-2 bottom-2 bg-white text-indigo-600 px-6 rounded-xl font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                    >
                       Tanya AI <ArrowRight size={18} />
                    </Link>
                 </div>
                 <p className="mt-4 text-[10px] text-indigo-200 font-medium uppercase tracking-widest">Daftar gratis untuk mendapatkan jawaban lengkap</p>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/10 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2"></div>
           </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="relative flex-none py-20 md:py-32 px-6 bg-slate-50 dark:bg-[#0A0A0A]/50 transition-colors">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl border border-slate-200 dark:border-[#2A2A2A] bg-white dark:bg-[#151515] p-4 shadow-2xl shadow-slate-200 dark:shadow-black/50 overflow-hidden group transition-all">
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
