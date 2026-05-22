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
  const [transcript, setTranscript] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // WebSocket and Audio Refs
  const wsRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const processorRef = useRef(null);
  const sourceRef = useRef(null);
  const audioQueue = useRef([]);
  const isMutedRef = useRef(false);
  const outputSampleRateRef = useRef(24000); // Gemini Live standard is 24kHz
  const nextStartTimeRef = useRef(0);
  const isProcessingAudioRef = useRef(false);

  // Audio Playback logic - Scheduled for gapless playback
  const playAudioFromQueue = useCallback(async () => {
    if (audioQueue.current.length === 0 || !audioContextRef.current || isProcessingAudioRef.current) return;

    isProcessingAudioRef.current = true;

    try {
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      while (audioQueue.current.length > 0) {
        const chunk = audioQueue.current.shift();

        const float32Data = new Float32Array(chunk.length);
        for (let i = 0; i < chunk.length; i++) {
          float32Data[i] = chunk[i] / 32768.0;
        }

        const audioBuffer = audioContextRef.current.createBuffer(1, float32Data.length, outputSampleRateRef.current);
        audioBuffer.getChannelData(0).set(float32Data);

        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);

        const currentTime = audioContextRef.current.currentTime;
        if (nextStartTimeRef.current < currentTime) {
          nextStartTimeRef.current = currentTime + 0.01; // Tiny buffer for first chunk
        }

        source.start(nextStartTimeRef.current);
        nextStartTimeRef.current += audioBuffer.duration;
      }
    } catch (e) {
      console.error("Audio playback error:", e);
    } finally {
      isProcessingAudioRef.current = false;
    }
  }, []);

  const initAudio = useCallback(async () => {
    try {
      // Force 16kHz for input as required by Gemini Live
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000,
      });

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      await audioContextRef.current.audioWorklet.addModule('/audio-processor.js');

      sourceRef.current = audioContextRef.current.createMediaStreamSource(streamRef.current);
      processorRef.current = new AudioWorkletNode(audioContextRef.current, 'audio-processor');

      processorRef.current.port.onmessage = (event) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && !isMutedRef.current) {
          const pcmData = new Int16Array(event.data);
          const uint8Array = new Uint8Array(pcmData.buffer);

          // Efficient binary to base64 conversion
          let binary = '';
          const len = uint8Array.byteLength;
          for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(uint8Array[i]);
          }
          const base64Data = btoa(binary);

          // Use strict snake_case for the 2026 Live API protocol
          const message = {
            realtime_input: {
              media_chunks: [{
                data: base64Data,
                mime_type: "audio/pcm;rate=16000"
              }]
            }
          };
          wsRef.current.send(JSON.stringify(message));
        }
      };

      sourceRef.current.connect(processorRef.current);
      return true;
    } catch (e) {
      console.error("Audio init error:", e);
      setStatusMessage("Gagal mengakses mikrofon.");
      return false;
    }
  }, []);

  const connectWebSocket = useCallback(async () => {
    try {
      const response = await fetch('/api/live');
      if (!response.ok) {
        throw new Error(`Token request failed: ${response.status}`);
      }
      const { token } = await response.json();

      if (!token) {
        setStatusMessage("Sesi gagal dimulai. Coba lagi.");
        return;
      }

      // Using the official Bidi endpoint
      const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${token}`;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        // Setup message strictly following the multimodal-live-api examples
        const setupMessage = {
          setup: {
            model: "models/gemini-2.0-flash-exp",
            generation_config: {
              response_modalities: ["AUDIO", "TEXT"],
              speech_config: {
                voice_config: {
                  prebuilt_voice_config: {
                    voice_name: "Kore" // Options: Kore, Fenrir, Aoide, etc.
                  }
                }
              },
            },
            system_instruction: {
              parts: [{ text: "Anda adalah Prof. Kore, Dosen Pembimbing Akademik yang bijak di EduSpaceAI. Berikan bimbingan skripsi atau akademik dengan suara yang hangat, edukatif, dan langsung ke poin. Gunakan Bahasa Indonesia yang natural." }]
            }
          }
        };

        ws.send(JSON.stringify(setupMessage));
        setIsConnected(true);
        setIsConnecting(false);
        setStatusMessage("Terhubung dengan Prof. Kore");
      };

      ws.onmessage = async (event) => {
        try {
          let data = event.data;
          if (data instanceof Blob) {
            data = await data.text();
          }

          const message = JSON.parse(data);

          // The Gemini Live API sends audio inside 'server_content' or 'serverContent'
          const serverContent = message.server_content || message.serverContent;

          if (serverContent?.model_turn || serverContent?.modelTurn) {
            const turn = serverContent.model_turn || serverContent.modelTurn;
            const parts = turn.parts || [];

            for (const part of parts) {
              // Handle Text Parts for transcription
              if (part.text) {
                setTranscript(prev => (prev + " " + part.text).slice(-200)); // Keep last 200 chars
              }

              // Handle Audio Parts
              const inlineData = part.inline_data || part.inlineData;
              if (inlineData?.data && inlineData?.mime_type?.includes('audio')) {
                // Update sample rate if provided in mimeType
                const rateMatch = inlineData.mime_type.match(/rate=(\d+)/);
                if (rateMatch) {
                  outputSampleRateRef.current = parseInt(rateMatch[1], 10);
                }

                // Decode Base64 to Int16Array
                const binaryString = atob(inlineData.data);
                const len = binaryString.length;
                let bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }

                // IMPORTANT: Audio MUST be byte-aligned (even length) for Int16Array
                if (bytes.length % 2 !== 0) {
                  const padded = new Uint8Array(bytes.length + 1);
                  padded.set(bytes);
                  bytes = padded;
                }

                const pcmData = new Int16Array(bytes.buffer);
                audioQueue.current.push(pcmData);
                playAudioFromQueue();
              }
            }
          }

          // Handle interruption/cancellation (server sending setup_complete or other control)
          if (message.setup_complete || message.setupComplete) {
            console.log("Gemini Live Setup Complete");
          }

          if (message.error) {
            console.error("Gemini API Error:", message.error);
            setStatusMessage(`Error: ${message.error.message || "Unknown"}`);
          }

        } catch (e) {
          // If it's not JSON, we strictly IGNORE it to avoid playing static noise
          // console.warn("Received non-JSON frame or failed to parse:", e);
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
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    let active = true;
    initAudio().then(success => {
      if (success && active) {
        connectWebSocket();
      }
    });

    return () => {
      active = false;
      if (wsRef.current) wsRef.current.close();
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const handleEndCall = useCallback(() => {
    if (wsRef.current) wsRef.current.close();
    router.push('/');
  }, [router]);

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
      <div className="relative flex-1 w-full flex flex-col items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[300px] h-[300px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="z-10 text-center space-y-4"
        >
          <div className="relative flex justify-center">
             <div className="w-24 h-24 rounded-full border-2 border-blue-500/30 flex items-center justify-center bg-blue-500/5">
                <div className="w-20 h-20 rounded-full border border-blue-400/50 flex items-center justify-center animate-pulse">
                   <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <span className="text-2xl">🎓</span>
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

          {transcript && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-xs mx-auto mt-4 p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10"
            >
              <p className="text-sm text-gray-300 italic leading-relaxed line-clamp-3">
                "{transcript.trim()}"
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Wave Visualization */}
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
              className={isMobile ? "" : "animate-wave"}
              d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
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
