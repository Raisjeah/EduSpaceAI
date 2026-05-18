'use client';

import { useState, useTransition } from 'react';
import { Quote, Send, Copy, Check, ArrowLeft, RefreshCcw } from 'lucide-react';
import { sendMessage } from '@/app/actions/chatActions';
import useAuth from '@/hooks/useAuth';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

export default function CitationPage() {
  const { userId } = useAuth();
  const [input, setInput] = useState('');
  const [citationStyle, setCitationStyle] = useState('APA 7th Edition');
  const [result, setResult] = useState('');
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!input.trim() || isPending) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append('prompt', `Buatkan sitasi dalam format ${citationStyle} untuk sumber berikut:\n\n${input}`);
      formData.append('skipSave', 'true'); // Don't clutter chat history with tool usage
      // We don't have a specific agent picker in sendMessage yet,
      // but we can pass it via a hidden mechanism or just let default handle it if it's smart enough.
      // Actually, let's just use the default for now, or I'll modify sendMessage if needed.
      // For now, I'll just send the prompt.

      const response = await sendMessage(formData);
      if (response.success) {
        setResult(response.aiResponse);
      }
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F0F0F] text-slate-900 dark:text-gray-200 p-6 md:p-12 transition-colors duration-200">
      <div className="max-w-3xl mx-auto">
        <Link href="/tools" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-500 mb-8 transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Kembali ke Tools</span>
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Quote size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Citation Generator</h1>
            <p className="text-sm text-slate-500 dark:text-gray-400">Buat sitasi akademik otomatis dengan berbagai format.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-[#1A1A1A] p-6 rounded-[2rem] border border-slate-200 dark:border-[#2A2A2A] shadow-sm">
            <label className="block text-sm font-bold mb-3 ml-1">Format Sitasi</label>
            <select
              value={citationStyle}
              onChange={(e) => setCitationStyle(e.target.value)}
              className="w-full bg-white dark:bg-[#0F0F0F] border border-slate-200 dark:border-[#333] rounded-xl px-4 py-3 outline-none focus:border-indigo-500/50 mb-6 transition-colors"
            >
              <option>APA 7th Edition</option>
              <option>MLA 9th Edition</option>
              <option>Chicago/Turabian</option>
              <option>IEEE</option>
              <option>Harvard</option>
              <option>Vancouver</option>
            </select>

            <label className="block text-sm font-bold mb-3 ml-1">Sumber (URL, DOI, atau Judul Buku/Jurnal)</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Masukkan informasi sumber di sini..."
              className="w-full bg-white dark:bg-[#0F0F0F] border border-slate-200 dark:border-[#333] rounded-2xl p-4 min-h-[150px] outline-none focus:border-indigo-500/50 transition-colors"
            />

            <button
              onClick={handleGenerate}
              disabled={!input.trim() || isPending}
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <RefreshCcw size={20} className="animate-spin" />
                  <span>Sedang Memproses...</span>
                </>
              ) : (
                <>
                  <Send size={20} />
                  <span>Generate Sitasi</span>
                </>
              )}
            </button>
          </div>

          {result && (
            <div className="bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
              <button
                onClick={handleCopy}
                className="absolute top-6 right-6 p-2 bg-white dark:bg-[#222] border border-slate-200 dark:border-[#333] rounded-lg text-slate-500 hover:text-indigo-500 transition-all"
                title="Salin Sitasi"
              >
                {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>

              <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-4">Hasil Sitasi</h3>
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
