'use client';

import ChatView from '@/components/ChatView';
import useAuth from '@/hooks/useAuth';
import { useParams } from 'next/navigation';

export default function ChatPage() {
  const { userId } = useAuth();
  const { chatId } = useParams();

  return <ChatView userId={userId} activeChatId={chatId} />;
}
