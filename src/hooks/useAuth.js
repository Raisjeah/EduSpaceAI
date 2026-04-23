'use client';

import { useState, useEffect } from 'react';
import { getSession } from '@/app/actions/authActions';

export default function useAuth() {
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const session = await getSession();
      if (session) {
        setUserId(session.uid);
        setUser(session);
      } else {
        setUserId(null);
        setUser(null);
      }
    } catch (error) {
      console.error("Gagal ambil sesi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return { user, userId, isLoading, refreshSession: fetchSession };
}
