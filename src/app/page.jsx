'use client';

import ChatView from '@/components/ChatView';
import useAuth from '@/hooks/useAuth';

export default function Home() {
  const { userId } = useAuth();

  return (
    <ChatView userId={userId} />
  );
}
