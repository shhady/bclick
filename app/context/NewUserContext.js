'use client';

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

const NewUserContext = createContext();

const USER_STORAGE_KEY = 'bclick_new_user_data';
const USER_TIMESTAMP_KEY = 'bclick_new_user_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const FAILED_REQUEST_KEY = 'bclick_failed_requests';
const MAX_RETRIES = 3; // Maximum number of retries

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
    return parsedData;
  } catch (error) {
    console.error('Error reading from session storage:', error);
    return null;
  }
};

const storeUserData = (userData) => {
  if (typeof window === 'undefined') return;
  
  try {
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

// Track failed requests to avoid repeated failures
const getFailedRequests = () => {
  if (typeof window === 'undefined') return {};
  
  try {
    const failedData = window.sessionStorage.getItem(FAILED_REQUEST_KEY);
    return failedData ? JSON.parse(failedData) : {};
  } catch (error) {
    console.error('Error reading failed requests:', error);
    return {};
  }
};

const updateFailedRequest = (userId, increment = true) => {
  if (typeof window === 'undefined') return;
  
  try {
    const failedRequests = getFailedRequests();
    
    if (increment) {
      // Add or increment retry count
      failedRequests[userId] = {
        count: (failedRequests[userId]?.count || 0) + 1,
        timestamp: Date.now()
      };
    } else {
      // Reset on success
      delete failedRequests[userId];
    }
    
    window.sessionStorage.setItem(FAILED_REQUEST_KEY, JSON.stringify(failedRequests));
  } catch (error) {
    console.error('Error updating failed requests:', error);
  }
};

export function NewUserProvider({ children }) {
  const { isLoaded: isClerkLoaded, user: clerkUser } = useUser();
  const [newUser, setNewUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    
    // Check if this request has failed too many times
    const failedRequests = getFailedRequests();
    const failedRequest = failedRequests[clerkId];
    
    if (failedRequest) {
      // If we've tried too many times, back off
      if (failedRequest.count >= MAX_RETRIES) {
        const backoffTime = 60 * 1000; // 1 minute
        const elapsed = Date.now() - failedRequest.timestamp;
        
        if (elapsed < backoffTime) {
          console.warn(`Backing off fetch for user ${clerkId} - too many failed attempts`);
          setLoading(false);
          return;
        }
        
        // Reset count after backoff period
        failedRequest.count = 0;
      }
    }
    
    setLoading(true);
    console.log(`Fetching user data for ${clerkId}...`);
    
    try {
      const response = await fetch(`/api/users/get-user/${clerkId}`);
      
      if (response.status === 404) {
        console.error(`User not found in database: ${clerkId}`);
        updateFailedRequest(clerkId);
        setError('User not found in the database. Please contact support.');
        setLoading(false);
        return;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText || 'Unknown error' };
        }
        
        console.error('Error fetching user data:', errorData);
        updateFailedRequest(clerkId);
        setError(errorData.message || `Failed to fetch user data: ${response.status}`);
        setLoading(false);
        return;
      }
      
      const userData = await response.json();
      
      if (!userData) {
        console.error('No user data returned from API');
        updateFailedRequest(clerkId);
        setError('No user data found');
        setLoading(false);
        return;
      }
      
      // Reset failed request count on success
      updateFailedRequest(clerkId, false);
      
      // Directly set the state with the received data
      setNewUserState(userData);
      
      // Store the data in session storage
      storeUserData(userData);
      
      // Reset error state
      setError(null);
      console.log(`Successfully fetched user data for ${clerkId}`);
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      updateFailedRequest(clerkId);
      setError(error.message || 'An error occurred while fetching user data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to handle user changes
  const processUserChange = useCallback((user) => {
    if (!user) {
      setNewUserState(null);
      clearStoredUserData();
      setLoading(false);
      return;
    }
    
    // If we already have user data and it's the same user, don't refetch
    if (newUser && newUser.clerkId === user.id) {
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

    // Set up periodic background refresh with better error handling
    const refreshInterval = setInterval(() => {
      // Only refresh if:
      // 1. We have a logged in user
      // 2. We're not currently loading data
      // 3. There are no active errors OR it's been at least 1 minute since the last retry
      if (clerkUser?.id && !loading) {
        const shouldRetryDespiteError = error && 
          getFailedRequests()[clerkUser.id]?.timestamp && 
          (Date.now() - getFailedRequests()[clerkUser.id].timestamp) > 60000;
        
        if (!error || shouldRetryDespiteError) {
          processUserChange(clerkUser);
        }
      }
    }, CACHE_DURATION / 2);

    return () => {
      clearInterval(refreshInterval);
      if (!clerkUser) {
        clearStoredUserData();
      }
    };
  }, [isClerkLoaded, clerkUser, loading, processUserChange, error]);

  // Enhanced setNewUser function with proper state management
  const setNewUser = useCallback((userData) => {
    if (userData) {
      // Don't use JSON.parse/stringify as it can lose complex object references
      // Instead, set the state directly to preserve all references
      setNewUserState(userData);
      
      // For storage, we can use JSON methods since we're serializing anyway
      try {
        storeUserData(userData);
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
    setNewUserState((prev) => {
      if (!prev) return null;
      const newData = { ...prev, ...updatedData };
      storeUserData(newData);
      return newData;
    });
  }, []);

  // Enhanced logout function
  const logout = useCallback(() => {
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