'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { login, loginWithGoogle } from '@/app/actions/authActions';
import useAuth from '@/hooks/useAuth';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchUser } = useAuth();

  const callbackUrl = searchParams.get('callbackUrl') || '/';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.target);
    const result = await login(formData);

    if (result.success) {
      await fetchUser();
      router.push(callbackUrl);
      router.refresh();
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  async function handleGoogleResponse(response) {
    setLoading(true);
    const result = await loginWithGoogle(response.credential);
    if (result.success) {
      await fetchUser();
      router.push(callbackUrl);
      router.refresh();
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
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-md bg-[#1A1A1A] p-8 rounded-2xl border border-gray-800">
        <h1 className="text-2xl font-bold mb-6 text-white text-center">Masuk ke EduSpace</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px bg-gray-800 flex-1"></div>
          <span className="text-gray-500 text-xs uppercase font-bold">Atau</span>
          <div className="h-px bg-gray-800 flex-1"></div>
        </div>

        <div id="googleSignIn" className="w-full mb-4"></div>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Belum punya akun?{' '}
          <Link href="/auth/register" className="text-indigo-500 hover:underline">
            Daftar gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
