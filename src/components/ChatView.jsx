'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useChat } from '@/context/ChatContext';
import { useLayout } from '@/context/LayoutContext';
import { motion, AnimatePresence } from 'framer-motion';
import TextareaAutosize from 'react-textarea-autosize';
import { ChevronDown, Plus, ArrowUp, X, FileText, Image as ImageIcon, Briefcase, Search, BookOpen, Edit3, Rocket, Camera, File, Square, Code, GraduationCap, Microscope, ArrowLeft, Mic } from 'lucide-react';
import { sendMessage, getChatDetails } from '@/app/actions/chatActions';
import { getProjectDetails } from '@/app/actions/projectActions';
import AiMessage from './AiMessage';
import ThinkingIndicator from './ThinkingIndicator';
import ModelSelector from './ModelSelector';
import FloatingOrbs from './FloatingOrbs';
import InputBox from './InputBox';
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
            <div className="flex flex-col items-center justify-center mb-4">
              <div className="w-20 h-20 bg-white dark:bg-[#151515] rounded-2xl flex items-center justify-center mb-4 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-white/5 overflow-hidden">
                <img
                  src="/logo.png"
                  alt="EduSpaceAI Logo"
                  className="w-12 h-12 object-contain invert dark:invert-0"
                />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1 text-center px-4">
                {project ? project.name : 'EduSpaceAI'}
              </h1>
              <p className="text-slate-600 dark:text-gray-400 text-center max-w-sm text-sm md:text-base px-4 font-medium">
                {project
                  ? `Sedang menggunakan agen ${getAgentName(project.agentId)} untuk membantumu di project ini.`
                  : greeting}
              </p>
            </div>
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
      <div
        className={`fixed bottom-0 right-0 p-4 md:p-6 transition-all duration-300 z-30 ${
          isSidebarOpen ? 'left-0 md:left-[280px]' : 'left-0'
        } bg-transparent pointer-events-none`}>
        <div className="max-w-4xl mx-auto flex flex-col gap-3 pointer-events-auto">
          <div className="flex justify-center">
            <AnimatePresence>
              {isTyping && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onClick={() => stopTypewriter(currentId)}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-[#2A2A2A] rounded-full text-[11px] font-bold text-slate-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 hover:border-red-200 transition-all shadow-sm mb-2 pointer-events-auto"
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
