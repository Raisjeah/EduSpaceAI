'use client';

export default function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-3 px-1.5 py-2">
      <div className="relative overflow-hidden rounded-md group">
        <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-indigo-400/80 bg-clip-text bg-gradient-to-r from-indigo-500 via-white to-indigo-500 bg-[length:200%_auto] animate-shimmer drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]">
          Thinking...
        </span>
        <div className="absolute inset-0 bg-indigo-400/5 blur-xl animate-pulse -z-10"></div>
      </div>
    </div>
  );
}
