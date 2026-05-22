"use client";

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

const LiveCallContext = createContext();

export function LiveCallProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState({ user: "", ai: "" });
  const [error, setError] = useState(null);

  // Refs for persistent state
  const wsRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const processorRef = useRef(null);
  const sourceRef = useRef(null);
  const isMutedRef = useRef(false);
  const audioQueue = useRef([]);
  const nextStartTimeRef = useRef(0);
  const outputSampleRateRef = useRef(24000);

  // --- AUDIO PLAYBACK (OUTPUT) ---
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

        const audioBuffer = audioContextRef.current.createBuffer(1, float32Data.length, outputSampleRateRef.current);
        audioBuffer.getChannelData(0).set(float32Data);

        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);

        const currentTime = audioContextRef.current.currentTime;
        if (nextStartTimeRef.current < currentTime) {
          nextStartTimeRef.current = currentTime + 0.05;
        }

        source.start(nextStartTimeRef.current);
        nextStartTimeRef.current += audioBuffer.duration;
      } catch (err) {
        console.error("[LiveCallContext] Playback error:", err);
      }
    }
  }, []);

  // --- INITIALIZE AUDIO (INPUT) ---
  const initAudio = async () => {
    try {
      console.log("[LiveCallContext] Initializing audio context (16kHz)...");
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000,
      });

      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      await audioContextRef.current.audioWorklet.addModule('/professor-audio.js');

      sourceRef.current = audioContextRef.current.createMediaStreamSource(streamRef.current);
      processorRef.current = new AudioWorkletNode(audioContextRef.current, 'professor-audio');

      processorRef.current.port.onmessage = (event) => {
        if (wsRef.current?.readyState === WebSocket.OPEN && !isMutedRef.current) {
          const pcmBuffer = event.data;
          const uint8Array = new Uint8Array(pcmBuffer);

          let binary = '';
          for (let i = 0; i < uint8Array.length; i++) {
            binary += String.fromCharCode(uint8Array[i]);
          }
          const base64Data = btoa(binary);

          wsRef.current.send(JSON.stringify({
            realtime_input: {
              audio: {
                data: base64Data,
                mime_type: "audio/pcm;rate=16000"
              }
            }
          }));
        }
      };

      sourceRef.current.connect(processorRef.current);
      return true;
    } catch (err) {
      console.error("[LiveCallContext] Audio init failed:", err);
      setError("Gagal mengakses mikrofon.");
      return false;
    }
  };

  // --- WEBSOCKET CONNECTION ---
  const connect = useCallback(async () => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);
    setError(null);

    try {
      const res = await fetch('/api/live');
      const { token } = await res.json();
      if (!token) throw new Error("API Key tidak tersedia.");

      const audioOk = await initAudio();
      if (!audioOk) throw new Error("Gagal inisialisasi audio.");

      const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${token}`;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[LiveCallContext] WebSocket connected.");
        const setupMessage = {
          setup: {
            model: "models/gemini-3.1-flash-live-preview",
            generation_config: {
              response_modalities: ["AUDIO"],
              speech_config: {
                voice_config: {
                  prebuilt_voice_config: {
                    voice_name: "Kore"
                  }
                }
              },
              thinking_level: "low",
              temperature: 1.0
            },
            system_instruction: {
              parts: [{ text: "Bertindaklah sebagai Dosen Pembimbing Akademik EduSpaceAI yang bijak, responsif, dan edukatif bernama Prof. Kore. Jawablah langsung menggunakan bahasa suara yang natural." }]
            }
          }
        };

        // Add transcription config as per 2026 requirements
        setupMessage.setup.generation_config.transcription_config = {
          language_code: "id-ID"
        };

        ws.send(JSON.stringify(setupMessage));
        setIsConnected(true);
        setIsConnecting(false);
      };

      ws.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);
          const serverContent = message.serverContent || message.server_content;

          if (serverContent?.modelTurn?.parts || serverContent?.model_turn?.parts) {
            const parts = serverContent?.modelTurn?.parts || serverContent?.model_turn?.parts;
            parts.forEach(part => {
              const inlineData = part.inlineData || part.inline_data;
              if (inlineData?.data && inlineData?.mimeType?.startsWith('audio/')) {
                const rateMatch = inlineData.mimeType.match(/rate=(\d+)/);
                if (rateMatch) outputSampleRateRef.current = parseInt(rateMatch[1], 10);

                const binary = atob(inlineData.data);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

                const buffer = bytes.length % 2 !== 0 ? new Uint8Array([...bytes, 0]).buffer : bytes.buffer;
                audioQueue.current.push(new Int16Array(buffer));
                playAudioFromQueue();
              }
            });
          }

          // Handle Transcripts from server (Enabled by transcription_config)
          if (serverContent?.inputTranscription?.text || serverContent?.input_transcription?.text) {
            setTranscript(prev => ({ ...prev, user: serverContent.inputTranscription?.text || serverContent.input_transcription?.text }));
          }
          if (serverContent?.outputTranscription?.text || serverContent?.output_transcription?.text) {
            setTranscript(prev => ({ ...prev, ai: serverContent.outputTranscription?.text || serverContent.output_transcription?.text }));
          }

          if (serverContent?.interrupted) {
            audioQueue.current = [];
            nextStartTimeRef.current = 0;
          }

          if (message.error) {
            setError(message.error.message);
          }
        } catch (e) {
          console.error("[LiveCallContext] Parsing error:", e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
      };

    } catch (err) {
      setError(err.message);
      setIsConnecting(false);
    }
  }, [isConnecting, isConnected, playAudioFromQueue]);

  const disconnect = useCallback(() => {
    if (wsRef.current) wsRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (audioContextRef.current) audioContextRef.current.close();

    setIsConnected(false);
    setIsConnecting(false);
    setTranscript({ user: "", ai: "" });
  }, []);

  const toggleMute = useCallback(() => {
    const newState = !isMuted;
    setIsMuted(newState);
    isMutedRef.current = newState;
  }, [isMuted]);

  return (
    <LiveCallContext.Provider value={{
      isConnected,
      isConnecting,
      isMuted,
      transcript,
      error,
      connect,
      disconnect,
      toggleMute
    }}>
      {children}
    </LiveCallContext.Provider>
  );
}

export function useLiveCall() {
  const context = useContext(LiveCallContext);
  if (!context) {
    throw new Error("useLiveCall must be used within a LiveCallProvider");
  }
  return context;
}
