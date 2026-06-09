'use client';

import { Suspense } from 'react';
import ChatView from '@/components/chat/ChatView';
import useAuth from '@/hooks/useAuth';
import { useParams, useSearchParams } from 'next/navigation';
import { SkeletonChatMessage } from '@/components/ui/Skeleton';

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
    <Suspense fallback={
      <div className="flex-1 w-full h-full p-4 sm:p-6 bg-white dark:bg-[#0F0F0F] flex flex-col">
        <div className="max-w-4xl mx-auto w-full pt-8 flex-1 space-y-4">
           <SkeletonChatMessage isUser={false} />
           <SkeletonChatMessage isUser={true} />
           <SkeletonChatMessage isUser={false} />
        </div>
      </div>
    }>
      <ChatPageInner />
    </Suspense>
  );
}
