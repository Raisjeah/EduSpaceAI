"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  X,
  Keyboard,
  Sparkles,
  Send,
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
  const [remainingMinutes, setRemainingMinutes] = useState(null);
  const startTimeRef = useRef(null);

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
  const outputSampleRateRef = useRef(24000);
  const nextStartTimeRef = useRef(0);

  // SiriWave Refs
  const siriWaveContainerRef = useRef(null);
  const siriWaveRef = useRef(null);
  const userAnalyserRef = useRef(null);
  const modelAnalyserRef = useRef(null);
  const modelGainRef = useRef(null);

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
        if (modelGainRef.current) {
          source.connect(modelGainRef.current);
        } else {
          source.connect(audioContextRef.current.destination);
        }
        const currentTime = audioContextRef.current.currentTime;
        if (nextStartTimeRef.current < currentTime) {
          nextStartTimeRef.current = currentTime + 0.05;
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
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      userAnalyserRef.current = audioContextRef.current.createAnalyser();
      userAnalyserRef.current.fftSize = 256;
      modelAnalyserRef.current = audioContextRef.current.createAnalyser();
      modelAnalyserRef.current.fftSize = 256;
      modelGainRef.current = audioContextRef.current.createGain();
      modelGainRef.current.connect(modelAnalyserRef.current);
      modelAnalyserRef.current.connect(audioContextRef.current.destination);
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true },
        video: false
      });
      if (videoRef.current) videoRef.current.srcObject = streamRef.current;
      await audioContextRef.current.audioWorklet.addModule('/audio-processor.js');
      sourceRef.current = audioContextRef.current.createMediaStreamSource(streamRef.current);
      sourceRef.current.connect(userAnalyserRef.current);
      processorRef.current = new AudioWorkletNode(audioContextRef.current, 'audio-processor');
      processorRef.current.port.onmessage = (event) => {
        if (sessionRef.current && !isMutedRef.current) {
          const pcmData = new Int16Array(event.data);
          const uint8Array = new Uint8Array(pcmData.buffer);
          let binary = '';
          for (let i = 0; i < uint8Array.length; i++) binary += String.fromCharCode(uint8Array[i]);
          const base64Data = btoa(binary);
          sessionRef.current.sendRealtimeInput({ audio: { data: base64Data, mimeType: "audio/pcm;rate=16000" } });
        }
      };
      sourceRef.current.connect(processorRef.current);
      return true;
    } catch (e) {
      console.error("Audio/Video init error:", e);
      setStatusMessage("Gagal mengakses mikrofon/kamera.");
      return false;
    }
  }, []);

  const connectLiveAPI = useCallback(async () => {
    try {
      const response = await fetch('/api/live');
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Live token request failed (${response.status})`);
      }
      const { token, remainingMinutes: rMin } = await response.json();
      if (!token) { setStatusMessage("Sesi gagal dimulai. Coba lagi."); return; }
      
      setRemainingMinutes(rMin);
      startTimeRef.current = Date.now();

      const ai = new GoogleGenAI({ apiKey: token });
      const session = await ai.live.connect({
        model: 'gemini-3.1-flash-live-preview',
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } } },
          systemInstruction: {
            parts: [{ text: "Bertindaklah sebagai Dosen Pembimbing Akademik EduSpaceAI yang bijak, responsif, dan edukatif bernama Prof. Kore. Jawablah langsung menggunakan bahasa suara yang natural. Kamu bisa melihat video jika user menyalakan kamera." }]
          },
          transcriptionConfig: { languageCode: "id-ID" }
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
            if (content.inputTranscription) {
              setTranscriptions(prev => [...prev.slice(-4), { role: 'user', text: content.inputTranscription.text }]);
            }
            if (content.outputTranscription) {
              setTranscriptions(prev => [...prev.slice(-4), { role: 'model', text: content.outputTranscription.text }]);
            }
            if (content.interrupted) clearAudioQueue();
            if (content.modelTurn?.parts) {
              for (const part of content.modelTurn.parts) {
                if (part.inlineData) {
                  const { mimeType, data } = part.inlineData;
                  if (mimeType?.toLowerCase().startsWith('audio/')) {
                    const rateMatch = mimeType.match(/rate=(\d+)/);
                    outputSampleRateRef.current = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
                    const binaryString = atob(data);
                    let bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
                    if (bytes.length % 2 !== 0) {
                      const padded = new Uint8Array(bytes.length + 1);
                      padded.set(bytes);
                      bytes = padded;
                    }
                    audioQueue.current.push(new Int16Array(bytes.buffer));
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
            reportUsage();
          }
        }
      });
      sessionRef.current = session;
    } catch (e) {
      console.error("Connection error:", e);
      setStatusMessage("Gagal menyambungkan.");
    }
  }, [playAudioFromQueue, clearAudioQueue]);

  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  const reportUsage = useCallback(async () => {
    if (!startTimeRef.current) return;
    const minutesUsed = (Date.now() - startTimeRef.current) / (1000 * 60);
    if (minutesUsed > 0.05) { // Hanya laporkan jika lebih dari bbrp detik
      try {
        await fetch('/api/live', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ minutesUsed }),
        });
      } catch (e) {
        console.error("Failed to report usage:", e);
      }
    }
    startTimeRef.current = null;
  }, []);

  useEffect(() => {
    initAudio().then(success => { if (success) connectLiveAPI(); });
    return () => {
      reportUsage();
      if (sessionRef.current) sessionRef.current.close();
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioContextRef.current) audioContextRef.current.close();
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    };
  }, []);

  // Timer Countdown Effect
  useEffect(() => {
    if (!isConnected || remainingMinutes === null) return;
    const interval = setInterval(() => {
      const minutesUsed = (Date.now() - startTimeRef.current) / (1000 * 60);
      const timeLeft = remainingMinutes - minutesUsed;
      if (timeLeft <= 0) {
        clearInterval(interval);
        setStatusMessage("Waktu habis.");
        handleEndCall();
      }
    }, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [isConnected, remainingMinutes]);

  useEffect(() => {
    const toggleCamera = async () => {
      if (!streamRef.current) return;
      if (isVideoOn) {
        try {
          const videoStream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 10 } }
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
    if (isConnected) toggleCamera();
  }, [isVideoOn, isConnected]);

  // SiriWave — mounted inside its own contained div, NOT full-screen
  useEffect(() => {
    if (isConnected && siriWaveContainerRef.current && !siriWaveRef.current) {
      const containerWidth = siriWaveContainerRef.current.offsetWidth || 400;
      siriWaveRef.current = new SiriWave({
        container: siriWaveContainerRef.current,
        width: containerWidth,
        height: isMobile ? 120 : 160,
        style: "ios9",
        amplitude: 0,
        speed: 0.1,
        color: "#818cf8",
        autostart: true,
        pixelDepth: isMobile ? 2 : 1,
      });

      const updateAmplitude = () => {
        if (!siriWaveRef.current) return;
        let maxAmplitude = 0;
        if (userAnalyserRef.current && !isMuted) {
          const dataArray = new Uint8Array(userAnalyserRef.current.frequencyBinCount);
          userAnalyserRef.current.getByteFrequencyData(dataArray);
          maxAmplitude = Math.max(maxAmplitude, dataArray.reduce((a, b) => a + b, 0) / dataArray.length / 128);
        }
        if (modelAnalyserRef.current) {
          const dataArray = new Uint8Array(modelAnalyserRef.current.frequencyBinCount);
          modelAnalyserRef.current.getByteFrequencyData(dataArray);
          maxAmplitude = Math.max(maxAmplitude, (dataArray.reduce((a, b) => a + b, 0) / dataArray.length / 128) * 1.5);
        }
        const targetAmplitude = maxAmplitude > 0.05 ? maxAmplitude * 2.5 : 0;
        siriWaveRef.current.setAmplitude(targetAmplitude);
        siriWaveRef.current.setSpeed(targetAmplitude > 0 ? 0.2 : 0.1);
        requestAnimationFrame(updateAmplitude);
      };
      updateAmplitude();
    }
    return () => {
      if (siriWaveRef.current) { siriWaveRef.current.dispose(); siriWaveRef.current = null; }
    };
  }, [isConnected, isMuted, isMobile]);

  useEffect(() => {
    if (isVideoOn && isConnected) {
      videoIntervalRef.current = setInterval(captureFrame, 200);
    } else {
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    }
    return () => { if (videoIntervalRef.current) clearInterval(videoIntervalRef.current); };
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
    <div className="fixed inset-0 bg-[#050505] text-white flex flex-col overflow-hidden">

      {/* ── Hidden elements ── */}
      <video ref={videoRef} className="hidden" autoPlay playsInline muted />
      <canvas ref={canvasRef} className="hidden" />

      {/* ── Ambient background glow (purely decorative, behind everything) ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-blue-700/6 rounded-full blur-[100px]" />
      </div>

      {/* ══════════════════════════════════════
          HEADER
      ══════════════════════════════════════ */}
      <header className="relative z-20 shrink-0 flex items-center justify-between px-5 pt-5 pb-3">
        {/* Left — Avatar + Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/10 shrink-0">
            <img src="/logo.png" alt="Prof. Kore" className="w-6 h-6 object-contain invert" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2 leading-none mb-1">
              Prof. Kore
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            </h2>
            <p className="text-[10px] text-indigo-400/80 font-bold uppercase tracking-widest leading-none">
              Dosen Pembimbing AI
            </p>
          </div>
        </div>

        {/* Right — Badges + keyboard */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-xl">
            <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
            <span className="text-[10px] font-bold tracking-wider text-indigo-100">LIVE</span>
          </div>
          <button
            onClick={() => router.push('/')}
            title="Kembali ke Keyboard"
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
          >
            <Keyboard className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
          </button>
        </div>
      </header>

      {/* ── Status bar ── */}
      <div className="relative z-20 shrink-0 px-5 pb-2 flex justify-between items-center">
        <p className={`text-xs text-gray-500 ${isConnecting ? 'animate-pulse' : ''}`}>
          {statusMessage}
        </p>
        {remainingMinutes !== null && isConnected && (
          <p className="text-xs text-indigo-400 font-mono bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">
            Sisa: {Math.max(0, Math.ceil(remainingMinutes - (Date.now() - startTimeRef.current) / 60000))} mnt
          </p>
        )}
      </div>

      {/* ══════════════════════════════════════
          MAIN CONTENT AREA
          — Scrollable column: video → transcriptions
          — Does NOT overlap with wave or controls
      ══════════════════════════════════════ */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center gap-5 px-5 overflow-y-auto min-h-0">

        {/* Video Preview */}
        <AnimatePresence>
          {isVideoOn && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 12 }}
              transition={{ type: 'spring', damping: 22, stiffness: 220 }}
              className="w-full max-w-sm aspect-video rounded-3xl overflow-hidden bg-black/40 border border-white/10 shadow-2xl ring-1 ring-white/5 shrink-0"
            >
              <video
                ref={(el) => { if (el && isVideoOn) el.srcObject = streamRef.current; }}
                autoPlay playsInline muted
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transcription Captions */}
        <div className="w-full max-w-2xl flex flex-col items-center gap-3">
          <AnimatePresence mode="popLayout">
            {transcriptions.slice(-2).map((t, i) => (
              <motion.div
                key={`${i}-${t.text}`}
                initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
                transition={{ type: 'spring', damping: 22, stiffness: 180 }}
                className={`w-full px-5 py-3.5 rounded-2xl text-base md:text-lg font-medium text-center leading-snug backdrop-blur-xl border shadow-lg ${
                  t.role === 'user'
                    ? 'bg-indigo-500/10 border-indigo-500/25 text-indigo-100'
                    : 'bg-white/5 border-white/10 text-white'
                }`}
              >
                {t.text}
              </motion.div>
            ))}
          </AnimatePresence>

          {transcriptions.length === 0 && !isConnecting && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-500 text-base font-medium animate-pulse text-center"
            >
              Silakan bicara dengan Prof. Kore...
            </motion.p>
          )}
        </div>
      </main>

      {/* ══════════════════════════════════════
          SIRIWAVE — contained, sits above controls
          NOT full-screen. Fixed height zone.
      ══════════════════════════════════════ */}
      <div className="relative z-10 shrink-0 w-full h-[120px] md:h-[140px] flex items-center justify-center overflow-hidden pointer-events-none">
        {/* Fade edges so wave doesn't look clipped */}
        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#050505] to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#050505] to-transparent z-10" />
        <div
          ref={siriWaveContainerRef}
          className="w-full"
          style={{ filter: 'drop-shadow(0 0 12px rgba(99,102,241,0.55))' }}
        />
      </div>

      {/* ══════════════════════════════════════
          BOTTOM CONTROLS
          — Always visible, never overlaps content
      ══════════════════════════════════════ */}
      <footer className="relative z-20 shrink-0 w-full px-5 pb-8 pt-2 flex flex-col items-center gap-3">

        {/* Text Input */}
        <AnimatePresence>
          {isTextInputOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              className="w-full max-w-xl overflow-hidden"
            >
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-2 rounded-2xl flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendTextMessage()}
                  placeholder="Ketik pesan untuk Prof. Kore..."
                  autoFocus
                  className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-sm text-white placeholder:text-gray-500"
                />
                <button
                  onClick={sendTextMessage}
                  disabled={!inputMessage.trim()}
                  className="p-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:pointer-events-none rounded-xl transition-all text-white shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Control Dock */}
        <div className="w-full max-w-xl bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[28px] px-4 py-3 flex items-center justify-between gap-2 shadow-2xl">

          {/* Camera */}
          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            title={isVideoOn ? 'Matikan Kamera' : 'Nyalakan Kamera'}
            aria-label={isVideoOn ? 'Matikan Kamera' : 'Nyalakan Kamera'}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all ${
              isVideoOn ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            <span className="text-[9px] font-medium tracking-wide">{isVideoOn ? 'Cam On' : 'Cam Off'}</span>
          </button>

          {/* Keyboard / Text */}
          <button
            onClick={() => setIsTextInputOpen(!isTextInputOpen)}
            title="Ketik Pesan"
            aria-label={isTextInputOpen ? 'Tutup input teks' : 'Buka input teks'}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all ${
              isTextInputOpen ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <Keyboard className="w-5 h-5" />
            <span className="text-[9px] font-medium tracking-wide">Teks</span>
          </button>

          {/* Mic — primary CTA */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
            aria-label={isMuted ? 'Nyalakan Mikrofon' : 'Matikan Mikrofon'}
            className={`flex flex-col items-center gap-1 px-5 py-3 rounded-2xl transition-all shadow-lg ${
              !isMuted
                ? 'bg-indigo-500 text-white shadow-indigo-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/25'
            }`}
          >
            {!isMuted ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            <span className="text-[9px] font-medium tracking-wide">{isMuted ? 'Muted' : 'Mic On'}</span>
          </button>

          {/* End Call */}
          <button
            onClick={handleEndCall}
            title="Akhiri Panggilan"
            aria-label="Akhiri Panggilan"
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 transition-all active:scale-95"
          >
            <X className="w-5 h-5 stroke-[2.5px]" />
            <span className="text-[9px] font-medium tracking-wide">Akhiri</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default LiveCallDashboard;
