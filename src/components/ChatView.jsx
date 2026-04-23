'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { ChevronDown, Plus, Send } from 'lucide-react';
import { sendMessage, getChatDetails } from '@/app/actions/chatActions';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ChatView({ userId, activeChatId }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isPending, startTransition] = useTransition();
  const chatEndRef = useRef(null);
  const router = useRouter();

  // 1. Load detail chat saat activeChatId berubah
  useEffect(() => {
    if (activeChatId && userId) {
      getChatDetails(activeChatId, userId).then(res => {
        setMessages(res);
      });
    } else if (!activeChatId) {
      setMessages([]);
    }
  }, [activeChatId, userId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);

  const handleSend = async (overrideInput) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isPending) return;

    const userMessage = {
      role: 'user',
      text: textToSend,
      _id: Date.now().toString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    startTransition(async () => {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('prompt', textToSend);
      if (activeChatId) formData.append('chatId', activeChatId);

      const result = await sendMessage(formData);

      if (result.success) {
        if (!activeChatId) {
          // Redirect ke chat yang baru dibuat
          router.push(`/chat/${result.chatId}`);
        }
        const aiMessage = {
          role: 'model',
          text: result.aiResponse,
          _id: (Date.now() + 1).toString()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#0F0F0F]">
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-10">
            <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/30">
              <span className="text-2xl text-indigo-500">🎓</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 text-center">EduSpaceAI</h1>
            <p className="text-gray-400 mb-10 text-center max-w-sm">
              Dosen pribadi bertenaga AI yang siap bantu skripsi, tugas, dan belajarmu.
            </p>
            <div className="w-full max-w-xl text-center">
              <InputBox input={input} setInput={setInput} handleSend={() => handleSend()} />
              <div className="flex flex-wrap justify-center gap-3 mt-8">
                <Link href="/tools">
                  <SuggestionChip label="Buka Tools" icon={<Plus size={12}/>} isLink={true} />
                </Link>
                <SuggestionChip label="Bimbingan Skripsi" onClick={() => handleSend("Saya butuh bantuan bimbingan skripsi, bisa mulai dari mana?")} />
                <SuggestionChip label="Buat Latihan Soal" onClick={() => handleSend("Buatkan 5 soal pilihan ganda tentang Pemrograman Dasar")} />
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto w-full py-8 px-4 space-y-8 flex-1">
            {messages.map((msg, idx) => (
              <div key={msg._id || idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`group relative flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {msg.role === 'model' && (
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-indigo-500/20">
                      AI
                    </div>
                  )}
                  <div className={`p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm transition-all ${
                    msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-[#1E1E1E] text-gray-200 border border-[#2A2A2A] rounded-tl-none'
                  }`}>
                    <div className="markdown-content prose prose-invert max-w-none prose-sm leading-relaxed">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isPending && (
              <div className="flex items-center gap-3 px-12 py-2">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest animate-pulse">Memproses...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>
      <div className="p-6 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F] to-transparent">
        <div className="max-w-3xl mx-auto">
          <InputBox input={input} setInput={setInput} handleSend={() => handleSend()} disabled={isPending} />
        </div>
      </div>
    </div>
  );
}

// --- KOMPONEN PENDUKUNG ---

function SuggestionChip({ label, icon, onClick, isLink }) {
  const Component = isLink ? 'div' : 'button';
  return (
    <Component
      onClick={onClick} 
      className="flex items-center gap-2 px-4 py-2 bg-[#1E1E1E] border border-[#2A2A2A] rounded-full text-[11px] text-gray-400 hover:text-white hover:border-indigo-500/50 transition-all cursor-pointer"
    >
      {icon} {label}
    </Component>
  );
}

function InputBox({ input, setInput, handleSend, disabled }) {
  return (
    <div className="relative bg-[#1E1E1E] rounded-2xl p-2 flex items-center border border-[#2A2A2A] focus-within:border-indigo-500/50 transition-all shadow-2xl">
      <div className="w-10 h-10 flex items-center justify-center text-gray-500">
        <Plus size={20} />
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
          }
        }}
        disabled={disabled}
        placeholder="Tanya apa saja ke Dosen AI-mu..."
        className="flex-1 bg-transparent border-none outline-none px-3 text-[14px] text-gray-200 placeholder-gray-500"
      />
      <button
        onClick={(e) => { e.preventDefault(); handleSend(); }}
        disabled={disabled || !input.trim()}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
          input.trim() && !disabled ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40' : 'bg-[#2A2A2A] text-gray-600'
        }`}
      >
        <Send size={18} />
      </button>
    </div>
  );
}
