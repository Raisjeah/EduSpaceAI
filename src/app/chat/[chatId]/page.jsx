'use client';

import ChatView from '@/components/ChatView';
import useAuth from '@/hooks/useAuth';
import { useParams, useSearchParams } from 'next/navigation';

export default function ChatPage() {
  const { userId, isLoading } = useAuth();
  const { chatId } = useParams();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  // Jangan return null agar Sidebar & Header di MainLayout tetap sinkron
  // ChatView sudah menangani loading state internalnya sendiri
  return <ChatView userId={userId} activeChatId={chatId} projectId={projectId} />;
}
