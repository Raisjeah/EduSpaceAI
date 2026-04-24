'use client';

import ChatView from '@/components/ChatView';
import LandingPage from '@/components/LandingPage';
import useAuth from '@/hooks/useAuth';

export default function Home() {
  const { userId, isLoading } = useAuth();

  if (isLoading) return null;

  return userId ? <ChatView userId={userId} /> : <LandingPage />;
}
