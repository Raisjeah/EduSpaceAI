'use client';

import Link from 'next/link';
import { ArrowRight, GraduationCap, Layout, Shield, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0F0F0F] text-gray-200">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-8 animate-fade-in">
            <Sparkles size={14} />
            <span>Asisten Skripsi Berbasis AI Terdepan</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Selesaikan Skripsi <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400">
              Lebih Cepat & Cerdas
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            EduSpaceAI hadir sebagai partner akademik pintarmu. Dari riset literatur hingga penyusunan bab, kami bantu setiap langkah perjalanan skripsimu.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/login"
              className="group flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-900/20"
            >
              Mulai Sekarang
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 bg-[#1A1A1A] hover:bg-[#252525] text-gray-300 rounded-2xl font-bold transition-all border border-[#2A2A2A]"
            >
              Pelajari Fitur
            </Link>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="pb-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl border border-[#2A2A2A] bg-[#151515] p-4 shadow-2xl shadow-black/50 overflow-hidden group">
            {/* Window Controls */}
            <div className="flex gap-1.5 mb-4 px-2">
              <div className="w-3 h-3 rounded-full bg-red-500/20 group-hover:bg-red-500/50 transition-colors"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 group-hover:bg-yellow-500/50 transition-colors"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/20 group-hover:bg-green-500/50 transition-colors"></div>
            </div>

            {/* Mock Dashboard Content */}
            <div className="aspect-video bg-[#0F0F0F] rounded-xl overflow-hidden flex">
              <div className="w-48 border-r border-[#1E1E1E] p-4 hidden md:block">
                <div className="h-4 w-24 bg-[#1E1E1E] rounded mb-8"></div>
                <div className="space-y-4">
                  <div className="h-8 w-full bg-indigo-600/20 rounded-lg"></div>
                  <div className="h-8 w-full bg-[#1E1E1E] rounded-lg"></div>
                  <div className="h-8 w-full bg-[#1E1E1E] rounded-lg"></div>
                </div>
              </div>
              <div className="flex-1 p-8 flex flex-col">
                <div className="h-6 w-32 bg-[#1E1E1E] rounded mb-12"></div>
                <div className="space-y-6 max-w-md">
                  <div className="h-12 w-full bg-[#1E1E1E] rounded-xl flex items-center px-4">
                    <div className="h-2 w-48 bg-[#2A2A2A] rounded"></div>
                  </div>
                  <div className="h-24 w-full bg-[#1A1A1A] rounded-xl flex flex-col p-4 gap-3">
                    <div className="h-2 w-full bg-[#2A2A2A] rounded"></div>
                    <div className="h-2 w-[80%] bg-[#2A2A2A] rounded"></div>
                    <div className="h-2 w-[60%] bg-[#2A2A2A] rounded"></div>
                  </div>
                </div>
                <div className="mt-auto h-12 w-full bg-[#1E1E1E] rounded-xl"></div>
              </div>
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-[#0A0A0A] border-t border-[#1E1E1E]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<GraduationCap className="text-indigo-500" />}
              title="Bimbingan Akademik"
              description="Diskusi topik penelitian dan draf bab dengan AI yang memahami metodologi penelitian."
            />
            <FeatureCard
              icon={<Layout className="text-purple-500" />}
              title="Tools Editor"
              description="Dilengkapi dengan alat pendukung pengerjaan dokumen yang intuitif dan efisien."
            />
            <FeatureCard
              icon={<Shield className="text-blue-500" />}
              title="Privasi Terjamin"
              description="Data penelitian dan dokumenmu aman bersama kami dengan enkripsi tingkat tinggi."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#1E1E1E] px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center font-bold text-[10px]">E</div>
          <span className="font-bold text-[14px] text-white tracking-tight">EduSpaceAI</span>
        </div>
        <p className="text-gray-500 text-sm italic">
          Bukan sekadar asisten, tapi teman seperjuangan skripsimu.
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-8 rounded-3xl bg-[#151515] border border-[#2A2A2A] hover:border-indigo-500/30 transition-all group">
      <div className="w-12 h-12 rounded-2xl bg-[#1E1E1E] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
