'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import useAuth from '@/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';

export default function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Ambil data auth
  const { userId, user, isLoading } = useAuth();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Protected Routes Logic
  useEffect(() => {
    const publicRoutes = ['/', '/auth'];
    if (!isLoading && !userId && !publicRoutes.includes(pathname)) {
      router.push('/');
    }
  }, [userId, isLoading, pathname, router]);

  // Mencegah Hydration Error
  if (!hasMounted) return null;

  // Jika di landing page atau auth page, jangan tampilkan sidebar/header
  const isAuthPage = pathname === '/auth';
  const isLandingPage = pathname === '/';

  if (isAuthPage || isLandingPage) {
    return <>{children}</>;
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
        user={user}
      />

      <main className="flex-1 flex flex-col h-full min-w-0 relative">
        <Header setIsSidebarOpen={setIsSidebarOpen} user={user} />

        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>
      </main>
    </div>
  );
}
