'use client';
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import OrderDetailsPage from './OrderDetailsPage';
import { useUserContext } from "@/app/context/UserContext";
import { useNewUserContext } from "@/app/context/NewUserContext";
import Image from 'next/image';
import Loader from '@/components/loader/Loader';
import { useToast } from '@/hooks/use-toast';
import {ReorderConfirmationDialog} from '@/components/ReorderConfirmationDialog';
import { FiEye, FiCheck, FiTruck, FiX } from 'react-icons/fi';
import Link from 'next/link';
import OrderStatusUpdate from '@/app/components/OrderStatusUpdate';
import { OrderUpdateDialog } from '@/components/OrderUpdateDialog';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import { RejectConfirmationDialog } from '@/components/RejectConfirmationDialog';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

const statusText = {
  pending: 'ממתין',
  processing: 'בטיפול',
  approved: 'הושלם',
  rejected: 'בוטל'
};

const OrderSkeleton = () => (
  <div className="animate-pulse">
    <div className="hidden md:block">
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="grid grid-cols-5 gap-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
    <div className="md:hidden">
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  </div>
);

// Add a new constant for minimum search length
const MIN_SEARCH_LENGTH = 2;

export default function Orders({ initialOrders }) {
  const { globalUser, isRefreshing, loading: userLoading } = useUserContext();
  const { toast } = useToast();
  const [orders, setOrders] = useState(initialOrders || []);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef(null);
  const [showReorderDialog, setShowReorderDialog] = useState(false);
  const [selectedReorder, setSelectedReorder] = useState(null);
  const [isReordering, setIsReordering] = useState(false);
  const [stockInfo, setStockInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [orderToReject, setOrderToReject] = useState(null);
  
  // Try to use NewUserContext if available
  let newUser = null;
  let updateNewUser = null;
  
  try {
    const newUserContext = useNewUserContext();
    if (newUserContext) {
      newUser = newUserContext.newUser;
      updateNewUser = newUserContext.updateNewUser;
    }
  } catch (error) {
    console.log('NewUserContext not available in Orders component');
    // NewUserContext not available, we'll continue without it
  }

  // Move all useCallback hooks to the top level
  const handleCloseUpdateDialog = useCallback(() => {
    setShowUpdateDialog(false);
    setSelectedOrder(null);
    setStockInfo(null);
  }, []);

  const handleUpdateClick = useCallback(async (order) => {
    if (!order || order.status !== 'pending') {
      toast({
        title: 'שגיאה',
        description: 'ניתן לעדכן רק הזמנות בסטטוס ממתין',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`/api/orders/stock-check/${order._id}`);
      if (!response.ok) throw new Error('Failed to fetch stock info');
      const data = await response.json();
      setStockInfo(data);
      setSelectedOrder(order);
      setShowUpdateDialog(true);
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'שגיאה בטעינת נתוני המלאי',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleUpdateConfirm = useCallback(async (updatedItems) => {
    if (!selectedOrder || !globalUser || !updatedItems?.length) return;

    setLoadingAction('updating');
    try {
      const formattedItems = updatedItems.map(item => ({
        productId: item.productId?._id || item.productId,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.productId?.price || item.price),
        total: parseFloat(item.productId?.price || item.price) * parseInt(item.quantity)
      }));

      const requestBody = {
        orderId: selectedOrder._id,
        items: formattedItems,
        status: 'pending',
        note: `הזמנה עודכנה על ידי ${globalUser.businessName}`,
        userId: globalUser._id,
        userRole: globalUser.role
      };

      const response = await fetch(`/api/orders/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update order');
      }

      const { order: updatedOrder } = responseData;
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
      
      handleCloseUpdateDialog();
      toast({
        title: 'הצלחה',
        description: 'ההזמנה עודכנה בהצלחה',
      });
    } catch (error) {
      console.error('Update Error:', error);
      toast({
        title: 'שגיאה',
        description: error.message || 'שגיאה בעדכון ההזמנה',
        variant: 'destructive',
      });
    } finally {
      setLoadingAction(null);
    }
  }, [selectedOrder, globalUser, toast, handleCloseUpdateDialog]);

  const handleReorder = useCallback(async (order) => {
    try {
      const response = await fetch('/api/products/validate-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: order.items })
      });
      
      if (!response.ok) throw new Error('Failed to validate stock');
      
      const data = await response.json();
      setStockInfo(data.stockInfo);
      setSelectedReorder(order);
      setShowReorderDialog(true);
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'שגיאה בבדיקת המלאי',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleReorderSuccess = useCallback((newOrder) => {
    if (newOrder?.order) {
      setOrders(prev => [newOrder.order, ...prev]);
      setStatusFilter('pending');
      toast({
        title: 'הצלחה',
        description: 'ההזמנה נוצרה בהצלחה',
      });
    }
  }, [toast]);

  // Memoize search params to prevent unnecessary re-renders
  const buildSearchParams = useCallback((pageNum = 1) => {
    const params = new URLSearchParams({
      page: pageNum,
      limit: 10,
      userId: globalUser?._id,
      role: globalUser?.role,
    });

    if (searchTerm?.trim()) {
      params.append('search', searchTerm.trim());
    }
    if (statusFilter !== 'all') {
      params.append('status', statusFilter);
    }

    return params;
  }, [globalUser?._id, globalUser?.role, searchTerm, statusFilter]);

  // Optimized loadMoreOrders function
  const loadMoreOrders = useCallback(async () => {
    if (isFetching || !hasMore || !globalUser || isSearching) return;

    try {
      setIsFetching(true);
      const params = buildSearchParams(page + 1);
      const response = await fetch(`/api/orders?${params.toString()}`);
      const data = await response.json();

      if (response.ok && Array.isArray(data.orders)) {
        setOrders(prev => {
          const uniqueOrders = new Map([...prev.map(order => [order._id, order])]);
          data.orders.forEach(order => uniqueOrders.set(order._id, order));
          return Array.from(uniqueOrders.values());
        });
        setHasMore(data.hasMore);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading more orders:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בטעינת הזמנות נוספות',
        variant: 'destructive',
      });
    } finally {
      setIsFetching(false);
    }
  }, [page, isFetching, hasMore, globalUser, isSearching, buildSearchParams, toast]);

  // Reset pagination when filters change
  useEffect(() => {
    if (!globalUser) return;

    setPage(1);
    setHasMore(true);
    
    // Only reset orders if we need to fetch from server
    if (searchTerm || statusFilter !== 'all') {
      setIsLoading(true);
      const fetchOrders = async () => {
        try {
          const params = buildSearchParams(1);
          const response = await fetch(`/api/orders?${params.toString()}`);
          const data = await response.json();
          
          if (response.ok && Array.isArray(data.orders)) {
            setOrders(data.orders);
            setHasMore(data.hasMore);
          }
        } catch (error) {
          console.error('Error fetching orders:', error);
          toast({
            title: 'שגיאה',
            description: 'שגיאה בטעינת הזמנות',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchOrders();
    } else {
      setOrders(initialOrders);
    }
  }, [statusFilter, searchTerm, globalUser, buildSearchParams, initialOrders, toast]);

  // Intersection Observer for infinite scrolling
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '20px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting && !isLoading && hasMore && !isSearching) {
        loadMoreOrders();
      }
    }, options);

    const currentLoader = loader.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [loadMoreOrders, isLoading, hasMore, isSearching]);

  // Show loading state while user data is being fetched
  // if (userLoading) {
  //   return <Loader />;
  // }

  // Ensure we have user data before rendering
  if (!globalUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">אנא התחבר</h2>
          <p className="text-gray-600">עליך להתחבר כדי לצפות בהזמנות</p>
        </div>
      </div>
    );
  }

  const handleOrderUpdate = async (orderId, newStatus, note = '') => {
    try {
      // Get the original order status before updating
      const originalOrder = orders.find(order => order._id === orderId);
      const originalStatus = originalOrder?.status;
      
      // Optimistically update the UI
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );

      const response = await fetch('/api/orders/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          note: note || `סטטוס הזמנה עודכן ל${
            newStatus === 'approved' ? 'הושלם' : 
            newStatus === 'processing' ? 'בטיפול' : 'נדחה'
          }`,
          userId: globalUser._id,
          userRole: globalUser.role
        })
      });

      if (!response.ok) {
        const error = await response.json();
        // Revert the optimistic update if the request fails
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, status: originalStatus }
              : order
          )
        );
        throw new Error(error.error || 'Failed to update order');
      }
      
      const { order: updatedOrder } = await response.json();

      // Update with the server response
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? updatedOrder : order
        )
      );

      // Update the newUserContext if available and if this is a supplier changing a pending order
      if (updateNewUser && globalUser.role === 'supplier' && originalStatus === 'pending' && newStatus !== 'pending') {
        try {
          
          // If we have the newUser object with orders array
          if (newUser && newUser.orders && Array.isArray(newUser.orders)) {
            // Create a new orders array with the updated order
            const updatedOrders = newUser.orders.map(order => 
              order._id === orderId 
                ? { ...order, status: newStatus }
                : order
            );
            
            // Update the newUserContext with the new orders array
            updateNewUser({ orders: updatedOrders });
          }
        } catch (error) {
          console.error('Error updating newUserContext:', error);
          // Continue even if updating newUserContext fails
        }
      }

      toast({
        title: 'הצלחה',
        description: 'ההזמנה עודכנה בהצלחה',
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'שגיאה',
        description: error.message || 'שגיאה בעדכון ההזמנה',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteOrder = async (orderId) => {
    setShowDeleteDialog(false);
    setOrderToDelete(null);
    setLoadingAction('deleting');
    try {
      // Optimistically update UI
      const orderToDelete = orders.find(order => order._id === orderId);
      setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));

      const response = await fetch('/api/orders/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId,
          userRole: globalUser.role 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Revert the optimistic update if the request fails
        setOrders(prevOrders => [...prevOrders, orderToDelete].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        ));
        throw new Error(data.message || 'Failed to delete order');
      }

      toast({
        title: 'נמחק',
        description: 'ההזמנה נמחקה בהצלחה!',
      });
      
      setSelectedOrder(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: 'שגיאה',
        description: error.message || 'שגיאה במחיקת ההזמנה',
        variant: 'destructive',
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const initiateDelete = (order) => {
    setOrderToDelete(order);
    setShowDeleteDialog(true);
  };

  if (selectedOrder) {
    return (
      <OrderDetailsPage
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onOrderUpdate={handleOrderUpdate}
        onOrderDelete={handleDeleteOrder}
      />
    );
  }

  const renderOrderActions = (order) => (
    <div className="flex items-center gap-2">
      <Link
        href={`/orders/${order._id}`}
        className="text-blue-600 hover:text-blue-900"
      >
        <FiEye className="w-5 h-5" />
      </Link>
      {globalUser.role === 'supplier' && order.status === 'pending' && (
        <>
          <button
            onClick={() => handleOrderUpdate(order._id, 'processing')}
            className="bg-blue-100 text-blue-600 px-4 py-1 rounded hover:bg-blue-200"
          >
            התחל טיפול
          </button>
          <button
            onClick={() => {
              setOrderToReject(order);
              setShowRejectDialog(true);
            }}
            className="bg-red-100 text-red-600 px-4 py-1 rounded hover:bg-red-200"
          >
            ביטול
          </button>
        </>
      )}
      {globalUser.role === 'supplier' && order.status === 'processing' && (
        <button
          onClick={() => handleOrderUpdate(order._id, 'approved')}
          className="bg-green-100 text-green-600 px-4 py-1 rounded hover:bg-green-200"
        >
          סיים טיפול
        </button>
      )}
      {globalUser.role === 'client' && order.status === 'pending' && (
        <button
          onClick={() => initiateDelete(order)}
          className="bg-red-100 text-red-600 px-4 py-1 rounded hover:bg-red-200"
        >
          מחק הזמנה
        </button>
      )}
    </div>
  );

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      {/* Add loading indicator for user data refresh */}
      {isRefreshing && (
        <div className="fixed top-16 md:top-20 right-4 z-50">
          <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md text-sm">
            מרענן נתונים...
          </div>
        </div>
      )}

      <div className='sticky px-4 top-12 md:top-20 left-0 w-full bg-white p-4 border-b border-gray-400 z-10'>
        <h1 className='text-2xl font-bold py-4'>הזמנות</h1>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input 
            type="text"
            placeholder="חיפוש לפי שם לקוח או מספר הזמנה..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-2 border border-gray-400 rounded"
          />
          <select 
            className="p-2 border rounded"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">כל הסטטוסים</option>
            <option value="pending">ממתין</option>
            <option value="processing">בטיפול</option>
            <option value="approved">הושלם</option>
            <option value="rejected">בוטל</option>
          </select>
        </div>
      </div>
      
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {globalUser?.role === 'client' ? 'ספק' : 'לקוח'}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                מספר הזמנה
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                סכום
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                סטטוס
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                פעולות
              </th>
            </tr>
          </thead>
          <tbody className={`bg-white divide-y divide-gray-200 ${isLoading ? 'opacity-50' : ''}`}>
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {globalUser.role === 'client' 
                      ? order.supplierId?.businessName 
                      : order.clientId?.businessName}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    #{order.orderNumber}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">₪{order.total}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status]}`}>
                    {statusText[order.status]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderOrderActions(order)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className={`md:hidden space-y-4 ${isLoading ? 'opacity-50' : ''}`}>
        {orders.map((order) => (
          <div key={order._id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-bold">מספר הזמנה: #{order.orderNumber}</p>
                <p className="text-sm text-gray-500">
                 שם: {globalUser.role === 'client' 
                    ? order.supplierId?.businessName 
                    : order.clientId?.businessName}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}>
                {statusText[order.status]}
              </span>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">סכום: ₪{order.total}</p>
            </div>
            <div className="flex justify-between items-center">
            <Link
                href={`/orders/${order._id}`}
                className="text-blue-600 hover:text-blue-900"
              >
                <FiEye className="w-5 h-5" />
              </Link>
              <div className="flex gap-2">
                
                {globalUser.role === 'client' && order.status === 'pending' && (
                  <button
                    onClick={() => initiateDelete(order)}
                    className="bg-red-100 text-red-600 px-4 py-1 rounded hover:bg-red-200"
                  >
                    מחק הזמנה
                  </button>
                )}
                {globalUser.role === 'supplier' && order.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleOrderUpdate(order._id, 'processing')}
                      className="bg-blue-100 text-blue-600 px-4 py-1 rounded hover:bg-blue-200"
                    >
                      התחל טיפול
                    </button>
                    <button
                      onClick={() => {
                        setOrderToReject(order);
                        setShowRejectDialog(true);
                      }}
                      className="bg-red-100 text-red-600 px-4 py-1 rounded hover:bg-red-200"
                    >
                      ביטול
                    </button>
                  </>
                )}
                {globalUser.role === 'supplier' && order.status === 'processing' && (
                  <button
                    onClick={() => handleOrderUpdate(order._id, 'approved')}
                    className="bg-green-100 text-green-600 px-4 py-1 rounded hover:bg-green-200"
                  >
                    סיים טיפול
                  </button>
                )}
              </div>
             
            </div>
          </div>
        ))}
      </div>

      {isFetching && <OrderSkeleton />}

      {orders.length === 0 && !isLoading && !isFetching && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchTerm 
              ? 'לא נמצאו הזמנות התואמות את החיפוש'
              : 'לא נמצאו הזמנות'}
          </p>
        </div>
      )}

      {/* Infinite scroll trigger */}
      <div ref={loader} className="h-10 w-full" />

      <ReorderConfirmationDialog
        isOpen={showReorderDialog}
        onClose={() => {
          setShowReorderDialog(false);
          setSelectedReorder(null);
        }}
        order={selectedReorder}
        stockInfo={stockInfo}
        isReordering={isReordering}
        setIsReordering={setIsReordering}
        onSuccess={handleReorderSuccess}
        globalUser={globalUser}
      />

      <OrderUpdateDialog
        key={selectedOrder?._id || 'no-order'}
        isOpen={showUpdateDialog}
        onClose={handleCloseUpdateDialog}
        onConfirm={handleUpdateConfirm}
        order={selectedOrder}
        stockInfo={stockInfo}
        loadingAction={loadingAction}
      />

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setOrderToDelete(null);
        }}
        onConfirm={() => handleDeleteOrder(orderToDelete?._id)}
        orderNumber={orderToDelete?.orderNumber}
      />

      <RejectConfirmationDialog
        isOpen={showRejectDialog}
        onClose={() => {
          setShowRejectDialog(false);
          setOrderToReject(null);
        }}
        onConfirm={(note) => {
          handleOrderUpdate(orderToReject?._id, 'rejected', note);
          setShowRejectDialog(false);
          setOrderToReject(null);
        }}
        orderNumber={orderToReject?.orderNumber}
      />
    </div>
  );
}
