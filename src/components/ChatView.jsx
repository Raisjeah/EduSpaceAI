'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { ChevronDown, Plus, Send } from 'lucide-react';
import { sendMessage, getChatHistory } from '@/app/actions/chatActions';

export default function ChatView({ userId, setCurrentView }) {
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isPending, startTransition] = useTransition();
  const chatEndRef = useRef(null);
  const [optimisticMessages, setOptimisticMessages] = useState([]); // tambahan

  // Load history awal
  useEffect(() => {
    if (userId) {
      getChatHistory(userId).then(setChatHistory);
    }
  }, [userId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, optimisticMessages, isPending]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', text: input, _id: Date.now().toString() };
    // Optimistic update: tambahkan pesan user ke UI langsung
    setOptimisticMessages(prev => [...prev, userMessage]);
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('prompt', input);
    setInput('');

    startTransition(async () => {
      await sendMessage(formData);
      // Setelah AI merespon, refresh history dari DB
      const updatedHistory = await getChatHistory(userId);
      setChatHistory(updatedHistory);
      setOptimisticMessages([]); // hapus optimistic setelah data nyata masuk
    });
  };

  // Gabungkan history nyata + optimistic messages (pesan user yang belum masuk DB)
  const allMessages = [...chatHistory, ...optimisticMessages];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        {allMessages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-10">
            <h1 className="text-2xl font-bold text-white mb-1">Hai Pelajar</h1>
            <h2 className="text-lg font-light text-gray-400 mb-10">Ada bisa aku bantu?</h2>
            <div className="w-full max-w-xl">
              <InputBox input={input} setInput={setInput} handleSend={handleSend} />
              <div className="flex flex-wrap justify-center gap-4 mt-6 text-[10px] text-gray-400 font-medium">
                <button onClick={() => setCurrentView('tools')} className="hover:text-white transition-colors">• Buka Tools / Editor</button>
                <button onClick={() => { setInput("Buatkan kerangka skripsi tentang AI"); handleSend(); }} className="hover:text-white transition-colors">• Buat Skripsi</button>
                <button onClick={() => { setInput("Buatkan 5 soal pilihan ganda tentang Sejarah"); handleSend(); }} className="hover:text-white transition-colors">• Buat Soal</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto w-full py-6 px-4 space-y-6 flex-1">
            {allMessages.map((msg, idx) => (
              <div key={msg._id || idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[90%] p-4 text-[12px] leading-relaxed ${msg.role === 'user' ? 'bg-[#2A2A2A] text-white rounded-[1.5rem] rounded-tr-sm border border-[#333]' : 'text-gray-300 w-full'}`}>
                  {msg.role === 'model' && (
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-5 h-5 rounded-full bg-indigo-600/20 flex items-center justify-center"><span className="text-[9px] font-bold text-indigo-400">AI</span></div>
                      <ChevronDown size={14} className="text-gray-600 cursor-pointer hover:text-gray-400" />
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>
              </div>
            ))}
            {isPending && (
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="gemini-loader w-4 h-4 relative"></div>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">EduSpace AI Memproses...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>
      {allMessages.length > 0 && (
        <div className="p-4 bg-[#1A1A1A]">
          <div className="max-w-2xl mx-auto">
            <InputBox input={input} setInput={setInput} handleSend={handleSend} disabled={isPending} />
          </div>
        </div>
      )}
    </div>
  );
}

function InputBox({ input, setInput, handleSend, disabled }) {
  return (
    <div className="relative bg-[#262626] rounded-full p-1.5 flex items-center border border-[#333] focus-within:border-[#555]">
      <label className="w-10 h-10 flex items-center justify-center cursor-pointer text-gray-400 hover:text-white">
        <Plus size={18} />
      </label>
      <input 
        type="text" value={input} onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Tanya EduSpaceAI....."
        className="flex-1 bg-transparent border-none outline-none px-2 text-[12px] text-gray-200 placeholder-gray-500"
      />
      <button onClick={() => handleSend()} disabled={disabled} className={`w-10 h-10 flex items-center justify-center ${input.trim() ? 'text-white' : 'text-gray-500'}`}>
        <Send size={16} />
      </button>
    </div>
  );
}
