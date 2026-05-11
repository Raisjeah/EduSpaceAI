'use client';

export default function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-2 py-3">
      <div className="flex gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 animate-bounce"></div>
      </div>
      <span className="text-[11px] font-medium text-slate-400 dark:text-gray-500 animate-pulse ml-1">
        Dosen AI sedang berpikir...
      </span>
    </div>
  );
}
