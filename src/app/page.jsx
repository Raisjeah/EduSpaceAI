'use client';

import Link from 'next/link';
import { ArrowRight, BrainCircuit, GraduationCap, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0F0F0F]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-500/20">E</div>
            <span className="font-bold text-lg tracking-tight">EduSpaceAI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Masuk</Link>
            <Link href="/auth" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-full text-sm font-bold transition-all shadow-lg shadow-indigo-900/20">Daftar Sekarang</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[120px] -z-10 rounded-full"></div>

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">AI-Powered Learning Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            Teman Belajar <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Paling Cerdas</span> Untukmu.
          </h1>

          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            EduSpaceAI hadir sebagai dosen pribadi yang siap membantu bimbingan skripsi, mengerjakan tugas, hingga menganalisis dokumen akademis dengan bantuan AI terbaru.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-bold transition-all group">
              Mulai Belajar Sekarang <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#features" className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold transition-all">
              Lihat Fitur
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BrainCircuit className="text-indigo-400" />}
              title="Bimbingan AI"
              description="Dapatkan saran bimbingan skripsi dan penjelasan materi yang mendalam dari asisten bertenaga AI."
            />
            <FeatureCard
              icon={<BookOpen className="text-purple-400" />}
              title="Analisis Dokumen"
              description="Upload PDF atau dokumen tugasmu, biar AI yang merangkum dan memperbaikinya untukmu."
            />
            <FeatureCard
              icon={<ShieldCheck className="text-emerald-400" />}
              title="Aman & Pribadi"
              description="Semua datamu tersimpan dengan aman di dashboard pribadi yang hanya bisa kamu akses."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600/20 rounded flex items-center justify-center font-bold text-[10px] text-indigo-400">E</div>
            <span className="font-bold text-sm tracking-tight">EduSpaceAI</span>
          </div>
          <p className="text-xs text-gray-500">© 2024 EduSpaceAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/20 transition-all group">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
