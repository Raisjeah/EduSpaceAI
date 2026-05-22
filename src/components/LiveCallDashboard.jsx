"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share,
  X,
  Keyboard,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import useGeminiLive from '@/hooks/useGeminiLive';

/**
 * LiveCallDashboard
 * Full-screen interface for Gemini Live sessions.
 * Powers the "Voice Call (Live)" feature.
 */
const LiveCallDashboard = () => {
  const router = useRouter();
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const {
    isConnected,
    isConnecting,
    isMuted,
    transcript,
    error,
    connect,
    disconnect,
    toggleMute
  } = useGeminiLive();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Auto-connect when entering this page if not already connected
    if (!isConnected && !isConnecting) {
       connect();
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
      // We don't disconnect on unmount anymore to keep the call alive if the user
      // just navigates away, but they can end it explicitly.
    };
  }, [connect, isConnected, isConnecting]);

  const handleEndCall = useCallback(() => {
    disconnect();
    router.push('/');
  }, [disconnect, router]);

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-between overflow-hidden">
      {/* Header */}
      <div className="w-full p-6 flex justify-between items-center z-10">
        <div className="w-10" />
        <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full">
          <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
          <span className="text-sm font-medium tracking-wider text-blue-100">LIVE</span>
        </div>
        <button
          onClick={() => router.push('/')}
          className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
        >
          <Keyboard className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Main Visualization Area */}
      <div className="relative flex-1 w-full flex flex-col items-center justify-center px-6">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`w-[300px] h-[300px] rounded-full blur-[120px] transition-all duration-1000 ${
            isConnected ? 'bg-blue-600/20 animate-pulse-slow' : 'bg-red-600/10'
          }`} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="z-10 text-center space-y-6 w-full max-w-lg"
        >
          <div className="relative flex justify-center">
             <div className={`w-24 h-24 rounded-full border-2 flex items-center justify-center transition-colors duration-500 ${
               isConnected ? 'border-blue-500/30 bg-blue-500/5' : 'border-neutral-700 bg-neutral-900'
             }`}>
                <div className={`w-20 h-20 rounded-full border flex items-center justify-center transition-all ${
                  isConnected ? 'border-blue-400/50 animate-pulse bg-blue-500/10' : 'border-neutral-600'
                }`}>
                   <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center overflow-hidden">
                      <img src="/logo.png" alt="Prof. Kore" className="w-10 h-10 object-contain invert" />
                   </div>
                </div>
             </div>
             {isConnected && (
               <motion.div
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 className="absolute bottom-1 right-[calc(50%-48px)] w-4 h-4 bg-green-500 rounded-full border-2 border-black shadow-[0_0_10px_rgba(34,197,94,0.5)]"
               />
             )}
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Prof. Kore</h2>
            <p className="text-sm text-blue-400/80 font-medium uppercase tracking-widest">Dosen Pembimbing AI</p>
          </div>

          <div className="h-24 flex flex-col items-center justify-center space-y-2">
            <AnimatePresence mode="wait">
              {error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-full border border-red-400/20"
                >
                  <AlertCircle size={16} />
                  <span className="text-sm font-medium">{error}</span>
                </motion.div>
              ) : isConnecting ? (
                <motion.p key="connecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-400 animate-pulse">Menghubungkan...</motion.p>
              ) : isConnected ? (
                <motion.div key="transcript" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                   {transcript.user && (
                     <p className="text-gray-400 text-sm line-clamp-1 italic">“{transcript.user}”</p>
                   )}
                   <p className="text-blue-100 text-lg font-medium leading-tight max-w-md mx-auto">
                     {transcript.ai || (isMuted ? "Mikrofon dimatikan" : "Siap mendengarkan...")}
                   </p>
                </motion.div>
              ) : (
                <motion.p key="disconnected" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-500">Panggilan Berakhir</motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none overflow-hidden">
        <div className={`absolute bottom-0 w-full h-full transition-opacity duration-1000 ${isConnected ? 'opacity-50' : 'opacity-0'}`}>
          <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-auto translate-y-20 scale-110">
            <defs>
              <linearGradient id="wave-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <path
              fill="url(#wave-grad)"
              className={isMobile ? "" : "animate-wave"}
              style={{ transform: 'translateZ(0)' }}
              d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
          <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-blue-900/40 to-transparent blur-3xl animate-pulse-slow" />
        </div>
      </div>

      <div className="w-full max-w-md px-6 pb-12 z-20">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-4 rounded-[32px] flex items-center justify-between shadow-2xl">
          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-4 rounded-2xl transition-all ${isVideoOn ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-400'}`}
          >
            {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>

          <button className="p-4 rounded-2xl bg-white/5 text-gray-400 hover:bg-white/10 transition-all">
            <Share className="w-6 h-6" />
          </button>

          <button
            onClick={toggleMute}
            disabled={!isConnected}
            className={`p-4 rounded-2xl transition-all ${!isMuted ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'} disabled:opacity-50`}
          >
            {!isMuted ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>

          <button
            onClick={handleEndCall}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/40 transition-all transform active:scale-95"
          >
            <X className="w-6 h-6 stroke-[3px]" />
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes wave {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(-20px) scaleY(1.05); }
        }
        .animate-wave {
          animation: wave 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LiveCallDashboard;
