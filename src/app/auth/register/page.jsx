'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register } from '@/app/actions/authActions';

export default function RegisterPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.target);
    const result = await register(formData);

    if (result.success) {
      router.push('/');
      router.refresh();
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-md bg-[#1A1A1A] p-8 rounded-2xl border border-gray-800">
        <h1 className="text-2xl font-bold mb-6 text-white text-center">Daftar Akun EduSpace</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Nama Lengkap</label>
            <input
              name="name"
              type="text"
              required
              className="w-full bg-[#0F0F0F] border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-600"
              placeholder="Masukkan nama Anda"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full bg-[#0F0F0F] border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-600"
              placeholder="nama@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full bg-[#0F0F0F] border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-600"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Sudah punya akun?{' '}
          <Link href="/auth/login" className="text-indigo-500 hover:underline">
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
