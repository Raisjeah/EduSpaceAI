'use client';

import { useState, useEffect, useRef, useTransition, useCallback } from 'react';
import { useChat } from '@/context/ChatContext';
import { useLayout } from '@/context/LayoutContext';
import { motion, AnimatePresence } from 'framer-motion';
import TextareaAutosize from 'react-textarea-autosize';
import { ChevronDown, Plus, ArrowUp, X, FileText, Image as ImageIcon, Briefcase, Search, BookOpen, Edit3, Rocket, Camera, File, Square, Code, GraduationCap, Microscope, ArrowLeft, Mic, Menu, Terminal, Bot, Settings2, Trash2 } from 'lucide-react';
import { sendMessage, getChatDetails } from '@/app/actions/chatActions';
import { getProjectDetails } from '@/app/actions/projectActions';
import { runDeepSearchAnalyzer, runDeepSearchExtractor, runDeepSearchAnalyst, runDeepSearchWriter } from '@/app/actions/deepSearchActions';
import AiMessage from './AiMessage';
import ModernThinking from './ModernThinking';
import ModelSelector from '../shared/ModelSelector';
import FloatingOrbs from '../ui/FloatingOrbs';
import Image from 'next/image';
import useAuth from '@/hooks/useAuth';
import UpgradeModal from '../modals/UpgradeModal';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import useThinkingState from '@/hooks/useThinkingState';

// ── PERUBAHAN 1: Suggested prompts untuk home screen ──
const SUGGESTED_PROMPTS = [
  { icon: <GraduationCap size={14} />, label: 'Bantu saya memahami materi kuliah' },
  { icon: <Microscope size={14} />, label: 'Bantu susun kerangka skripsi' },
  { icon: <Edit3 size={14} />, label: 'Koreksi tulisan akademik saya' },
  { icon: <Search size={14} />, label: 'Carikan referensi terbaru' },
];
// ── END PERUBAHAN 1 ──

const AGENT_SUGGESTED_PROMPTS = {
  'deep-search': [
    { icon: <Search size={14} />, label: 'Carikan referensi terbaru tentang topik ini' },
    { icon: <Search size={14} />, label: 'Apa perkembangan terkini di bidang ini?' },
    { icon: <Search size={14} />, label: 'Cari jurnal akademik tentang AI pendidikan' },
    { icon: <Search size={14} />, label: 'Temukan data statistik terbaru' },
  ],
  researcher: [
    { icon: <BookOpen size={14} />, label: 'Bantu saya menyusun Bab 1 skripsi' },
    { icon: <BookOpen size={14} />, label: 'Jelaskan metode penelitian kualitatif' },
    { icon: <BookOpen size={14} />, label: 'Bantu buat kerangka tinjauan pustaka' },
    { icon: <BookOpen size={14} />, label: 'Apa perbedaan penelitian kualitatif vs kuantitatif?' },
  ],
  editor: [
    { icon: <Edit3 size={14} />, label: 'Koreksi paragraf ini sesuai PUEBI' },
    { icon: <Edit3 size={14} />, label: 'Parafrase kalimat ini agar lebih akademik' },
    { icon: <Edit3 size={14} />, label: 'Perbaiki struktur abstrak saya' },
    { icon: <Edit3 size={14} />, label: 'Cek konsistensi gaya penulisan' },
  ],
  visualizer: [
    { icon: <Code size={14} />, label: 'Buat diagram alur metodologi penelitian' },
    { icon: <Code size={14} />, label: 'Visualisasikan konsep machine learning' },
    { icon: <Code size={14} />, label: 'Buat diagram ER untuk database' },
    { icon: <Code size={14} />, label: 'Gambarkan alur sistem informasi' },
  ],
  citation: [
    { icon: <FileText size={14} />, label: 'Buat sitasi APA dari URL ini' },
    { icon: <FileText size={14} />, label: 'Format daftar pustaka saya' },
    { icon: <FileText size={14} />, label: 'Konversi sitasi MLA ke APA' },
    { icon: <FileText size={14} />, label: 'Buat sitasi dari DOI ini' },
  ],
};

export default function ChatView({ userId, activeChatId, projectId }) {
  const { user } = useAuth();
  const { isSidebarOpen, setIsSidebarOpen } = useLayout();
  const [greetingTime, setGreetingTime] = useState('Selamat pagi');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) {
      setGreetingTime('Selamat pagi');
    } else if (hour >= 11 && hour < 15) {
      setGreetingTime('Selamat siang');
    } else if (hour >= 15 && hour < 18) {
      setGreetingTime('Selamat sore');
    } else {
      setGreetingTime('Selamat malam');
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
  const [activeStates, setActiveStates] = useState(null);
  const [activeStateIndex, setActiveStateIndex] = useState(0);
  const [hitlData, setHitlData] = useState(null);
  const [isSimpleChat, setIsSimpleChat] = useState(false);
  const { status: dynamicStatus, states: hookStates, currentIndex: hookCurrentIndex } = useThinkingState(isThinking || isUploading, project?.agentId || 'default', activeStates);
  const [upgradeModal, setUpgradeModal] = useState({ isOpen: false, feature: '' });
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const chatEndRef = useRef(null);
  const handleSendRef = useRef(null);
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
    if (activeChatId && userId) {
      setInternalId(null);

      if (messages.length === 0) {
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
          if (handleSendRef.current) handleSendRef.current(res[res.length - 1].text, true);
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

    // Hapus default states yang membuat semua chat terlihat seperti mode agent
    setActiveStates(null);

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
      let preGeneratedResponse = null;
      
      const COMPLEXITY_MARKERS = ['sekaligus', 'lengkap dengan', 'mendalam', 'bandingkan', 'analisis mendalam', 'buatkan lengkap', 'sertakan sumber', 'dengan diagram', 'dengan sitasi', 'riset lengkap', 'cari tahu', 'terbaru', 'carikan', 'informasi tentang', 'jelaskan detail'];
      const textToAnalyze = textToSend.toLowerCase();
      const isComplex = COMPLEXITY_MARKERS.some(m => textToAnalyze.includes(m)) || textToSend.split(' ').length > 30;
      
      const isSimpleGreeting = /^(halo|hi|hai|hello|pagi|siang|sore|malam|test|tes|oy|hei|halo\s*dosen|woy)(?:\s|$)/i.test(textToAnalyze) && textToSend.length < 30 && !isComplex;
      setIsSimpleChat(isSimpleGreeting);

      const needsDeepSearch = project?.agentId === 'deep-search' || isComplex;

      // ✅ Custom orchestration for Real-time Deep Search & HITL
      if (needsDeepSearch) {
        const DEEP_SEARCH_STEPS = [
          'Agent Search Engine: Menganalisis pertanyaan...',
          'Agent Search Engine: Mencari informasi di internet...',
          'Agent Analyst: Memvalidasi & menganalisis sumber web...',
          'Agent Editor: Menulis hasil akhir & merapikan struktur...',
        ];

        try {
          setActiveStates(DEEP_SEARCH_STEPS);
          setActiveStateIndex(0);

          const { subQueries, historyContext } = await runDeepSearchAnalyzer(textToSend, currentId, user?._id?.toString());
          setActiveStateIndex(1);

          const { structuredContext, verifiedSources, citationList } = await runDeepSearchExtractor(subQueries, textToSend);
          
          // --- HITL PAUSE ---
          if (citationList && citationList.length > 0) {
            const userDecision = await new Promise((resolve) => {
              setHitlData({
                sources: citationList,
                resolve
              });
            });
            setHitlData(null);

            if (userDecision === 'stop') {
              setIsThinking(false);
              setIsUploading(false);
              setActiveStates(null);
              setActiveStateIndex(0);
              runTypewriter(currentId, "Proses pencarian telah dihentikan oleh pengguna.");
              return;
            }
          }
          // ------------------

          setActiveStateIndex(2);
          const factualContext = await runDeepSearchAnalyst(textToSend, historyContext, structuredContext, [], selectedModel);
          
          setActiveStateIndex(3);
          let finalAnswer = await runDeepSearchWriter(textToSend, historyContext, factualContext, verifiedSources, [], selectedModel);

          if (citationList && citationList.length > 0) {
            finalAnswer += "\n\n---\n\n**Sumber Referensi:**\n\n";
            citationList.forEach((cit) => {
              finalAnswer += `- [${cit.title}](${cit.url})\n`;
            });
          }

          preGeneratedResponse = finalAnswer;
        } catch (error) {
          console.error(error);
          setIsThinking(false);
          setIsUploading(false);
          setActiveStates(null);
          setActiveStateIndex(0);
          setHitlData(null);
          runTypewriter(currentId, "Maaf, terjadi kesalahan saat melakukan riset mendalam.");
          return;
        }
      }

      // ── SEND TO DB & GET RESULT ──
      const formData = new FormData();
      formData.append('prompt', textToSend);
      formData.append('modelId', selectedModel);
      if (currentId !== 'new') formData.append('chatId', currentId);
      if (projectId) formData.append('projectId', projectId);
      if (isAutoTrigger) formData.append('skipSave', 'true');
      if (fileToUpload) formData.append('file', fileToUpload);
      if (preGeneratedResponse) formData.append('preGeneratedResponse', preGeneratedResponse);
      
      let chatIdToUse = currentId;
      if (currentId === 'new') {
        chatIdToUse = `chat_${Date.now()}`;
        formData.append('chatId', chatIdToUse);
      }
      
      try {
        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          setChatStatus(chatIdToUse, { isThinking: false });
          
          const errorMsg = errorData.error || "";
          if (errorMsg.includes('Batas') || errorMsg.includes('Premium')) {
            setUpgradeModal({ 
              isOpen: true, 
              feature: errorMsg.includes('Batas') ? 'Limit Pesan' : 'Fitur Premium' 
            });
            setMessages(prev => prev.slice(0, -1));
          } else {
            runTypewriter(chatIdToUse, errorMsg || "Maaf, terjadi kesalahan.");
          }
          return;
        }

        if (!activeChatId && currentId === 'new') {
          migrateNewChatToId(chatIdToUse);
          setInternalId(chatIdToUse);
          const targetUrl = projectId
            ? `/chat/${chatIdToUse}?projectId=${projectId}`
            : `/chat/${chatIdToUse}`;
          router.replace(targetUrl, { scroll: false });
        }

        setChatStatus(chatIdToUse, { isThinking: false });
        setIsUploading(false);
        setActiveStates(null);
        setActiveStateIndex(0);

        setChatStatus(chatIdToUse, { isTyping: true });
        const aiMessageId = (Date.now() + 1).toString();
        
        setChatMessages(chatIdToUse, prev => [...prev, {
          role: 'model',
          text: '',
          _id: aiMessageId
        }]);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let fullText = '';

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            const chunkValue = decoder.decode(value, { stream: true });
            fullText += chunkValue;
            setChatMessages(chatIdToUse, prev => prev.map(m =>
              m._id === aiMessageId ? { ...m, text: fullText } : m
            ));
          }
        }
        
        setChatStatus(chatIdToUse, { isTyping: false });
        
      } catch (error) {
        console.error("sendMessage error:", error);
        setChatStatus(chatIdToUse, { isThinking: false });
        runTypewriter(chatIdToUse, "⚠️ Terjadi kesalahan jaringan. Gagal menghubungi server.");
      } finally {
        setIsUploading(false);
        setActiveStates(null);
        setActiveStateIndex(0);
      }
    });
  };

  useEffect(() => {
    handleSendRef.current = handleSend;
  }, [handleSend]);

  const getAgentIcon = (agentId) => {
    switch (agentId) {
      case 'deep-search': return <Search size={16} className="text-blue-400" />;
      case 'researcher': return <BookOpen size={16} className="text-green-400" />;
      case 'editor': return <Edit3 size={16} className="text-amber-400" />;
      case 'visualizer': return <Code size={16} className="text-purple-400" />;
      case 'citation': return <FileText size={16} className="text-rose-400" />;
      default: return <Rocket size={16} className="text-indigo-400" />;
    }
  };

  const getAgentName = (agentId) => {
    switch (agentId) {
      case 'deep-search': return 'Deep Search Agent';
      case 'researcher': return 'Profesor Riset';
      case 'editor': return 'Editor Akademik';
      case 'visualizer': return 'Visual Concept Mapper';
      case 'citation': return 'Citation Generator';
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
      case 'visualizer': return {
        bg: 'bg-purple-50 dark:bg-purple-900/10',
        border: 'border-purple-200 dark:border-purple-800/30',
        accent: 'bg-purple-500',
        text: 'text-purple-600 dark:text-purple-400'
      };
      case 'citation': return {
        bg: 'bg-rose-50 dark:bg-rose-900/10',
        border: 'border-rose-200 dark:border-rose-800/30',
        accent: 'bg-rose-500',
        text: 'text-rose-600 dark:text-rose-400'
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
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!chatContainerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;

      setIsHeaderScrolled(scrollTop > 20);
    };

    const currentRef = chatContainerRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    }
    return () => {
      if (currentRef) currentRef.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
          <div className="flex items-center gap-1 md:gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`md:hidden p-2 rounded-lg hover:bg-white/50 dark:hover:bg-black/20 ${agentTheme.text} transition-all pointer-events-auto`}
              aria-label={isSidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'}
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
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
              <div className={`w-16 h-16 bg-white dark:bg-[#151515] rounded-2xl flex items-center justify-center mb-3 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-white/5 overflow-hidden ${project ? agentTheme.text : ''}`}>
                {project ? (
                  <div className="scale-150 opacity-80">{getAgentIcon(project.agentId)}</div>
                ) : (
                  <Image
                    src="/logo.png"
                    alt="EduSpaceAI Logo"
                    width={40}
                    height={40}
                    className="object-contain invert dark:invert-0"
                  />
                )}
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {project ? project.name : 'EduSpaceAI'}
              </h1>
              <div className="text-slate-500 dark:text-gray-500 text-sm max-w-sm font-medium h-10 px-2">
                {project ? (
                  <LoopingTypewriter 
                    baseText={`Halo ${user?.name ? user.name.split(' ')[0] : 'Sobat'} 👋, saya ${getAgentName(project.agentId)},`} 
                    dynamicTexts={["siap membantu proyek ini!", "apa yang ingin Anda teliti?", "mari kita kerjakan!"]} 
                  />
                ) : (
                  <LoopingTypewriter 
                    baseText={`${greetingTime} ${user?.name ? user.name.split(' ')[0] : 'Sobat'} 👋,`} 
                    dynamicTexts={["ada yang bisa aku bantu?", "mari mulai risetmu!", "butuh referensi jurnal?", "yuk cek skripsimu!"]} 
                  />
                )}
              </div>
            </div>

            {/* Suggested Prompts */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 w-full max-w-sm">
              {(project ? (AGENT_SUGGESTED_PROMPTS[project.agentId] || SUGGESTED_PROMPTS) : SUGGESTED_PROMPTS).map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInput(prompt.label)}
                  className={`flex items-start gap-2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.07] hover:border-indigo-400/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all text-left group`}
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
                  isTyping={idx === messages.length - 1 && isTyping} 
                  isLast={idx === messages.length - 1}
                  agentId={project?.agentId}
                  onRegenerate={idx === messages.length - 1 && msg.role === 'model' ? () => {
                    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
                    if (lastUserMsg) handleSend(lastUserMsg.text, false);
                  } : undefined}
                />
              ))}
              {(isThinking || isUploading) && (
                <div className="px-1 flex flex-col gap-1.5 mt-2">
                  <ModernThinking
                    status={dynamicStatus}
                    states={activeStates || hookStates}
                    currentIndex={activeStates ? activeStateIndex : hookCurrentIndex}
                    agentId={activeStates ? 'deep-search' : (project?.agentId || 'default')}
                    isDone={false}
                    mode={(!isSimpleChat && ((project?.agentId && project.agentId !== 'default') || activeStates || hitlData)) ? 'agent' : 'simple'}
                    hitlData={hitlData}
                    onHitlAction={(action) => {
                       if (hitlData && hitlData.resolve) {
                         hitlData.resolve(action);
                       }
                    }}
                  />
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
        className={`fixed bottom-0 right-0 p-3 sm:p-4 md:p-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-[max(1.5rem,env(safe-area-inset-bottom))] transition-all duration-300 z-30 ${
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
                  aria-label="Berhenti menghasilkan jawaban"
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
            agentTheme={agentTheme}
            placeholder={project ? `Tanya apa saja ke ${getAgentName(project.agentId)}...` : "Tanya apa saja ke Dosen AI-mu..."}
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

function LoopingTypewriter({ baseText, dynamicTexts }) {
  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer;
    const currentFullText = dynamicTexts[textIndex];
    
    if (isDeleting) {
      if (displayText.length > 0) {
        timer = setTimeout(() => setDisplayText(prev => prev.slice(0, -1)), 30);
      } else {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % dynamicTexts.length);
      }
    } else {
      if (displayText.length < currentFullText.length) {
        timer = setTimeout(() => setDisplayText(currentFullText.slice(0, displayText.length + 1)), 60);
      } else {
        timer = setTimeout(() => setIsDeleting(true), 2500);
      }
    }
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, textIndex, dynamicTexts]);

  return (
    <span className="inline-flex min-h-[1.5em]">
      <span>{baseText} </span>
      <span className="font-semibold text-indigo-500 ml-1">{displayText}</span>
      <span className="animate-pulse text-indigo-500 font-bold ml-[1px]">|</span>
    </span>
  );
}

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

function InputBox({ input, setInput, handleSend, disabled, selectedFile, setSelectedFile, isNewChat, modelSelector, placeholder, agentTheme }) {
  const { setIsProjectModalOpen } = useLayout();
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
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

      <div className={`relative bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 rounded-[24px] p-1.5 flex items-end gap-1 transition-all shadow-2xl pointer-events-auto group-focus-within:border-transparent ${agentTheme ? `focus-within:border-transparent focus-within:ring-2 focus-within:${agentTheme.border.replace('border-', 'ring-').split(' ')[0]}` : 'focus-within:ring-2 focus-within:ring-indigo-500/30'}`}>
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
          maxRows={8}
          disabled={disabled}
          placeholder={placeholder || "Tanya apa saja ke Dosen AI-mu..."}
          className="flex-1 w-full min-w-0 bg-transparent border-none outline-none py-2.5 px-3 text-base text-slate-900 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-500 resize-none overflow-y-auto custom-scrollbar"
        />
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-0.5 px-1">
            <Link
              href="/tools"
              className="inline-flex items-center justify-center min-h-[36px] px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-gray-500 hover:text-indigo-500 hover:bg-indigo-500/5 rounded-lg transition-all tracking-widest uppercase"
              aria-label="Buka halaman Tools"
            >
              Tools
            </Link>
            <div className="w-[1px] h-3 bg-slate-200 dark:bg-white/10 mx-0.5" />
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="inline-flex items-center justify-center min-h-[36px] px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-gray-500 hover:text-indigo-500 hover:bg-indigo-500/5 rounded-lg transition-all tracking-widest uppercase"
              aria-label="Buat Agent Workspace baru"
            >
              Agent
            </button>
          </div>
          <div className="flex items-center gap-1">
            {modelSelector}
            <Link
              href="/chat/live"
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 dark:bg-white/5 text-slate-900 dark:text-white hover:scale-105 transition-all shadow-sm border border-slate-200 dark:border-white/10"
              title="Voice Call (Live)"
              aria-label="Buka Voice Call Live"
            >
              <div className="flex items-center gap-0.5">
                <div className="w-0.5 h-2.5 bg-current rounded-full" />
                <div className="w-0.5 h-4 bg-current rounded-full" />
                <div className="w-0.5 h-2.5 bg-current rounded-full" />
              </div>
            </Link>
            <button
            onClick={input.trim() || selectedFile ? handleSend : undefined}
            disabled={disabled || (!input.trim() && !selectedFile)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all shrink-0 ${
              input.trim() || selectedFile
                ? (agentTheme ? `${agentTheme.accent.replace('bg-', 'bg-').split(' ')[0]} text-white` : 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700 hover:scale-105')
                : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-gray-600'
            }`}
            aria-label="Kirim pesan"
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
