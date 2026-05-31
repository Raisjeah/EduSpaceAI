'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Unhandled UI Exception:', error);
  }, [error]);

  return (
    <html lang="id">
      <body>
        <div className="flex h-[100dvh] w-full flex-col items-center justify-center bg-white p-6 dark:bg-[#0F0F0F]">
          <div className="max-w-md text-center">
            <h1 className="mb-4 text-4xl font-bold text-slate-900 dark:text-white">Oops!</h1>
            <p className="mb-8 text-slate-600 dark:text-gray-400">
              Terjadi kesalahan yang tidak terduga. Jangan khawatir, tim EduSpaceAI telah mencatat error ini.
            </p>
            <button
              onClick={() => reset()}
              className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-indigo-700"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
