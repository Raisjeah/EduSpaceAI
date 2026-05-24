'use client';

export default function ChatSkeleton() {
  return (
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
  );
}
