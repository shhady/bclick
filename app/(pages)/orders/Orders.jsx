'use client';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import OrderDetailsPage from './OrderDetailsPage';
import { useToast } from '@/hooks/use-toast';
import { useUserContext } from "@/app/context/UserContext";
import Image from 'next/image';
import { ReorderConfirmationDialog } from '@/components/ReorderConfirmationDialog';

export default function Orders({ orders: initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const { globalUser, updateGlobalOrders } = useUserContext();
  const { toast } = useToast();

  // Fetch fresh data when component mounts
  useEffect(() => {
    const fetchLatestOrders = async () => {
      try {
        const response = await fetch('/api/orders', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error('Error fetching latest orders:', error);
      }
    };

    fetchLatestOrders();
  }, []);

  // Filter orders based on user role and ID
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

  // Set initial orderList with filtered orders
  const [orderList, setOrderList] = useState(filteredOrders);

  // Update orderList when filteredOrders changes
  useEffect(() => {
    setOrderList(filteredOrders);
  }, [filteredOrders]);

  const [isReordering, setIsReordering] = useState(false);
  const [showReorderDialog, setShowReorderDialog] = useState(false);
  const [selectedReorder, setSelectedReorder] = useState(null);
  const [stockInfo, setStockInfo] = useState(null);

  const pendingOrders = orderList?.filter((order) => order?.status === 'pending');
  const historyOrders = orderList?.filter((order) => order?.status !== 'pending');

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  const hideOrderDetails = () => {
    setSelectedOrder(null);
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
        setOrderList((prev) => prev.filter((order) => order._id !== orderId));
        toast({
          title: 'Deleted',
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

  const getOrdersByTab = useCallback(() => {
    return orderList?.filter((order) => 
      activeTab === 'pending' ? order?.status === 'pending' : order?.status !== 'pending'
    );
  }, [orderList, activeTab]);

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
      setOrderList((prevOrders) => 
        prevOrders.map((order) =>
          order._id === orderId ? updatedOrder : order
        )
      );
  
      // Update globalUser.orders in context
      
  
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
  
  const checkStockAvailability = async (items) => {
    try {
      const response = await fetch('/api/products/validate-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      
      if (!response.ok) throw new Error('Failed to validate stock');
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking stock:', error);
      throw error;
    }
  };

  const handleReorder = useCallback(async (order) => {
    try {
      const stockData = await checkStockAvailability(order.items);
      setStockInfo(stockData.stockInfo);
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

  const handleReorderConfirm = useCallback(async (updatedOrder) => {
    if (isReordering) return;
    
    setIsReordering(true);
    try {
      const response = await fetch('/api/orders/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalOrderId: updatedOrder._id,
          clientId: updatedOrder.clientId._id,
          supplierId: updatedOrder.supplierId._id,
          items: updatedOrder.items
        }),
      });

      if (!response.ok) throw new Error('Failed to create reorder');

      const { order: newOrder } = await response.json();
      setOrderList(prev => [newOrder, ...prev]);
      setShowReorderDialog(false);
      setSelectedReorder(null);
      
      toast({
        title: 'הצלחה',
        description: 'ההזמנה נוצרה בהצלחה!',
      });
      
      setActiveTab('pending');
    } catch (error) {
      console.error('Error reordering:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בביצוע ההזמנה החוזרת',
        variant: 'destructive',
      });
    } finally {
      setIsReordering(false);
    }
  }, [isReordering, toast, setOrderList, setShowReorderDialog, setSelectedReorder, setActiveTab]);

  const handleOrderUpdate = (updatedOrder) => {
    setOrderList(prev => prev.map(order => 
      order._id === updatedOrder._id ? updatedOrder : order
    ));
    setSelectedOrder(null);
  };

  if (selectedOrder) {
    return (
      <OrderDetailsPage
        order={selectedOrder}
        onClose={hideOrderDetails}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onDeleteOrder={handleDeleteOrder}
        onOrderUpdate={handleOrderUpdate}
      />
    );
  }

  return (
    <div>
      {globalUser?.role === 'supplier' && (
        <div>
          <Image 
            src={globalUser?.coverImage.secure_url} 
            alt="profile" 
            width={500} 
            height={500} 
            className='w-full max-h-[200px] object-cover'
          />
        </div>
      )}
      <h1 className="text-xl font-bold text-center mt-4">הזמנות שלי</h1>

      <div className="flex justify-center mt-4">
        <div className="flex overflow-hidden rounded-md">
          {['pending', 'history'].map((tab, index) => (
            <button
              key={tab}
              className={`px-4 py-2 ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 text-black'
              } ${
                index === 0 
                  ? 'rounded-r-md' // Right button rounded on right side
                  : 'rounded-l-md border-l border-white' // Left button rounded on left side
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
        <OrderTable 
          orders={getOrdersByTab()} 
          onShowDetails={showOrderDetails} 
          activeTab={activeTab}
          onReorder={handleReorder}
          isReordering={isReordering}
        />
      </div>
      <ReorderConfirmationDialog
        isOpen={showReorderDialog}
        onClose={() => setShowReorderDialog(false)}
        onConfirm={handleReorderConfirm}
        order={selectedReorder}
        stockInfo={stockInfo}
        isReordering={isReordering}
      />
    </div>
  );
}

function OrderTable({ orders, onShowDetails, activeTab, onReorder, isReordering }) {
  const { globalUser } = useUserContext();

  if (globalUser?.role === 'supplier') {
    // Return original supplier table
    return (
      <table className="table-auto w-full border-collapse border border-gray-300 mt-2">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">שם העסק</th>
            <th className="border border-gray-300 px-4 py-2">מס&lsquo; הזמנה</th>
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
              className={order?.status === 'rejected' ? 'bg-red-100' : ''}
            >
              <td className="border border-gray-300 px-4 py-2">
                {order?.clientId?.businessName}
              </td>
              <td className="border border-gray-300 px-4 py-2">{order?.orderNumber}</td>
              <td className={`border border-gray-300 px-4 py-2 ${
                order?.status === "approved" ? "text-green-500" : 
                order?.status === "rejected" ? "text-red-500" : 
                "text-gray-700"
              }`}>
                {order?.status === 'pending' 
                  ? new Date(order?.createdAt).toLocaleDateString('he-IL')
                  : order?.status === "approved" 
                    ? "אושרה" 
                    : order?.status === "rejected" 
                      ? "נדחתה" 
                      : "נוכחית"
                }
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <button
                  onClick={() => onShowDetails(order)}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
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

  // Client view
  if (activeTab === 'pending') {
    // Table view for pending orders
    return (
      <table className="table-auto w-full border-collapse border border-gray-300 mt-2">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">שם הספק</th>
            <th className="border border-gray-300 px-4 py-2">מס&lsquo; הזמנה</th>
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
                  className="px-4 py-2 bg-blue-500 text-white rounded"
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

  // Original view for history orders
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
                  {activeTab === 'history' && (
                    <div className="flex justify-center">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          onReorder(order);
                        }}
                        className="px-4 py-2 bg-customBlue text-white rounded hover:bg-green-600 text-sm w-full"
                      >
                        הזמן שוב
                      </button>
                    </div>
                  )}
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
                      <th className="border border-gray-300 px-4 py-2 w-[20%] text-center">סה&ldquo;כ</th>
                    </tr>
                  </thead>
                </table>
              </td>
            </tr>
            {order.items.map((item) => (
              <tr key={`${order._id}-${item.productId._id}`}>
                <td className="border border-gray-300 px-4 py-2 w-[40%]">{item.productId.name}</td>
                <td className="border border-gray-300 px-4 py-2 w-[20%] text-center">{item.quantity}</td>
                <td className="border border-gray-300 px-4 py-2 w-[20%] text-center">₪{item.productId.price}</td>
                <td className="border border-gray-300 px-4 py-2 w-[20%] text-center">
                  ₪{(item.quantity * item.productId.price).toFixed(2)}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-100">
              <td colSpan={3} className="border border-gray-300 px-4 py-2 text-right font-bold">
                סה&ldquo;כ להזמנה:
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
