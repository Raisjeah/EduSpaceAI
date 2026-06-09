'use client';

import { Suspense } from 'react';
import ChatView from '@/components/chat/ChatView';
import LandingPage from '@/components/shared/LandingPage';
import useAuth from '@/hooks/useAuth';

export default function Home() {
  const { userId, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 relative overflow-hidden gap-6 bg-white dark:bg-[#0F0F0F]">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-slate-200 dark:bg-[#222] rounded-2xl animate-pulse mb-3"></div>
          <div className="w-32 h-6 bg-slate-200 dark:bg-[#222] rounded animate-pulse mb-1"></div>
          <div className="w-48 h-4 bg-slate-200 dark:bg-[#222] rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 w-full max-w-sm">
          <div className="h-10 bg-slate-200 dark:bg-[#222] rounded-xl animate-pulse"></div>
          <div className="h-10 bg-slate-200 dark:bg-[#222] rounded-xl animate-pulse"></div>
          <div className="h-10 bg-slate-200 dark:bg-[#222] rounded-xl animate-pulse"></div>
          <div className="h-10 bg-slate-200 dark:bg-[#222] rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return userId ? (
    <Suspense fallback={
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 relative overflow-hidden gap-6 bg-white dark:bg-[#0F0F0F]">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-slate-200 dark:bg-[#222] rounded-2xl animate-pulse mb-3"></div>
          <div className="w-32 h-6 bg-slate-200 dark:bg-[#222] rounded animate-pulse mb-1"></div>
          <div className="w-48 h-4 bg-slate-200 dark:bg-[#222] rounded animate-pulse"></div>
        </div>
      </div>
    }>
      <ChatView userId={userId} />
    </Suspense>
  ) : (
    <LandingPage />
  );
}
