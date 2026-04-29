'use client';

import ChatView from '@/components/ChatView';
import useAuth from '@/hooks/useAuth';
import { useParams, useSearchParams } from 'next/navigation';

export default function ChatPage() {
  const { userId, isLoading } = useAuth();
  const { chatId } = useParams();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  if (isLoading) return null;

  return <ChatView userId={userId} activeChatId={chatId} projectId={projectId} />;
}
