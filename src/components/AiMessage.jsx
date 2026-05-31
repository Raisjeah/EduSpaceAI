'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ThumbsUp, ThumbsDown, Copy, Check, Volume2, Loader2, StopCircle } from 'lucide-react';
import Mermaid from './Mermaid';
import 'katex/dist/katex.min.css';

export default function AiMessage({ content, isUser = false, isTyping = false, onApply }) {
  // Detect Image Payload early to avoid ReferenceError in helper functions
  let imageData = null;
  if (content && typeof content === 'string' && content.startsWith('{"type":"image"')) {
    try {
      imageData = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse image payload", e);
    }
  }

  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);

  const cleanupAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  const handleReadAloud = async () => {
    if (isPlaying) {
      cleanupAudio();
      setIsPlaying(false);
      return;
    }

    try {
      setIsLoadingAudio(true);
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: content }),
      });

      if (!response.ok) {
        throw new Error('Gagal memproses audio');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      cleanupAudio();
      audioUrlRef.current = audioUrl;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsPlaying(true);
        setIsLoadingAudio(false);
      };

      audio.onended = () => {
        setIsPlaying(false);
        cleanupAudio();
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setIsLoadingAudio(false);
        cleanupAudio();
        console.error('Audio playback error');
      };

      await audio.play();
    } catch (error) {
      console.error('Error reading aloud:', error);
      setIsLoadingAudio(false);
      setIsPlaying(false);
      cleanupAudio();
    }
  };

  const handleCopy = async () => {
    if (imageData) return; // Can't copy image as text
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Gagal menyalin teks: ', err);
    }
  };

  if (isUser) {
    return (
      <div className="w-full flex justify-end">
        <div className="w-fit max-w-[85%] flex flex-row-reverse gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/10 backdrop-blur-xl border border-white/20 text-slate-800 dark:text-white rounded-tr-none leading-relaxed transition-all shadow-lg">
            <div className="markdown-content prose dark:prose-invert prose-sm max-w-none leading-relaxed prose-p:my-1 prose-headings:mb-2 prose-headings:mt-4">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match && match[1] === 'mermaid' ? (
                      <Mermaid chart={String(children).replace(/\n$/, '')} />
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-start">
      <div className="w-full max-w-none flex flex-col">
        <div className="py-6 w-full leading-relaxed transition-all">
          {imageData ? (
            <div className="relative group rounded-2xl overflow-hidden liquid-glass shadow-2xl max-w-2xl">
              <img
                src={`data:${imageData.mimeType};base64,${imageData.base64Data}`}
                alt="AI Generated"
                className="w-full h-auto object-contain animate-in fade-in zoom-in duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = `data:${imageData.mimeType};base64,${imageData.base64Data}`;
                    link.download = `ai-generated-${Date.now()}.jpg`;
                    link.click();
                  }}
                  className="px-4 py-2 bg-white text-black text-xs font-bold rounded-full hover:scale-105 transition-transform"
                >
                  Unduh Gambar
                </button>
              </div>
            </div>
          ) : (
            <div className="markdown-content prose dark:prose-invert prose-base text-base max-w-none leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match && match[1] === 'mermaid' ? (
                      <Mermaid chart={String(children).replace(/\n$/, '')} />
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Action Bar - Only show when not typing */}
        {!isTyping && (
        <div className="flex items-center gap-2 mt-4 ml-0.5 animate-in fade-in duration-500" aria-label="Aksi pesan">
          <button
            onClick={() => { setLiked(!liked); if (!liked) setDisliked(false); }}
            className={`p-2.5 md:p-1.5 rounded-lg transition-all ${liked ? 'text-indigo-500 bg-indigo-500/20 border border-indigo-500/30' : 'text-slate-500 hover:text-indigo-500 hover:bg-white/10 border border-transparent'}`}
            title="Suka"
            aria-label="Suka pesan ini"
            aria-pressed={liked}
          >
            <ThumbsUp size={18} className="md:w-4 md:h-4" />
          </button>
          <button
            onClick={() => { setDisliked(!disliked); if (!disliked) setLiked(false); }}
            className={`p-2.5 md:p-1.5 rounded-lg transition-all ${disliked ? 'text-indigo-500 bg-indigo-500/20 border border-indigo-500/30' : 'text-slate-500 hover:text-indigo-500 hover:bg-white/10 border border-transparent'}`}
            title="Tidak Suka"
            aria-label="Tidak suka pesan ini"
            aria-pressed={disliked}
          >
            <ThumbsDown size={18} className="md:w-4 md:h-4" />
          </button>
          {!imageData && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-2.5 md:p-1.5 rounded-lg text-slate-500 hover:text-indigo-500 hover:bg-white/10 border border-transparent transition-all flex items-center gap-1.5"
                title="Salin Pesan"
                aria-label="Salin teks pesan"
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-green-500" />
                    <span className="text-[10px] font-medium text-green-500">Tersalin!</span>
                  </>
                ) : (
                  <Copy size={16} />
                )}
              </button>

              <button
                onClick={handleReadAloud}
                disabled={isLoadingAudio}
                className={`p-2.5 md:p-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  isPlaying
                    ? 'text-indigo-500 bg-indigo-500/20 border border-indigo-500/30'
                    : 'text-slate-500 hover:text-indigo-500 hover:bg-white/10 border border-transparent'
                }`}
                title={isPlaying ? "Berhenti" : "Dengarkan"}
                aria-label={isPlaying ? "Berhenti mendengarkan" : "Dengarkan pesan ini"}
              >
                {isLoadingAudio ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : isPlaying ? (
                  <StopCircle size={16} />
                ) : (
                  <Volume2 size={16} />
                )}
              </button>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
