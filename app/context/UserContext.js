'use client';

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

const UserContext = createContext();

export function UserProvider({ children }) {
  const { isLoaded, user } = useUser(); // Clerk hook for authentication
  const [globalUser, setGlobalUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoize update functions to prevent unnecessary re-renders
  const updateRelatedUserStatus = useCallback((userId, newStatus) => {
    setGlobalUser((prev) => {
      if (!prev) return prev;
      const updatedRelatedUsers = prev.relatedUsers.map((rel) =>
        rel.user === userId ? { ...rel, status: newStatus } : rel
      );
      return { ...prev, relatedUsers: updatedRelatedUsers };
    });
  }, []);

  const updateGlobalUser = useCallback((updatedData) => {
    setGlobalUser((prev) => ({
      ...prev,
      ...updatedData,
    }));
  }, []);

  const updateGlobalOrders = useCallback((updatedOrder) => {
    setGlobalUser((prev) => {
      if (!prev) return prev;
      const updatedOrders = prev.orders.map((order) =>
        order._id === updatedOrder._id ? updatedOrder : order
      );
      return { ...prev, orders: updatedOrders };
    });
  }, []);
  
  useEffect(() => {
    const fetchUser = async () => {
      if (!isLoaded || !user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/users/get-user/${user.id}`);
        if (response.ok) {
          const userData = await response.json();
          setGlobalUser(userData);
        } else {
          setError("User not found");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [isLoaded, user]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    globalUser,
    setGlobalUser,
    updateGlobalUser,
    updateGlobalOrders,
    updateRelatedUserStatus,
    loading,
    error,
    setError,
  }), [globalUser, loading, error, updateGlobalUser, updateGlobalOrders, updateRelatedUserStatus]);

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
