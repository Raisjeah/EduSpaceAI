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
import useAuth from '@/hooks/useAuth';
import UpgradeModal from './UpgradeModal';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// ── PERUBAHAN 1: Suggested prompts untuk home screen ──
const SUGGESTED_PROMPTS = [
  { icon: <GraduationCap size={14} />, label: 'Bantu saya memahami materi kuliah' },
  { icon: <Microscope size={14} />, label: 'Bantu susun kerangka skripsi' },
  { icon: <Edit3 size={14} />, label: 'Koreksi tulisan akademik saya' },
  { icon: <Search size={14} />, label: 'Carikan referensi terbaru' },
];
// ── END PERUBAHAN 1 ──

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
  const statusIntervalRef = useRef(null);
  const [upgradeModal, setUpgradeModal] = useState({ isOpen: false, feature: '' });
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const chatEndRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAnalyzing = searchParams.get('analyze') === 'true';

  useEffect(() => {
    if (projectId) {
      getProjectDetails(projectId).then(res => setProject(res));
    } else {
      setProject(null);
    }
  }, [projectId]);

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

  useEffect(() => {
    if (activeChatId && userId) {
      setInternalId(null);

      if (messages.length === 0 && internalId !== activeChatId) {
        setIsLoadingChat(true);
      }

      getChatDetails(activeChatId).then(res => {
        setChatMessages(activeChatId, prev => {
          if (prev.length > 0 && (isTyping || isThinking)) return prev;
          return res;
        });
        setIsLoadingChat(false);

        if (res.length > 0) {
          const firstUserMsg = res.find(m => m.role === 'user');
          if (firstUserMsg) {
            setActiveChatTitle(firstUserMsg.text.substring(0, 40) + (firstUserMsg.text.length > 40 ? '...' : ''));
          }
        }

        if (isAnalyzing && res.length > 0 && res[res.length - 1].role === 'user') {
          handleSend(res[res.length - 1].text, true);
        }
      });
    } else if (!activeChatId) {
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
      {/* Project Header */}
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
          // ── PERUBAHAN 2: Home screen — logo lebih atas, tambah suggested prompts ──
          <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 relative overflow-hidden gap-6">
            <div className="hidden md:block">
              <FloatingOrbs />
            </div>

            {/* Logo + Greeting */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white dark:bg-[#151515] rounded-2xl flex items-center justify-center mb-3 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-white/5 overflow-hidden">
                <img
                  src="/logo.png"
                  alt="EduSpaceAI Logo"
                  className="w-10 h-10 object-contain invert dark:invert-0"
                />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {project ? project.name : 'EduSpaceAI'}
              </h1>
              <p className="text-slate-500 dark:text-gray-500 text-sm max-w-xs font-medium">
                {project
                  ? `Menggunakan agen ${getAgentName(project.agentId)}`
                  : greeting}
              </p>
            </div>

            {/* Suggested Prompts */}
            {!project && (
              <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(prompt.label);
                    }}
                    className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.07] hover:border-indigo-400/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all text-left group"
                  >
                    <span className="text-slate-400 dark:text-gray-500 group-hover:text-indigo-500 transition-colors mt-0.5 shrink-0">
                      {prompt.icon}
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-gray-400 group-hover:text-slate-800 dark:group-hover:text-gray-200 font-medium leading-snug transition-colors">
                      {prompt.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          // ── END PERUBAHAN 2 ──
        ) : (
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto custom-scrollbar"
          >
            {/* ── PERUBAHAN 3: space-y-4 → space-y-3, pb sedikit dikurangi ── */}
            <div className="max-w-4xl mx-auto w-full pt-4 md:pt-8 pb-[150px] md:pb-[160px] px-4 sm:px-6 space-y-3 flex-1">
              {messages.map((msg, idx) => (
                <AiMessage
                  key={msg._id || idx}
                  content={msg.text}
                  isUser={msg.role === 'user'}
                  isTyping={msg.role === 'model' && idx === messages.length - 1 && isTyping}
                />
              ))}
              {thoughtTraces.length > 0 && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {thoughtTraces.map((trace, idx) => (
                    <div key={idx} className={`flex items-center gap-2 px-3 py-1.5 ${agentTheme.bg} border ${agentTheme.border} rounded-lg w-fit`}>
                       <span className={`text-[11px] ${agentTheme.text} font-medium`}>{trace}</span>
                    </div>
                  ))}
                </div>
              )}
              {(isThinking || isUploading) && (
                <div className="px-1 flex flex-col gap-1.5">
                  <ThinkingIndicator agentId={project?.agentId || 'default'} />
                  {isUploading && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/30 rounded-lg w-fit animate-pulse">
                      <FileText size={12} className="text-indigo-500" />
                      <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">Mengunggah file...</span>
                    </div>
                  )}
                </div>
              )}
              {/* ── END PERUBAHAN 3 ── */}
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

// --- KOMPONEN PENDUKUNG --- (tidak diubah)

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

function InputBox({ input, setInput, handleSend, disabled, selectedFile, setSelectedFile, isNewChat, modelSelector }) {
  const { setIsProjectModalOpen } = useLayout();
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [activeActionSection, setActiveActionSection] = useState('files');
  const [showNudge, setShowNudge] = useState(false);
  const fileInputRef = useRef(null);

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
          <div
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsActionSheetOpen(false)}
          />
          <motion.div
            ref={actionSheetRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-full left-0 right-0 mb-4 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] rounded-2xl shadow-2xl overflow-hidden z-50 w-full md:w-[400px]"
          >
            {/* Section Tabs */}
            <div className="flex border-b border-slate-200 dark:border-[#333]">
              <button
                onClick={() => setActiveActionSection('files')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeActionSection === 'files' ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-400 dark:text-gray-500'
                }`}
              >
                Files
              </button>
              <button
                onClick={() => setActiveActionSection('tools')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeActionSection === 'tools' ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-400 dark:text-gray-500'
                }`}
              >
                Tools
              </button>
              <button
                onClick={() => setActiveActionSection('agent')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeActionSection === 'agent' ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-400 dark:text-gray-500'
                }`}
              >
                Agent
              </button>
              <button
                onClick={() => setActiveActionSection('model')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeActionSection === 'model' ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-400 dark:text-gray-500'
                }`}
              >
                Model
              </button>
            </div>

            {/* Section Content */}
            <div className="p-4">
              {activeActionSection === 'files' && (
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => { cameraInputRef.current?.click(); setIsActionSheetOpen(false); }} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 dark:bg-[#242424] hover:bg-slate-100 dark:hover:bg-[#2A2A2A] transition-all">
                    <Camera size={24} className="text-slate-600 dark:text-gray-400" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-gray-400">Camera</span>
                  </button>
                  <button onClick={() => { galleryInputRef.current?.click(); setIsActionSheetOpen(false); }} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 dark:bg-[#242424] hover:bg-slate-100 dark:hover:bg-[#2A2A2A] transition-all">
                    <ImageIcon size={24} className="text-slate-600 dark:text-gray-400" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-gray-400">Gallery</span>
                  </button>
                  <button onClick={() => { fileInputRef.current?.click(); setIsActionSheetOpen(false); }} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 dark:bg-[#242424] hover:bg-slate-100 dark:hover:bg-[#2A2A2A] transition-all">
                    <FileText size={24} className="text-slate-600 dark:text-gray-400" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-gray-400">Document</span>
                  </button>
                </div>
              )}

              {activeActionSection === 'tools' && (
                <Link href="/tools" onClick={() => setIsActionSheetOpen(false)} className="block p-4 rounded-xl bg-slate-50 dark:bg-[#242424] hover:bg-slate-100 dark:hover:bg-[#2A2A2A] transition-all text-left">
                  <div className="flex items-center gap-3">
                    <Briefcase size={24} className="text-indigo-500" />
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">Tools</div>
                      <div className="text-[10px] text-slate-500 dark:text-gray-500">Akses tools tambahan</div>
                    </div>
                  </div>
                </Link>
              )}

              {activeActionSection === 'agent' && (
                <button onClick={() => { setIsProjectModalOpen(true); setIsActionSheetOpen(false); }} className="w-full p-4 rounded-xl bg-slate-50 dark:bg-[#242424] hover:bg-slate-100 dark:hover:bg-[#2A2A2A] transition-all text-left">
                  <div className="flex items-center gap-3">
                    <Rocket size={24} className="text-indigo-500" />
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">Agent</div>
                      <div className="text-[10px] text-slate-500 dark:text-gray-500">Pilih agent workspace</div>
                    </div>
                  </div>
                </button>
              )}

              {activeActionSection === 'model' && (
                <div className="p-2 flex justify-center">
                  {modelSelector}
                </div>
              )}
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

      <div className="relative bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 rounded-[24px] p-1.5 flex items-end gap-1 focus-within:border-indigo-500/30 transition-all shadow-2xl pointer-events-auto">
        <div className="relative">
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

        <input type="file" ref={cameraInputRef} onChange={handleFileChange} className="hidden" accept="image/*" capture="environment" />
        <input type="file" ref={galleryInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.txt,.csv" />

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
          maxRows={20}
          disabled={disabled}
          placeholder="Tanya apa saja ke Dosen AI-mu..."
          className="flex-1 w-full min-w-0 bg-transparent border-none outline-none py-2.5 px-3 text-base text-slate-900 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-500 resize-none overflow-y-auto custom-scrollbar"
        />
        <div className="flex flex-col items-end gap-2 justify-end mb-1">
          <div className="flex items-center gap-1 mt-auto">
            <Link
              href="/chat/live"
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 dark:bg-white/5 text-slate-900 dark:text-white hover:scale-105 transition-all shadow-sm border border-slate-200 dark:border-white/10"
              title="Voice Call (Live)"
            >
              <div className="flex items-center gap-0.5">
                <div className="w-0.5 h-2.5 bg-current rounded-full" />
                <div className="w-0.5 h-4 bg-current rounded-full" />
                <div className="w-0.5 h-2.5 bg-current rounded-full" />
              </div>
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
    </div>
  );
}
