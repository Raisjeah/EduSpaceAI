'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import useAuth from '@/hooks/useAuth';
import Toast from '@/components/Toast';

export default function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  // Ambil data auth
  const { userId, isLoading, notification, setNotification } = useAuth();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Handle Redirection
  useEffect(() => {
    if (!hasMounted || isLoading) return;

    const isAuthPage = pathname.startsWith('/auth');
      const isHomePage = pathname === '/';
      const isPricingPage = pathname === '/pricing';
      const isLegalPage = pathname === '/terms' || pathname === '/privacy';

      // Redirect ke login jika mencoba akses halaman internal (bukan home/auth/pricing/legal) tanpa login
      if (!userId && !isAuthPage && !isHomePage && !isPricingPage && !isLegalPage) {
        router.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
      }
      // Redirect ke home jika sudah login tapi mencoba akses halaman auth
      else if (userId && isAuthPage) {
        router.push('/');
      }
  }, [userId, isLoading, pathname, router, hasMounted]);

  // Mencegah Hydration Error
  if (!hasMounted) return null;

  const isAuthPage = pathname.startsWith('/auth');

  const isHomePage = pathname === '/';
  const isPricingPage = pathname === '/pricing';
  const isLegalPage = pathname === '/terms' || pathname === '/privacy';
  const isPublicPage = isAuthPage || isHomePage || isPricingPage || isLegalPage;

  // Loading state untuk halaman internal
  if (isLoading && !isPublicPage) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-white dark:bg-[#0F0F0F]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-gray-400 font-medium animate-pulse text-sm">Menyiapkan EduSpaceAI...</p>
        </div>
      </div>
    );
  }

  // Jika di halaman auth, tampilkan children saja tanpa sidebar/header
  if (isAuthPage) {
    return <div className="min-h-[100dvh] bg-white dark:bg-[#0F0F0F] text-slate-900 dark:text-gray-200">{children}</div>;
  }

  return (
    <div className="relative h-[100dvh] w-full bg-white dark:bg-[#0F0F0F] text-slate-900 dark:text-gray-200 overflow-hidden flex transition-colors duration-200">
      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Overlay Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        userId={userId}
      />

      <main className="flex-1 flex flex-col h-[100dvh] min-w-0 relative overflow-hidden">
        <Header setIsSidebarOpen={setIsSidebarOpen} />

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex-1 flex flex-col min-h-0"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
