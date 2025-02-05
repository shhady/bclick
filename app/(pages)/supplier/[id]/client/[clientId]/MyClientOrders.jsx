'use client';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import OrderDetails from '@/components/orders/OrderDetails';
import { useToast } from '@/hooks/use-toast';
import { useUserContext } from "@/app/context/UserContext";
import Loader from '@/components/loader/Loader';

export default function MyClientOrders() {
  const params = useParams();
  const { clientId, id: supplierId } = params;
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const { globalUser } = useUserContext();
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const printRef = useRef(null);
  const router = useRouter();

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

  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
    }
  };

  useEffect(() => {
    const fetchClientOrders = async () => {
      try {
        // Verify supplier permission
        if (globalUser?.role !== 'supplier' || globalUser?._id !== supplierId) {
          router.push('/orders');
          return;
        }

        const response = await fetch(`/api/orders/client/${clientId}?supplierId=${supplierId}`);
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

    if (clientId && supplierId && globalUser) {
      fetchClientOrders();
    }
  }, [clientId, supplierId, globalUser]);

  // Update the filtering logic
  const currentOrders = useMemo(() => 
    orders.filter((order) => {
      const statusMatch = statusFilter === 'all' || order.status === statusFilter;
      return statusMatch;
    }),
  [orders, statusFilter]);

  // Modify the search handler
  const handleSearch = () => {
    if (searchInput.trim()) {
      setHasSearched(true);
      const found = orders.find(order => 
        order.orderNumber.toString() === searchInput.trim()
      );
      
      if (found) {
        setSelectedOrder(found);
        setFilteredOrders([]);
      } else {
        setFilteredOrders([]);
      }
    }
  };

  if (selectedOrder) {
    return (
      <OrderDetails
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onOrderUpdate={handleOrderUpdate}
        onOrderDelete={handleOrderDelete}
        globalUser={globalUser}
        handlePrint={handlePrint}
        printRef={printRef}
        setSelectedOrder={setSelectedOrder}
      />
    );
  }

  return (
    <div className="my-16">
      <div className='sticky px-4 top-12 md:top-20 left-0 w-full bg-white p-4 border-b border-gray-400'>
        <h1 className='text-2xl font-bold py-4'>הזמנות הלקוח</h1>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input 
            type="text"
            placeholder="חפש לפי מספר הזמנה..."
            value={searchInput}
            className="flex-1 p-2 border border-gray-400 rounded"
            onChange={(e) => {
              setSearchInput(e.target.value);
              if (!e.target.value) {
                setHasSearched(false);
                setFilteredOrders([]);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
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

      {isLoading ? (
        <Loader />
      ) : (
        <div className="mt-4">
          {currentOrders.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow">
              <p className="text-gray-500">לא נמצאו הזמנות</p>
            </div>
          ) : (
            <OrderTable
              orders={(filteredOrders.length > 0 ? filteredOrders : currentOrders)}
              onShowDetails={setSelectedOrder}
              globalUser={globalUser}
            />
          )}
        </div>
      )}
    </div>
  );
}

function OrderTable({ orders, onShowDetails, globalUser }) {
  if (globalUser?.role === 'supplier') {
    return (
      <>
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
                {orders?.map((order) => (
                  <tr key={order?._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {order?.clientId?.businessName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        #{order?.orderNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">₪{order?.total}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order?.status === "approved" ? "bg-green-100 text-green-800" : 
                        order?.status === "rejected" ? "bg-red-100 text-red-800" : 
                        order?.status === "processing" ? "bg-blue-100 text-blue-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {order?.status === "approved" ? "הושלם" : 
                         order?.status === "rejected" ? "נדחתה" : 
                         order?.status === "processing" ? "בטיפול" :
                         "ממתינה"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order?.createdAt).toLocaleDateString('he-IL')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => onShowDetails(order)}
                        className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                      >
                        צפה בהזמנה
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {orders?.map(order => (
            <div key={order._id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-bold">#{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('he-IL')}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  order.status === "approved" ? "bg-green-100 text-green-800" : 
                  order.status === "rejected" ? "bg-red-100 text-red-800" : 
                  order.status === "processing" ? "bg-blue-100 text-blue-800" :
                  "bg-yellow-100 text-yellow-800"
                }`}>
                  {order.status === "approved" ? "הושלם" : 
                   order.status === "rejected" ? "נדחתה" : 
                   order.status === "processing" ? "בטיפול" :
                   "ממתינה"}
                </span>
              </div>
              
              <div className="space-y-2">
                <p>לקוח: {order.clientId?.businessName}</p>
                <p>סה&quot;כ: ₪{order.total}</p>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => onShowDetails(order)}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  צפה בהזמנה
                </button>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  // Client view
  return (
    <>
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
              {orders?.map((order) => (
                <tr key={order?._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {order?.clientId?.businessName}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      #{order?.orderNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">₪{order?.total}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order?.status === "approved" ? "bg-green-100 text-green-800" : 
                      order?.status === "rejected" ? "bg-red-100 text-red-800" : 
                      order?.status === "processing" ? "bg-blue-100 text-blue-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {order?.status === "approved" ? "הושלם" : 
                       order?.status === "rejected" ? "נדחתה" : 
                       order?.status === "processing" ? "בטיפול" :
                       "ממתינה"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order?.createdAt).toLocaleDateString('he-IL')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onShowDetails(order)}
                      className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                    >
                      צפה בהזמנה
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {orders?.map(order => (
          <div key={order._id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-bold">#{order.orderNumber}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString('he-IL')}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-sm ${
                order.status === "approved" ? "bg-green-100 text-green-800" : 
                order.status === "rejected" ? "bg-red-100 text-red-800" : 
                order.status === "processing" ? "bg-blue-100 text-blue-800" :
                "bg-yellow-100 text-yellow-800"
              }`}>
                {order.status === "approved" ? "הושלם" : 
                 order.status === "rejected" ? "נדחתה" : 
                 order.status === "processing" ? "בטיפול" :
                 "ממתינה"}
              </span>
            </div>
            
            <div className="space-y-2">
              <p>לקוח: {order.clientId?.businessName}</p>
              <p>סה&quot;כ: ₪{order.total}</p>
            </div>

            <div className="mt-4">
              <button
                onClick={() => onShowDetails(order)}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                צפה בהזמנה
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
