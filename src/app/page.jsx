'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ChatView from '@/components/ChatView';
import ToolsView from '@/components/ToolsView';
import DocumentEditor from '@/components/DocumentEditor';
import useAuth from '@/hooks/useAuth';

export default function Home() {
  const [currentView, setCurrentView] = useState('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [resetChat, setResetChat] = useState(false); // tambahan
  const { user, userId } = useAuth();

  if (!userId) return <div className="h-screen bg-[#1A1A1A] flex items-center justify-center text-white">Memuat...</div>;

  const handleNewChat = () => {
    setResetChat(true);
    setCurrentView('chat');
    // Setelah reset, beri waktu untuk merender ulang lalu matikan resetChat
    setTimeout(() => setResetChat(false), 100);
  };

  return (
    <div className="flex h-screen bg-[#1A1A1A] text-gray-200 font-sans overflow-hidden">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen}
        setCurrentView={setCurrentView}
        userId={userId}
        onNewChat={handleNewChat} // kirim fungsi ke sidebar
      />
      <main className="flex-1 flex flex-col h-full min-w-0 relative">
        <Header setIsSidebarOpen={setIsSidebarOpen} />
        <div className="flex-1 overflow-hidden relative">
          {currentView === 'chat' && <ChatView userId={userId} resetChat={resetChat} setResetChat={setResetChat} setCurrentView={setCurrentView} />}
          {currentView === 'tools' && <ToolsView setCurrentView={setCurrentView} />}
          {currentView.startsWith('editor:') && (
            <DocumentEditor 
              type={currentView.split(':')[1]} 
              setCurrentView={setCurrentView} 
              userId={userId}
            />
          )}
        </div>
      </main>
    </div>
  );
}
