'use client';
import { useState, useEffect } from 'react';

const AGENT_STATES = {
  'deep-search': [
    'Menganalisis pertanyaan...',
    'Membuat rencana riset...',
    'Mencari informasi di web...',
    'Membaca konten sumber...',
    'Memvalidasi & menganalisis data...',
    'Menyusun jawaban final...',
  ],
  researcher: [
    'Menganalisis konteks akademik...',
    'Meninjau metodologi penelitian...',
    'Menyusun argumen ilmiah...',
    'Memvalidasi struktur penelitian...',
  ],
  editor: [
    'Membaca teks...',
    'Mengoreksi tata bahasa (PUEBI)...',
    'Memeriksa struktur kalimat...',
    'Finalisasi editing...',
  ],
  visualizer: [
    'Memetakan konsep...',
    'Menyusun alur visual...',
    'Membuat struktur diagram Mermaid...',
  ],
  citation: [
    'Membaca data sumber...',
    'Memformat referensi...',
    'Memvalidasi kelengkapan sitasi...',
  ],
  default: [
    'Memahami pertanyaan...',
    'Mengambil konteks...',
    'Menganalisis informasi...',
    'Menyusun jawaban...',
    'Finalisasi...',
  ],
};

export default function useThinkingState(isThinking, agentId = 'default', customStates = null) {
  const states = customStates || AGENT_STATES[agentId] || AGENT_STATES.default;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isThinking) {
      setCurrentIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev < states.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [isThinking, states]);

  return {
    status: states[currentIndex],
    currentIndex,
    states,
  };
}
