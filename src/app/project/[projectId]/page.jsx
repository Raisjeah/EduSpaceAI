'use client';

import ChatView from '@/components/chat/ChatView';
import useAuth from '@/hooks/useAuth';
import { useParams } from 'next/navigation';

export default function ProjectPage() {
  const { userId, isLoading } = useAuth();
  const { projectId } = useParams();

  // Biarkan ChatView menangani loading state-nya sendiri
  return <ChatView userId={userId} projectId={projectId} />;
}
