import React from 'react';
import { BookOpen, Edit3, Image, Quote, Rocket, Search, Workflow } from 'lucide-react';

export const AGENT_DISPLAY_CONFIGS = {
  default: {
    name: 'EduSpaceAI',
    description: 'Dosen pribadi yang suportif untuk bimbingan belajar, latihan soal, dan penjelasan konsep.',
  },
  researcher: {
    name: 'Profesor Riset',
    description: 'Ahli metodologi penelitian, analisis data, struktur akademik, dan substansi argumen.',
  },
  editor: {
    name: 'Editor Akademik',
    description: 'Memperbaiki kejelasan, PUEBI, struktur kalimat, dan gaya penulisan akademik.',
  },
  'deep-search': {
    name: 'Deep Search Agent',
    description: 'Mencari informasi terbaru dan sumber web relevan untuk kebutuhan riset real-time.',
  },
  citation: {
    name: 'Citation Generator',
    description: 'Menyusun sitasi, referensi, daftar pustaka, dan validasi data sumber akademik.',
  },
  visualizer: {
    name: 'Visual Concept Mapper',
    description: 'Mengubah konsep, proses, atau struktur jawaban menjadi visualisasi workflow yang mudah dipahami.',
  },
  'image-generator': {
    name: 'Nano Banana (Image Gen)',
    description: 'Membantu menyusun prompt kreatif dan menghasilkan aset visual berbasis instruksi teks.',
  },
};


export const AGENT_LIST = [
  { id: 'default', name: 'EduSpaceAI', desc: 'Dosen Umum' },
  { id: 'researcher', name: 'Profesor Riset', desc: 'Metodologi & riset' },
  { id: 'deep-search', name: 'Deep Search', desc: 'Riset web real-time' },
  { id: 'editor', name: 'Editor Akademik', desc: 'Koreksi & PUEBI' },
  { id: 'citation', name: 'Citation Generator', desc: 'Sitasi & daftar pustaka' },
  { id: 'visualizer', name: 'Visual Mapper', desc: 'Diagram & workflow' },
];

export function getAgentIcon(agentId, size = 18, className = '') {
  const iconProps = { size, className };
  const icons = {
    default: React.createElement(Rocket, iconProps),
    researcher: React.createElement(BookOpen, iconProps),
    editor: React.createElement(Edit3, iconProps),
    'deep-search': React.createElement(Search, iconProps),
    citation: React.createElement(Quote, iconProps),
    visualizer: React.createElement(Workflow, iconProps),
    'image-generator': React.createElement(Image, iconProps),
  };

  return icons[agentId] || icons.default;
}

export function getAgentTheme(agentId) {
  const themes = {
    default: {
      bg: 'bg-indigo-500',
      softBg: 'bg-indigo-500/10',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-500/20',
    },
    researcher: {
      bg: 'bg-green-500',
      softBg: 'bg-green-500/10',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-500/20',
    },
    editor: {
      bg: 'bg-amber-500',
      softBg: 'bg-amber-500/10',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/20',
    },
    'deep-search': {
      bg: 'bg-blue-500',
      softBg: 'bg-blue-500/10',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500/20',
    },
    citation: {
      bg: 'bg-purple-500',
      softBg: 'bg-purple-500/10',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-500/20',
    },
    visualizer: {
      bg: 'bg-pink-500',
      softBg: 'bg-pink-500/10',
      text: 'text-pink-600 dark:text-pink-400',
      border: 'border-pink-500/20',
    },
    'image-generator': {
      bg: 'bg-orange-500',
      softBg: 'bg-orange-500/10',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-500/20',
    },
  };

  return themes[agentId] || themes.default;
}

export function getAgentName(agentId) {
  return AGENT_DISPLAY_CONFIGS[agentId]?.name || 'EduSpaceAI';
}

export function getAgentDescription(agentId) {
  return AGENT_DISPLAY_CONFIGS[agentId]?.description || AGENT_DISPLAY_CONFIGS.default.description;
}
