'use client';
import React, { useState } from 'react';
import OrderDetailsPage from './OrderDetailsPage'; // Import the OrderDetails component

export default function OrdersPage({ orders }) {
  const [selectedOrder, setSelectedOrder] = useState(null); // State to track selected order
  const [activeTab, setActiveTab] = useState('pending'); // State to track the active tab

  console.log(orders);
  // Group orders by status
  const pendingOrders = orders?.filter((order) => order?.status === 'pending');
  const approvedOrders = orders?.filter((order) => order?.status === 'approved');
  const rejectedOrders = orders?.filter((order) => order?.status === 'rejected');

  // Show order details
  const showOrderDetails = (order) => {
    setSelectedOrder(order); // Set the selected order
  };

  // Hide order details
  const hideOrderDetails = () => {
    setSelectedOrder(null); // Clear the selected order
  };

  // Get orders based on the active tab
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
    <div className="p-4  mb-16">
      {!selectedOrder ? (
        <>
          <h1 className="text-xl font-bold text-center">הזמנות שלי</h1>

          <div className="flex justify-center mt-4">
            <button
              className={`px-4 py-2 ${
                activeTab === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'
              } rounded`}
              onClick={() => setActiveTab('pending')}
            >
              הזמנות נוכחיות
            </button>
            <button
              className={`px-4 py-2 ml-2 ${
                activeTab === 'approved' ? 'bg-green-500 text-white' : 'bg-gray-300 text-black'
              } rounded`}
              onClick={() => setActiveTab('approved')}
            >
              היסטוריית הזמנות
            </button>
            <button
              className={`px-4 py-2 ml-2 ${
                activeTab === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-300 text-black'
              } rounded`}
              onClick={() => setActiveTab('rejected')}
            >
              הזמנות נדחו
            </button>
          </div>

          <div className="mt-4">
            <OrderTable orders={getOrdersByTab()} onShowDetails={showOrderDetails} />
          </div>
        </>
      ) : (
        <OrderDetailsPage order={selectedOrder} onClose={hideOrderDetails} />
      )}
    </div>
  );
}

// Table component for orders
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
                className="px-4 py-2 text-gray-600 w-full h-full rounded"
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
