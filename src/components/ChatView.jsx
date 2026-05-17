'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useChat } from '@/context/ChatContext';
import { motion, AnimatePresence } from 'framer-motion';
import TextareaAutosize from 'react-textarea-autosize';
import { ChevronDown, Plus, Send, X, FileText, Image as ImageIcon, Briefcase, Search, BookOpen, Edit3, Rocket, Camera, File, Square, Code, GraduationCap, Microscope, ArrowLeft, Mic, AtSign } from 'lucide-react';
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
    stopTypewriter,
    migrateNewChatToId,
    clearChat,
    setActiveChatTitle
  } = useChat();

  // Local state to track chatId after migration for first message
  const [internalId, setInternalId] = useState(null);
  const currentId = activeChatId || internalId || 'new';

  const currentChat = chatData[currentId] || { messages: [], isThinking: false, isTyping: false };
  const messages = currentChat.messages;
  const isThinking = currentChat.isThinking;
  const isTyping = currentChat.isTyping;

  const setMessages = (msgs) => setChatMessages(currentId, msgs);
  const setIsThinking = (val) => setChatStatus(currentId, { isThinking: val });

  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [project, setProject] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
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
    try {
      setSelectedModel(modelId);
      localStorage.setItem('eduspace_preferred_model', modelId);
    } catch (err) {
      console.error("Failed to change model:", err);
    }
  };

  // Simulated Thought Traces Effect
  useEffect(() => {
    if (isPending && project?.agentId === 'deep-search') {
      const traces = [
        '🔍 Menganalisis pertanyaan...',
        '📋 Membuat rencana riset...',
        '🌐 Mencari informasi di web...',
        '📄 Membaca konten website...',
        '🧠 Menganalisis sumber data...',
        '✍️ Menyusun jawaban final...'
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
      }, 3000);
      return () => clearInterval(interval);
    } else {
      setThoughtTraces([]);
    }
  }, [isPending, project]);

  // 1. Load detail chat saat activeChatId berubah
  useEffect(() => {
    if (activeChatId && userId) {
      // Clear internal bridge once we are on the real route
      setInternalId(null);

      // Hanya tampilkan loading jika messages memang kosong DAN tidak dalam proses migrasi
      if (messages.length === 0 && internalId !== activeChatId) {
        setIsLoadingChat(true);
      }

      getChatDetails(activeChatId, userId).then(res => {
        // Jangan menimpa jika sedang ada proses pengetikan AI (mencegah jumpy UI)
        setChatMessages(activeChatId, prev => {
          if (prev.length > 0 && (isTyping || isThinking)) return prev;
          return res;
        });
        setIsLoadingChat(false);

        // Set Header Title based on first message
        if (res.length > 0) {
          const firstUserMsg = res.find(m => m.role === 'user');
          if (firstUserMsg) {
            setActiveChatTitle(firstUserMsg.text.substring(0, 40) + (firstUserMsg.text.length > 40 ? '...' : ''));
          }
        }

        // Jika dari mode analisa, trigger AI untuk pesan terakhir
        if (isAnalyzing && res.length > 0 && res[res.length - 1].role === 'user') {
          handleSend(res[res.length - 1].text, true);
        }
      });
    } else if (!activeChatId) {
      // Jika di halaman home (/), pastikan state 'new' bersih HANYA jika tidak sedang pending/migrasi
      if (!isPending && !internalId) {
        clearChat('new');
      }
      setActiveChatTitle('EduSpaceAI');
      setIsLoadingChat(false);
    }
  }, [activeChatId, userId, isAnalyzing, isPending, internalId, setActiveChatTitle]);

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

      // If it's the very first message, set the title
      if (messages.length === 0) {
         setActiveChatTitle(userMessage.text.substring(0, 40) + (userMessage.text.length > 40 ? '...' : ''));
      }
    }

    const fileToUpload = selectedFile;
    setSelectedFile(null);

    if (fileToUpload) {
      setIsUploading(true);
    } else {
      setIsThinking(true);
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('prompt', textToSend);
      formData.append('modelId', selectedModel);
      if (currentId !== 'new') formData.append('chatId', currentId);
      if (projectId) formData.append('projectId', projectId);
      if (isAutoTrigger) formData.append('skipSave', 'true');
      if (fileToUpload) formData.append('file', fileToUpload);

      const result = await sendMessage(formData);
      setIsUploading(false);

      if (result.success) {
        if (!activeChatId && currentId === 'new') {
          migrateNewChatToId(result.chatId);
          setInternalId(result.chatId);

          const targetUrl = projectId
            ? `/chat/${result.chatId}?projectId=${projectId}`
            : `/chat/${result.chatId}`;

          router.replace(targetUrl, { scroll: false });
        }

        // --- TYPEWRITER EFFECT ---
        runTypewriter(result.chatId, result.aiResponse);
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

  const getAgentTheme = (agentId) => {
    switch (agentId) {
      case 'deep-search': return {
        bg: 'bg-blue-50 dark:bg-blue-900/10',
        border: 'border-blue-200 dark:border-blue-800/30',
        accent: 'bg-blue-500',
        text: 'text-blue-600 dark:text-blue-400'
      };
      case 'researcher': return {
        bg: 'bg-green-50 dark:bg-green-900/10',
        border: 'border-green-200 dark:border-green-800/30',
        accent: 'bg-green-500',
        text: 'text-green-600 dark:text-green-400'
      };
      case 'editor': return {
        bg: 'bg-amber-50 dark:bg-amber-900/10',
        border: 'border-amber-200 dark:border-amber-800/30',
        accent: 'bg-amber-500',
        text: 'text-amber-600 dark:text-amber-400'
      };
      default: return {
        bg: 'bg-indigo-50 dark:bg-indigo-900/10',
        border: 'border-indigo-200 dark:border-indigo-800/30',
        accent: 'bg-indigo-500',
        text: 'text-indigo-600 dark:text-indigo-400'
      };
    }
  };

  const agentTheme = project ? getAgentTheme(project.agentId) : getAgentTheme('default');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat pagi! Siap bantu skripsimu hari ini?';
    if (hour < 15) return 'Selamat siang! Ada yang bisa saya bantu?';
    if (hour < 19) return 'Selamat sore! Tetap semangat belajarnya ya.';
    return 'Selamat malam! Masih ada yang bisa dibantu?';
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
        <div className={`px-4 md:px-6 py-3 border-b ${agentTheme.border} ${agentTheme.bg} flex items-center justify-between z-10 flex-none transition-colors duration-200`}>
          <div className="flex items-center gap-2 md:gap-4">
            <Link
              href="/"
              className={`p-2 rounded-lg hover:bg-white/50 dark:hover:bg-black/20 ${agentTheme.text} transition-all`}
              title="Keluar dari Workspace"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${agentTheme.bg} border ${agentTheme.border} flex items-center justify-center`}>
                {getAgentIcon(project.agentId)}
              </div>
              <div>
                <h2 className="text-[12px] font-bold text-slate-900 dark:text-white leading-tight">{project.name}</h2>
                <p className={`text-[10px] ${agentTheme.text} uppercase tracking-widest font-semibold`}>{getAgentName(project.agentId)}</p>
              </div>
            </div>
          </div>
          <div className={`hidden sm:block text-[10px] ${agentTheme.text} ${agentTheme.bg} px-2 py-1 rounded border ${agentTheme.border} font-bold uppercase tracking-wider`}>Workspace Agent</div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {isLoadingChat ? (
          <div className="flex-1 max-w-4xl mx-auto w-full pt-8 px-4 space-y-8 animate-pulse">
            <div className="flex justify-start">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1E1E1E]" />
              <div className="ml-4 space-y-2">
                <div className="h-4 w-48 bg-slate-100 dark:bg-[#1E1E1E] rounded" />
                <div className="h-4 w-64 bg-slate-100 dark:bg-[#1E1E1E] rounded" />
              </div>
            </div>
            <div className="flex justify-end">
              <div className="mr-4 space-y-2">
                <div className="h-4 w-32 bg-indigo-50 dark:bg-indigo-900/10 rounded ml-auto" />
                <div className="h-10 w-64 bg-indigo-50 dark:bg-indigo-900/10 rounded" />
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/10" />
            </div>
            <div className="flex justify-start pt-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1E1E1E]" />
              <div className="ml-4 space-y-2">
                <div className="h-4 w-56 bg-slate-100 dark:bg-[#1E1E1E] rounded" />
                <div className="h-20 w-80 bg-slate-100 dark:bg-[#1E1E1E] rounded" />
              </div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4 relative overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 animate-gradient-shift bg-[length:400%_400%]" />

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-indigo-500/20 rounded-full"
                  animate={{
                    y: [0, -40, 0],
                    opacity: [0.3, 0.8, 0.3],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 4 + i,
                    repeat: Infinity,
                    delay: i * 0.7,
                  }}
                  style={{
                    left: `${15 + i * 15}%`,
                    top: `${25 + (i % 3) * 20}%`,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/30 border border-white/20"
              >
                <span className="text-4xl">
                  {project ? '📂' : '🎓'}
                </span>
              </motion.div>

              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3 text-center">
                {project ? project.name : 'EduSpaceAI'}
              </h1>
              <p className="text-slate-600 dark:text-gray-400 mb-8 text-center max-w-sm font-medium">
                {project
                  ? `Sedang menggunakan agen ${getAgentName(project.agentId)} untuk membantumu di project ini.`
                  : getGreeting()}
              </p>
            </div>
            <div className="w-full max-w-2xl text-center">
              {project?.agentId === 'deep-search' ? (
                <div className="flex flex-wrap justify-center gap-3">
                   <SuggestionChip theme={agentTheme} icon={<Search size={12}/>} label="Cari berita terbaru AI" onClick={() => handleSend("Apa berita terbaru tentang perkembangan AI minggu ini?")} />
                   <SuggestionChip theme={agentTheme} icon={<Rocket size={12}/>} label="Tren Teknologi 2025" onClick={() => handleSend("Apa tren teknologi utama yang diprediksi untuk tahun 2025?")} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                      <GraduationCap size={14} className="text-indigo-500" />
                      <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Skripsi & Riset</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <SuggestionChip theme={agentTheme} label="Bimbingan Skripsi" onClick={() => handleSend("Saya butuh bantuan bimbingan skripsi, bisa mulai dari mana?")} />
                      <SuggestionChip theme={agentTheme} label="Cek Judul Skripsi" onClick={() => handleSend("Bantu saya review judul skripsi: [Sebutkan judulmu]")} />
                      <SuggestionChip theme={agentTheme} label="Cari Rumusan Masalah" onClick={() => handleSend("Bantu saya membuat rumusan masalah untuk topik: [Sebutkan topik]")} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                      <BookOpen size={14} className="text-green-500" />
                      <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Bantuan Belajar</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <SuggestionChip theme={agentTheme} label="Buat Latihan Soal" onClick={() => handleSend("Buatkan 5 soal pilihan ganda tentang Pemrograman Dasar")} />
                      <SuggestionChip theme={agentTheme} label="Ringkas Materi" onClick={() => handleSend("Tolong ringkaskan konsep tentang: [Sebutkan konsep]")} />
                      <SuggestionChip theme={agentTheme} label="Jelaskan Rumus" onClick={() => handleSend("Bantu jelaskan cara kerja rumus ini: [Tulis rumus]")} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                      <Code size={14} className="text-blue-500" />
                      <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Coding & IT</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <SuggestionChip theme={agentTheme} label="Debug Kode" onClick={() => handleSend("Bantu saya mencari error di kode ini: [Paste kodemu]")} />
                      <SuggestionChip theme={agentTheme} label="Jelaskan Algoritma" onClick={() => handleSend("Jelaskan cara kerja algoritma Dijkstra dengan bahasa sederhana")} />
                      <SuggestionChip theme={agentTheme} label="Review Query SQL" onClick={() => handleSend("Bantu optimasi query SQL berikut: [Paste query]")} />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-center pt-8">
                <Link href="/tools">
                  <SuggestionChip theme={agentTheme} label="Jelajahi Semua Tools" icon={<Plus size={12}/>} isLink={true} />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto w-full pt-4 md:pt-8 pb-[100px] md:pb-[120px] px-4 space-y-8 flex-1">
              {messages.map((msg, idx) => (
                <AiMessage
                  key={msg._id || idx}
                  content={msg.text}
                  isUser={msg.role === 'user'}
                  isTyping={msg.role === 'model' && idx === messages.length - 1 && isTyping}
                  agentId={project?.agentId}
                />
              ))}
              {thoughtTraces.length > 0 && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {thoughtTraces.map((trace, idx) => (
                    <div key={idx} className={`flex items-center gap-2 px-3 py-1.5 ${agentTheme.bg} border ${agentTheme.border} rounded-lg w-fit`}>
                       <span className={`text-[11px] ${agentTheme.text} font-medium`}>{trace}</span>
                    </div>
                  ))}
                </div>
              )}
              {(isThinking || isUploading) && (
                <div className="px-1 flex flex-col gap-2">
                  <ThinkingIndicator />
                  {isUploading && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/30 rounded-lg w-fit animate-pulse">
                      <FileText size={12} className="text-indigo-500" />
                      <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">Mengunggah file...</span>
                    </div>
                  )}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>
        )}
      </div>
      <div className="p-4 md:p-6 bg-gradient-to-t from-white dark:from-[#0F0F0F] via-white dark:via-[#0F0F0F] to-transparent flex-none">
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          <div className="flex items-center justify-between px-2">
             <div className="flex-1 flex justify-center">
               <AnimatePresence>
                 {isTyping && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      onClick={() => stopTypewriter(currentId)}
                      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-[#2A2A2A] rounded-full text-[11px] font-bold text-slate-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                    >
                      <Square size={12} fill="currentColor" /> Berhenti Menghasilkan
                    </motion.button>
                 )}
               </AnimatePresence>
             </div>
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
            isNewChat={messages.length === 0}
          />
        </div>
      </div>
    </div>
  );
}

// --- KOMPONEN PENDUKUNG ---

function SuggestionChip({ label, icon, onClick, isLink, theme }) {
  const Component = isLink ? motion.div : motion.button;
  const hoverBorder = theme ? theme.border.replace('border-', 'hover:border-') : 'hover:border-indigo-500/50';
  const hoverText = theme ? theme.text.replace('text-', 'hover:text-') : 'hover:text-indigo-600';

  return (
    <Component
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick} 
      className={`flex items-center gap-2 px-4 py-2.5
        bg-gradient-to-r from-slate-50 to-slate-100
        dark:from-[#1E1E1E] dark:to-[#252525]
        border border-slate-200 dark:border-[#2A2A2A]
        rounded-xl text-[11px] text-slate-600 dark:text-gray-400
        ${hoverText} ${hoverBorder}
        transition-all shadow-sm hover:shadow-md cursor-pointer w-full md:w-auto md:inline-flex group`}
    >
      {icon && (
        <div className="p-1 rounded-lg bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
          {icon}
        </div>
      )}
      <span className="truncate font-medium">{label}</span>
    </Component>
  );
}

function InputBox({ input, setInput, handleSend, disabled, selectedFile, setSelectedFile, isNewChat }) {
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const fileInputRef = useRef(null);

  // Show nudge for new chats after a delay
  useEffect(() => {
    if (isNewChat) {
      const timer = setTimeout(() => {
        setShowNudge(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isNewChat]);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const textareaRef = useRef(null);
  const actionSheetRef = useRef(null);


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
          <>
          {/* Overlay to close action sheet */}
          <div
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsActionSheetOpen(false)}
          />
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
          </>
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

      <div className="relative bg-white/80 dark:bg-[#1E1E1E]/80 backdrop-blur-xl rounded-2xl p-2 flex items-end gap-1 border border-slate-200 dark:border-[#2A2A2A] focus-within:border-indigo-500/50 focus-within:shadow-xl focus-within:shadow-indigo-500/10 transition-all duration-300 shadow-2xl">
        {/* Glow effect saat focus */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl opacity-0 focus-within:opacity-100 transition-opacity pointer-events-none" />

        <div className="flex gap-0.5 relative z-10">
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-[#2A2A2A] rounded-xl transition-colors hidden md:flex items-center justify-center">
            <Mic size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="relative z-10">
          <AnimatePresence>
            {showNudge && !isActionSheetOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 10 }}
                className="absolute bottom-full left-0 mb-4 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap shadow-xl"
              >
                Unggah File/Gambar di sini!
                <div className="absolute top-full left-4 w-2 h-2 bg-indigo-600 rotate-45 -translate-y-1"></div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => {
              setIsActionSheetOpen(!isActionSheetOpen);
              setShowNudge(false);
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all shrink-0 ${
              isActionSheetOpen
              ? 'bg-indigo-600 text-white rotate-45'
              : 'text-slate-400 dark:text-gray-500 hover:text-indigo-400'
            } ${showNudge && !isActionSheetOpen ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-[#0F0F0F] animate-pulse' : ''}`}
          >
            <Plus size={20} />
          </button>
        </div>

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

        <div className="flex-1 flex flex-col relative z-10">
          <TextareaAutosize
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            minRows={1}
            maxRows={8}
            disabled={disabled}
            placeholder="Tanya apa saja ke Dosen AI-mu..."
            className="w-full bg-transparent border-none outline-none py-2.5 px-3 text-base text-slate-900 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-500 resize-none overflow-y-auto custom-scrollbar"
          />
        </div>

        <div className="flex items-center gap-1.5 relative z-10 mb-0.5">
          {input.length > 0 && (
            <span className="text-[10px] text-slate-400 font-medium mb-2 mr-1">
              {input.length}/2000
            </span>
          )}
          <button
            onClick={(e) => { e.preventDefault(); handleSend(); }}
            disabled={disabled || (!input.trim() && !selectedFile)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              (input.trim() || selectedFile) && !disabled ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/40' : 'bg-slate-200 dark:bg-[#2A2A2A] text-slate-400 dark:text-gray-600'
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
