import { useState, useEffect } from 'react';

export default function useAuth() {
  // 1. Ambil ID langsung saat state pertama kali dibuat (hanya di browser)
  const [userId, setUserId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('eduspace_user_id');
    }
    return null;
  });

  const [user, setUser] = useState(null);
  
  // 2. Jika ID sudah ada sejak awal, isLoading langsung false
  const [isLoading, setIsLoading] = useState(!userId);

  useEffect(() => {
    let id = localStorage.getItem('eduspace_user_id');
    
    if (!id) {
      id = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('eduspace_user_id', id);
    }
    
    setUserId(id);
    setUser({ uid: id, name: 'Rais Dev' });
    setIsLoading(false);
  }, []);

  return { user, userId, isLoading };
}
