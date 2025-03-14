'use client';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useNewUserContext } from "@/app/context/NewUserContext";
import Loader from '@/components/loader/Loader';
import { FiEye } from 'react-icons/fi';
import Link from 'next/link';

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

export default function MyClientOrders() {
  const params = useParams();
  const { clientId, id: supplierId } = params;
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const { newUser } = useNewUserContext();
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchClientOrders = async () => {
      try {
        // Verify supplier permission
        if (newUser?.role !== 'supplier' || newUser?._id !== supplierId) {
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

    if (clientId && supplierId && newUser) {
      fetchClientOrders();
    }
  }, [clientId, supplierId, newUser, router]);

  // Filter orders based on status and search
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const statusMatch = statusFilter === 'all' || order.status === statusFilter;
      const searchMatch = !searchInput.trim() || 
        order.orderNumber.toString().includes(searchInput.trim());
      return statusMatch && searchMatch;
    });
  }, [orders, statusFilter, searchInput]);

  return (
    <div className="my-16">
      <div className='sticky px-4 top-12 md:top-20 left-0 w-full bg-white p-4 border-b border-gray-400'>
        <h1 className='text-2xl font-bold py-4'>הזמנות הלקוח</h1>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input 
            type="text"
            placeholder="חפש לפי מספר הזמנה..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
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

      {isLoading ? (
        <Loader />
      ) : (
        <div className="mt-4">
          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/orders/${order._id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiEye className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold">#{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">
                      {order.clientId?.businessName}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}>
                    {statusText[order.status]}
                  </span>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">סכום: ₪{order.total}</p>
                </div>
                <div className="flex justify-end">
                  <Link
                    href={`/orders/${order._id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <FiEye className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchInput 
                  ? 'לא נמצאו הזמנות התואמות את החיפוש'
                  : 'לא נמצאו הזמנות'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
