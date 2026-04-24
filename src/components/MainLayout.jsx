'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import useAuth from '@/hooks/useAuth';

export default function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  // Ambil data auth
  const { userId, isLoading } = useAuth();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Handle Redirection
  useEffect(() => {
    if (hasMounted && !isLoading) {
      const isAuthPage = pathname.startsWith('/auth');
      if (!userId && !isAuthPage) {
        router.push('/auth/login');
      } else if (userId && isAuthPage) {
        router.push('/');
      }
    }
  }, [userId, isLoading, pathname, router, hasMounted]);

  // Mencegah Hydration Error
  if (!hasMounted) return null;

  const isAuthPage = pathname.startsWith('/auth');

  // Jika di halaman auth, tampilkan children saja tanpa sidebar/header
  if (isAuthPage) {
    return <div className="min-h-screen bg-[#0F0F0F] text-gray-200">{children}</div>;
  }

  return (
    <div className="relative h-screen w-full bg-[#0F0F0F] text-gray-200 overflow-hidden flex">

      {/* 1. TIRAI LOADING (OVERLAY) */}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] bg-[#0F0F0F] flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 text-sm font-medium animate-pulse">Menyiapkan Ruang Belajar...</p>
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
