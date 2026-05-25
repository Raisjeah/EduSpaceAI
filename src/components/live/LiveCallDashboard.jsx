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
  Send,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { GoogleGenAI } from '@google/genai';
import SiriWave from 'siriwave';

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

  // SiriWave Refs
  const siriWaveContainerRef = useRef(null);
  const siriWaveRef = useRef(null);
  const userAnalyserRef = useRef(null);
  const modelAnalyserRef = useRef(null);
  const modelGainRef = useRef(null);

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

        // Connect to model analyser for wave animation
        if (modelGainRef.current) {
          source.connect(modelGainRef.current);
        } else {
          source.connect(audioContextRef.current.destination);
        }

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

      // Initialize Analysers
      userAnalyserRef.current = audioContextRef.current.createAnalyser();
      userAnalyserRef.current.fftSize = 256;

      modelAnalyserRef.current = audioContextRef.current.createAnalyser();
      modelAnalyserRef.current.fftSize = 256;

      modelGainRef.current = audioContextRef.current.createGain();
      modelGainRef.current.connect(modelAnalyserRef.current);
      modelAnalyserRef.current.connect(audioContextRef.current.destination);

      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
        video: false // Initially false, we toggle it later
      });

      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }

      await audioContextRef.current.audioWorklet.addModule('/audio-processor.js');

      sourceRef.current = audioContextRef.current.createMediaStreamSource(streamRef.current);
      sourceRef.current.connect(userAnalyserRef.current);

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
          responseModalities: ['AUDIO'],
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

  // Camera Toggle Effect
  useEffect(() => {
    const toggleCamera = async () => {
      if (!streamRef.current) return;

      if (isVideoOn) {
        try {
          const videoStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              frameRate: { ideal: 10 }
            }
          });
          const videoTrack = videoStream.getVideoTracks()[0];
          streamRef.current.addTrack(videoTrack);
          if (videoRef.current) videoRef.current.srcObject = streamRef.current;
        } catch (err) {
          console.error("Error opening camera:", err);
          setIsVideoOn(false);
        }
      } else {
        streamRef.current.getVideoTracks().forEach(track => {
          track.stop();
          streamRef.current.removeTrack(track);
        });
      }
    };

    if (isConnected) {
      toggleCamera();
    }
  }, [isVideoOn, isConnected]);

  // SiriWave Animation Effect
  useEffect(() => {
    if (isConnected && siriWaveContainerRef.current && !siriWaveRef.current) {
      siriWaveRef.current = new SiriWave({
        container: siriWaveContainerRef.current,
        width: window.innerWidth,
        height: isMobile ? 300 : 500,
        style: "ios9",
        amplitude: 0,
        speed: 0.1,
        color: "#818cf8", // Lighter Indigo for Neon effect
        autostart: true,
        pixelDepth: isMobile ? 2 : 1,
      });

      const updateAmplitude = () => {
        if (!siriWaveRef.current) return;

        let maxAmplitude = 0;

        if (userAnalyserRef.current && !isMuted) {
          const dataArray = new Uint8Array(userAnalyserRef.current.frequencyBinCount);
          userAnalyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          maxAmplitude = Math.max(maxAmplitude, average / 128);
        }

        if (modelAnalyserRef.current) {
          const dataArray = new Uint8Array(modelAnalyserRef.current.frequencyBinCount);
          modelAnalyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          maxAmplitude = Math.max(maxAmplitude, (average / 128) * 1.5);
        }

        // Smooth transition and set amplitude
        const targetAmplitude = maxAmplitude > 0.05 ? maxAmplitude * 2.5 : 0;
        siriWaveRef.current.setAmplitude(targetAmplitude);
        siriWaveRef.current.setSpeed(targetAmplitude > 0 ? 0.2 : 0.1);

        requestAnimationFrame(updateAmplitude);
      };

      updateAmplitude();
    }

    return () => {
      if (siriWaveRef.current) {
        siriWaveRef.current.dispose();
        siriWaveRef.current = null;
      }
    };
  }, [isConnected, isMuted, isMobile]);

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
    <div className="fixed inset-0 bg-[#050505] text-white flex flex-col items-center overflow-hidden">
      {/* Header - Moved Profile here as per user request */}
      <div className="w-full p-6 flex justify-between items-start z-30">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center overflow-hidden shadow-lg shadow-indigo-500/10">
              <img src="/logo.png" alt="Prof. Kore" className="w-6 h-6 object-contain invert dark:invert-0" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Prof. Kore
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              </h2>
              <p className="text-[10px] text-indigo-400/80 font-bold uppercase tracking-widest">Dosen Pembimbing AI</p>
            </div>
          </div>
          <p className={`mt-2 text-gray-500 text-xs ${isConnecting ? 'animate-pulse' : ''}`}>{statusMessage}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="text-[10px] font-bold tracking-wider text-indigo-100">LIVE SESSION</span>
          </div>
          <button
            onClick={() => router.push('/')}
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
            title="Switch to Keyboard"
          >
            <Keyboard className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
          </button>
        </div>
      </div>

      {/* Main Visualization Area */}
      <div className="relative flex-1 w-full flex flex-col items-center justify-center px-4 pb-32">
        {/* Hidden video and canvas for frame capture */}
        <video ref={videoRef} className="hidden" autoPlay playsInline muted />
        <canvas ref={canvasRef} className="hidden" />

        {/* Ambient Glowing Aura */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[100px] animate-pulse" />
        </div>

        {/* Central Wave Container */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
           <div ref={siriWaveContainerRef} className="w-full opacity-80 mix-blend-screen" />
        </div>

        {/* Video Preview / Transcription Focus */}
        <div className="relative z-20 w-full max-w-4xl flex flex-col items-center gap-8">

          {/* Active Speaker / Video Box */}
          <AnimatePresence>
            {isVideoOn && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-lg aspect-video rounded-[32px] overflow-hidden bg-black/40 border border-white/10 backdrop-blur-2xl shadow-2xl ring-1 ring-white/5"
              >
                <video
                  ref={(el) => {
                    if (el && isVideoOn) el.srcObject = streamRef.current;
                  }}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Large Transcriptions (Captions) */}
          <div className="w-full flex flex-col items-center gap-4 min-h-[120px]">
            <AnimatePresence mode="popLayout">
              {transcriptions.slice(-2).map((t, i) => (
                <motion.div
                  key={`${i}-${t.text}`}
                  initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                  transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                  className={`px-8 py-4 rounded-[28px] backdrop-blur-xl border text-lg md:text-2xl font-medium max-w-[90%] text-center shadow-2xl ${
                    t.role === 'user'
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-100'
                      : 'bg-white/5 border-white/10 text-white'
                  }`}
                >
                  {t.text}
                </motion.div>
              ))}
            </AnimatePresence>

            {transcriptions.length === 0 && !isConnecting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-500 text-lg font-medium animate-pulse"
              >
                Silahkan bicara dengan Prof. Kore...
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* SiriWave Glowing Overlay at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-0">
        <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-indigo-900/20 to-transparent" />
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
        canvas {
          filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.5));
        }
      `}</style>
    </div>
  );
};

export default LiveCallDashboard;
