import { useState, useEffect } from 'react';
import { getUser } from '@/app/actions/authActions';

export default function useAuth() {
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await getUser();
        if (userData) {
          setUserId(userData.uid);
          setUser(userData);
        } else {
          setUserId(null);
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { user, userId, isLoading };
}
