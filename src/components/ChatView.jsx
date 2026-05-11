'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { ChevronDown, Plus, Send, X, FileText, Image as ImageIcon, Briefcase, Search, BookOpen, Edit3, Rocket } from 'lucide-react';
import { sendMessage, getChatDetails } from '@/app/actions/chatActions';
import { getProjectDetails } from '@/app/actions/projectActions';
import AiMessage from './AiMessage';
import ThinkingIndicator from './ThinkingIndicator';
import ModelSelector from './ModelSelector';
import useAuth from '@/hooks/useAuth';
import UpgradeModal from './UpgradeModal';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Cache untuk transisi dari chat kosong ke chatID baru
// Membantu menghindari flash "Memuat percakapan..." dan menjaga typewriter effect
let chatCache = null;

export default function ChatView({ userId, activeChatId, projectId }) {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [messages, setMessages] = useState(() => {
    if (chatCache && chatCache.chatId === activeChatId) {
      return chatCache.messages;
    }
    return [];
  });
  const [project, setProject] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [isThinking, setIsThinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [thoughtTraces, setThoughtTraces] = useState([]);
  const [upgradeModal, setUpgradeModal] = useState({ isOpen: false, feature: '' });
  const [isLoadingChat, setIsLoadingChat] = useState(() => {
    if (chatCache && chatCache.chatId === activeChatId) {
      return false;
    }
    return !!activeChatId;
  });
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
      // Jika ada di cache, berarti baru saja redirect dari chat baru
      if (chatCache && chatCache.chatId === activeChatId) {
        const cachedResponse = chatCache.aiResponse;
        chatCache = null; // Clear cache
        runTypewriter(cachedResponse);
        return;
      }

      setIsLoadingChat(true);
      setMessages([]); // Clear messages immediately to avoid ghosting

      getChatDetails(activeChatId, userId).then(res => {
        setMessages(res);
        setIsLoadingChat(false);

        // Jika dari mode analisa, trigger AI untuk pesan terakhir
        if (isAnalyzing && res.length > 0 && res[res.length - 1].role === 'user') {
          handleSend(res[res.length - 1].text, true);
        }
      });
    } else if (!activeChatId) {
      setMessages([]);
      setIsLoadingChat(false);
    }
  }, [activeChatId, userId, isAnalyzing]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);

  const runTypewriter = (fullResponse) => {
    const aiMessageId = (Date.now() + 1).toString();

    // Matikan animasi thinking tepat saat teks AI akan muncul
    setIsThinking(false);
    setIsTyping(true);

    // Inisialisasi pesan AI kosong
    setMessages(prev => [...prev, {
      role: 'model',
      text: '',
      _id: aiMessageId
    }]);

    // Simulasi kata demi kata
    const words = fullResponse.split(' ');
    let currentText = '';
    let wordIndex = 0;

    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        currentText += (wordIndex === 0 ? '' : ' ') + words[wordIndex];
        setMessages(prev => prev.map(m =>
          m._id === aiMessageId ? { ...m, text: currentText } : m
        ));
        wordIndex++;
        // Scroll to bottom as text grows
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 30); // Kecepatan munculnya kata
  };

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
          // Simpan hasil ke cache agar saat redirect (halaman remount),
          // data tidak hilang dan tidak flash loading
          chatCache = {
            chatId: result.chatId,
            messages: [...messages, {
              role: 'user',
              text: textToSend || (fileToUpload ? `[File: ${fileToUpload.name}]` : ''),
              _id: Date.now().toString()
            }],
            aiResponse: result.aiResponse,
            projectId: projectId
          };

          const targetUrl = projectId
            ? `/chat/${result.chatId}?projectId=${projectId}`
            : `/chat/${result.chatId}`;

          router.push(targetUrl, { scroll: false });
          return; // Biarkan instansi baru yang menangani typewriter
        }

        // --- TYPEWRITER EFFECT ---
        runTypewriter(result.aiResponse);
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
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

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
      setSelectedFile(file);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {selectedFile && (
        <div className="flex items-center gap-2 mb-2 ml-2 p-2 bg-slate-100 dark:bg-[#2A2A2A] rounded-xl w-fit border border-indigo-500/30 transition-colors">
          {selectedFile.type.startsWith('image/') ? (
            <ImageIcon size={16} className="text-indigo-400" />
          ) : (
            <FileText size={16} className="text-indigo-400" />
          )}
          <span className="text-[11px] text-slate-600 dark:text-gray-300 truncate max-w-[150px]">{selectedFile.name}</span>
          <button
            onClick={() => setSelectedFile(null)}
            className="hover:text-red-400 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}
      <div className="relative bg-slate-100 dark:bg-[#1E1E1E] rounded-2xl p-2 flex items-end gap-1 border border-slate-200 dark:border-[#2A2A2A] focus-within:border-indigo-500/50 transition-all shadow-2xl">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-10 h-10 flex items-center justify-center text-slate-400 dark:text-gray-500 hover:text-indigo-400 transition-colors shrink-0"
        >
          <Plus size={20} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt,.csv"
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
