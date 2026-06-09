import React from 'react';

// Base styling for all skeletons
const baseStyle = "animate-pulse bg-slate-200 dark:bg-[#222] rounded-xl";

export function SkeletonCard({ className = "" }) {
  return (
    <div className={`${baseStyle} p-4 w-full h-32 ${className}`}>
      <div className="h-4 w-1/2 bg-slate-300 dark:bg-[#333] rounded mb-2"></div>
      <div className="h-3 w-3/4 bg-slate-300 dark:bg-[#333] rounded"></div>
    </div>
  );
}

export function SkeletonText({ lines = 1, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`${baseStyle} h-4 w-full last:w-4/5`}></div>
      ))}
    </div>
  );
}

export function SkeletonChatMessage({ isUser = false, className = "" }) {
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} ${className} mb-4`}>
      {!isUser && (
        <div className={`w-10 h-10 shrink-0 rounded-full mr-3 ${baseStyle}`}></div>
      )}
      <div className={`max-w-[75%] w-[400px] rounded-2xl p-4 ${baseStyle} ${isUser ? 'rounded-tr-sm bg-slate-300 dark:bg-[#333]' : 'rounded-tl-sm'}`}>
        <div className="space-y-3">
          <div className="h-3 w-full bg-slate-300 dark:bg-[#333] rounded"></div>
          <div className="h-3 w-5/6 bg-slate-300 dark:bg-[#333] rounded"></div>
          {!isUser && <div className="h-3 w-4/6 bg-slate-300 dark:bg-[#333] rounded"></div>}
        </div>
      </div>
      {isUser && (
        <div className={`w-10 h-10 shrink-0 rounded-full ml-3 ${baseStyle}`}></div>
      )}
    </div>
  );
}

export function SkeletonStatCard({ className = "" }) {
  return (
    <div className={`${baseStyle} p-6 h-40 border border-transparent shadow-sm flex flex-col justify-between ${className}`}>
      <div className="flex justify-between items-start">
        <div className="w-12 h-12 rounded-2xl bg-slate-300 dark:bg-[#333]"></div>
        <div className="w-20 h-3 rounded-full bg-slate-300 dark:bg-[#333]"></div>
      </div>
      <div className="space-y-3">
        <div className="w-16 h-8 rounded-lg bg-slate-300 dark:bg-[#333]"></div>
        <div className="w-full h-2 rounded-full bg-slate-300 dark:bg-[#333]"></div>
      </div>
    </div>
  );
}
