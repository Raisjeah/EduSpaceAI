'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ThumbsUp, ThumbsDown, Copy, Check } from 'lucide-react';
import 'katex/dist/katex.min.css';

export default function AiMessage({ content, isUser = false }) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const handleCopy = async () => {
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
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md text-white rounded-tr-none leading-relaxed transition-all">
            <div className="markdown-content prose prose-invert prose-sm max-w-none leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
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
          <div className="markdown-content prose dark:prose-invert prose-base text-base max-w-none leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-2 mt-4 ml-0.5">
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
        </div>
      </div>
    </div>
  );
}
