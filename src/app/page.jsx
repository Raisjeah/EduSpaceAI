'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ChatView from '@/components/ChatView';
import ToolsView from '@/components/ToolsView';
import DocumentEditor from '@/components/DocumentEditor';
import useAuth from '@/hooks/useAuth';

export default function Home() {
  const [currentView, setCurrentView] = useState('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [hasMounted, setHasMounted] = useState(false);

  // Ambil data auth
  const { userId, isLoading } = useAuth();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Mencegah Hydration Error
  if (!hasMounted) return null;

  return (
    // Gunakan 'relative h-screen overflow-hidden' agar layar tidak bisa di-scroll keluar jalur
    <div className="relative h-screen w-full bg-[#0F0F0F] text-gray-200 overflow-hidden flex">
      
      {/* 1. TIRAI LOADING (OVERLAY) 
          Menggunakan fixed dan z-[9999] agar PASTI di depan dan tidak mendorong konten lain */}
      {isLoading && !userId && (
        <div className="fixed inset-0 z-[9999] bg-[#0F0F0F] flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 text-sm font-medium animate-pulse">Menyiapkan Ruang Belajar...</p>
          </div>
        </div>
      )}

      {/* 2. PESAN JIKA USER BENAR-BENAR TIDAK ADA (Setelah Loading Selesai) */}
      {!isLoading && !userId && (
        <div className="fixed inset-0 z-[9998] bg-[#0F0F0F] flex items-center justify-center p-6 text-center">
          <div className="max-w-xs">
            <p className="text-gray-400 mb-4 text-sm">Sesi belajar tidak ditemukan. Silakan refresh browser atau coba lagi.</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-indigo-600 rounded-lg text-xs font-bold">Refresh Sekarang</button>
          </div>
        </div>
      )}

      {/* 3. STRUKTUR UTAMA (Sudah siap di belakang tirai loading) */}
      
      {/* Overlay Sidebar untuk Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        setCurrentView={setCurrentView}
        userId={userId}
        activeChatId={activeChatId}
        setActiveChatId={setActiveChatId}
      />

      <main className="flex-1 flex flex-col h-full min-w-0 relative">
        <Header setIsSidebarOpen={setIsSidebarOpen} />

        <div className="flex-1 overflow-hidden relative">
          {currentView === 'chat' && (
            <ChatView
              userId={userId}
              setCurrentView={setCurrentView}
              activeChatId={activeChatId}
              setActiveChatId={setActiveChatId}
            />
          )}

          {currentView === 'tools' && (
            <ToolsView
              setCurrentView={setCurrentView}
            />
          )}

          {currentView.startsWith('editor:') && (
            <DocumentEditor
              type={currentView.split(':')[1]}
              setCurrentView={setCurrentView}
              userId={userId}
              setActiveChatId={setActiveChatId}
            />
          )}
        </div>
      </main>
    </div>
  );
}
