import { useState, useEffect } from 'react';

export default function useAuth() {
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Simulasi autentikasi anonim dengan localStorage
    let id = localStorage.getItem('eduspace_user_id');
    if (!id) {
      id = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('eduspace_user_id', id);
    }
    setUserId(id);
    setUser({ uid: id, name: 'Rais Dev' });
  }, []);

  return { user, userId };
}
