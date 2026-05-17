'use client';

import { Suspense } from 'react';
import ChatView from '@/components/ChatView';
import LandingPage from '@/components/LandingPage';
import useAuth from '@/hooks/useAuth';

export default function Home() {
  const { userId, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#0F0F0F]">
        <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse">Menyiapkan EduSpace</p>
      </div>
    );
  }

  return userId ? (
    <Suspense fallback={null}>
      <ChatView userId={userId} />
    </Suspense>
  ) : (
    <LandingPage />
  );
}
