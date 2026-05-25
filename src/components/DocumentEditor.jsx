'use client';

import React, { useState, useRef, useEffect, useTransition, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderOpen, BrainCircuit, Send, MessageSquare, Sparkles, ChevronRight, FileText, Eraser, Square, Bold, Italic, List, Heading2, Strikethrough, Download, FileJson, File as FileIcon, Save, Check, Loader2 } from 'lucide-react';
import { saveDocument, updateDocument, getDocumentById } from '@/app/actions/documentActions';
import { saveChat, sendMessage } from '@/app/actions/chatActions';
import { extractFileContent } from '@/app/actions/fileActions'; // server action
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AiMessage from './AiMessage';
import ThinkingIndicator from './ThinkingIndicator';
import { useChat } from '@/context/ChatContext';
import TextareaAutosize from 'react-textarea-autosize';

// TipTap Imports
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// Export Imports
import html2pdf from 'html2pdf.js';
import { asBlob } from 'html-docx-js-typescript';
import { saveAs } from 'file-saver';

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-slate-50 dark:bg-[#1A1A1A] border-b border-slate-200 dark:border-[#333] rounded-t-[1.5rem]">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-[#2A2A2A] transition-colors ${editor.isActive('bold') ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'text-slate-600 dark:text-gray-400'}`}
        title="Bold (Ctrl+B)"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-[#2A2A2A] transition-colors ${editor.isActive('italic') ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'text-slate-600 dark:text-gray-400'}`}
        title="Italic (Ctrl+I)"
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-[#2A2A2A] transition-colors ${editor.isActive('strike') ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'text-slate-600 dark:text-gray-400'}`}
        title="Strikeout"
      >
        <Strikethrough size={16} />
      </button>
      <div className="w-[1px] bg-slate-200 dark:bg-[#333] mx-1 my-2"></div>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-[#2A2A2A] transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'text-slate-600 dark:text-gray-400'}`}
        title="Heading 2"
      >
        <Heading2 size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-[#2A2A2A] transition-colors ${editor.isActive('bulletList') ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'text-slate-600 dark:text-gray-400'}`}
        title="Bullet List"
      >
        <List size={16} />
      </button>
    </div>
  );
};

class EditorErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error("Editor Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-800/30">
          <h2 className="text-red-800 dark:text-red-400 font-bold mb-2">Terjadi Kesalahan di Editor</h2>
          <button onClick={() => window.location.reload()} className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg">Muat Ulang Halaman</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function DocumentEditor({ type, userId, docId, projectId: initialProjectId }) {
  const {
    chatData,
    setChatMessages,
    setChatStatus,
    runTypewriter,
    stopTypewriter
  } = useChat();

  const [content, setContent] = useState('');
  const [currentDocId, setCurrentDocId] = useState(docId);
  const [projectId, setProjectId] = useState(initialProjectId);
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base max-w-none focus:outline-none min-h-[400px] p-4 md:p-8 text-slate-700 dark:text-gray-300 leading-relaxed'
      }
    }
  });

  const [fileName, setFileName] = useState('Belum ada file diunggah');
  const [fileType, setFileType] = useState('text/plain');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'unsaved'

  // Chat Integration State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const [activeChatId, setActiveChatId] = useState(null);

  const currentId = useMemo(() => `editor_${type}_${userId}`, [type, userId]);
  const currentChat = chatData[currentId] || { messages: [], isThinking: false, isTyping: false };
  const messages = currentChat.messages;
  const isThinking = currentChat.isThinking;
  const isTyping = currentChat.isTyping;

  // Selection state
  const [selection, setSelection] = useState({ text: '', show: false, x: 0, y: 0 });

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const router = useRouter();
  const autoSaveTimeoutRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);

  // Load document if docId is provided
  useEffect(() => {
    if (currentDocId) {
      getDocumentById(currentDocId).then(doc => {
        if (doc) {
          setFileName(doc.fileName);
          setFileType(doc.fileType);
          setContent(doc.content);
          if (editor) editor.commands.setContent(doc.content);
        }
      });
    }
  }, [currentDocId, editor]);

  const handleSave = useCallback(async (manual = false) => {
    const currentContent = editor ? editor.getHTML() : content;
    if (!currentContent || currentContent.length < 10) return;

    setSaveStatus('saving');
    try {
      let result;
      if (currentDocId) {
        result = await updateDocument(currentDocId, fileName, fileType, currentContent, projectId);
      } else {
        result = await saveDocument(fileName, fileType, currentContent, projectId);
        if (result.success) {
          setCurrentDocId(result.id);
        }
      }

      if (result.success) {
        setSaveStatus('saved');
      } else {
        setSaveStatus('unsaved');
      }
    } catch (err) {
      console.error("Save error:", err);
      setSaveStatus('unsaved');
    }
  }, [editor, content, currentDocId, fileName, fileType, projectId]);

  // Auto-save logic
  useEffect(() => {
    if (content && content.length >= 10) {
      setSaveStatus('unsaved');
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);

      autoSaveTimeoutRef.current = setTimeout(() => {
        handleSave();
      }, 2000);
    }
    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [content, handleSave]);

  const [extractProgress, setExtractProgress] = useState(0);

  const handleFileUpload = useCallback(async (e) => {
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
        if (editor) {
          editor.commands.setContent(result.content);
        }
      } else {
        const errorMsg = `Gagal ekstrak file: ${result.error}`;
        setContent(errorMsg);
        if (editor) {
          editor.commands.setContent(errorMsg);
        }
      }
    } catch (err) {
      clearInterval(progressInterval);
      const errorMsg = `Terjadi kesalahan saat mengunggah file.`;
      setContent(errorMsg);
      if (editor) {
        editor.commands.setContent(errorMsg);
      }
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setExtractProgress(0);
      }, 500);
    }
  };

  const handleDownloadPDF = () => {
    if (!editor) return;
    const element = document.querySelector('.tiptap');
    if (!element) return;

    const opt = {
      margin: 10,
      filename: `${fileName.split('.')[0] || 'dokumen'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
  };

  const handleDownloadDocx = async () => {
    if (!editor) return;
    const htmlContent = editor.getHTML();
    // Add basic styling for docx
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;

    try {
      const blob = await asBlob(fullHtml);
      saveAs(blob, `${fileName.split('.')[0] || 'dokumen'}.docx`);
    } catch (error) {
      console.error("Error generating DOCX:", error);
    }
  };

  const handleAnalyze = useCallback(async () => {
    const currentContent = editor ? editor.getHTML() : content;
    if (!currentContent || isPending) return;

    setIsChatOpen(true);
    const chatId = currentId;

    const initialPrompt = `Tolong analisis dan berikan saran perbaikan untuk isi dokumen ini (${fileName}):\n\n${currentContent}`;

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
      formData.append('prompt', initialPrompt);
      formData.append('chatId', chatId);

      const result = await sendMessage(formData);
      if (result.success) {
        runTypewriter(chatId, result.aiResponse);
      } else {
        setChatStatus(chatId, { isThinking: false });
      }
    });
  }, [editor, content, isPending, currentId, fileName, runTypewriter, setChatMessages, setChatStatus]);

  const handleTextSelection = useCallback(() => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, ' ');

    if (text.trim()) {
      // Use getSelection API for better positioning
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Find parent container offset
        const container = document.querySelector('.tiptap-container');
        const containerRect = container?.getBoundingClientRect() || { left: 0, top: 0 };

        setSelection({
          text,
          show: true,
          x: rect.left - containerRect.left + (rect.width / 2),
          y: rect.top - containerRect.top - 40 // Adjust for toolbar height
        });
      }
    } else {
      setSelection(prev => ({ ...prev, show: false }));
    }
  }, [editor]);

  const handleFloatingAction = useCallback((actionType) => {
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

  const handleSendChat = useCallback(async (overrideInput) => {
    const textToSend = overrideInput || chatInput;
    if (!textToSend.trim() || isPending) return;

    setChatInput('');
    const chatId = currentId;

    const userMessage = {
      role: 'user',
      text: textToSend,
      _id: Date.now().toString()
    };
    setChatMessages(chatId, prev => [...prev, userMessage]);
    setChatStatus(chatId, { isThinking: true });

    startTransition(async () => {
      const formData = new FormData();
      formData.append('chatId', chatId);
      // Sertakan konten editor sebagai konteks digabung dengan prompt
      const currentContent = editor ? editor.getHTML() : content;
      formData.append('prompt', `[Konteks Editor]:\n${currentContent}\n\nPertanyaan: ${textToSend}`);

      const result = await sendMessage(formData);
      if (result.success) {
        runTypewriter(chatId, result.aiResponse);
      } else {
        setChatStatus(chatId, { isThinking: false });
      }
    });
  }, [chatInput, isPending, currentId, editor, content, runTypewriter, setChatMessages, setChatStatus]);

  return (
    <EditorErrorBoundary>
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
          <div className="flex items-center gap-2">
            {/* Save Status Indicator */}
            <div className="flex items-center gap-1.5 mr-2 px-3 py-1.5 bg-slate-50 dark:bg-black/20 rounded-lg border border-slate-200 dark:border-white/5 transition-all">
               {saveStatus === 'saving' ? (
                 <>
                   <Loader2 size={12} className="animate-spin text-indigo-500" />
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Menyimpan...</span>
                 </>
               ) : saveStatus === 'saved' ? (
                 <>
                   <Check size={12} className="text-green-500" />
                   <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Tersimpan</span>
                 </>
               ) : (
                 <>
                   <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                   <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Belum Simpan</span>
                 </>
               )}
            </div>

            <button
              onClick={() => handleSave(true)}
              className={`p-2 rounded-lg border transition-all ${saveStatus === 'unsaved' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-100 dark:bg-[#1A1A1A] border-slate-200 dark:border-[#333] text-slate-400'}`}
              title="Simpan Manual"
            >
              <Save size={18} />
            </button>

            <div className="relative group">
              <button
                className="flex items-center justify-center gap-2 bg-slate-200 dark:bg-[#242424] hover:bg-slate-300 dark:hover:bg-[#2A2A2A] text-slate-700 dark:text-gray-300 px-3 py-2 rounded-lg transition-colors text-[11px] font-bold"
              >
                <Download size={14} /> Unduh
              </button>
              <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] rounded-lg shadow-xl py-1 hidden group-hover:block z-50">
                <button
                  onClick={handleDownloadPDF}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-[11px] text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#222]"
                >
                  <FileIcon size={12} className="text-red-500" /> PDF (.pdf)
                </button>
                <button
                  onClick={handleDownloadDocx}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-[11px] text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#222]"
                >
                  <FileIcon size={12} className="text-blue-500" /> Word (.docx)
                </button>
              </div>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={!content || isPending}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors text-[11px] font-bold disabled:opacity-50 shadow-lg shadow-indigo-900/20"
            >
              <Sparkles size={14} /> <span>{isChatOpen ? 'Analisis Ulang' : 'Analisis dengan AI'}</span>
            </button>
          </div>
        </div>

        <div className="flex-1 relative flex flex-col min-h-[100dvh] h-full bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] rounded-[1.5rem] shadow-inner transition-colors">
          {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 dark:bg-[#0F0F0F]/80 backdrop-blur-sm rounded-[1.5rem] border border-indigo-500/20">
              <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-[#333] flex flex-col items-center w-[280px]">
                <ThinkingIndicator />
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
          <MenuBar editor={editor} />
          <div
            className="flex-1 overflow-y-auto custom-scrollbar tiptap-container relative"
            onMouseUp={handleTextSelection}
            onKeyUp={handleTextSelection}
          >
            <EditorContent editor={editor} />
            {!content && !isLoading && (
              <div className="absolute inset-x-0 top-32 flex flex-col items-center justify-center pointer-events-none opacity-40">
                <FileText size={48} className="text-slate-400 mb-4" />
                <p className="text-sm font-medium text-slate-500 dark:text-gray-400">
                  Isi dokumen akan muncul di sini...
                </p>
              </div>
            )}
          </div>

          {/* Floating Toolbar */}
          {selection.show && (
            <div
              className="absolute z-50 bg-white dark:bg-[#222] border border-slate-200 dark:border-[#333] rounded-xl shadow-2xl p-1 flex gap-1 animate-in fade-in zoom-in duration-200"
              style={{
                left: `${selection.x}px`,
                top: `${selection.y}px`,
                transform: `translateX(-50%) translateY(-100%)`
              }}
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
                  onApply={msg.role === 'model' ? (text) => {
                    setContent(text);
                    if (editor) editor.commands.setContent(text);
                  } : null}
                />
              ))}
            </div>
          )}
          {isThinking && (
            <ThinkingIndicator />
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
    </EditorErrorBoundary>
  );
}
