"use client";

import { useLiveCall } from '@/context/LiveCallContext';

/**
 * useGeminiLive Hook (Wrapper)
 * Now consumes LiveCallContext to provide shared state across components.
 */
export default function useGeminiLive() {
  return useLiveCall();
}
