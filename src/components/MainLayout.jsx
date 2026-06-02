'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLayout } from '@/context/LayoutContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import LoadingScreen from '@/components/LoadingScreen';
import useAuth from '@/hooks/useAuth';
import Toast from '@/components/Toast';
import ProjectModal from './ProjectModal';

export default function MainLayout({ children }) {
  const { isSidebarOpen, setIsSidebarOpen, isProjectModalOpen, setIsProjectModalOpen } = useLayout();
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
    const isInternalPage = !isAuthPage && !isHomePage && !isPricingPage && !isLegalPage;

    // Redirect ke login hanya jika benar-benar tidak ada userId (bukan transisi loading)
    if (!userId && isInternalPage && pathname !== '/chat/live') {
      router.replace(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
    // Redirect ke home jika sudah login tapi mencoba akses halaman auth
    else if (userId && isAuthPage) {
      router.replace('/');
    }
  }, [userId, isLoading, pathname, router, hasMounted]);

  // Mencegah Hydration Error
  if (!hasMounted) return null;

  const isAuthPage = pathname.startsWith('/auth');

  const isHomePage = pathname === '/';
  const isChatPage = pathname.startsWith('/chat') && pathname !== '/chat/live';
  const isLiveCallPage = pathname === '/chat/live';
  const isProjectPage = pathname.startsWith('/project');
  const isAgentMode = pathname.startsWith('/project/');

  // Key untuk AnimatePresence agar transisi dari "/", "/chat/:id", atau "/project/:id" tidak re-render layout
  const layoutKey = (isHomePage || isChatPage || isProjectPage) ? 'chat-view' : pathname;

  // Loading state - Hanya tampilkan loading screen jika belum ada userId dan sedang loading (initial auth check)
  // Jika sudah ada userId, biarkan layout tetap render agar tidak ada "flicker" saat re-fetching user data
  if (isLoading && !userId) {
    return <LoadingScreen />;
  }

  // Jika di halaman auth atau live call, tampilkan children saja tanpa sidebar/header
  if (isAuthPage || isLiveCallPage) {
    return <div className="min-h-[100dvh] bg-white dark:bg-[#0F0F0F] text-slate-900 dark:text-gray-200">{children}</div>;
  }

  return (
    <div className="relative h-[100dvh] w-full bg-white dark:bg-[#0F0F0F] text-slate-900 dark:text-gray-200 overflow-x-hidden flex transition-colors duration-200">
      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <Suspense fallback={null}>
        <Sidebar
          userId={userId}
        />
      </Suspense>

      {/* Backdrop for mobile when sidebar is open */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col h-[100dvh] min-w-0 relative overflow-hidden">
        <ProjectModal
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
          userId={userId}
        />

        <div className={`flex-1 flex flex-col min-h-0 overflow-hidden relative transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-[280px] md:translate-x-0 md:ml-[280px]' : 'translate-x-0 ml-0'
        } ${isAgentMode ? 'md:ml-0' : ''}`}>
          <Header />

          <AnimatePresence mode="wait">
            <motion.div
              key={layoutKey}
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
