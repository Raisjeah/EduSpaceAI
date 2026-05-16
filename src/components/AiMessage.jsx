'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ThumbsUp, ThumbsDown, Copy, Check } from 'lucide-react';
import Mermaid from './Mermaid';
import 'katex/dist/katex.min.css';

export default function AiMessage({ content, isUser = false, isTyping = false, onApply }) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

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

  // Detect Image Payload
  let imageData = null;
  if (content.startsWith('{"type":"image"')) {
    try {
      imageData = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse image payload", e);
    }
  }

  if (isUser) {
    return (
      <div className="w-full flex justify-end">
        <div className="w-fit max-w-[85%] flex flex-row-reverse gap-4">
          <div className="p-4 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 backdrop-blur-md text-slate-800 dark:text-white rounded-tr-none leading-relaxed transition-all">
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
            <div className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg max-w-2xl">
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
        <div className="flex items-center gap-2 mt-4 ml-0.5 animate-in fade-in duration-500">
          <button
            onClick={() => { setLiked(!liked); if (!liked) setDisliked(false); }}
            className={`p-1.5 rounded-lg transition-colors ${liked ? 'text-indigo-500 bg-indigo-500/10' : 'text-slate-500 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-[#1E1E1E]'}`}
            title="Suka"
          >
            <ThumbsUp size={16} />
          </button>
          <button
            onClick={() => { setDisliked(!disliked); if (!disliked) setLiked(false); }}
            className={`p-1.5 rounded-lg transition-colors ${disliked ? 'text-indigo-500 bg-indigo-500/10' : 'text-slate-500 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-[#1E1E1E]'}`}
            title="Tidak Suka"
          >
            <ThumbsDown size={16} />
          </button>
          {!imageData && (
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-[#1E1E1E] transition-colors flex items-center gap-1.5"
              title="Salin Pesan"
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
          )}
        </div>
        )}
      </div>
    </div>
  );
}
