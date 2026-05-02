'use client';

import ChatView from '@/components/ChatView';
import LandingPage from '@/components/LandingPage';
import useAuth from '@/hooks/useAuth';

export default function Home() {
  const { userId, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 text-sm animate-pulse">Menyiapkan Ruang Belajar...</p>
      </div>
    );
  }

  return userId ? <ChatView userId={userId} /> : <LandingPage />;
}
