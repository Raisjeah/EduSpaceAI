'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { login, loginWithGoogle } from '@/app/actions/authActions';
import useAuth from '@/hooks/useAuth';
import { Loader2, BookOpen, Search, Edit3, GraduationCap, ArrowRight } from 'lucide-react';

function sanitizeCallbackUrl(raw) {
  if (typeof raw !== 'string' || raw.length === 0) return '/';
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/';
  if (raw.includes('\\')) return '/';
  return raw;
}

function LoginPageInner() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const agreedRef = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchUser, showNotification } = useAuth();

  const callbackUrl = sanitizeCallbackUrl(searchParams.get('callbackUrl'));

  useEffect(() => {
    agreedRef.current = agreed;
  }, [agreed]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!agreed) {
      setError('Anda harus menyetujui Ketentuan Layanan & Kebijakan Privasi.');
      return;
    }

    setLoading(true);
    const formData = new FormData(e.target);
    const result = await login(formData);
    if (result.success) {
      await fetchUser();
      showNotification('Login berhasil');
      router.push(callbackUrl);
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  async function handleGoogleResponse(response) {
    if (!agreedRef.current) {
      setError('Anda harus menyetujui Ketentuan Layanan & Kebijakan Privasi sebelum masuk dengan Google.');
      return;
    }

    setLoading(true);
    const result = await loginWithGoogle(response.credential);
    if (result.success) {
      await fetchUser();
      showNotification('Login berhasil');
      router.push(callbackUrl);
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  useEffect(() => {
    /* global google */
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      google.accounts.id.renderButton(
        document.getElementById('googleSignIn'),
        { theme: 'outline', size: 'large', width: '100%' }
      );
    }
  }, []);

  const features = [
    { icon: BookOpen, text: 'Profesor Riset AI untuk skripsi & metodologi' },
    { icon: Search, text: 'Deep Search dari database jurnal Scopus' },
    { icon: Edit3, text: 'Editor akademik sesuai kaidah PUEBI' },
  ];

  return (
    <div className="min-h-screen flex bg-[#0A0A0F]">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-[10%] w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-[15%] right-[5%] w-96 h-96 bg-purple-600/15 rounded-full blur-[120px]" style={{animationDelay: '1s'}} />
          <div className="absolute top-[50%] left-[40%] w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
              <img src="/logo.png" alt="EduSpaceAI" className="w-7 h-7 object-contain invert-0" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">EduSpaceAI</span>
          </Link>
        </div>

        {/* Main content */}
        <div className="relative z-10">
          <div className="text-[11px] font-bold text-indigo-400 tracking-[0.25em] uppercase mb-6">/asisten riset akademik</div>
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.1] mb-6">
            Selesaikan riset
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              lebih cepat &amp; akurat.
            </span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed mb-10 max-w-sm">
            Dari draf pertama hingga sidang akhir — EduSpaceAI hadir di setiap langkahmu.
          </p>

          <div className="space-y-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center flex-shrink-0">
                  <f.icon size={16} className="text-indigo-400" />
                </div>
                <span className="text-gray-300 text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom attribution */}
        <div className="relative z-10">
          <p className="text-gray-600 text-xs">© {new Date().getFullYear()} EduSpaceAI. All rights reserved.</p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 bg-white dark:bg-[#0F0F0F] lg:rounded-l-[40px] relative">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex items-center gap-2">
          <img src="/logo.png" alt="EduSpaceAI" className="w-8 h-8 object-contain invert dark:invert-0" />
          <span className="font-bold text-lg text-slate-900 dark:text-white">EduSpaceAI</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Selamat datang kembali</h2>
            <p className="text-slate-500 dark:text-gray-400 text-sm">Masuk untuk melanjutkan risetmu.</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 p-3 rounded-xl mb-5 text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2A2A2A] rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                placeholder="nama@email.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Password</label>
              </div>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2A2A2A] rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                placeholder="••••••••"
              />
            </div>
            <div className="flex items-start gap-2.5 pt-1.5 mb-2">
              <input
                type="checkbox"
                id="agree-checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 focus:outline-none shrink-0 cursor-pointer"
              />
              <label htmlFor="agree-checkbox" className="text-[11px] text-slate-500 dark:text-gray-400 leading-tight cursor-pointer">
                Saya setuju dengan <Link href="/terms" target="_blank" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Ketentuan Layanan</Link> dan <Link href="/privacy" target="_blank" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Kebijakan Privasi</Link> EduSpaceAI.
              </label>
            </div>
            <button
              type="submit"
              disabled={loading || !agreed}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <><Loader2 size={17} className="animate-spin" /> Masuk...</>
              ) : (
                <><span>Masuk</span><ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px bg-slate-200 dark:bg-[#2A2A2A] flex-1" />
            <span className="text-slate-400 dark:text-gray-500 text-xs font-semibold uppercase">atau</span>
            <div className="h-px bg-slate-200 dark:bg-[#2A2A2A] flex-1" />
          </div>

          <div id="googleSignIn" className="w-full mb-6" />

          <p className="text-center text-slate-500 dark:text-gray-400 text-sm">
            Belum punya akun?{' '}
            <Link href="/auth/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Daftar gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}
