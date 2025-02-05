'use client';
import React, { useState, useRef } from 'react';
import { useUserContext } from '@/app/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import { OrderUpdateDialog } from '@/components/OrderUpdateDialog';
import { useRouter } from 'next/navigation';
import { FiPrinter, FiCheck, FiX, FiClock } from 'react-icons/fi';
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

// Add PrintContent component
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
          <div><strong>טלפון:</strong> <span dir="ltr" className='text-black text-right'>{order.clientId?.phone}</span></div>
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
            <th className="py-2 px-1 sm:px-2 text-center">כמות</th>
            <th className="py-2 px-1 sm:px-2 text-center">מחיר ליחידה</th>
            <th className="py-2 px-1 sm:px-2 text-left">סה&quot;כ</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item._id} className="border-b">
              <td className="py-2 px-1 sm:px-2">{item.productId?.name}</td>
              <td className="py-2 px-1 sm:px-2 text-center">{item.quantity}</td>
              <td className="py-2 px-1 sm:px-2 text-center">₪{item.productId?.price}</td>
              <td className="py-2 px-1 sm:px-2 text-left">
                ₪{(item.quantity * item.productId?.price).toFixed(2)}
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

export default function OrderDetailsPage({ order, onClose, setSelectedOrder, onOrderUpdate, onOrderDelete }) {
  const { globalUser } = useUserContext();
  const { toast } = useToast();
  const router = useRouter();
  const [note, setNote] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [stockInfo, setStockInfo] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);
  const printRef = useRef(null);
  
  // Add permission checks
  const isSupplier = globalUser?.role === 'supplier' && order.supplierId._id === globalUser._id;
  const isClient = globalUser?.role === 'client' && order.clientId._id === globalUser._id;
  const canModifyOrder = isClient && order.status === 'pending';

  const handleUpdateOrderStatus = async (orderId, status, note) => {
    if (status === 'rejected' && !note.trim()) {
      setErrorMessage('חובה להוסיף הערה בעת דחיית הזמנה');
      return;
    }

    setLoadingAction(status === 'approved' ? 'accepting' : 'rejecting');
    try {
      const response = await fetch('/api/orders/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status,
          note: note.trim() || `סטטוס הזמנה עודכן ל${
            status === 'approved' ? 'הושלם' : 
            status === 'processing' ? 'בטיפול' : 'נדחה'
          }`,
          userId: globalUser._id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update order');
      }

      const data = await response.json();
      onOrderUpdate(data.order);
      setNote('');
      setErrorMessage('');
      toast({
        title: 'הצלחה',
        description: status === 'approved' ? 'ההזמנה אושרה בהצלחה' : 'ההזמנה נדחתה בהצלחה',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: error.message || 'שגיאה בעדכון ההזמנה',
        variant: 'destructive',
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    setLoadingAction('deleting');
    try {
      const response = await fetch('/api/orders/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete order');
      }

      onOrderDelete(orderId);
      toast({
        title: 'נמחק',
        description: 'ההזמנה נמחקה בהצלחה!',
      });
      onClose();
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: 'שגיאה',
        description: error.message || 'שגיאה במחיקת ההזמנה',
        variant: 'destructive',
      });
    } finally {
      setLoadingAction(null);
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

  const handleUpdateClick = async () => {
    
    try {
      const stockData = await checkStockAvailability(order.items);
      setStockInfo(stockData.stockInfo);
      setShowUpdateDialog(true);
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'שגיאה בבדיקת המלאי',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateConfirm = async (updatedOrder) => {
    setLoadingAction('updating');
    try {
      const formattedItems = updatedOrder.items.map(item => ({
        productId: typeof item.productId === 'string' ? item.productId : item.productId._id,
        quantity: parseInt(item.quantity)
      }));

      const response = await fetch('/api/orders/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: updatedOrder._id,
          items: formattedItems,
          note: 'עודכנו כמויות בהזמנה'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update order');
      }

      const data = await response.json();
      setShowUpdateDialog(false);

      onOrderUpdate(data.order);

      toast({
        title: 'הצלחה',
        description: data.message || 'ההזמנה עודכנה בהצלחה',
      });
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: 'שגיאה',
        description: error.message || 'שגיאה בעדכון ההזמנה',
        variant: 'destructive',
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleAccept = () => {
    handleUpdateOrderStatus(order._id, 'approved', note);
  };

  const handleReject = () => {
    if (!note.trim()) {
      setErrorMessage('חובה להוסיף הערה בעת דחיית הזמנה');
      return;
    }
    handleUpdateOrderStatus(order._id, 'rejected', note);
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

  return (
    <div className="p-4" dir="rtl">
      <button 
        className='border border-gray-300 rounded-md p-2 my-2 flex items-center gap-2 shadow-md' 
        onClick={() => setSelectedOrder(null)}
      >
        <ArrowRight/> חזור לרשימת ההזמנות
      </button>

      {/* ... existing header and items sections ... */}

      {/* Status Update Buttons */}
      {order.status !== 'approved' && order.status !== 'rejected' && (
        <div className="bg-white rounded-lg shadow-md mb-16 p-6">
          <h2 className="text-lg font-semibold mb-4">עדכון סטטוס</h2>
          <div className="flex gap-2">
            {isSupplier && order.status === 'pending' && (
              <>
                <button
                  onClick={() => handleUpdateOrderStatus(order._id, 'processing', note)}
                  className="flex-1 bg-blue-100 text-blue-600 px-4 py-2 rounded hover:bg-blue-200"
                >
                  התחל טיפול
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200"
                >
                  ביטול
                </button>
              </>
            )}
            {isSupplier && order.status === 'processing' && (
              <>
                <button
                  onClick={handleAccept}
                  className="flex-1 bg-green-100 text-green-600 px-4 py-2 rounded hover:bg-green-200"
                >
                  סיים טיפול
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200"
                >
                  ביטול
                </button>
              </>
            )}
            {canModifyOrder && (
              <div className="flex gap-2 w-full">
                <button
                  onClick={handleUpdateClick}
                  className="flex-1 bg-blue-100 text-blue-600 px-4 py-2 rounded hover:bg-blue-200"
                >
                  עדכן הזמנה
                </button>
                <button
                  onClick={() => handleDeleteOrder(order._id)}
                  className="flex-1 bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200"
                >
                  מחק הזמנה
                </button>
              </div>
            )}
          </div>
          {/* Show textarea only for supplier when needed */}
          {isSupplier && (order.status === 'pending' || order.status === 'processing') && (
            <div className="mt-4">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="הוסף הערה (חובה לדחייה)"
                className="w-full p-2 border rounded"
              />
              {errorMessage && (
                <p className="text-red-500 mt-2">{errorMessage}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Notes History */}
      {order.notes && order.notes.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">היסטוריית הערות</h2>
          <div className="space-y-3">
            {order.notes.map((note, index) => (
              <div key={index} className="border-r-2 border-gray-200 pr-4">
                <div className="text-sm text-gray-600">
                  {new Date(note.date).toLocaleDateString('he-IL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="text-gray-800 mt-1">{note.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ... rest of the existing code ... */}
    </div>
  );
}
