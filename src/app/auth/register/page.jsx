'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register, loginWithGoogle } from '@/app/actions/authActions';

export default function RegisterPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState({
    email: { valid: true, message: '' },
    password: { valid: true, message: '' },
    name: { valid: true, message: '' }
  });
  const router = useRouter();

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) return { valid: false, message: 'Email wajib diisi' };
    if (!emailRegex.test(email)) return { valid: false, message: 'Format email tidak valid' };
    return { valid: true, message: '' };
  };

  const validatePassword = (password) => {
    if (!password) return { valid: false, message: 'Password wajib diisi' };
    if (password.length < 8) return { valid: false, message: 'Password minimal 8 karakter' };
    return { valid: true, message: '' };
  };

  const validateName = (name) => {
    if (!name) return { valid: false, message: 'Nama wajib diisi' };
    if (name.length < 2) return { valid: false, message: 'Nama terlalu pendek' };
    return { valid: true, message: '' };
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const name = formData.get('name');

    const emailVal = validateEmail(email);
    const passwordVal = validatePassword(password);
    const nameVal = validateName(name);

    setValidation({
      email: emailVal,
      password: passwordVal,
      name: nameVal
    });

    if (!emailVal.valid || !passwordVal.valid || !nameVal.valid) {
      return;
    }

    setLoading(true);
    const result = await register(formData);

    if (result.success) {
      router.push('/');
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  async function handleGoogleResponse(response) {
    setLoading(true);
    const result = await loginWithGoogle(response.credential);
    if (result.success) {
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#1A1A1A] p-8 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-xl transition-colors">
        <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white text-center">Daftar Akun EduSpace</h1>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500 text-red-600 dark:text-red-500 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-gray-400 mb-1">Nama Lengkap</label>
            <input
              name="name"
              type="text"
              required
              onBlur={(e) => setValidation(prev => ({ ...prev, name: validateName(e.target.value) }))}
              className={`w-full bg-slate-50 dark:bg-[#0F0F0F] border ${validation.name.valid ? 'border-slate-200 dark:border-gray-800' : 'border-red-500'} rounded-lg px-4 py-2 text-base text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 transition-colors`}
              placeholder="Masukkan nama Anda"
            />
            {!validation.name.valid && <p className="text-red-500 text-xs mt-1">{validation.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-gray-400 mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              onBlur={(e) => setValidation(prev => ({ ...prev, email: validateEmail(e.target.value) }))}
              className={`w-full bg-slate-50 dark:bg-[#0F0F0F] border ${validation.email.valid ? 'border-slate-200 dark:border-gray-800' : 'border-red-500'} rounded-lg px-4 py-2 text-base text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 transition-colors`}
              placeholder="nama@email.com"
            />
            {!validation.email.valid && <p className="text-red-500 text-xs mt-1">{validation.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-gray-400 mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              onBlur={(e) => setValidation(prev => ({ ...prev, password: validatePassword(e.target.value) }))}
              className={`w-full bg-slate-50 dark:bg-[#0F0F0F] border ${validation.password.valid ? 'border-slate-200 dark:border-gray-800' : 'border-red-500'} rounded-lg px-4 py-2 text-base text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 transition-colors`}
              placeholder="••••••••"
            />
            {!validation.password.valid && <p className="text-red-500 text-xs mt-1">{validation.password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px bg-slate-200 dark:bg-gray-800 flex-1"></div>
          <span className="text-slate-400 dark:text-gray-500 text-xs uppercase font-bold">Atau</span>
          <div className="h-px bg-slate-200 dark:bg-gray-800 flex-1"></div>
        </div>

        <div id="googleSignIn" className="w-full mb-4"></div>

        <p className="mt-6 text-center text-slate-500 dark:text-gray-400 text-sm">
          Sudah punya akun?{' '}
          <Link href="/auth/login" className="text-indigo-600 dark:text-indigo-500 hover:underline transition-colors">
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
