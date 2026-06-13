'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register, loginWithGoogle } from '@/app/actions/authActions';
import useAuth from '@/hooks/useAuth';
import { Loader2, BookOpen, Search, Edit3, Sparkles, ArrowRight } from 'lucide-react';

function getPasswordStrength(pwd) {
  if (!pwd) return { label: '', color: 'bg-slate-200', width: 'w-0' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 2) return { label: 'Lemah', color: 'bg-red-500', width: 'w-1/3' };
  if (score <= 3) return { label: 'Sedang', color: 'bg-yellow-500', width: 'w-2/3' };
  return { label: 'Kuat', color: 'bg-green-500', width: 'w-full' };
}

export default function RegisterPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();
  const { fetchUser, showNotification } = useAuth();

  const agreedRef = useRef(false);

  useEffect(() => {
    agreedRef.current = agreed;
  }, [agreed]);

  const passwordStrength = getPasswordStrength(password);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!agreed) {
      setError('Anda harus menyetujui Ketentuan Layanan & Kebijakan Privasi.');
      return;
    }

    setLoading(true);

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const passwordVal = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      setError('Format email tidak valid');
      setLoading(false);
      return;
    }

    if (passwordVal !== confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      setLoading(false);
      return;
    }

    const strength = getPasswordStrength(passwordVal);
    if (strength.label === 'Lemah') {
      setError('Password terlalu lemah. Harus minimal berstatus "Sedang".');
      setLoading(false);
      return;
    }

    const result = await register(formData);

    if (result.success) {
      await fetchUser();
      showNotification('Registrasi berhasil');
      router.push('/');
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  async function handleGoogleResponse(response) {
    if (!agreedRef.current) {
      setError('Anda harus menyetujui Ketentuan Layanan & Kebijakan Privasi sebelum mendaftar dengan Google.');
      return;
    }

    setLoading(true);
    const result = await loginWithGoogle(response.credential);
    if (result.success) {
      await fetchUser();
      showNotification('Registrasi berhasil');
      router.push('/');
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
        callback: handleGoogleResponse
      });
      google.accounts.id.renderButton(
        document.getElementById("googleSignIn"),
        { theme: "outline", size: "large", width: "100%" }
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
            Mulai risetmu
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              dengan panduan AI pintar.
            </span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed mb-10 max-w-sm">
            Gabung dengan ribuan mahasiswa Indonesia yang menyelesaikan skripsi dan riset lebih cepat.
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
        <div className="lg:hidden mb-6 flex items-center gap-2">
          <img src="/logo.png" alt="EduSpaceAI" className="w-8 h-8 object-contain invert dark:invert-0" />
          <span className="font-bold text-lg text-slate-900 dark:text-white">EduSpaceAI</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Daftar Akun Baru</h2>
            <p className="text-slate-500 dark:text-gray-400 text-sm">Mari bergabung dengan asisten akademik berbasis AI.</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 p-3 rounded-xl mb-5 text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span className="leading-tight">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Nama Depan</label>
                <input
                  name="firstName"
                  type="text"
                  required
                  className="w-full bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2A2A2A] rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  placeholder="Budi"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Nama Belakang</label>
                <input
                  name="lastName"
                  type="text"
                  required
                  className="w-full bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2A2A2A] rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  placeholder="Santoso"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2A2A2A] rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                placeholder="nama@email.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
              <input
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2A2A2A] rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                placeholder="••••••••"
              />
              {password && (
                <div className="mt-2 space-y-1 px-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 font-medium">Kekuatan Sandi:</span>
                    <span className={`font-extrabold tracking-wide uppercase ${
                      passwordStrength.label === 'Lemah' ? 'text-red-500' :
                      passwordStrength.label === 'Sedang' ? 'text-yellow-500' : 'text-green-500'
                    }`}>{passwordStrength.label}</span>
                  </div>
                  <div className="w-full h-1 bg-slate-100 dark:bg-[#2A2A2A] rounded-full overflow-hidden">
                    <div className={`h-full ${passwordStrength.color} ${passwordStrength.width} transition-all duration-300`} />
                  </div>
                  <p className="text-[9px] text-slate-400 leading-tight">
                    Gunakan minimal 8 karakter, gabungan huruf kapital, huruf kecil, angka, dan simbol.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Konfirmasi Password</label>
              <input
                name="confirmPassword"
                type="password"
                required
                className="w-full bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2A2A2A] rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-start gap-2.5 pt-1.5">
              <input
                type="checkbox"
                id="agree-checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 focus:outline-none shrink-0"
              />
              <label htmlFor="agree-checkbox" className="text-[11px] text-slate-500 dark:text-gray-400 leading-tight cursor-pointer">
                Saya setuju dengan <Link href="/terms" target="_blank" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Ketentuan Layanan</Link> dan <Link href="/privacy" target="_blank" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Kebijakan Privasi</Link> EduSpaceAI.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !agreed}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <><Loader2 size={17} className="animate-spin" /> Mendaftar...</>
              ) : (
                <><span>Daftar Sekarang</span><ArrowRight size={16} /></>
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
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
