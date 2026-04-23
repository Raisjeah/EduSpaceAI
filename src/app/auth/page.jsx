'use client';

import { useState, useTransition } from 'react';
import { Mail, Lock, Chrome, ArrowRight, UserPlus, LogIn, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { login, register } from '@/app/actions/authActions';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    startTransition(async () => {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      let result;
      if (mode === 'register') {
        formData.append('name', name);
        result = await register(formData);
      } else {
        result = await login(formData);
      }

      if (result.success) {
        // Refresh page to update useAuth state via cookie
        window.location.href = '/chat-new';
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full"></div>

      <div className="w-full max-w-md relative">
        {/* Back to Home */}
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 text-sm group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Beranda
        </Link>

        <div className="bg-[#1A1A1A] border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
          <div className="text-center mb-10">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-bold text-xl mx-auto mb-6 shadow-lg shadow-indigo-500/20">
              E
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {mode === 'login' ? 'Selamat Datang Kembali' : 'Buat Akun Belajar'}
            </h1>
            <p className="text-gray-500 text-sm">
              {mode === 'login' ? 'Masuk untuk melanjutkan progres belajarmu.' : 'Mulai perjalanan belajarmu dengan EduSpaceAI.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-xl mb-6 text-center font-bold">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><UserPlus size={18} /></span>
                  <input
                    type="text"
                    placeholder="Contoh: Rais Dev"
                    value={name}
                    required
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Alamat Email</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><Mail size={18} /></span>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Kata Sandi</label>
                {mode === 'login' && <button type="button" className="text-[10px] text-indigo-400 hover:underline">Lupa Password?</button>}
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><Lock size={18} /></span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>
            </div>

            <button
              disabled={isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 group mt-6 disabled:opacity-50"
            >
              {isPending ? 'Memproses...' : (mode === 'login' ? 'Masuk Sekarang' : 'Daftar Akun')}
              {!isPending && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]"><span className="bg-[#1A1A1A] px-4 text-gray-600 font-bold">Atau Masuk Dengan</span></div>
          </div>

          <button className="w-full bg-white text-black font-bold py-4 rounded-2xl transition-all hover:bg-gray-100 flex items-center justify-center gap-3">
            <Chrome size={18} /> Lanjutkan dengan Google
          </button>

          <p className="text-center mt-8 text-sm text-gray-500">
            {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'} {' '}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-indigo-400 font-bold hover:underline"
            >
              {mode === 'login' ? 'Daftar Gratis' : 'Masuk di sini'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
