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
  Sparkles,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { GoogleGenAI } from '@google/genai';

const LiveCallDashboard = () => {
  const router = useRouter();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Menghubungkan ke Prof. Kore...");
  const [isMobile, setIsMobile] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [transcriptions, setTranscriptions] = useState([]);
  const [isTextInputOpen, setIsTextInputOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // SDK and Audio Refs
  const sessionRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const videoIntervalRef = useRef(null);
  const processorRef = useRef(null);
  const sourceRef = useRef(null);
  const audioQueue = useRef([]);
  const isMutedRef = useRef(false);
  const outputSampleRateRef = useRef(24000); // Gemini Live standard is 24kHz
  const nextStartTimeRef = useRef(0);

  // Audio Playback logic - Scheduled for gapless playback
  const clearAudioQueue = useCallback(() => {
    audioQueue.current = [];
    nextStartTimeRef.current = 0;
  }, []);

  const playAudioFromQueue = useCallback(async () => {
    if (audioQueue.current.length === 0 || !audioContextRef.current) return;

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    while (audioQueue.current.length > 0) {
      const chunk = audioQueue.current.shift();
      try {
        const float32Data = new Float32Array(chunk.length);
        for (let i = 0; i < chunk.length; i++) {
          float32Data[i] = chunk[i] / 32768.0;
        }

        const audioBuffer = audioContextRef.current.createBuffer(1, float32Data.length, outputSampleRateRef.current || 24000);
        audioBuffer.getChannelData(0).set(float32Data);

        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);

        const currentTime = audioContextRef.current.currentTime;
        if (nextStartTimeRef.current < currentTime) {
          nextStartTimeRef.current = currentTime + 0.05; // 50ms buffer for first chunk
        }

        source.start(nextStartTimeRef.current);
        nextStartTimeRef.current += audioBuffer.duration;
      } catch (e) {
        console.error("Audio playback error:", e);
      }
    }
  }, []);

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !sessionRef.current || !isVideoOn) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = 640;
    canvas.height = 480;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Data = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
    sessionRef.current.sendRealtimeInput({
      video: { data: base64Data, mimeType: 'image/jpeg' }
    });
  }, [isVideoOn]);

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
        },
        video: isVideoOn
          ? {
              width: { ideal: 640 },
              height: { ideal: 480 },
              frameRate: { ideal: 10 }
            }
          : false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }

      await audioContextRef.current.audioWorklet.addModule('/audio-processor.js');

      sourceRef.current = audioContextRef.current.createMediaStreamSource(streamRef.current);
      processorRef.current = new AudioWorkletNode(audioContextRef.current, 'audio-processor');

      processorRef.current.port.onmessage = (event) => {
        if (sessionRef.current && !isMutedRef.current) {
          const pcmData = new Int16Array(event.data);
          const uint8Array = new Uint8Array(pcmData.buffer);
          let binary = '';
          for (let i = 0; i < uint8Array.length; i++) {
            binary += String.fromCharCode(uint8Array[i]);
          }
          const base64Data = btoa(binary);

          sessionRef.current.sendRealtimeInput({
            audio: {
              data: base64Data,
              mimeType: "audio/pcm;rate=16000"
            }
          });
        }
      };

      sourceRef.current.connect(processorRef.current);
      return true;
    } catch (e) {
      console.error("Audio/Video init error:", e);
      setStatusMessage("Gagal mengakses mikrofon/kamera.");
      return false;
    }
  }, [isVideoOn]);

  const connectLiveAPI = useCallback(async () => {
    try {
      const response = await fetch('/api/live');
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Live token request failed (${response.status})`);
      }
      const { token } = await response.json();

      if (!token) {
        setStatusMessage("Sesi gagal dimulai. Coba lagi.");
        return;
      }

      const ai = new GoogleGenAI({ apiKey: token });
      const session = await ai.live.connect({
        model: 'gemini-3.1-flash-live-preview',
        config: {
          responseModalities: ['audio'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: 'Kore'
              }
            }
          },
          systemInstruction: {
            parts: [{ text: "Bertindaklah sebagai Dosen Pembimbing Akademik EduSpaceAI yang bijak, responsif, dan edukatif bernama Prof. Kore. Jawablah langsung menggunakan bahasa suara yang natural. Kamu bisa melihat video jika user menyalakan kamera." }]
          },
          transcriptionConfig: {
            languageCode: "id-ID"
          }
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            setStatusMessage("Terhubung dengan Prof. Kore");
          },
          onmessage: (response) => {
            const content = response.serverContent;
            if (!content) return;

            // Handle Transcriptions
            if (content.inputTranscription) {
              setTranscriptions(prev => [...prev.slice(-4), { role: 'user', text: content.inputTranscription.text }]);
            }
            if (content.outputTranscription) {
              setTranscriptions(prev => [...prev.slice(-4), { role: 'model', text: content.outputTranscription.text }]);
            }

            // Handle Interruption
            if (content.interrupted) {
              clearAudioQueue();
            }

            // Process ALL parts in model turn
            if (content.modelTurn?.parts) {
              for (const part of content.modelTurn.parts) {
                if (part.inlineData) {
                  const inlineData = part.inlineData;
                  const mimeType = inlineData.mimeType;

                  if (mimeType?.toLowerCase().startsWith('audio/')) {
                    const rateMatch = mimeType.match(/rate=(\d+)/);
                    if (rateMatch) {
                      outputSampleRateRef.current = parseInt(rateMatch[1], 10);
                    } else {
                      outputSampleRateRef.current = 24000; // Gemini Live standard
                    }

                    const binaryString = atob(inlineData.data);
                    const len = binaryString.length;
                    let bytes = new Uint8Array(len);
                    for (let i = 0; i < len; i++) {
                      bytes[i] = binaryString.charCodeAt(i);
                    }
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
            }
          },
          onerror: (error) => {
            console.error("Gemini Live API error:", error);
            setStatusMessage(`Live error: ${error.message || 'unknown error'}`);
          },
          onclose: () => {
            setIsConnected(false);
            setStatusMessage("Panggilan berakhir.");
          }
        }
      });

      sessionRef.current = session;

    } catch (e) {
      console.error("Connection error:", e);
      setStatusMessage("Gagal menyambungkan.");
    }
  }, [playAudioFromQueue, clearAudioQueue]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    initAudio().then(success => {
      if (success) {
        connectLiveAPI();
      }
    });

    return () => {
      if (sessionRef.current) sessionRef.current.close();
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioContextRef.current) audioContextRef.current.close();
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    };
  }, []); // Run once on mount

  useEffect(() => {
    if (isVideoOn && isConnected) {
      videoIntervalRef.current = setInterval(captureFrame, 200); // 5 FPS
    } else {
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    }
    return () => {
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    };
  }, [isVideoOn, isConnected, captureFrame]);

  const handleEndCall = useCallback(() => {
    if (sessionRef.current) sessionRef.current.close();
    router.push('/');
  }, [router]);

  const sendTextMessage = useCallback(() => {
    if (sessionRef.current && inputMessage.trim()) {
      sessionRef.current.sendRealtimeInput({ text: inputMessage.trim() });
      setTranscriptions(prev => [...prev.slice(-4), { role: 'user', text: inputMessage.trim() }]);
      setInputMessage("");
      setIsTextInputOpen(false);
    }
  }, [inputMessage]);

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
          onClick={() => router.push('/')}
          className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
        >
          <Keyboard className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Main Visualization Area */}
      <div className="relative flex-1 w-full flex flex-col items-center justify-center px-4">
        {/* Hidden video and canvas for frame capture */}
        <video ref={videoRef} className="hidden" autoPlay playsInline muted />
        <canvas ref={canvasRef} className="hidden" />

        {/* Ambient Glowing Aura */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[300px] h-[300px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow" />
        </div>

        {/* Video Preview / Avatar */}
        <div className="relative z-10 w-full max-w-lg aspect-video rounded-[32px] overflow-hidden bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl flex items-center justify-center">
          {isVideoOn ? (
            <video
              ref={(el) => {
                if (el) el.srcObject = streamRef.current;
              }}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full border-2 border-blue-500/30 flex items-center justify-center bg-blue-500/5">
                <div className="w-20 h-20 rounded-full border border-blue-400/50 flex items-center justify-center animate-pulse">
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                  </div>
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold tracking-tight">Prof. Kore</h2>
                <p className="text-sm text-blue-400/80 font-medium">Dosen Pembimbing AI</p>
              </div>
            </div>
          )}

          {/* Transcription Overlay (Subtitles) */}
          <div className="absolute bottom-6 left-0 right-0 px-6 z-20 pointer-events-none">
            <div className="flex flex-col items-center gap-2">
              <AnimatePresence mode="popLayout">
                {transcriptions.slice(-2).map((t, i) => (
                  <motion.div
                    key={`${i}-${t.text}`}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`px-4 py-2 rounded-2xl backdrop-blur-md border text-sm max-w-[80%] text-center ${
                      t.role === 'user'
                        ? 'bg-blue-500/20 border-blue-500/30 text-blue-100'
                        : 'bg-black/40 border-white/10 text-white'
                    }`}
                  >
                    {t.text}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {isConnected && (
            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">LIVE</span>
            </div>
          )}
        </div>

        {/* Status Text under video box */}
        <p className={`mt-6 text-gray-400 text-sm z-10 ${isConnecting ? 'animate-pulse' : ''}`}>{statusMessage}</p>
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
              className={isMobile ? "" : "animate-wave"}
              style={{ transform: 'translateZ(0)' }}
              d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
          <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-blue-900/40 to-transparent blur-3xl animate-pulse-slow" />
        </div>
      </div>

      {/* Controller Dock */}
      <div className="w-full max-w-xl px-6 pb-12 z-20 flex flex-col gap-4">
        {/* Text Input Expansion */}
        <AnimatePresence>
          {isTextInputOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 20, height: 0 }}
              className="w-full"
            >
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-2 rounded-[24px] flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
                  placeholder="Ketik pesan untuk Prof. Kore..."
                  className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-sm text-white placeholder:text-gray-500"
                />
                <button
                  onClick={sendTextMessage}
                  disabled={!inputMessage.trim()}
                  className="p-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 rounded-xl transition-all text-white"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-4 rounded-[32px] flex items-center justify-between shadow-2xl">
          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-4 rounded-2xl transition-all ${isVideoOn ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-400'}`}
          >
            {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>

          <button
            onClick={() => setIsTextInputOpen(!isTextInputOpen)}
            className={`p-4 rounded-2xl transition-all ${isTextInputOpen ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-400'}`}
          >
            <Keyboard className="w-6 h-6" />
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
