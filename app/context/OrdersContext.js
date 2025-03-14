'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNewUserContext } from './NewUserContext';

const OrdersContext = createContext();

const DEBUG = true;

export function OrdersProvider({ children }) {
  const { newUser, updateNewUser } = useNewUserContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const logDebug = (...args) => {
    if (DEBUG) {
      console.log('[OrdersContext]', ...args);
    }
  };

  // Initialize orders from newUser when available
  useEffect(() => {
    if (newUser && newUser.orders && Array.isArray(newUser.orders) && !initialized) {
      console.log('Initializing orders from newUser context');
      setOrders(newUser.orders);
      setLoading(false);
      setInitialized(true);
    }
  }, [newUser, initialized]);

  // Function to update an order's status
  const updateOrderStatus = useCallback(async (orderId, newStatus, note = '') => {
    try {
      logDebug(`Updating order ${orderId} to status ${newStatus}`);
      
      // Find the original order
      const originalOrder = orders.find(order => order._id === orderId);
      if (!originalOrder) {
        console.error(`Order ${orderId} not found in state`);
        throw new Error('Order not found');
      }
      
      const originalStatus = originalOrder.status;
      logDebug(`Original status: ${originalStatus}, updating to: ${newStatus}`);
      
      // Optimistically update the local state
      setOrders(prevOrders => {
        const updatedOrders = prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus }
            : order
        );
        logDebug(`Optimistically updated orders state, new length: ${updatedOrders.length}`);
        return updatedOrders;
      });
      
      // Make the API call
      logDebug('Making API call to update order status');
      const response = await fetch('/api/orders/update-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          note: note || `סטטוס הזמנה עודכן ל${
            newStatus === 'approved' ? 'הושלם' : 
            newStatus === 'processing' ? 'בטיפול' : 'נדחה'
          }`,
          userId: newUser._id,
          userRole: newUser.role
        })
      });
      
      if (!response.ok) {
        // Revert the optimistic update if the request fails
        logDebug('API call failed, reverting optimistic update');
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, status: originalStatus }
              : order
          )
        );
        
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update order');
      }
      
      // Get the updated order from the response
      const data = await response.json();
      const updatedOrder = data.order;
      logDebug('API call successful, received updated order:', updatedOrder);
      
      // Update the orders state with the server response
      setOrders(prevOrders => {
        const updatedOrders = prevOrders.map(order => 
          order._id === orderId 
            ? updatedOrder
            : order
        );
        logDebug(`Updated orders state with server response, new length: ${updatedOrders.length}`);
        return updatedOrders;
      });
      
      // Also update the newUser context
      if (newUser && updateNewUser) {
        logDebug('Updating newUser context with updated order');
        const updatedOrders = newUser.orders.map(order => 
          order._id === orderId 
            ? updatedOrder
            : order
        );
        
        updateNewUser({ orders: updatedOrders });
        
        // Force a refresh of the orders state from newUser after a short delay
        // This ensures that any changes made by updateNewUser are reflected in our local state
        setTimeout(() => {
          if (newUser && newUser.orders) {
            logDebug('Refreshing orders state from newUser context after delay');
            setOrders(prevOrders => {
              // Only update if the order status is different
              const needsUpdate = prevOrders.some(order => 
                order._id === orderId && order.status !== newStatus
              );
              
              if (needsUpdate) {
                logDebug('Found inconsistency, updating orders state');
                return prevOrders.map(order => 
                  order._id === orderId 
                    ? { ...order, status: newStatus }
                    : order
                );
              }
              
              return prevOrders;
            });
          }
        }, 500);
      }
      
      return { success: true, order: updatedOrder };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: error.message };
    }
  }, [orders, newUser, updateNewUser]);

  // Function to delete an order
  const deleteOrder = useCallback(async (orderId) => {
    try {
      // Find the order to delete
      const orderToDelete = orders.find(order => order._id === orderId);
      if (!orderToDelete) {
        throw new Error('Order not found');
      }
      
      // Optimistically update the UI
      setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
      
      // Make the API call
      const response = await fetch('/api/orders/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId,
          userRole: newUser.role 
        }), 
      });
      
      if (!response.ok) {
        // Revert the optimistic update if the request fails
        setOrders(prevOrders => [...prevOrders, orderToDelete].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        ));
        
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete order');
      }
      
      // Also update the newUser context
      if (newUser && updateNewUser && newUser.orders) {
        const updatedOrders = newUser.orders.filter(order => order._id !== orderId);
        updateNewUser({ orders: updatedOrders });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting order:', error);
      return { success: false, error: error.message };
    }
  }, [orders, newUser, updateNewUser]);

  // Function to refresh orders from the server
  const refreshOrders = useCallback(async () => {
    if (!newUser) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/orders?userId=${newUser._id}&role=${newUser.role}&limit=50`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      setOrders(data.orders || []);
      
      // Also update the newUser context
      if (updateNewUser) {
        updateNewUser({ orders: data.orders || [] });
      }
      
      return { success: true, orders: data.orders };
    } catch (error) {
      console.error('Error refreshing orders:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [newUser, updateNewUser]);

  // The context value
  const contextValue = {
    orders,
    setOrders,
    loading,
    error,
    updateOrderStatus,
    deleteOrder,
    refreshOrders
  };

  return (
    <OrdersContext.Provider value={contextValue}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrdersContext() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrdersContext must be used within an OrdersProvider');
  }
  return context;
} 