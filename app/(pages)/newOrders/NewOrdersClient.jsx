'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUserContext } from '@/app/context/UserContext';
import Loader from '@/components/loader/Loader';

export default function NewOrdersClient({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders || []);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const loader = useRef(null);
  const { globalUser } = useUserContext();

 

  const loadMoreOrders = useCallback(async () => {
    if (isLoading || !hasMore || !globalUser) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/generalOrders?page=${page + 1}&limit=15&clerkId=${globalUser.clerkId}`
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

    // Store the current value of the ref for cleanup
    const currentLoaderRef = loader.current;

    return () => {
      if (currentLoaderRef) {
        observer.unobserve(currentLoaderRef);
      }
    };
  }, [loadMoreOrders, isLoading, hasMore]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">הזמנות</h1>
      
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order._id} className="border p-4 rounded-lg shadow">
            <div className="flex justify-between">
              <span>הזמנה מספר: {order.orderNumber}</span>
              <span> {new Date(order.createdAt).toLocaleDateString('he-IL')}</span>
            </div>
            <div className="mt-2">
              <p>לקוח: {order.clientId?.businessName}</p>
              <p>ספק: {order.supplierId?.businessName}</p>
              <p>סטטוס: {order.status === 'pending' ? 'ממתין לאישור' : 
                        order.status === 'approved' ? 'אושר' : 'נדחה'}</p>
              <p>סה&ldquo;כ: ₪{order.total.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      <div ref={loader} className="h-10 w-full flex items-center justify-center mt-4">
        {isLoading && <Loader />}
      </div>
    </div>
  );
} 