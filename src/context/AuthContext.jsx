'use client';

import { createContext, useState, useEffect } from 'react';
import { getUser } from '@/app/actions/authActions';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const userData = await getUser();
      if (userData) {
        setUser(userData);
        setUserId(userData.uid);
      } else {
        setUser(null);
        setUserId(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const updateUserName = (newName) => {
    if (user) {
      setUser({ ...user, name: newName });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userId,
      isLoading,
      fetchUser,
      updateUserName,
      searchQuery,
      setSearchQuery,
      notification,
      setNotification,
      showNotification
    }}>
      {children}
    </AuthContext.Provider>
  );
}
