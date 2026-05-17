'use client';

import { Suspense } from 'react';
import ChatView from '@/components/ChatView';
import useAuth from '@/hooks/useAuth';
import { useParams, useSearchParams } from 'next/navigation';

function ChatPageInner() {
  const { userId } = useAuth();
  const { chatId } = useParams();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  // Jangan return null agar Sidebar & Header di MainLayout tetap sinkron;
  // ChatView sudah menangani loading state internalnya sendiri.
  return <ChatView userId={userId} activeChatId={chatId} projectId={projectId} />;
}

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatPageInner />
    </Suspense>
  );
}
