'use client';
import React, { useState } from 'react';
import OrderDetailsPage from './OrderDetailsPage';
import { useToast } from '@/hooks/use-toast';

export default function OrdersPage({ orders, onUpdateOrder }) {
  const [selectedOrder, setSelectedOrder] = useState(null); // Track selected order
  const [activeTab, setActiveTab] = useState('pending'); // Track active tab
  const [orderList, setOrderList] = useState(orders); // Track the current orders list
  const { toast } = useToast();

  const pendingOrders = orderList?.filter((order) => order?.status === 'pending');
  const approvedOrders = orderList?.filter((order) => order?.status === 'approved');
  const rejectedOrders = orderList?.filter((order) => order?.status === 'rejected');

  const showOrderDetails = (order) => {
    setSelectedOrder(order); // Open order details
  };

  const hideOrderDetails = () => {
    setSelectedOrder(null); // Close order details
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const response = await fetch('/api/orders/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: selectedOrder._id, supplierId: selectedOrder.supplierId, clientId:selectedOrder.clientId }),
      });

      if (response.ok) {
        setOrderList((prev) => prev.filter((order) => order._id !== orderId)); // Remove the deleted order from state
        toast({
          title: 'Deleted',
          description: 'ההזמנה נמחקה בהצלחה!',
          variant: 'destructive',
        });
        hideOrderDetails(); 
           } else {
        const data = await response.json();
        alert(data.message || 'שגיאה במחיקת ההזמנה. אנא נסה שוב.');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('שגיאה במחיקת ההזמנה. אנא נסה שוב.');
    }
  };

  const getOrdersByTab = () => {
    switch (activeTab) {
      case 'pending':
        return pendingOrders;
      case 'approved':
        return approvedOrders;
      case 'rejected':
        return rejectedOrders;
      default:
        return [];
    }
  };

  return (
    <div className="p-4 mb-16">
      {!selectedOrder ? (
        <>
          <h1 className="text-xl font-bold text-center">הזמנות שלי</h1>

          {/* Tabs */}
          <div className="flex justify-center mt-4 gap-2">
            {['pending', 'approved', 'rejected'].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 ${
                  activeTab === tab
                    ? `bg-${tab === 'pending' ? 'blue' : tab === 'approved' ? 'green' : 'red'}-500 text-white`
                    : 'bg-gray-300 text-black'
                } rounded`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'pending' ? 'הזמנות נוכחיות' : tab === 'approved' ? 'היסטוריית הזמנות' : 'הזמנות נדחו'}
              </button>
            ))}
          </div>

          {/* Orders Table */}
          <div className="mt-4">
            <OrderTable orders={getOrdersByTab()} onShowDetails={showOrderDetails} />
          </div>
        </>
      ) : (
        <OrderDetailsPage
          order={selectedOrder}
          onClose={hideOrderDetails}
          onUpdateOrder={onUpdateOrder}
          onDeleteOrder={handleDeleteOrder} // Pass delete handler to OrderDetailsPage
        />
      )}
    </div>
  );
}

// Table Component
function OrderTable({ orders, onShowDetails }) {
  return (
    <table className="table-auto w-full border-collapse border border-gray-300 mt-2">
      <thead>
        <tr className="bg-gray-200">
          <th className="border border-gray-300 px-4 py-2">מס&apos; הזמנה</th>
          <th className="border border-gray-300 px-4 py-2">כמות פריטים</th>
          <th className="border border-gray-300 px-4 py-2">תאריך</th>
          <th className="border border-gray-300 px-4 py-2"></th>
        </tr>
      </thead>
      <tbody>
        {orders?.map((order) => (
          <tr key={order?._id}>
            <td className="border border-gray-300 px-4 py-2">{order?.orderNumber}</td>
            <td className="border border-gray-300 px-4 py-2">{order?.items.length}</td>
            <td className="border border-gray-300 px-4 py-2">
              {new Date(order?.date).toLocaleDateString('he-IL')}
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
