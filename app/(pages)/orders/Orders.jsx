'use client';
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import OrderDetailsPage from './OrderDetailsPage';
import { useToast } from '@/hooks/use-toast';
import { useUserContext } from "@/app/context/UserContext";
import Image from 'next/image';
import { ReorderConfirmationDialog } from '@/components/ReorderConfirmationDialog';
import Loader from '@/components/loader/Loader';

export default function Orders({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const { globalUser } = useUserContext();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef(null);
  const [isReordering, setIsReordering] = useState(false);
  const [showReorderDialog, setShowReorderDialog] = useState(false);
  const [selectedReorder, setSelectedReorder] = useState(null);
  const [stockInfo, setStockInfo] = useState(null);

  const filteredOrders = useMemo(() => {
    if (!orders || !globalUser) return [];
    
    return orders.filter(order => {
      if (globalUser.role === 'supplier') {
        return order.supplierId._id === globalUser._id;
      } else if (globalUser.role === 'client') {
        return order.clientId._id === globalUser._id;
      }
      return false;
    });
  }, [orders, globalUser]);

  const currentOrders = useMemo(() => 
    filteredOrders.filter((order) => 
      activeTab === 'pending' 
        ? order.status === 'pending' 
        : ['approved', 'rejected'].includes(order.status)
    ),
  [filteredOrders, activeTab]);

  const loadMoreOrders = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders?page=${page + 1}&limit=10`);
      const newOrders = await response.json();
      
      if (newOrders.length < 10) {
        setHasMore(false);
      }
      
      setOrders(prev => [...prev, ...newOrders]);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading more orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreOrders();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMoreOrders, hasMore]);

  const handleUpdateOrderStatus = async (orderId, status, note) => {
    try {
      const response = await fetch('/api/orders/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId, 
          status, 
          note,
          userId: globalUser._id 
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update order');
      }
  
      const { order: updatedOrder } = await response.json();
  
      // Update the local order list
      setOrders((prevOrders) => 
        prevOrders.map((order) =>
          order._id === orderId ? updatedOrder : order
        )
      );
  
      // Close the selected order details
      setSelectedOrder(null);
  
      toast({
        title: 'הצלחה',
        description: status === 'approved' ? 'ההזמנה אושרה בהצלחה' : 'ההזמנה נדחתה בהצלחה',
      });
  
      return updatedOrder;
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: 'שגיאה',
        description: error.message || 'שגיאה בעדכון ההזמנה',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const response = await fetch('/api/orders/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: orderId, 
          supplierId: selectedOrder.supplierId, 
          clientId: selectedOrder.clientId 
        }),
      });

      if (response.ok) {
        setOrders((prev) => prev.filter((order) => order._id !== orderId));
        toast({
          title: 'נמחק',
          description: 'ההזמנה נמחקה בהצלחה!',
          variant: 'destructive',
        });
        setSelectedOrder(null);
      } else {
        const data = await response.json();
        throw new Error(data.message || 'שגיאה במחיקת ההזמנה');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: 'שגיאה',
        description: error.message || 'שגיאה במחיקת ההזמנה. אנא נסה שוב.',
        variant: 'destructive',
      });
    }
  };

  const handleReorder = useCallback(async (order) => {
    try {
      const response = await fetch('/api/products/validate-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: order.items })
      });
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

  if (selectedOrder) {
    return (
      <OrderDetailsPage
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateOrderStatus}
        onDelete={handleDeleteOrder}
      />
    );
  }

  return (
    <div>
      {globalUser?.role === 'supplier' && (
        <div>
          <Image 
            src={globalUser?.coverImage?.secure_url} 
            alt="profile" 
            width={500} 
            height={500} 
            className='w-full max-h-[200px] object-cover'
          />
        </div>
      )}
      <h1 className="text-xl font-bold text-center mt-4">הזמנות שלי</h1>
      
      <div className="flex mt-4">
        <div className="flex overflow-hidden rounded-md w-full">
          {['pending', 'history'].map((tab, index) => (
            <button
              key={tab}
              className={`px-4 py-2 flex-1 ${
                activeTab === tab
                  ? 'bg-customBlue text-white'
                  : 'bg-customGray text-black'
              } ${
                index === 0 
                  ? 'rounded-r-md'
                  : 'rounded-l-md border-l border-white'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'pending' 
                ? (globalUser?.role === 'supplier' ? 'הזמנות לאישור' : 'הזמנות נוכחיות')
                : 'היסטוריית הזמנות'
              }
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        {currentOrders.length === 0 ? (
          <div className="text-center text-gray-500">אין הזמנות</div>
        ) : (
          <OrderTable
            orders={currentOrders}
            onShowDetails={setSelectedOrder}
            activeTab={activeTab}
            globalUser={globalUser}
          />
        )}
        {isLoading && <Loader />}
        <div ref={observerTarget} style={{ height: '20px' }} />
      </div>
      <ReorderConfirmationDialog
        isOpen={showReorderDialog}
        onClose={() => setShowReorderDialog(false)}
        order={selectedReorder}
        stockInfo={stockInfo}
        isReordering={isReordering}
      />
    </div>
  );
}

function OrderTable({ orders, onShowDetails, activeTab, globalUser }) {
  if (globalUser?.role === 'supplier') {
    return (
      <table className="table-auto w-full border-collapse border-gray-300 mt-2">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">שם העסק</th>
            <th className="border border-gray-300 px-4 py-2">מס' הזמנה</th>
            <th className="border border-gray-300 px-4 py-2">
              {activeTab === 'pending' ? 'תאריך' : 'סטטוס'}
            </th>
            <th className="border border-gray-300 px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {orders?.map((order) => (
            <tr 
              key={order?._id}
              className={order?.status === 'rejected' ? 'bg-red-100' : 'border-b-2 border-customGray'}
            >
              <td className="border-gray-300 px-4 py-2 text-center">
                {order?.clientId?.businessName}
              </td>
              <td className="px-4 py-2 text-center">{order?.orderNumber}</td>
              <td className={`px-4 py-2 text-center ${
                order?.status === "approved" ? "text-green-500" : 
                order?.status === "rejected" ? "text-red-500" : 
                "text-gray-700"
              }`}>
                {activeTab === 'pending' 
                  ? new Date(order?.createdAt).toLocaleDateString('he-IL')
                  : order?.status === "approved" 
                    ? "אושרה" 
                    : order?.status === "rejected" 
                      ? "נדחתה" 
                      : "נוכחית"
                }
              </td>
              <td onClick={() => onShowDetails(order)} className="cursor-pointer px-4 py-2 text-center hover:bg-customGray hover:text-customGrayText">
                <button className="py-2 md:px-8 rounded-lg hover:bg-customGray hover:text-customGrayText">
                  הצג
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // Client view for history orders
  if (activeTab === 'history') {
    return (
      <div className="space-y-8">
        {orders?.map((order) => (
          <table key={order._id} className="table-auto w-full border-collapse border border-gray-300">
            <tbody>
              <tr className="bg-gray-50">
                <td colSpan={4} className="border border-gray-300 px-4 py-2">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center">
                        <span className='text-2xl'>הזמנה מס׳ {order.orderNumber}</span>
                        <span>{new Date(order.createdAt).toLocaleDateString('he-IL')}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {order.supplierId?.businessName}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td colSpan={4} className="p-0">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border border-gray-300 px-4 py-2 w-[40%]">פריט</th>
                        <th className="border border-gray-300 px-4 py-2 w-[20%] text-center">כמות</th>
                        <th className="border border-gray-300 px-4 py-2 w-[20%] text-center">מחיר יחידה</th>
                        <th className="border border-gray-300 px-4 py-2 w-[20%] text-center">סה"כ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={`${order._id}-${item.productId._id}`}>
                          <td className="border border-gray-300 px-4 py-2">{item.productId.name}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">₪{item.productId.price}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            ₪{(item.quantity * item.productId.price).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr className="bg-gray-100">
                <td colSpan={3} className="border border-gray-300 px-4 py-2 text-right font-bold">
                  סה"כ להזמנה:
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center font-bold">
                  ₪{order.total.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        ))}
      </div>
    );
  }

  // Client view for pending orders
  return (
    <table className="table-auto w-full border-collapse border border-gray-300 mt-2">
      <thead>
        <tr className="bg-gray-200">
          <th className="border border-gray-300 px-4 py-2">שם הספק</th>
          <th className="border border-gray-300 px-4 py-2">מס' הזמנה</th>
          <th className="border border-gray-300 px-4 py-2">תאריך</th>
          <th className="border border-gray-300 px-4 py-2"></th>
        </tr>
      </thead>
      <tbody>
        {orders?.map((order) => (
          <tr key={order?._id}>
            <td className="border border-gray-300 px-4 py-2">
              {order?.supplierId?.businessName}
            </td>
            <td className="border border-gray-300 px-4 py-2">
              {order?.orderNumber}
            </td>
            <td className="border border-gray-300 px-4 py-2">
              {new Date(order?.createdAt).toLocaleDateString('he-IL')}
            </td>
            <td className="border border-gray-300 px-4 py-2 text-center">
              <button
                onClick={() => onShowDetails(order)}
                className="px-4 py-2 bg-customBlue text-white rounded"
              >
                הצג
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
