'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TextareaAutosize from 'react-textarea-autosize';
import { Plus, X, Camera, Image as ImageIcon, FileText, Mic, MicOff, ArrowUp, Square } from 'lucide-react';
import Link from 'next/link';
import { useLayout } from '@/context/LayoutContext';
import useGeminiLive from '@/hooks/useGeminiLive';

export default function InputBox({
  input,
  setInput,
  handleSend,
  disabled,
  selectedFile,
  setSelectedFile,
  isNewChat,
  modelSelector
}) {
  const { setIsProjectModalOpen } = useLayout();
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [showNudge, setShowNudge] = useState(false);

  // Voice Call Hook
  const { isConnected, isConnecting, toggleMute, isMuted } = useGeminiLive();

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const textareaRef = useRef(null);
  const actionSheetRef = useRef(null);

  useEffect(() => {
    if (isNewChat) {
      const timer = setTimeout(() => {
        setShowNudge(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isNewChat]);

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
      {/* Action Sheet (Upload Options) */}
      <AnimatePresence>
        {isActionSheetOpen && (
          <>
            <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsActionSheetOpen(false)} />
            <motion.div
              ref={actionSheetRef}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full left-0 mb-4 w-52 sm:w-56 max-w-[85vw] liquid-glass rounded-2xl shadow-2xl p-2 z-50"
            >
              <div className="flex flex-col gap-1">
                <button onClick={() => cameraInputRef.current?.click()} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-[#252525] rounded-xl transition-all text-left group">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
                    <Camera size={18} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-gray-200">Kamera</span>
                </button>
                <button onClick={() => galleryInputRef.current?.click()} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-[#252525] rounded-xl transition-all text-left group">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                    <ImageIcon size={18} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-gray-200">Galeri</span>
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-[#252525] rounded-xl transition-all text-left group">
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

      {/* Selected File Preview */}
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

      {/* Input Bar */}
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
              isActionSheetOpen ? 'bg-indigo-600 text-white rotate-45' : 'text-slate-400 dark:text-gray-500 hover:text-indigo-400'
            } ${showNudge && !isActionSheetOpen ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-[#0F0F0F] animate-pulse' : ''}`}
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Hidden Inputs */}
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
          placeholder="Tanya apa saja ke Dosen AI-mu..."
          className="flex-1 w-full min-w-0 bg-transparent border-none outline-none py-2.5 px-3 text-base text-slate-900 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-500 resize-none overflow-y-auto custom-scrollbar"
        />

        <div className="flex flex-col items-end gap-2">
          {/* Top Row Navigation */}
          <div className="flex items-center gap-1.5 px-2 mb-0.5">
            <Link href="/tools" className="text-[10px] font-bold text-slate-400 dark:text-gray-500 hover:text-indigo-500 transition-colors tracking-widest uppercase">TOOLS</Link>
            <div className="w-[1px] h-2.5 bg-slate-200 dark:bg-white/10" />
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="text-[10px] font-bold text-slate-400 dark:text-gray-500 hover:text-indigo-500 transition-colors tracking-widest uppercase"
            >
              AGENT
            </button>
          </div>

          {/* Bottom Row Actions */}
          <div className="flex items-center gap-1">
            {modelSelector}

            {/* Dynamic Microphone Button */}
            <Link
              href="/chat/live"
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-sm border ${
                isConnecting ? 'bg-amber-500 text-white animate-pulse' :
                isConnected ? 'bg-green-500 text-white' :
                'bg-white/5 dark:bg-white/5 text-slate-900 dark:text-white border-slate-200 dark:border-white/10 hover:scale-105'
              }`}
              title="Voice Call (Live)"
            >
              <div className="flex items-center gap-0.5">
                <div className={`w-0.5 h-2.5 bg-current rounded-full ${isConnected ? 'animate-bounce' : ''}`} />
                <div className={`w-0.5 h-4 bg-current rounded-full ${isConnected ? 'animate-bounce delay-75' : ''}`} />
                <div className={`w-0.5 h-2.5 bg-current rounded-full ${isConnected ? 'animate-bounce delay-150' : ''}`} />
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
