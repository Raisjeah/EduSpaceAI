"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share,
  X,
  Keyboard,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const LiveCallDashboard = () => {
  const router = useRouter();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Menghubungkan ke Prof. Kore...");

  // WebSocket and Audio Refs
  const wsRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const processorRef = useRef(null);
  const sourceRef = useRef(null);
  const audioQueue = useRef([]);
  const isPlaying = useRef(false);

  // Audio Playback logic
  const playAudioFromQueue = useCallback(async () => {
    if (isPlaying.current || audioQueue.current.length === 0 || !audioContextRef.current) return;

    isPlaying.current = true;
    const chunk = audioQueue.current.shift();

    try {
      // Input is Int16Array from Base64 decode
      const float32Data = new Float32Array(chunk.length);
      for (let i = 0; i < chunk.length; i++) {
        float32Data[i] = chunk[i] / 32768.0;
      }

      const audioBuffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
      audioBuffer.getChannelData(0).set(float32Data);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => {
        isPlaying.current = false;
        playAudioFromQueue();
      };
      source.start();
    } catch (e) {
      console.error("Audio playback error:", e);
      isPlaying.current = false;
      playAudioFromQueue();
    }
  }, []);

  const initAudio = useCallback(async () => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      await audioContextRef.current.audioWorklet.addModule('/audio-processor.js');

      sourceRef.current = audioContextRef.current.createMediaStreamSource(streamRef.current);
      processorRef.current = new AudioWorkletNode(audioContextRef.current, 'audio-processor');

      processorRef.current.port.onmessage = (event) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && !isMuted) {
          const pcmData = new Int16Array(event.data);
          // Standard btoa only handles characters up to 255.
          // For binary data, we use a slightly more robust way.
          const binary = String.fromCharCode(...new Uint8Array(pcmData.buffer));
          const base64Data = btoa(binary);

          wsRef.current.send(JSON.stringify({
            realtimeInput: {
              mediaChunks: [{
                mimeType: "audio/pcm",
                data: base64Data
              }]
            }
          }));
        }
      };

      sourceRef.current.connect(processorRef.current);
      return true;
    } catch (e) {
      console.error("Audio init error:", e);
      setStatusMessage("Gagal mengakses mikrofon.");
      return false;
    }
  }, [isMuted]);

  const connectWebSocket = useCallback(async () => {
    try {
      const response = await fetch('/api/live');
      const { apiKey } = await response.json();

      if (!apiKey) {
        setStatusMessage("Sesi gagal dimulai. Coba lagi.");
        return;
      }

      const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        const setupMessage = {
          setup: {
            model: "models/gemini-2.5-flash-native-audio-preview-12-2025",
            generationConfig: {
              responseModalities: ["AUDIO"]
            },
            systemInstruction: {
              parts: [{ text: "Bertindaklah sebagai Dosen Pembimbing Akademik EduSpaceAI yang bijak, responsif, dan edukatif bernama Prof. Kore. Jawablah langsung menggunakan bahasa suara yang natural." }]
            }
          }
        };
        ws.send(JSON.stringify(setupMessage));
        setIsConnected(true);
        setIsConnecting(false);
        setStatusMessage("Terhubung dengan Prof. Kore");
      };

      ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);

        if (message.serverContent?.modelTurn?.parts) {
          const audioPart = message.serverContent.modelTurn.parts.find(p => p.inlineData?.mimeType === 'audio/pcm');
          if (audioPart) {
            const binaryString = atob(audioPart.inlineData.data);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const pcmData = new Int16Array(bytes.buffer);
            audioQueue.current.push(pcmData);
            playAudioFromQueue();
          }
        }
      };

      ws.onerror = (e) => {
        console.error("WebSocket Error:", e);
        setStatusMessage("Gangguan koneksi.");
      };

      ws.onclose = () => {
        setIsConnected(false);
        setStatusMessage("Panggilan berakhir.");
      };

    } catch (e) {
      console.error("Connection error:", e);
      setStatusMessage("Gagal menyambungkan.");
    }
  }, [playAudioFromQueue]);

  useEffect(() => {
    initAudio().then(success => {
      if (success) {
        connectWebSocket();
      }
    });

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []); // Run once on mount

  const handleEndCall = useCallback(() => {
    if (wsRef.current) wsRef.current.close();
    router.push('/chat');
  }, [router]);

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-between overflow-hidden">
      {/* Header */}
      <div className="w-full p-6 flex justify-between items-center z-10">
        <div className="w-10" /> {/* Spacer */}
        <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full">
          <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
          <span className="text-sm font-medium tracking-wider text-blue-100">LIVE</span>
        </div>
        <button
          onClick={() => router.push('/chat')}
          className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
        >
          <Keyboard className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Main Visualization Area */}
      <div className="relative flex-1 w-full flex flex-col items-center justify-center">
        {/* Ambient Glowing Aura */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[300px] h-[300px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow" />
        </div>

        {/* Status Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="z-10 text-center space-y-4"
        >
          <div className="relative flex justify-center">
             <div className="w-24 h-24 rounded-full border-2 border-blue-500/30 flex items-center justify-center bg-blue-500/5">
                <div className="w-20 h-20 rounded-full border border-blue-400/50 flex items-center justify-center animate-pulse">
                   <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <span className="text-2xl">👨‍🏫</span>
                   </div>
                </div>
             </div>
             {isConnected && (
               <div className="absolute bottom-1 right-[calc(50%-48px)] w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
             )}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">Prof. Kore</h2>
            <p className="text-sm text-blue-400/80 font-medium">Dosen Pembimbing AI</p>
          </div>
          <p className={`text-gray-400 text-sm ${isConnecting ? 'animate-pulse' : ''}`}>{statusMessage}</p>
        </motion.div>
      </div>

      {/* Bottom Wave - The "Ambient Blue Glowing Wave" */}
      <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 w-full h-full opacity-50">
          <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-auto translate-y-20 scale-110">
            <defs>
              <linearGradient id="wave-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <path
              fill="url(#wave-grad)"
              className="animate-wave"
              d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
          <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-blue-900/40 to-transparent blur-3xl animate-pulse-slow" />
        </div>
      </div>

      {/* Controller Dock */}
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
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-2xl transition-all ${!isMuted ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'}`}
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
