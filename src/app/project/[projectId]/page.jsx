'use client';

import ChatView from '@/components/ChatView';
import useAuth from '@/hooks/useAuth';
import { useParams } from 'next/navigation';

export default function ProjectPage() {
  const { userId, isLoading } = useAuth();
  const { projectId } = useParams();

  if (isLoading) return null;

  return <ChatView userId={userId} projectId={projectId} />;
}
