'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Code, BookOpen, Edit3, FlaskConical, Calculator, Lightbulb, FileText, Sparkles } from 'lucide-react';

const THINKING_CATEGORIES = {
  coding: {
    icon: Code,
    color: 'text-blue-500',
    dotColor: 'bg-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    messages: [
      'Menganalisis struktur kode...',
      'Mencari solusi terbaik...',
      'Menyusun logika program...',
      'Memeriksa sintaks dan pola...',
      'Mengoptimalkan algoritma...',
      'Menulis kode yang bersih...',
    ],
  },
  math: {
    icon: Calculator,
    color: 'text-emerald-500',
    dotColor: 'bg-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    messages: [
      'Menghitung formula...',
      'Menganalisis persamaan...',
      'Memecahkan langkah demi langkah...',
      'Memverifikasi hasil perhitungan...',
      'Menerapkan rumus yang tepat...',
      'Menyederhanakan ekspresi...',
    ],
  },
  research: {
    icon: FlaskConical,
    color: 'text-purple-500',
    dotColor: 'bg-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    messages: [
      'Mencari referensi akademik...',
      'Menganalisis metodologi penelitian...',
      'Menyusun kerangka teoritis...',
      'Mengevaluasi sumber data...',
      'Merumuskan hipotesis...',
      'Menelaah literatur terkait...',
    ],
  },
  skripsi: {
    icon: BookOpen,
    color: 'text-amber-500',
    dotColor: 'bg-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    messages: [
      'Menganalisis topik skripsi...',
      'Menyusun kerangka bab...',
      'Meninjau rumusan masalah...',
      'Mencari gap penelitian...',
      'Mereview struktur penulisan...',
      'Menyiapkan panduan bimbingan...',
    ],
  },
  writing: {
    icon: Edit3,
    color: 'text-rose-500',
    dotColor: 'bg-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
    messages: [
      'Menyusun struktur tulisan...',
      'Memilih diksi yang tepat...',
      'Menyempurnakan paragraf...',
      'Memeriksa tata bahasa...',
      'Mengatur alur penulisan...',
      'Mengedit dan memoles teks...',
    ],
  },
  search: {
    icon: Search,
    color: 'text-cyan-500',
    dotColor: 'bg-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    messages: [
      'Menjelajahi sumber informasi...',
      'Memfilter data relevan...',
      'Mengumpulkan fakta terbaru...',
      'Memverifikasi informasi...',
      'Menganalisis hasil pencarian...',
      'Menyusun ringkasan temuan...',
    ],
  },
  explain: {
    icon: Lightbulb,
    color: 'text-yellow-500',
    dotColor: 'bg-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    messages: [
      'Menyederhanakan konsep...',
      'Mencari analogi yang tepat...',
      'Menyusun penjelasan bertahap...',
      'Mempersiapkan contoh...',
      'Mengurai konsep kompleks...',
      'Membuat ilustrasi konsep...',
    ],
  },
  document: {
    icon: FileText,
    color: 'text-orange-500',
    dotColor: 'bg-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    messages: [
      'Menganalisis dokumen...',
      'Mengekstrak informasi penting...',
      'Memahami konteks file...',
      'Memproses data dokumen...',
      'Menelaah isi dokumen...',
      'Menyiapkan analisis...',
    ],
  },
  default: {
    icon: Sparkles,
    color: 'text-indigo-500',
    dotColor: 'bg-indigo-500',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20',
    messages: [
      'Memahami pertanyaanmu...',
      'Mencari jawaban terbaik...',
      'Menganalisis konteks...',
      'Menyusun respons yang tepat...',
      'Memproses informasi...',
      'Merangkai jawaban untukmu...',
    ],
  },
};

const KEYWORD_MAP = [
  { keywords: ['kode', 'code', 'coding', 'program', 'debug', 'error', 'bug', 'fungsi', 'function', 'variabel', 'variable', 'array', 'loop', 'class', 'api', 'sql', 'query', 'python', 'javascript', 'java', 'html', 'css', 'react', 'algoritma', 'compile', 'syntax', 'git', 'database'], category: 'coding' },
  { keywords: ['hitung', 'rumus', 'formula', 'matematika', 'math', 'kalkulus', 'statistik', 'integral', 'turunan', 'persamaan', 'aljabar', 'geometri', 'trigonometri', 'probabilitas', 'matriks', 'vektor', 'limit'], category: 'math' },
  { keywords: ['riset', 'research', 'jurnal', 'metodologi', 'metode penelitian', 'hipotesis', 'variabel penelitian', 'populasi', 'sampel', 'kualitatif', 'kuantitatif', 'eksperimen', 'observasi', 'studi kasus', 'analisis data', 'literature review'], category: 'research' },
  { keywords: ['skripsi', 'thesis', 'tesis', 'disertasi', 'bab 1', 'bab 2', 'bab 3', 'bab 4', 'bab 5', 'pendahuluan', 'pembahasan', 'kesimpulan', 'daftar pustaka', 'rumusan masalah', 'latar belakang', 'judul skripsi', 'proposal', 'sidang', 'bimbingan'], category: 'skripsi' },
  { keywords: ['tulis', 'write', 'esai', 'essay', 'artikel', 'paragraf', 'kalimat', 'ringkas', 'rangkum', 'summary', 'review', 'edit', 'revisi', 'perbaiki tulisan', 'tata bahasa', 'ejaan', 'puebi', 'parafrase', 'makalah', 'laporan'], category: 'writing' },
  { keywords: ['cari', 'search', 'temukan', 'berita', 'informasi terbaru', 'update', 'tren', 'apa itu', 'siapa', 'dimana', 'kapan', 'berapa', 'fakta'], category: 'search' },
  { keywords: ['jelaskan', 'explain', 'apa maksud', 'bagaimana cara', 'mengapa', 'kenapa', 'ajarkan', 'konsep', 'definisi', 'contoh', 'ilustrasi', 'belajar', 'pahami', 'mengerti', 'tutorial', 'pelajari'], category: 'explain' },
  { keywords: ['file', 'dokumen', 'document', 'pdf', 'upload', 'gambar', 'image', 'foto', 'screenshot', 'unggah'], category: 'document' },
];

function detectCategory(prompt) {
  if (!prompt) return 'default';
  const lower = prompt.toLowerCase();

  let bestMatch = 'default';
  let bestScore = 0;

  for (const { keywords, category } of KEYWORD_MAP) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = category;
    }
  }

  return bestMatch;
}

export default function ThinkingIndicator({ prompt, agentId }) {
  const [messageIndex, setMessageIndex] = useState(0);

  const category = useMemo(() => {
    if (agentId === 'deep-search') return 'search';
    if (agentId === 'researcher') return 'research';
    if (agentId === 'editor') return 'writing';
    return detectCategory(prompt);
  }, [prompt, agentId]);

  const config = THINKING_CATEGORIES[category];
  const Icon = config.icon;

  useEffect(() => {
    setMessageIndex(0);
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % config.messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [config]);

  return (
    <div className="flex flex-col gap-2 px-2 py-3">
      <div className="flex items-center gap-3">
        <motion.div
          className={`w-8 h-8 rounded-xl ${config.bgColor} border ${config.borderColor} flex items-center justify-center shrink-0`}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon size={16} className={config.color} />
        </motion.div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <motion.div
                className={`w-1.5 h-1.5 rounded-full ${config.dotColor}/60`}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className={`w-1.5 h-1.5 rounded-full ${config.dotColor}/60`}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className={`w-1.5 h-1.5 rounded-full ${config.dotColor}/60`}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              />
            </div>
            <AnimatePresence mode="wait">
              <motion.span
                key={`${category}-${messageIndex}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className={`text-[11px] font-semibold ${config.color}`}
              >
                {config.messages[messageIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className={`h-0.5 w-32 rounded-full overflow-hidden ${config.bgColor}`}>
            <motion.div
              className={`h-full rounded-full ${config.dotColor}`}
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: '50%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
