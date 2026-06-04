'use client';
import { useState, useEffect } from 'react';

const DEFAULT_STATES = [
  "Understanding question",
  "Retrieving context",
  "Analyzing information",
  "Building response",
  "Finalizing answer"
];

export default function useThinkingState(isThinking, customStates = null) {
  const states = customStates || DEFAULT_STATES;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isThinking) {
      setCurrentIndex(0);
      return;
    }

    // 60fps performance optimization: use standard timing but avoid heavy operations
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        // Stop automatically at the last state
        if (prev < states.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1800); // Rotate every 1.8 seconds

    return () => clearInterval(interval);
  }, [isThinking, states]);

  return {
    status: states[currentIndex],
    currentIndex,
    states
  };
}
