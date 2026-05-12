'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useChat } from '@/context/ChatContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, Send, X, FileText, Image as ImageIcon, Briefcase, Search, BookOpen, Edit3, Rocket, Camera, File } from 'lucide-react';
import { sendMessage, getChatDetails } from '@/app/actions/chatActions';
import { getProjectDetails } from '@/app/actions/projectActions';
import AiMessage from './AiMessage';
import ThinkingIndicator from './ThinkingIndicator';
import ModelSelector from './ModelSelector';
import useAuth from '@/hooks/useAuth';
import UpgradeModal from './UpgradeModal';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ChatView({ userId, activeChatId, projectId }) {
  const { user } = useAuth();
  const {
    chatData,
    setChatMessages,
    setChatStatus,
    runTypewriter,
    migrateNewChatToId,
    clearChat
  } = useChat();

  const currentChat = chatData[activeChatId || 'new'] || { messages: [], isThinking: false, isTyping: false };
  const messages = currentChat.messages;
  const isThinking = currentChat.isThinking;
  const isTyping = currentChat.isTyping;

  const setMessages = (msgs) => setChatMessages(activeChatId, msgs);
  const setIsThinking = (val) => setChatStatus(activeChatId, { isThinking: val });
  const setIsTyping = (val) => setChatStatus(activeChatId, { isTyping: val });

  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [project, setProject] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [thoughtTraces, setThoughtTraces] = useState([]);
  const [upgradeModal, setUpgradeModal] = useState({ isOpen: false, feature: '' });
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const chatEndRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAnalyzing = searchParams.get('analyze') === 'true';

  // Load project details if projectId exists
  useEffect(() => {
    if (projectId) {
      getProjectDetails(projectId).then(res => setProject(res));
    } else {
      setProject(null);
    }
  }, [projectId]);

  // Load last selected model from localStorage
  useEffect(() => {
    const savedModel = localStorage.getItem('eduspace_preferred_model');
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  }, []);

  const handleModelChange = (modelId) => {
    setSelectedModel(modelId);
    localStorage.setItem('eduspace_preferred_model', modelId);
  };

  // Simulated Thought Traces Effect
  useEffect(() => {
    if (isPending && project?.agentId === 'deep-search') {
      const traces = [
        '🔍 Mencari referensi jurnal...',
        '📄 Menganalisis 5 sumber berita...',
        '✍️ Menyusun rangkuman...'
      ];
      let i = 0;
      setThoughtTraces([traces[0]]);
      const interval = setInterval(() => {
        i++;
        if (i < traces.length) {
          setThoughtTraces(prev => [...prev, traces[i]]);
        } else {
          clearInterval(interval);
        }
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setThoughtTraces([]);
    }
  }, [isPending, project]);

  // 1. Load detail chat saat activeChatId berubah
  useEffect(() => {
    if (activeChatId && userId) {
      // Hanya tampilkan loading jika messages memang kosong
      // (Bisa jadi sudah ada pesan optimis, jadi jangan flash loading)
      if (messages.length === 0) {
        setIsLoadingChat(true);
      }

      getChatDetails(activeChatId, userId).then(res => {
        // Jangan menimpa jika sedang ada proses pengetikan AI (mencegah jumpy UI)
        setChatMessages(activeChatId, prev => {
          if (prev.length > 0 && (isTyping || isThinking)) return prev;
          return res;
        });
        setIsLoadingChat(false);

        // Jika dari mode analisa, trigger AI untuk pesan terakhir
        if (isAnalyzing && res.length > 0 && res[res.length - 1].role === 'user') {
          handleSend(res[res.length - 1].text, true);
        }
      });
    } else if (!activeChatId) {
      // Jika di halaman home (/), pastikan state 'new' bersih
      clearChat('new');
      setIsLoadingChat(false);
    }
  }, [activeChatId, userId, isAnalyzing]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);


  const handleSend = async (overrideInput, isAutoTrigger = false) => {
    const textToSend = overrideInput || input;
    if ((!textToSend.trim() && !selectedFile) || (isPending && !isAutoTrigger)) return;

    if (!isAutoTrigger) {
      const userMessage = {
        role: 'user',
        text: textToSend || (selectedFile ? `[File: ${selectedFile.name}]` : ''),
        _id: Date.now().toString()
      };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
    }

    const fileToUpload = selectedFile;
    setSelectedFile(null);
    setIsThinking(true);

    startTransition(async () => {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('prompt', textToSend);
      formData.append('modelId', selectedModel);
      if (activeChatId) formData.append('chatId', activeChatId);
      if (projectId) formData.append('projectId', projectId);
      if (isAutoTrigger) formData.append('skipSave', 'true');
      if (fileToUpload) formData.append('file', fileToUpload);

      const result = await sendMessage(formData);

      if (result.success) {
        if (!activeChatId) {
          migrateNewChatToId(result.chatId);
          const targetUrl = projectId
            ? `/chat/${result.chatId}?projectId=${projectId}`
            : `/chat/${result.chatId}`;

          router.push(targetUrl, { scroll: false });
        }

        // --- TYPEWRITER EFFECT ---
        runTypewriter(!activeChatId ? result.chatId : activeChatId, result.aiResponse);
      } else {
        setIsThinking(false);
        if (result.error?.includes('Batas')) {
          setUpgradeModal({ isOpen: true, feature: 'Pesan Harian' });
        } else if (result.error?.includes('Premium')) {
          setUpgradeModal({ isOpen: true, feature: 'Upload File' });
        }
      }
    });
  };

  const getAgentIcon = (agentId) => {
    switch (agentId) {
      case 'deep-search': return <Search size={16} className="text-blue-400" />;
      case 'researcher': return <BookOpen size={16} className="text-green-400" />;
      case 'editor': return <Edit3 size={16} className="text-amber-400" />;
      default: return <Rocket size={16} className="text-indigo-400" />;
    }
  };

  const getAgentName = (agentId) => {
    switch (agentId) {
      case 'deep-search': return 'Deep Search Agent';
      case 'researcher': return 'Profesor Riset';
      case 'editor': return 'Editor Akademik';
      default: return 'EduSpaceAI';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0F0F0F] overflow-hidden transition-colors duration-200">
      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={() => setUpgradeModal({ ...upgradeModal, isOpen: false })}
        featureName={upgradeModal.feature}
      />
      {/* Project Header (If in project) */}
      {project && (
        <div className="px-6 py-3 border-b border-slate-200 dark:border-[#1E1E1E] bg-white dark:bg-[#0F0F0F] flex items-center justify-between z-10 flex-none transition-colors duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] flex items-center justify-center">
              {getAgentIcon(project.agentId)}
            </div>
            <div>
              <h2 className="text-[12px] font-bold text-slate-900 dark:text-white leading-tight">{project.name}</h2>
              <p className="text-[10px] text-slate-500 dark:text-gray-500 uppercase tracking-widest">{getAgentName(project.agentId)}</p>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-gray-500 bg-slate-100 dark:bg-[#1A1A1A] px-2 py-1 rounded border border-slate-200 dark:border-[#333]">Active Agent Workspace</div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {isLoadingChat ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-slate-500 dark:text-gray-500 text-sm animate-pulse">Memuat percakapan...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/30">
              <span className="text-2xl text-indigo-500">
                {project ? '📂' : '🎓'}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 text-center">
              {project ? project.name : 'EduSpaceAI'}
            </h1>
            <p className="text-slate-600 dark:text-gray-400 mb-6 text-center max-w-sm">
              {project
                ? `Sedang menggunakan agen ${getAgentName(project.agentId)} untuk membantumu di project ini.`
                : 'Dosen pribadi bertenaga AI yang siap bantu skripsi, tugas, dan belajarmu.'}
            </p>
            <div className="w-full max-w-xl text-center">
              <div className="flex flex-wrap justify-center gap-3">
                {project?.agentId === 'deep-search' ? (
                  <SuggestionChip label="Cari berita terbaru AI" onClick={() => handleSend("Apa berita terbaru tentang perkembangan AI minggu ini?")} />
                ) : (
                  <>
                    <Link href="/tools">
                      <SuggestionChip label="Buka Tools" icon={<Plus size={12}/>} isLink={true} />
                    </Link>
                    <SuggestionChip label="Bimbingan Skripsi" onClick={() => handleSend("Saya butuh bantuan bimbingan skripsi, bisa mulai dari mana?")} />
                  </>
                )}
                <SuggestionChip label="Buat Latihan Soal" onClick={() => handleSend("Buatkan 5 soal pilihan ganda tentang Pemrograman Dasar")} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="max-w-3xl mx-auto w-full pt-8 pb-[120px] px-4 space-y-8 flex-1">
              {messages.map((msg, idx) => (
                <AiMessage
                  key={msg._id || idx}
                  content={msg.text}
                  isUser={msg.role === 'user'}
                  isTyping={msg.role === 'model' && idx === messages.length - 1 && isTyping}
                />
              ))}
              {thoughtTraces.length > 0 && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {thoughtTraces.map((trace, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-indigo-500/5 border border-slate-200 dark:border-indigo-500/20 rounded-lg w-fit">
                       <span className="text-[11px] text-slate-600 dark:text-indigo-300 font-medium">{trace}</span>
                    </div>
                  ))}
                </div>
              )}
              {isThinking && (
                <div className="px-1">
                  <ThinkingIndicator />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>
        )}
      </div>
      <div className="p-6 bg-gradient-to-t from-white dark:from-[#0F0F0F] via-white dark:via-[#0F0F0F] to-transparent flex-none">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          <div className="flex justify-end pr-2">
             <ModelSelector
               currentPlan={user?.current_plan || 'FREE'}
               selectedModel={selectedModel}
               onSelect={handleModelChange}
             />
          </div>
          <InputBox
            input={input}
            setInput={setInput}
            handleSend={() => handleSend()}
            disabled={isPending}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
          />
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
      className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-[#1E1E1E] border border-slate-200 dark:border-[#2A2A2A] rounded-full text-[11px] text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:border-indigo-500/50 transition-all cursor-pointer"
    >
      {icon} {label}
    </Component>
  );
}

function InputBox({ input, setInput, handleSend, disabled, selectedFile, setSelectedFile }) {
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const textareaRef = useRef(null);
  const actionSheetRef = useRef(null);

  // Close action sheet when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionSheetRef.current && !actionSheetRef.current.contains(event.target)) {
        setIsActionSheetOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL if it's an image
      if (file.type.startsWith('image/')) {
        file.preview = URL.createObjectURL(file);
      }
      setSelectedFile(file);
      setIsActionSheetOpen(false);
    }
  };

  return (
    <div className="flex flex-col w-full relative">
      <AnimatePresence>
        {isActionSheetOpen && (
          <motion.div
            ref={actionSheetRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-0 mb-4 w-56 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2A2A2A] rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl bg-white/90 dark:bg-[#1A1A1A]/90"
          >
            <div className="flex flex-col gap-1">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-[#252525] rounded-xl transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
                  <Camera size={18} />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-gray-200">Kamera</span>
              </button>

              <button
                onClick={() => galleryInputRef.current?.click()}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-[#252525] rounded-xl transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                  <ImageIcon size={18} />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-gray-200">Galeri</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-[#252525] rounded-xl transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                  <FileText size={18} />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-gray-200">Dokumen/File</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.9 }}
            className="flex items-center gap-3 mb-3 ml-1 p-2 bg-slate-50 dark:bg-[#1A1A1A] rounded-2xl w-fit border border-slate-200 dark:border-[#2A2A2A] shadow-sm group"
          >
            {selectedFile.preview ? (
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-[#333]">
                <img src={selectedFile.preview} alt="preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                <FileText size={20} />
              </div>
            )}
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-gray-200 truncate max-w-[150px]">{selectedFile.name}</span>
              <span className="text-[9px] text-slate-400 dark:text-gray-500 uppercase">{(selectedFile.size / 1024).toFixed(0)} KB • {selectedFile.type.split('/')[1] || 'FILE'}</span>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-200 dark:bg-[#2A2A2A] text-slate-500 dark:text-gray-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative bg-slate-100 dark:bg-[#1E1E1E] rounded-2xl p-2 flex items-end gap-1 border border-slate-200 dark:border-[#2A2A2A] focus-within:border-indigo-500/50 transition-all shadow-2xl">
        <button
          onClick={() => setIsActionSheetOpen(!isActionSheetOpen)}
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all shrink-0 ${
            isActionSheetOpen
            ? 'bg-indigo-600 text-white rotate-45'
            : 'text-slate-400 dark:text-gray-500 hover:text-indigo-400'
          }`}
        >
          <Plus size={20} />
        </button>

        {/* Hidden Inputs */}
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
          capture="environment"
        />
        <input
          type="file"
          ref={galleryInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,video/*"
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.csv"
        />

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={1}
          disabled={disabled}
          placeholder="Tanya apa saja ke Dosen AI-mu..."
          className="flex-1 bg-transparent border-none outline-none py-2.5 px-3 text-base text-slate-900 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-500 resize-none overflow-y-auto custom-scrollbar"
        />
        <button
          onClick={(e) => { e.preventDefault(); handleSend(); }}
          disabled={disabled || (!input.trim() && !selectedFile)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            (input.trim() || selectedFile) && !disabled ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40' : 'bg-slate-200 dark:bg-[#2A2A2A] text-slate-400 dark:text-gray-600'
          }`}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
