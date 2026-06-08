'use client';

import DocumentEditor from '@/components/editor/DocumentEditor';
import useAuth from '@/hooks/useAuth';
import { useParams, useSearchParams } from 'next/navigation';

export default function EditorPage() {
  const { userId } = useAuth();
  const { type } = useParams();
  const searchParams = useSearchParams();
  const docId = searchParams.get('docId');

  return <DocumentEditor type={type} userId={userId} docId={docId} />;
}
