'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { FiPrinter, FiCheck, FiX, FiClock } from 'react-icons/fi';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';
import { ArrowRight } from 'lucide-react';

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

const OrderTable = ({ items }) => (
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-2 sm:px-4 lg:px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          מוצר
        </th>
        <th className="hidden md:table-cell px-2 sm:px-4 lg:px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
          ברקוד
        </th>
        <th className="px-2 sm:px-4 lg:px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
          כמות
        </th>
        <th className="px-2 sm:px-4 lg:px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
          מחיר
        </th>
        <th className="px-2 sm:px-4 lg:px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          סה״כ
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {items.map((item) => (
        <tr key={item._id}>
          <td className="px-2 sm:px-4 lg:px-6 py-2 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">
              {item.productId?.name}
            </div>
          </td>
          <td className="hidden md:table-cell px-2 sm:px-4 lg:px-6 py-2 text-center whitespace-nowrap">
            <div className="text-sm text-gray-900">{item.productId?.barCode || 'N/A'}</div>
          </td>
          <td className="px-2 sm:px-4 lg:px-6 py-2 text-center whitespace-nowrap">
            <div className="text-sm text-gray-900">{item.quantity}</div>
          </td>
          <td className="px-2 sm:px-4 lg:px-6 py-2 text-center whitespace-nowrap">
            <div className="text-sm text-gray-900">₪{item.price}</div>
          </td>
          <td className="px-2 sm:px-4 lg:px-6 py-2 text-left whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">
              ₪{(item.quantity * item.price).toFixed(2)}
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const PrintContent = ({ order }) => (
  <div className="p-8 max-w-4xl mx-auto" style={{ direction: 'rtl' }}>
    {/* Header */}
    <div className="text-center mb-8">
      <h1 className="text-2xl font-bold">פרטי הזמנה #{order.orderNumber}</h1>
      <p className="text-gray-600">
        {new Date(order.createdAt).toLocaleDateString('he-IL', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </p>
    </div>

    {/* Customer Info */}
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">פרטי לקוח</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p><strong>שם העסק:</strong> {order.clientId?.businessName}</p>
          <div ><strong>טלפון:</strong> <span dir="ltr" className='text-black text-right'>{order.clientId?.phone}</span></div>
          <p><strong>אימייל:</strong> {order.clientId?.email}</p>
        </div>
        <div>

          <p><strong>כתובת:</strong> {order.clientId?.address}</p>
          <p><strong>עיר:</strong> {order.clientId?.city}</p>
        </div>
      </div>
    </div>

    {/* Order Items */}
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">פרטי הזמנה</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 px-1 sm:px-2 text-right">מוצר</th>
            <th className=" py-2 px-1 sm:px-2 text-center">ברקוד</th>
            <th className="py-2 px-1 sm:px-2 text-center">כמות</th>
            <th className="py-2 px-1 sm:px-2 text-center">מחיר</th>
            <th className="py-2 px-1 sm:px-2 text-left">סה&quot;כ</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item._id} className="border-b">
              <td className="py-2 px-1 sm:px-2">{item.productId?.name}</td>
              <td className=" py-2 px-1 sm:px-2 text-center">
                {item.productId?.barCode}
              </td>
              <td className="py-2 px-1 sm:px-2 text-center">{item.quantity}</td>
              <td className="py-2 px-1 sm:px-2 text-center">₪{item.price}</td>
              <td className="py-2 px-1 sm:px-2 text-left">
                ₪{(item.quantity * item.price).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Total */}
    <div className="text-left">
      <h2 className="text-xl font-bold mb-2">סיכום</h2>
      <p className="text-2xl font-bold">סה&quot;כ לתשלום: ₪{order.total.toFixed(2)}</p>
    </div>
  </div>
);

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const printRef = useRef(null);
  const router = useRouter()

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) throw new Error('Failed to fetch order');
        const data = await response.json();
        setOrder(data.order);
      } catch (error) {
        toast({
          title: 'שגיאה',
          description: 'שגיאה בטעינת ההזמנה',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      const response = await fetch('/api/orders/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order._id,
          status: newStatus,
          note: `סטטוס הזמנה עודכן ל${
            newStatus === 'approved' ? 'הושלם' : 
            newStatus === 'processing' ? 'בטיפול' : 'נדחה'
          }`
        })
      });

      if (!response.ok) throw new Error('Failed to update order');
      
      const data = await response.json();
      setOrder(data.order);
      toast({
        title: 'הצלחה',
        description: 'ההזמנה עודכנה בהצלחה',
      });
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'שגיאה בעדכון ההזמנה',
        variant: 'destructive',
      });
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    const printContent = printRef.current;
    
    if (printWindow && printContent) {
      printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>הדפסת הזמנה ${order.orderNumber}</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <style>
              @media print {
                body { padding: 20px; }
                @page { margin: 0; }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      // Print after styles are loaded
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  if (isLoading) {
    return <div className="p-4">טוען...</div>;
  }

  if (!order) {
    return <div className="p-4">הזמנה לא נמצאה</div>;
  }

  return (
    <div className="p-4" dir="rtl">
      
      {/* Header with Print and Status */}
      <button
            onClick={() => router.back()}
            className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors duration-200 flex items-center gap-2 font-medium shadow-sm"
          >
            <ArrowRight />
            חזור
          </button>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">הזמנה מספר #{order.orderNumber}</h1>
            <p className="text-gray-500">
              {new Date(order.createdAt).toLocaleString('he-IL')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm ${statusColors[order.status]}`}>
              {statusText[order.status]}
            </span>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <FiPrinter className="w-4 h-4" />
              הדפס
            </button>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="flex justify-between items-center mt-8">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              order.status !== 'rejected' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'
            }`}>
              <FiClock className="w-5 h-5" />
            </div>
            <p className="mt-2 text-sm">ממתין</p>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              order.status === 'processing' || order.status === 'approved' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              <FiClock className="w-5 h-5" />
            </div>
            <p className="mt-2 text-sm">בטיפול</p>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200 mx-2"></div>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              order.status === 'approved' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              <FiCheck className="w-5 h-5" />
            </div>
            <p className="mt-2 text-sm">הושלם</p>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">פרטי לקוח</h2>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <p className="text-gray-600">שם העסק</p>
            <p className="font-medium">{order.clientId?.businessName}</p>
          </div>
          <div>
            <p className="text-gray-600">טלפון</p>
            <a 
              href={`tel:${order.clientId?.phone}`}
              className="font-medium text-right text-black"
              dir="ltr"
            >
              {order.clientId?.phone}
            </a>
          </div>
          <div>
            <p className="text-gray-600">כתובת</p>
            <p className="font-medium">{order.clientId?.address}</p>
          </div>
          <div>
            <p className="text-gray-600">אימייל</p>
            <a 
              href={`mailto:${order.clientId?.email}`}
              className="font-medium text-gray-600 hover:text-gray-800 "
            >
              {order.clientId?.email}
            </a>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">מוצרים</h2>
        <OrderTable items={order.items} />
      </div>

      {/* Order Total */}
      <div className="mt-6 text-left">
        <p className="text-lg font-bold">סך הכל: ₪{order.total}</p>
      </div>

      {/* Status Update Buttons at Bottom */}
      <div className="bg-white rounded-lg shadow-md mb-16 p-6">
        <h2 className="text-lg font-semibold mb-4">עדכון סטטוס</h2>
        <div className="flex gap-2">
          {order.status === 'pending' && (
            <>
              <button
                onClick={() => handleStatusUpdate('processing')}
                className="flex-1 bg-blue-100 text-blue-600 px-4 py-2 rounded hover:bg-blue-200"
              >
                התחל טיפול
              </button>
              <button
                onClick={() => handleStatusUpdate('rejected')}
                className="flex-1 bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200"
              >
                ביטול
              </button>
            </>
          )}
          {order.status === 'processing' && (
            <button
              onClick={() => handleStatusUpdate('approved')}
              className="flex-1 bg-green-100 text-green-600 px-4 py-2 rounded hover:bg-green-200"
            >
              סיים טיפול
            </button>
          )}
        </div>
      </div>

      {/* Print Content */}
      <div className="hidden">
        <div ref={printRef}>
          <PrintContent order={order} />
        </div>
      </div>
    </div>
  );
} 