'use client';
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import OrderDetailsPage from './OrderDetailsPage';
import { useUserContext } from "@/app/context/UserContext";
import Image from 'next/image';
import Loader from '@/components/loader/Loader';
import { useToast } from '@/hooks/use-toast';
import {ReorderConfirmationDialog} from '@/components/ReorderConfirmationDialog';
import { FiEye, FiCheck, FiTruck, FiX } from 'react-icons/fi';
import Link from 'next/link';
import OrderStatusUpdate from '@/app/components/OrderStatusUpdate';

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

export default function Orders({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
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
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleOrderUpdate = async (orderId, newStatus, note = '') => {
    try {
      const response = await fetch('/api/orders/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          note: note || `סטטוס הזמנה עודכן ל${
            newStatus === 'approved' ? 'הושלם' : 
            newStatus === 'processing' ? 'בטיפול' : 'נדחה'
          }`
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update order');
      }
      
      const data = await response.json();
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? data.order : order
        )
      );

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

  const handleOrderDelete = (orderId) => {
    setOrders(prevOrders => 
      prevOrders.filter(order => order._id !== orderId)
    );
    setSelectedOrder(null);
  };

  const filteredOrders = useMemo(() => {
    if (!orders || !globalUser) return [];
    
    return orders.filter(order => {
      const userMatch = globalUser.role === 'supplier' 
        ? order.supplierId._id === globalUser._id
        : order.clientId._id === globalUser._id;

      const statusMatch = statusFilter === 'all' || order.status === statusFilter;
      
      const matchesSearch = 
        order.orderNumber.toString().includes(searchTerm) ||
        (order.clientId?.businessName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.supplierId?.businessName || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      return userMatch && statusMatch && matchesSearch;
    });
  }, [orders, globalUser, statusFilter, searchTerm]);

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
      setStatusFilter('pending'); // Switch to pending tab
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
    <div className="space-y-4 mb-20" dir="rtl">
      <div className='sticky px-4 top-12 md:top-20 left-0 w-full bg-white p-4 border-b border-gray-400'>
      <h1 className='text-2xl font-bold py-4'>הזמנות</h1>
      {/* Filters */}
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
      

      {/* Desktop Table */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  לקוח
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  מספר הזמנה
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  סה&quot;כ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  סטטוס
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  תאריך
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {order.clientId?.businessName}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('he-IL')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/orders/${order._id}`}
                        className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                      >
                        צפה בהזמנה
                      </Link>
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleOrderUpdate(order._id, 'processing')}
                            className="bg-blue-100 text-blue-600 px-4 py-1 rounded hover:bg-blue-200"
                          >
                            התחל טיפול
                          </button>
                          <button
                            onClick={() => handleOrderUpdate(order._id, 'rejected')}
                            className="bg-red-100 text-red-600 px-4 py-1 rounded hover:bg-red-200"
                          >
                            ביטול
                          </button>
                        </>
                      )}
                      {order.status === 'processing' && (
                        <button
                          onClick={() => handleOrderUpdate(order._id, 'approved')}
                          className="bg-green-100 text-green-600 px-4 py-1 rounded hover:bg-green-200"
                        >
                          סיים טיפול
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4 ">
        {filteredOrders.map(order => (
          <div key={order._id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-bold">#{order.orderNumber}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString('he-IL')}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-sm ${statusColors[order.status]}`}>
                {statusText[order.status]}
              </span>
            </div>
            
            <div className="space-y-2">
              <p>לקוח: {order.clientId?.businessName}</p>
              <p>סה&quot;כ: ₪{order.total}</p>
            </div>

            <div className="mt-4 flex gap-2">
              <Link
                href={`/orders/${order._id}`}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                צפה בהזמנה
              </Link>
              {order.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleOrderUpdate(order._id, 'processing')}
                    className="bg-blue-100 text-blue-600 px-4 py-2 rounded hover:bg-blue-200"
                  >
                    התחל טיפול
                  </button>
                  <button
                    onClick={() => handleOrderUpdate(order._id, 'rejected')}
                    className="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200"
                  >
                    ביטול
                  </button>
                </>
              )}
              {order.status === 'processing' && (
                <button
                  onClick={() => handleOrderUpdate(order._id, 'approved')}
                  className="bg-green-100 text-green-600 px-4 py-2 rounded hover:bg-green-200"
                >
                  סיים טיפול
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <p className="text-gray-500">לא נמצאו הזמנות התואמות את החיפוש</p>
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
