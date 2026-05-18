'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderOpen, BrainCircuit, Send, MessageSquare, Sparkles, ChevronRight, FileText, Eraser, Square } from 'lucide-react';
import { saveDocument } from '@/app/actions/documentActions';
import { saveChat, sendMessage } from '@/app/actions/chatActions';
import { extractFileContent } from '@/app/actions/fileActions'; // server action
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AiMessage from './AiMessage';
import ThinkingIndicator from './ThinkingIndicator';
import { useChat } from '@/context/ChatContext';
import TextareaAutosize from 'react-textarea-autosize';

export default function DocumentEditor({ type, userId }) {
  const {
    chatData,
    setChatMessages,
    setChatStatus,
    runTypewriter,
    stopTypewriter
  } = useChat();

  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('Belum ada file diunggah');
  const [fileType, setFileType] = useState('text/plain');
  const [isLoading, setIsLoading] = useState(false);

  // Chat Integration State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const [activeChatId, setActiveChatId] = useState(null);

  const currentId = activeChatId || 'editor_chat';
  const currentChat = chatData[currentId] || { messages: [], isThinking: false, isTyping: false };
  const messages = currentChat.messages;
  const isThinking = currentChat.isThinking;
  const isTyping = currentChat.isTyping;

  // Selection state
  const [selection, setSelection] = useState({ text: '', show: false });
  const [lastEditorPrompt, setLastEditorPrompt] = useState('');

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);

  const [extractProgress, setExtractProgress] = useState(0);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setFileType(file.type || 'text/plain');
    setIsLoading(true);
    setExtractProgress(10);

    const formData = new FormData();
    formData.append('file', file);

    // Simulate progress for better UX feedback
    const progressInterval = setInterval(() => {
      setExtractProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    try {
      const result = await extractFileContent(formData);
      clearInterval(progressInterval);
      setExtractProgress(100);

      if (result.success) {
        setContent(result.content);
      } else {
        setContent(`Gagal ekstrak file: ${result.error}`);
      }
    } catch (err) {
      clearInterval(progressInterval);
      setContent(`Terjadi kesalahan saat mengunggah file.`);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setExtractProgress(0);
      }, 500);
    }
  };

  const handleAnalyze = async () => {
    if (!content || isPending) return;

    setIsChatOpen(true);
    const chatId = activeChatId || `chat_${Date.now()}`;
    if (!activeChatId) setActiveChatId(chatId);

    const initialPrompt = `Tolong analisis dan berikan saran perbaikan untuk isi dokumen ini (${fileName}):\n\n${content}`;
    setLastEditorPrompt('Tolong analisis dokumen ini.');

    // Optimistic UI for Chat
    const userMessage = {
      role: 'user',
      text: "Tolong analisis dokumen ini.",
      _id: Date.now().toString()
    };
    setChatMessages(chatId, prev => [...prev, userMessage]);
    setChatStatus(chatId, { isThinking: true });

    startTransition(async () => {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('prompt', initialPrompt);
      formData.append('chatId', chatId);

      const result = await sendMessage(formData);
      if (result.success) {
        runTypewriter(chatId, result.aiResponse);
      } else {
        setChatStatus(chatId, { isThinking: false });
      }
    });
  };

  const handleTextSelection = (e) => {
    const text = e.target.value.substring(e.target.selectionStart, e.target.selectionEnd);
    if (text.trim()) {
      setSelection({
        text,
        show: true
      });
    } else {
      setSelection(prev => ({ ...prev, show: false }));
    }
  };

  const handleFloatingAction = (actionType) => {
    const prompt = actionType === 'paraphrase'
      ? `Tolong parafrase teks berikut agar lebih ilmiah:\n\n"${selection.text}"`
      : `Tolong ringkas teks berikut:\n\n"${selection.text}"`;

    setChatInput(prompt);
    setIsChatOpen(true);
    setSelection(prev => ({ ...prev, show: false }));

    // Auto-send the action
    setTimeout(() => {
      handleSendChat(prompt);
    }, 100);
  };

  const handleSendChat = async (overrideInput) => {
    const textToSend = overrideInput || chatInput;
    if (!textToSend.trim() || isPending) return;

    setLastEditorPrompt(textToSend);
    setChatInput('');
    const chatId = activeChatId || `chat_${Date.now()}`;
    if (!activeChatId) setActiveChatId(chatId);

    const userMessage = {
      role: 'user',
      text: textToSend,
      _id: Date.now().toString()
    };
    setChatMessages(chatId, prev => [...prev, userMessage]);
    setChatStatus(chatId, { isThinking: true });

    startTransition(async () => {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('chatId', chatId);
      // Sertakan konten editor sebagai konteks digabung dengan prompt
      formData.append('prompt', `[Konteks Editor]:\n${content}\n\nPertanyaan: ${textToSend}`);

      const result = await sendMessage(formData);
      if (result.success) {
        runTypewriter(chatId, result.aiResponse);
      } else {
        setChatStatus(chatId, { isThinking: false });
      }
    });
  };

  return (
    <div className="h-full flex bg-white dark:bg-[#0F0F0F] overflow-hidden transition-colors duration-200">
      {/* Main Editor Area */}
      <div className={`flex-1 flex flex-col p-3 md:p-6 transition-all duration-300 ${isChatOpen ? 'md:mr-0' : ''}`}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
              <BrainCircuit size={18} className="text-indigo-400" /> <span className="truncate">Editor {type}</span>
            </h2>
            <p className="text-[10px] md:text-[11px] text-slate-500 dark:text-gray-500">Unggah file, edit, lalu klik Analisis.</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`p-2 rounded-lg border transition-all ${isChatOpen ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-100 dark:bg-[#1A1A1A] border-slate-200 dark:border-[#333] text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
              title="Toggle AI Chat"
            >
              <MessageSquare size={18} />
            </button>
            <Link href="/tools" className="text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={20}/></Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mb-4 bg-slate-100 dark:bg-[#1A1A1A] p-2 rounded-xl border border-slate-200 dark:border-[#333]">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <label className="flex items-center gap-2 bg-slate-200 dark:bg-[#242424] hover:bg-slate-300 dark:hover:bg-[#2A2A2A] px-3 md:px-4 py-2 rounded-lg cursor-pointer transition-colors text-[11px] font-bold text-slate-600 dark:text-gray-300 shrink-0">
              <FolderOpen size={14} /> Buka File
              <input type="file" className="hidden" onChange={handleFileUpload} accept=".txt,.csv,.md,.json,.pdf,.doc,.docx" />
            </label>
            <span className="text-[11px] text-slate-500 dark:text-gray-500 px-1 truncate font-medium">{fileName}</span>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={!content || isPending}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors text-[11px] font-bold disabled:opacity-50 shadow-lg shadow-indigo-900/20"
          >
            <Sparkles size={14} /> <span>{isChatOpen ? 'Analisis Ulang' : 'Analisis dengan AI'}</span>
          </button>
        </div>

        <div className="flex-1 relative flex flex-col min-h-0">
          {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 dark:bg-[#0F0F0F]/80 backdrop-blur-sm rounded-[1.5rem] border border-indigo-500/20">
              <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-[#333] flex flex-col items-center w-[280px]">
                <ThinkingIndicator prompt="Mengekstrak konten file" agentId="editor" />
                <p className="text-xs font-bold text-slate-600 dark:text-gray-300 mt-2">
                  {extractProgress < 100 ? 'Mengekstrak Konten File...' : 'Berhasil Diekstrak!'}
                </p>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-[#222] rounded-full mt-4 overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${extractProgress}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-indigo-600"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-mono">{extractProgress}% Selesai</p>
              </div>
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onMouseUp={handleTextSelection}
            onKeyUp={handleTextSelection}
            placeholder="Isi dokumen akan muncul di sini. Kamu bisa mengetik dan mengeditnya secara manual sebelum dianalisis oleh Profesor AI..."
            className="flex-1 bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] rounded-[1.5rem] p-4 md:p-8 text-sm md:text-base text-slate-700 dark:text-gray-300 font-mono leading-relaxed outline-none focus:border-indigo-500/40 resize-none custom-scrollbar shadow-inner transition-colors"
          />

          {/* Floating Toolbar */}
          {selection.show && (
            <div
              className="absolute z-50 bg-white dark:bg-[#222] border border-slate-200 dark:border-[#333] rounded-xl shadow-2xl p-1 flex gap-1 animate-in fade-in zoom-in duration-200"
              style={{ left: `50%`, top: `20px`, transform: `translateX(-50%)` }}
            >
              <button
                onClick={() => handleFloatingAction('paraphrase')}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-lg transition-all text-[11px] font-bold"
              >
                <Sparkles size={14} /> Parafrase
              </button>
              <div className="w-[1px] bg-slate-200 dark:bg-[#333] my-1"></div>
              <button
                onClick={() => handleFloatingAction('summarize')}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-lg transition-all text-[11px] font-bold"
              >
                <FileText size={14} /> Ringkas
              </button>
              <div className="w-[1px] bg-slate-200 dark:bg-[#333] my-1"></div>
              <button
                onClick={() => setSelection(prev => ({ ...prev, show: false }))}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-[#333] text-slate-400 dark:text-gray-500 rounded-lg transition-all"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Integrated Chat Panel */}
      <div className={`
        fixed inset-y-0 right-0 w-full md:w-[400px] bg-slate-50 dark:bg-[#151515] border-l border-slate-200 dark:border-[#222] z-40 transform transition-transform duration-300 ease-in-out flex flex-col h-[100dvh]
        ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-4 border-b border-slate-200 dark:border-[#222] flex items-center justify-between bg-white dark:bg-[#1A1A1A]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 dark:bg-indigo-600/20 flex items-center justify-center border border-indigo-500/30">
              <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-slate-900 dark:text-white">Dosen Pembimbing AI</h3>
              <p className="text-[10px] text-slate-500 dark:text-gray-500 uppercase tracking-widest">Workspace Assistant</p>
            </div>
          </div>
          <button onClick={() => setIsChatOpen(false)} className="text-slate-400 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white p-1">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-0">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="w-12 h-12 bg-slate-100 dark:bg-[#1A1A1A] rounded-2xl flex items-center justify-center mb-4 border border-slate-200 dark:border-[#222]">
                <FileText size={20} className="text-slate-400 dark:text-gray-600" />
              </div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Belum Ada Analisis</h4>
              <p className="text-[11px] text-slate-500 dark:text-gray-500">Klik "Analisis dengan AI" atau mulai chat untuk mendapatkan saran akademik.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg, idx) => (
                <AiMessage
                  key={msg._id || idx}
                  content={msg.text}
                  isUser={msg.role === 'user'}
                  isTyping={msg.role === 'model' && idx === messages.length - 1 && isTyping}
                  onApply={msg.role === 'model' ? (text) => setContent(text) : null}
                />
              ))}
            </div>
          )}
          {isThinking && (
            <ThinkingIndicator prompt={lastEditorPrompt} agentId="editor" />
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 bg-white dark:bg-[#1A1A1A] border-t border-slate-200 dark:border-[#222]">
          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {isTyping && (
                <div className="flex justify-center mb-1">
                   <motion.button
                     initial={{ opacity: 0, y: 5 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: 5 }}
                     onClick={() => stopTypewriter(currentId)}
                     className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-[#2A2A2A] rounded-full text-[10px] font-bold text-slate-600 dark:text-gray-300 hover:text-red-600 transition-all shadow-sm"
                   >
                     <Square size={10} fill="currentColor" /> Berhenti
                   </motion.button>
                </div>
              )}
            </AnimatePresence>
            <div className="relative">
              <TextareaAutosize
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendChat();
                  }
                }}
                minRows={1}
                maxRows={4}
                placeholder="Tanya perbaikan..."
                className="w-full bg-slate-50 dark:bg-[#0F0F0F] border border-slate-200 dark:border-[#333] rounded-xl py-3 pl-4 pr-12 text-sm text-slate-900 dark:text-gray-200 outline-none focus:border-indigo-500/50 transition-colors resize-none overflow-y-auto custom-scrollbar"
              />
              <button
                onClick={handleSendChat}
                disabled={!chatInput.trim() || isPending}
                className="absolute right-2 bottom-2 w-8 h-8 flex items-center justify-center bg-indigo-600 rounded-lg text-white disabled:opacity-50 shadow-lg shadow-indigo-900/20"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
