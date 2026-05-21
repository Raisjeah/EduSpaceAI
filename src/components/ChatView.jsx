'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useChat } from '@/context/ChatContext';
import { useLayout } from '@/context/LayoutContext';
import { motion, AnimatePresence } from 'framer-motion';
import TextareaAutosize from 'react-textarea-autosize';
import { ChevronDown, Plus, ArrowUp, X, FileText, Image as ImageIcon, Briefcase, Search, BookOpen, Edit3, Rocket, Camera, File, Square, Code, GraduationCap, Microscope, ArrowLeft, Mic, Wrench, FileSpreadsheet, Share2, Quote, BrainCircuit } from 'lucide-react';
import { sendMessage, getChatDetails } from '@/app/actions/chatActions';
import { getProjectDetails } from '@/app/actions/projectActions';
import AiMessage from './AiMessage';
import ThinkingIndicator from './ThinkingIndicator';
import ModelSelector from './ModelSelector';
import FloatingOrbs from './FloatingOrbs';
import ProjectModal from './ProjectModal';
import useAuth from '@/hooks/useAuth';
import UpgradeModal from './UpgradeModal';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ChatView({ userId, activeChatId, projectId }) {
  const { user } = useAuth();
  const { isSidebarOpen } = useLayout();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) {
      setGreeting('Selamat pagi ☀️ Ada yang bisa EduSpaceAI bantu hari ini?');
    } else if (hour >= 11 && hour < 15) {
      setGreeting('Selamat siang 🌤️ Ada yang bisa EduSpaceAI bantu hari ini?');
    } else if (hour >= 15 && hour < 18) {
      setGreeting('Selamat sore 🌅 Ada yang bisa EduSpaceAI bantu hari ini?');
    } else {
      setGreeting('Selamat malam 🌙 Ada yang bisa EduSpaceAI bantu hari ini?');
    }
  }, []);
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
  const [dynamicStatus, setDynamicStatus] = useState("Dosen AI sedang berpikir...");
  const statusIntervalRef = useRef(null);
  const [upgradeModal, setUpgradeModal] = useState({ isOpen: false, feature: '' });
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
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

      getChatDetails(activeChatId).then(res => {
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

    // --- Dynamic Status Setup ---
    const presets = {
      academic: ["Membaca file referensi...", "Menganalisis bab terkait...", "Menyusun struktur penjelasan...", "Memfinalisasi materi akademik..."],
      search: ["Membuka mesin pencari...", "Menjelajahi situs terkait...", "Menyaring informasi valid...", "Merangkum hasil penelusuran..."],
      coding: ["Membaca baris kode...", "Menganalisis logika fungsi...", "Melacak potensi bug...", "Menyusun perbaikan kode..."],
      default: ["Menerima pesan...", "Memikirkan jawaban terbaik...", "Menyusun respons..."]
    };

    let selectedPreset = presets.default;
    const lowerInput = textToSend.toLowerCase();
    if (/bab|skripsi|materi|kuliah|akademik|tugas/.test(lowerInput)) {
      selectedPreset = presets.academic;
    } else if (/cari|search|website|link|googling|internet/.test(lowerInput) || project?.agentId === 'deep-search') {
      selectedPreset = presets.search;
    } else if (/kode|code|bug|sql|error|function|script|coding/.test(lowerInput)) {
      selectedPreset = presets.coding;
    }

    let statusIndex = 0;
    setDynamicStatus(selectedPreset[0]);
    if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);

    statusIntervalRef.current = setInterval(() => {
      statusIndex++;
      if (statusIndex < selectedPreset.length) {
        setDynamicStatus(selectedPreset[statusIndex]);
      } else {
        clearInterval(statusIntervalRef.current);
      }
    }, 2000);

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
        if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
        runTypewriter(result.chatId, result.aiResponse);
      } else {
        if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
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

  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [isFooterScrolled, setIsFooterScrolled] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!chatContainerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;

      setIsHeaderScrolled(scrollTop > 20);
      setIsFooterScrolled(scrollTop + clientHeight < scrollHeight - 20);
    };

    const currentRef = chatContainerRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
    }
    return () => {
      if (currentRef) currentRef.removeEventListener('scroll', handleScroll);
    };
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0F0F0F] overflow-hidden transition-colors duration-200">
      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={() => setUpgradeModal({ ...upgradeModal, isOpen: false })}
        featureName={upgradeModal.feature}
      />
      {/* Project Header (If in project) */}
      {project && (
        <div className={`px-4 md:px-6 py-3 border-b ${agentTheme.border} bg-white/10 dark:bg-black/20 backdrop-blur-xl flex items-center justify-between z-10 flex-none transition-all`}>
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
          <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 relative overflow-hidden">
            <div className="hidden md:block">
              <FloatingOrbs />
            </div>
            <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/30 backdrop-blur-xl">
              <span className="text-2xl text-indigo-500">
                {project ? '📂' : '🎓'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 text-center px-4">
              {project ? project.name : 'EduSpaceAI'}
            </h1>
            <p className="text-slate-600 dark:text-gray-400 mb-6 text-center max-w-sm text-sm md:text-base px-4 font-medium">
              {project
                ? `Sedang menggunakan agen ${getAgentName(project.agentId)} untuk membantumu di project ini.`
                : greeting}
            </p>
          </div>
        ) : (
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto custom-scrollbar"
          >
            <div className="max-w-4xl mx-auto w-full pt-4 md:pt-12 pb-[160px] md:pb-[180px] px-4 sm:px-6 space-y-8 flex-1">
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
                    <div key={idx} className={`flex items-center gap-2 px-3 py-1.5 ${agentTheme.bg} border ${agentTheme.border} rounded-lg w-fit`}>
                       <span className={`text-[11px] ${agentTheme.text} font-medium`}>{trace}</span>
                    </div>
                  ))}
                </div>
              )}
              {(isThinking || isUploading) && (
                <div className="px-1 flex flex-col gap-2">
                  <ThinkingIndicator status={dynamicStatus} />
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

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        userId={userId}
      />
      <div
        className={`fixed bottom-0 right-0 p-4 md:p-6 transition-all duration-300 z-30 ${
          isSidebarOpen ? 'left-0 md:left-[280px]' : 'left-0'
        } ${
        isFooterScrolled
          ? 'bg-white/70 dark:bg-[#0F0F0F]/70 backdrop-blur-md shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] border-t border-slate-200/50 dark:border-white/5'
          : 'bg-transparent border-transparent'
      }`}>
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          <div className="flex justify-center">
            <AnimatePresence>
              {isTyping && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onClick={() => stopTypewriter(currentId)}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-[#2A2A2A] rounded-full text-[11px] font-bold text-slate-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 hover:border-red-200 transition-all shadow-sm mb-2"
                >
                  <Square size={12} fill="currentColor" /> Berhenti Menghasilkan
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          <InputBox
            input={input}
            setInput={setInput}
            handleSend={() => handleSend()}
            disabled={isPending}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            isNewChat={messages.length === 0}
            setIsProjectModalOpen={setIsProjectModalOpen}
            modelSelector={
              <ModelSelector
                currentPlan={user?.current_plan || 'FREE'}
                selectedModel={selectedModel}
                onSelect={handleModelChange}
              />
            }
          />
        </div>
      </div>
    </div>
  );
}

// --- KOMPONEN PENDUKUNG ---

function SuggestionChip({ label, icon, onClick, isLink, theme }) {
  const Component = isLink ? 'div' : 'button';
  const hoverBorder = theme ? theme.border.replace('border-', 'hover:border-') : 'hover:border-indigo-500/50';
  const hoverText = theme ? theme.text.replace('text-', 'hover:text-') : 'hover:text-indigo-500';

  return (
    <Component
      onClick={onClick} 
      className={`flex items-center gap-2 px-4 py-2 bg-white/5 dark:bg-white/10 backdrop-blur-md border border-white/10 rounded-xl text-[11px] text-slate-600 dark:text-gray-300 ${hoverText} ${hoverBorder} transition-all cursor-pointer w-full md:w-auto md:inline-flex shadow-sm hover:shadow-md hover:bg-white/20`}
    >
      {icon} <span className="truncate font-medium">{label}</span>
    </Component>
  );
}

function InputBox({ input, setInput, handleSend, disabled, selectedFile, setSelectedFile, isNewChat, setIsProjectModalOpen, modelSelector }) {
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [isToolsSheetOpen, setIsToolsSheetOpen] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const fileInputRef = useRef(null);
  const toolsSheetRef = useRef(null);

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
            className="absolute bottom-full left-0 mb-4 w-52 sm:w-56 max-w-[85vw] liquid-glass rounded-2xl shadow-2xl p-2 z-50"
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
            className="flex items-center gap-3 mb-3 ml-1 p-2 bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-2xl w-fit border border-white/20 shadow-xl group"
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
              <span className="text-[11px] font-semibold text-slate-700 dark:text-gray-200 truncate max-w-[100px] sm:max-w-[150px]">{selectedFile.name}</span>
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

      <div className="relative bg-transparent border border-slate-200 dark:border-white/10 rounded-2xl p-1.5 flex items-end gap-1 focus-within:border-indigo-500/30 transition-all shadow-sm">
        <div className="relative flex items-center">
          <AnimatePresence>
            {isToolsSheetOpen && (
              <>
              <div
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setIsToolsSheetOpen(false)}
              />
              <motion.div
                ref={toolsSheetRef}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-0 mb-4 w-64 max-w-[90vw] liquid-glass rounded-2xl shadow-2xl p-2 z-50 overflow-hidden"
              >
                <div className="px-3 py-2 mb-1 border-b border-white/10">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Workspace & Tools</h3>
                </div>
                <div className="flex flex-col gap-0.5 max-h-[300px] overflow-y-auto custom-scrollbar">
                  {[
                    { id: 'pdf', title: 'Analisis PDF', icon: <FileText size={16} className="text-red-400" />, link: '/editor/pdf' },
                    { id: 'doc', title: 'Analisis DOC', icon: <BookOpen size={16} className="text-blue-400" />, link: '/editor/doc' },
                    { id: 'xls', title: 'Data Excel/CSV', icon: <FileSpreadsheet size={16} className="text-green-400" />, link: '/editor/xls' },
                    { id: 'skripsi', title: 'Asisten Skripsi', icon: <BrainCircuit size={16} className="text-indigo-400" />, link: '/editor/skripsi' },
                    { id: 'soal', title: 'Generator Soal', icon: <Edit3 size={16} className="text-amber-400" />, link: '/editor/soal' },
                    { id: 'visualizer', title: 'Concept Mapper', icon: <Share2 size={16} className="text-purple-400" />, link: '/editor/visualizer' },
                    { id: 'citation', title: 'Citation Gen', icon: <Quote size={16} className="text-pink-400" />, link: '/tools/citation' },
                    { id: 'live', title: 'Voice Call (Live)', icon: <Mic size={16} className="text-indigo-500" />, link: '/chat/live' },
                  ].map((tool) => (
                    <Link
                      key={tool.id}
                      href={tool.link}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 rounded-xl transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {tool.icon}
                      </div>
                      <span className="text-xs font-medium text-slate-700 dark:text-gray-200">{tool.title}</span>
                    </Link>
                  ))}
                </div>
              </motion.div>
              </>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showNudge && !isActionSheetOpen && !isToolsSheetOpen && (
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
              setIsToolsSheetOpen(false);
              setShowNudge(false);
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all shrink-0 ${
              isActionSheetOpen
              ? 'bg-indigo-600 text-white rotate-45'
              : 'text-slate-400 dark:text-gray-500 hover:text-indigo-400'
            } ${showNudge && !isActionSheetOpen ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-[#0F0F0F] animate-pulse' : ''}`}
            title="Tambah File"
          >
            <Plus size={20} />
          </button>

          <button
            onClick={() => {
              setIsToolsSheetOpen(!isToolsSheetOpen);
              setIsActionSheetOpen(false);
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all shrink-0 ${
              isToolsSheetOpen
              ? 'bg-indigo-500/20 text-indigo-500'
              : 'text-slate-400 dark:text-gray-500 hover:text-indigo-400'
            }`}
            title="Tools & Workspace"
          >
            <Wrench size={18} />
          </button>

          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 dark:text-gray-500 hover:text-indigo-400 transition-all shrink-0"
            title="Workspace Agent"
          >
            <Briefcase size={18} />
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
          className="flex-1 bg-transparent border-none outline-none py-2.5 px-3 text-base text-slate-900 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-500 resize-none overflow-y-auto custom-scrollbar"
        />
        <div className="flex items-center gap-1">
          {modelSelector}
          <Link
            href="/chat/live"
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-neutral-900/5 dark:bg-white/5 text-slate-500 dark:text-gray-400 hover:bg-indigo-500/10 hover:text-indigo-500 transition-all"
            title="Voice Call (Live)"
          >
            <Mic size={16} />
          </Link>
          <button
            onClick={(e) => { e.preventDefault(); handleSend(); }}
            disabled={disabled || (!input.trim() && !selectedFile)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              (input.trim() || selectedFile) && !disabled ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 hover:scale-105' : 'bg-white/5 text-slate-400 dark:text-gray-600'
            }`}
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
