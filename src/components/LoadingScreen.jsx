'use client';

import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex h-[100dvh] w-full items-center justify-center bg-white dark:bg-[#0F0F0F] transition-colors duration-200">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 dark:text-gray-400 font-medium animate-pulse text-sm">Menyiapkan EduSpaceAI...</p>
      </div>
    </div>
  );
}
