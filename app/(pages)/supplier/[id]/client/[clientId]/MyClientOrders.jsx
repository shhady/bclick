'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import OrderDetailsPage from '../../../../orders/OrderDetailsPage';
import { useToast } from '@/hooks/use-toast';
import { useUserContext } from "@/app/context/UserContext";
import Loader from '@/components/loader/Loader';

export default function MyClientOrders() {
  const params = useParams();
  const clientId = params.clientId;
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const { globalUser } = useUserContext();
  const [isLoading, setIsLoading] = useState(true);

  // Add handlers for order updates
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

  useEffect(() => {
    const fetchClientOrders = async () => {
      try {
        const response = await fetch(`/api/orders/client/${clientId}`);
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error('Error fetching client orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (clientId) {
      fetchClientOrders();
    }
  }, [clientId]);

  const currentOrders = useMemo(() => 
    orders.filter((order) => 
      activeTab === 'pending' 
        ? order.status === 'pending' 
        : ['approved', 'rejected'].includes(order.status)
    ),
  [orders, activeTab]);

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
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">הזמנות הלקוח</h2>
      {isLoading ? (
        <Loader />
      ) : (
        <>
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
                  {tab === 'pending' ? 'הזמנות נוכחיות' : 'היסטוריית הזמנות'}
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
          </div>
        </>
      )}
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
            <th className="border border-gray-300 px-4 py-2">מס&apos; הזמנה</th>
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
