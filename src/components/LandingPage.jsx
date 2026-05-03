'use client';

import Link from 'next/link';
import { ArrowRight, GraduationCap, Layout, Shield, Sparkles, Briefcase, Plus } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar bg-[#0F0F0F] text-gray-200">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 pb-20 md:pb-32 overflow-hidden">
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

          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight px-2">
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

            {/* Enhanced Dashboard Preview (Cool Banner) */}
            <div className="aspect-video bg-[#0F0F0F] rounded-xl overflow-hidden flex relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-purple-600/10"></div>

              <div className="w-48 border-r border-[#1E1E1E] p-4 hidden md:block relative z-10 bg-[#0F0F0F]/50 backdrop-blur-sm">
                <div className="h-4 w-24 bg-gradient-to-r from-indigo-500 to-purple-500 rounded mb-8 opacity-50"></div>
                <div className="space-y-3">
                  <div className="h-8 w-full bg-indigo-600/20 rounded-lg border border-indigo-500/20 flex items-center px-3">
                    <div className="w-3 h-3 rounded bg-indigo-400 mr-2"></div>
                    <div className="h-1.5 w-12 bg-indigo-400/50 rounded"></div>
                  </div>
                  <div className="h-8 w-full bg-[#1E1E1E] rounded-lg border border-white/5 flex items-center px-3">
                    <div className="w-3 h-3 rounded bg-gray-600 mr-2"></div>
                    <div className="h-1.5 w-16 bg-gray-600 rounded"></div>
                  </div>
                  <div className="h-8 w-full bg-[#1E1E1E] rounded-lg border border-white/5 flex items-center px-3">
                    <div className="w-3 h-3 rounded bg-gray-600 mr-2"></div>
                    <div className="h-1.5 w-10 bg-gray-600 rounded"></div>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-8 flex flex-col relative z-10">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <div className="h-4 w-32 bg-white/10 rounded"></div>
                </div>

                <div className="space-y-6 max-w-lg">
                  <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/5 shadow-xl">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex-shrink-0 flex items-center justify-center text-xs font-bold">A</div>
                      <div className="space-y-2 flex-1">
                        <div className="h-2 w-full bg-white/10 rounded"></div>
                        <div className="h-2 w-3/4 bg-white/10 rounded"></div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center text-[10px] font-bold">Edu</div>
                      <div className="bg-indigo-600/10 rounded-2xl p-4 border border-indigo-500/20 flex-1">
                        <div className="h-2 w-full bg-indigo-400/30 rounded mb-2"></div>
                        <div className="h-2 w-5/6 bg-indigo-400/30 rounded mb-2"></div>
                        <div className="h-2 w-4/6 bg-indigo-400/30 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex items-center gap-4 bg-[#1A1A1A] p-3 rounded-2xl border border-white/5">
                   <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><Plus size={16} className="text-gray-500" /></div>
                   <div className="flex-1 h-3 bg-white/5 rounded-full"></div>
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

      {/* Features Grid */}
      <section id="features" className="py-24 bg-[#0A0A0A] border-t border-[#1E1E1E]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<GraduationCap className="text-indigo-500" />}
              title="Bimbingan Akademik"
              description="Diskusi topik penelitian dan draf bab dengan AI yang memahami metodologi penelitian."
            />
            <FeatureCard
              icon={<Briefcase className="text-orange-500" />}
              title="Workspace Agents"
              description="Buat workspace khusus dengan agen AI spesialis seperti Deep Search, Researcher, atau Editor."
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
