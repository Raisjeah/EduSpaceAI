'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-md transition-colors duration-200 ${
        type === 'success'
        ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400'
        : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400'
      }`}>
        {type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
        <span className="text-sm font-medium">{message}</span>
        <button onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }} className="ml-2 hover:opacity-70">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
