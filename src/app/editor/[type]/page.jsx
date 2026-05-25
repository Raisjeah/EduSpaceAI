'use client';

import DocumentEditor from '@/components/editor/DocumentEditor';
import useAuth from '@/hooks/useAuth';
import { useParams } from 'next/navigation';

export default function EditorPage() {
  const { userId } = useAuth();
  const { type } = useParams();

  return <DocumentEditor type={type} userId={userId} />;
}
