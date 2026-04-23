'use client';

import ChatView from '@/components/ChatView';
import useAuth from '@/hooks/useAuth';

export default function Home() {
  const { userId, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <ChatView userId={userId} />
  );
}
