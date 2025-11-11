'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserCompat } from '@/hooks/useUserCompat';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUserCompat();
  const [dbUser, setDbUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeUser = async () => {
      if (clerkLoaded) {
        if (!clerkUser) {
          setIsLoading(false);
          return;
        }

        try {
          const response = await fetch(`/api/users/get-user/${clerkUser.id}`);
          if (response.ok) {
            const userData = await response.json();
            setDbUser(userData);
            
            // If first time user (no DB record), redirect to profile completion
            if (!userData) {
              router.push('/newprofile/complete');
            }
          } else {
            console.error('Failed to fetch user data');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    initializeUser();
  }, [clerkUser, clerkLoaded, router]);

  return (
    <AuthContext.Provider value={{ 
      user: dbUser, 
      clerkUser,
      isLoading,
      setDbUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 