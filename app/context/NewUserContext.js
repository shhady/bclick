'use client';

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

const NewUserContext = createContext();

const USER_STORAGE_KEY = 'bclick_new_user_data';
const USER_TIMESTAMP_KEY = 'bclick_new_user_timestamp';
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
    
    // Parse the stored data
    const parsedData = JSON.parse(userData);
    console.log('getStoredUserData - Retrieved data from storage:', parsedData);
    return parsedData;
  } catch (error) {
    console.error('Error reading from session storage:', error);
    return null;
  }
};

const storeUserData = (userData) => {
  if (typeof window === 'undefined') return;
  
  try {
    console.log('storeUserData - Storing user data in session storage');
    
    // Ensure we're storing a complete copy with all nested objects
    const dataToStore = JSON.stringify(userData);
    
    window.sessionStorage.setItem(USER_STORAGE_KEY, dataToStore);
    window.sessionStorage.setItem(USER_TIMESTAMP_KEY, Date.now().toString());
    
    // Verify storage worked by reading it back
    const storedData = window.sessionStorage.getItem(USER_STORAGE_KEY);
    if (!storedData) {
      console.error('Failed to store user data - storage is empty after setting');
    }
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

export function NewUserProvider({ children }) {
  const { isLoaded: isClerkLoaded, user: clerkUser } = useUser();
  const [newUser, setNewUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  console.log('newUser', newUser);
  // Initialize user data from storage on mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedData = getStoredUserData();
    if (storedData) {
      setNewUserState(storedData);
      setLoading(false);
    }
  }, []);

  // Function to fetch fresh user data
  const fetchUserData = useCallback(async (clerkId) => {
    if (!clerkId) {
      console.error('fetchUserData called without clerkId');
      setError('Missing user ID');
      setLoading(false);
      return;
    }
    
    console.log('Fetching user data for clerkId:', clerkId);
    setLoading(true);
    
    try {
      const response = await fetch(`/api/users/get-user/${clerkId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching user data:', errorData);
        setError(errorData.message || 'Failed to fetch user data');
        setLoading(false);
        return;
      }
      
      const userData = await response.json();
      console.log('Received user data from API:', userData);
      
      if (!userData) {
        console.error('No user data returned from API');
        setError('No user data found');
        setLoading(false);
        return;
      }
      
      // Directly set the state with the received data
      setNewUserState(userData);
      
      // Store the data in session storage
      storeUserData(userData);
      
      // Reset error state
      setError(null);
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      setError(error.message || 'An error occurred while fetching user data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to handle user changes
  const processUserChange = useCallback((user) => {
    console.log('processUserChange called with user:', user);
    
    if (!user) {
      setNewUserState(null);
      clearStoredUserData();
      setLoading(false);
      return;
    }
    
    // If we already have user data and it's the same user, don't refetch
    if (newUser && newUser.clerkId === user.id) {
      console.log('User already loaded, skipping fetch');
      setLoading(false);
      return;
    }
    
    // Fetch user data from the API
    fetchUserData(user.id);
  }, [newUser, fetchUserData]);

  // Watch for user changes including logout
  useEffect(() => {
    if (!isClerkLoaded) return;

    // Process the current user
    processUserChange(clerkUser);

    // Set up periodic background refresh
    const refreshInterval = setInterval(() => {
      if (clerkUser?.id && !loading) {
        processUserChange(clerkUser);
      }
    }, CACHE_DURATION / 2);

    return () => {
      clearInterval(refreshInterval);
      if (!clerkUser) {
        clearStoredUserData();
      }
    };
  }, [isClerkLoaded, clerkUser, loading, processUserChange]);

  // Enhanced setNewUser function with proper state management
  const setNewUser = useCallback((userData) => {
    console.log('NewUserContext setNewUser - Setting new user data:', userData);
    
    if (userData) {
      // Don't use JSON.parse/stringify as it can lose complex object references
      // Instead, set the state directly to preserve all references
      setNewUserState(userData);
      
      // For storage, we can use JSON methods since we're serializing anyway
      try {
        storeUserData(userData);
        console.log('NewUserContext setNewUser - User data stored successfully');
      } catch (error) {
        console.error('Error storing user data:', error);
      }
    } else {
      setNewUserState(null);
      clearStoredUserData();
    }
  }, []);

  // Enhanced update functions with cache management
  const updateNewUser = useCallback((updatedData) => {
    console.log('NewUserContext updateNewUser - Updating user with:', updatedData);
    
    setNewUserState((prev) => {
      if (!prev) return null;
      const newData = { ...prev, ...updatedData };
      storeUserData(newData);
      return newData;
    });
  }, []);

  // Enhanced logout function
  const logout = useCallback(() => {
    console.log('NewUserContext logout - Clearing user data');
    setNewUserState(null);
    clearStoredUserData();
    // Remove the redirect as it will be handled by Clerk's signOut
  }, []);

  // Memoized context value
  const contextValue = useMemo(() => ({
    newUser,
    setNewUser,
    updateNewUser,
    loading,
    error,
    setError,
    isRefreshing,
    logout,
    clerkUser
  }), [newUser, loading, error, isRefreshing, setNewUser, updateNewUser, logout, clerkUser]);

  return (
    <NewUserContext.Provider value={contextValue}>
      {children}
    </NewUserContext.Provider>
  );
}

export function useNewUserContext() {
  const context = useContext(NewUserContext);
  if (!context) {
    throw new Error('useNewUserContext must be used within a NewUserProvider');
  }
  return context;
} 