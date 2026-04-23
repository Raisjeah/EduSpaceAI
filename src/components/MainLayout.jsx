'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import useAuth from '@/hooks/useAuth';

export default function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Ambil data auth
  const { userId, isLoading } = useAuth();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Mencegah Hydration Error
  if (!hasMounted) return null;

  return (
    <div className="relative h-screen w-full bg-[#0F0F0F] text-gray-200 overflow-hidden flex">

      {/* 1. TIRAI LOADING (OVERLAY) */}
      {isLoading && !userId && (
        <div className="fixed inset-0 z-[9999] bg-[#0F0F0F] flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 text-sm font-medium animate-pulse">Menyiapkan Ruang Belajar...</p>
          </div>
        </div>
      )}

      {/* 2. PESAN JIKA USER BENAR-BENAR TIDAK ADA */}
      {!isLoading && !userId && (
        <div className="fixed inset-0 z-[9998] bg-[#0F0F0F] flex items-center justify-center p-6 text-center">
          <div className="max-w-xs">
            <p className="text-gray-400 mb-4 text-sm">Sesi belajar tidak ditemukan. Silakan refresh browser atau coba lagi.</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-indigo-600 rounded-lg text-xs font-bold">Refresh Sekarang</button>
          </div>
        </div>
      )}

      {/* 3. STRUKTUR UTAMA */}

      {/* Overlay Sidebar untuk Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        userId={userId}
      />

      <main className="flex-1 flex flex-col h-full min-w-0 relative">
        <Header setIsSidebarOpen={setIsSidebarOpen} />

        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>
      </main>
    </div>
  );
}
