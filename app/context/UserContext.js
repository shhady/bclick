'use client';

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

const UserContext = createContext();

const USER_STORAGE_KEY = 'bclick_user_data';
const USER_TIMESTAMP_KEY = 'bclick_user_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const getStoredUserData = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = window.sessionStorage.getItem(USER_STORAGE_KEY);
    const timestamp = window.sessionStorage.getItem(USER_TIMESTAMP_KEY);
    
    if (!userData || !timestamp) return null;
    
    // Check if cache is still valid
    const isExpired = Date.now() - Number(timestamp) > CACHE_DURATION;
    if (isExpired) {
      window.sessionStorage.removeItem(USER_STORAGE_KEY);
      window.sessionStorage.removeItem(USER_TIMESTAMP_KEY);
      return null;
    }
    
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error reading from session storage:', error);
    return null;
  }
};

const storeUserData = (userData) => {
  if (typeof window === 'undefined') return;
  
  try {
    window.sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    window.sessionStorage.setItem(USER_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error writing to session storage:', error);
  }
};

const clearStoredUserData = () => {
  if (typeof window === 'undefined') return;
  
  try {
    window.sessionStorage.removeItem(USER_STORAGE_KEY);
    window.sessionStorage.removeItem(USER_TIMESTAMP_KEY);
  } catch (error) {
    console.error('Error clearing session storage:', error);
  }
};

export function UserProvider({ children }) {
  const { isLoaded: isClerkLoaded, user: clerkUser } = useUser();
  const [globalUser, setGlobalUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize user data from storage on mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedData = getStoredUserData();
    if (storedData) {
      setGlobalUser(storedData);
      setLoading(false);
    }
  }, []);

  // Function to fetch fresh user data
  const fetchUserData = useCallback(async (clerkId) => {
    if (!clerkId) return null;

    try {
      setIsRefreshing(true);
      const response = await fetch(`/api/users/get-user/${clerkId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user data');
      }
      
      const userData = await response.json();
      setGlobalUser(userData);
      storeUserData(userData);
      setError(null);
      return userData;
    } catch (err) {
      console.error("Error fetching user:", err);
      setError(err.message || "Failed to fetch user data");
      return null;
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Watch for user changes including logout
  useEffect(() => {
    if (!isClerkLoaded) return;

    const handleUserChange = async () => {
      setLoading(true);

      if (!clerkUser) {
        setGlobalUser(null);
        clearStoredUserData();
        setLoading(false);
        return;
      }

      const storedData = getStoredUserData();
      if (storedData && storedData.clerkId === clerkUser.id) {
        setGlobalUser(storedData);
        // Refresh in background
        fetchUserData(clerkUser.id);
      } else {
        await fetchUserData(clerkUser.id);
      }
      
      setLoading(false);
    };

    handleUserChange();

    // Set up periodic background refresh
    const refreshInterval = setInterval(() => {
      if (clerkUser?.id && !loading) {
        fetchUserData(clerkUser.id);
      }
    }, CACHE_DURATION / 2);

    return () => {
      clearInterval(refreshInterval);
      if (!clerkUser) {
        clearStoredUserData();
      }
    };
  }, [isClerkLoaded, clerkUser, fetchUserData, loading]);

  // Enhanced update functions with cache management
  const updateGlobalUser = useCallback((updatedData) => {
    setGlobalUser((prev) => {
      if (!prev) return null;
      const newData = { ...prev, ...updatedData };
      storeUserData(newData);
      return newData;
    });
  }, []);

  const updateRelatedUserStatus = useCallback((userId, newStatus) => {
    setGlobalUser((prev) => {
      if (!prev) return null;
      const updatedRelatedUsers = prev.relatedUsers.map((rel) =>
        rel.user === userId ? { ...rel, status: newStatus } : rel
      );
      const newData = { ...prev, relatedUsers: updatedRelatedUsers };
      storeUserData(newData);
      return newData;
    });
  }, []);

  const updateGlobalOrders = useCallback((updatedOrder) => {
    setGlobalUser((prev) => {
      if (!prev) return null;
      const updatedOrders = prev.orders.map((order) =>
        order._id === updatedOrder._id ? updatedOrder : order
      );
      const newData = { ...prev, orders: updatedOrders };
      storeUserData(newData);
      return newData;
    });
  }, []);

  // Enhanced logout function
  const logout = useCallback(() => {
    setGlobalUser(null);
    clearStoredUserData();
    window.location.href = '/';
  }, []);

  // Memoized context value
  const contextValue = useMemo(() => ({
    globalUser,
    setGlobalUser: (userData) => {
      if (userData) {
        setGlobalUser(userData);
        storeUserData(userData);
      } else {
        setGlobalUser(null);
        clearStoredUserData();
      }
    },
    updateGlobalUser,
    updateGlobalOrders,
    updateRelatedUserStatus,
    loading,
    error,
    setError,
    isRefreshing,
    logout
  }), [globalUser, loading, error, isRefreshing, updateGlobalUser, updateGlobalOrders, updateRelatedUserStatus, logout]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}
