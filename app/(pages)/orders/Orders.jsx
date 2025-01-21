'use client';
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import OrderDetailsPage from './OrderDetailsPage';
import { useUserContext } from "@/app/context/UserContext";
import Image from 'next/image';
import Loader from '@/components/loader/Loader';
import { useToast } from '@/hooks/use-toast';
import {ReorderConfirmationDialog} from '@/components/ReorderConfirmationDialog';

export default function Orders({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const { globalUser } = useUserContext();
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef(null);
  const [showReorderDialog, setShowReorderDialog] = useState(false);
  const [selectedReorder, setSelectedReorder] = useState(null);
  const [isReordering, setIsReordering] = useState(false);
  const [stockInfo, setStockInfo] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log('Initial orders:', initialOrders);
    console.log('Current orders:', orders);
  }, [initialOrders, orders]);

  const loadMoreOrders = useCallback(async () => {
    if (isLoading || !hasMore || !globalUser) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/generalOrders?page=${page + 1}&limit=10&clerkId=${globalUser.clerkId}`
      );
      const data = await response.json();

      if (response.ok && Array.isArray(data.orders)) {
        setOrders(prev => {
          const newOrders = [...prev];
          data.orders.forEach(newOrder => {
            if (!newOrders.some(order => order._id === newOrder._id)) {
              newOrders.push(newOrder);
            }
          });
          return newOrders;
        });
        setHasMore(data.hasMore);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading more orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore, globalUser]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          loadMoreOrders();
        }
      },
      { threshold: 0.1 }
    );

    if (loader.current) {
      observer.observe(loader.current);
    }

    return () => {
      if (loader.current) {
        observer.unobserve(loader.current);
      }
    };
  }, [loadMoreOrders, isLoading, hasMore]);

  const handleOrderUpdate = (updatedOrder) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order._id === updatedOrder._id ? updatedOrder : order
      )
    );
    setSelectedOrder(null);
  };

  const handleOrderDelete = (orderId) => {
    setOrders(prevOrders => 
      prevOrders.filter(order => order._id !== orderId)
    );
    setSelectedOrder(null);
  };

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
      setActiveTab('pending'); // Switch to pending tab
      toast({
        title: 'הצלחה',
        description: 'ההזמנה נוצרה בהצלחה',
      });
    }
  }, []);

  if (selectedOrder) {
    return (
      <OrderDetailsPage
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onOrderUpdate={handleOrderUpdate}
        onOrderDelete={handleOrderDelete}
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
          <div className="mb-6">
            <OrderTable
              orders={currentOrders}
              onShowDetails={setSelectedOrder}
              activeTab={activeTab}
              globalUser={globalUser}
              onReorder={handleReorder}
            />
            <div 
              ref={loader} 
              className="h-10 w-full flex items-center justify-center mt-4"
            >
              {isLoading ? <Loader /> : hasMore ? 'טוען עוד...' : ''}
            </div>
          </div>
        )}
      </div>

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
    </div>
  );
}

function OrderTable({ orders, onShowDetails, activeTab, globalUser, onReorder }) {
  if (globalUser?.role === 'supplier') {
    return (
      <table className="table-auto w-full border-collapse border-gray-300 mt-2">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">שם העסק</th>
            <th className="border border-gray-300 px-4 py-2">מס&apos; הזמנה</th>
            <th className="border border-gray-300 px-4 py-2">
              {activeTab === 'pending' ? 'תאריך' : 'סטטוס'}
            </th>
            <th className="border border-gray-300 px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {orders?.map((order, index) => (
            <tr 
              key={`${order?._id}-${activeTab}-${order?.status}-${index}`}
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
        {orders?.map((order, index) => (
          <table 
            key={`${order._id}-${activeTab}-${order.status}-${index}`} 
            className="table-auto w-full border-collapse border border-gray-300"
          >
            <tbody>
              <tr className={`bg-gray-50 ${
                order.status === 'rejected' ? 'bg-white' : 
                order.status === 'approved' ? 'bg-white' : 'bg-white'
              }`}>
                <td colSpan={4} className="border border-gray-300 px-4 py-2">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center">
                        <span className='text-2xl'>הזמנה מס׳ {order.orderNumber}</span>
                        <div className="flex items-center gap-4">
                          <span>{new Date(order.createdAt).toLocaleDateString('he-IL')}</span>
                          {globalUser?.role === 'client' && (
                            <button
                              onClick={() => onReorder(order)}
                              className="px-4 py-2 bg-customBlue text-white rounded hover:bg-blue-600"
                            >
                              הזמן שוב
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {order.supplierId?.businessName}
                        </span>
                        <span className={`font-bold ${
                          order.status === 'approved' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {order.status === 'approved' ? 'אושרה' : 'נדחתה'}
                        </span>
                      </div>
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
                        <th className="border border-gray-300 px-4 py-2 w-[20%] text-center">סה&quot;כ</th>
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
                  סה&quot;כ להזמנה:
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
          <th className="border border-gray-300 px-4 py-2">מס&apos; הזמנה</th>
          <th className="border border-gray-300 px-4 py-2">תאריך</th>
          <th className="border border-gray-300 px-4 py-2"></th>
        </tr>
      </thead>
      <tbody>
        {orders?.map((order, index) => (
          <tr key={`${order?._id}-${activeTab}-${index}`}>
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
