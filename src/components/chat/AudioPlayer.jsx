'use client';

import { useState, useEffect, useCallback } from 'react';

// Singleton state to manage global playback
let globalAudio = null;
let currentPlayingText = null;
const audioCache = new Map();
const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

export function useTTS(text) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleChange = () => {
      setIsPlaying(currentPlayingText === text && globalAudio && !globalAudio.paused);
    };

    listeners.add(handleChange);
    handleChange();

    return () => {
      listeners.delete(handleChange);
      // Cleanup audio if this specific message is unmounting while playing
      if (currentPlayingText === text && globalAudio) {
        globalAudio.pause();
        globalAudio = null;
        currentPlayingText = null;
        notifyListeners();
      }
    };
  }, [text]);

  const togglePlay = useCallback(async () => {
    if (!text) return;

    // If this text is already playing, pause it
    if (currentPlayingText === text && globalAudio) {
      if (!globalAudio.paused) {
        globalAudio.pause();
      } else {
        try {
          await globalAudio.play();
        } catch (e) {
          console.error("Playback failed", e);
        }
      }
      notifyListeners();
      return;
    }

    // Stop anything else
    if (globalAudio) {
      globalAudio.pause();
      globalAudio.currentTime = 0;
    }

    try {
      setIsLoading(true);
      setError(null);
      let audioUrl;

      if (audioCache.has(text)) {
        audioUrl = audioCache.get(text);
      } else {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          throw new Error('Gagal menghasilkan suara');
        }

        const { audio: base64Audio } = await response.json();
        audioUrl = `data:audio/mp3;base64,${base64Audio}`;
        audioCache.set(text, audioUrl);
      }

      const audio = new Audio(audioUrl);
      globalAudio = audio;
      currentPlayingText = text;

      audio.onplay = notifyListeners;
      audio.onpause = notifyListeners;
      audio.onended = () => {
        currentPlayingText = null;
        globalAudio = null;
        notifyListeners();
      };
      audio.onerror = () => {
        currentPlayingText = null;
        globalAudio = null;
        setError('Gagal memutar audio');
        notifyListeners();
      };

      await audio.play();
      setIsLoading(false);
    } catch (err) {
      console.error('TTS Error:', err);
      setError(err.message);
      setIsLoading(false);
      currentPlayingText = null;
      globalAudio = null;
      notifyListeners();
      throw err;
    }
  }, [text]);

  return { isPlaying, isLoading, togglePlay, error };
}
