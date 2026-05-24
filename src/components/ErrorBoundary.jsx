'use client';

import React from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white dark:bg-[#0F0F0F] text-slate-900 dark:text-white transition-colors duration-200">
          <div className="w-full max-w-md p-8 rounded-3xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 text-center shadow-xl">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-500 mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h1 className="text-2xl font-bold mb-2">Ups! Terjadi Kesalahan</h1>
            <p className="text-slate-600 dark:text-gray-400 mb-8 text-sm leading-relaxed">
              Maaf, sepertinya terjadi kendala teknis. Coba segarkan halaman atau kembali ke beranda.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
              >
                <RefreshCcw size={18} /> Segarkan Halaman
              </button>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 w-full py-3 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-200 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-[#252525] transition-all"
              >
                <Home size={18} /> Kembali ke Beranda
              </Link>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 bg-black/5 dark:bg-white/5 rounded-lg text-left overflow-auto max-h-40">
                <code className="text-[10px] text-red-500 font-mono">
                  {this.state.error && this.state.error.toString()}
                </code>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
