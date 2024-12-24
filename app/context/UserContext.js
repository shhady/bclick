'use client';

import { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

const UserContext = createContext();

export function UserProvider({ children }) {
  const { isLoaded, user } = useUser(); // Clerk hook for authentication
  const [globalUser, setGlobalUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update the status of a related user in globalUser
  const updateRelatedUserStatus = (userId, newStatus) => {
    setGlobalUser((prev) => {
      if (!prev) return prev; // Ensure globalUser exists
      const updatedRelatedUsers = prev.relatedUsers.map((rel) =>
        rel.user === userId ? { ...rel, status: newStatus } : rel
      );
      return { ...prev, relatedUsers: updatedRelatedUsers };
    });
  };

  const updateGlobalUser = (updatedData) => {
    setGlobalUser((prev) => ({
      ...prev, // Preserve existing data
      ...updatedData, // Merge new updates
    }));
  };
  const updateGlobalOrders = (updatedOrder) => {
    setGlobalUser((prev) => {
      if (!prev) return prev; // Ensure globalUser exists
      const updatedOrders = prev.orders.map((order) =>
        order._id === updatedOrder._id ? updatedOrder : order
      );
      return { ...prev, orders: updatedOrders };
    });
  };
  
  useEffect(() => {
    const fetchUser = async () => {
      if (!isLoaded || !user) return; // Wait for Clerk to load user data

      try {
        const response = await fetch(`/api/users/get-user/${user.id}`);
        if (response.ok) {
          const userData = await response.json();
          setGlobalUser(userData); // Set user in context
        } else {
          console.log("Failed to fetch user data");
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

  return (
    <UserContext.Provider
      value={{
        globalUser,
        setGlobalUser,
        updateGlobalUser,
        updateGlobalOrders,
        updateRelatedUserStatus, // Expose the helper for updating related user status
        loading,
        error,
        setError,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  return useContext(UserContext);
}
