'use client';
import React, { useState } from 'react';
import { FiPrinter, FiCheck, FiX, FiClock } from 'react-icons/fi';
import { OrderUpdateDialog } from '@/components/OrderUpdateDialog';
import { useToast } from '@/hooks/use-toast';

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

export default function OrderDetails({ 
  order, 
  onClose, 
  onOrderUpdate, 
  onOrderDelete,
  isSupplier,
  canModifyOrder,
  globalUser,
  handlePrint,
  printRef
}) {
  const [note, setNote] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [stockInfo, setStockInfo] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);
  const { toast } = useToast();

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

  return (
    <div className="p-4" dir="rtl">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {/* ... copy the header and timeline JSX ... */}
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 overflow-x-auto">
        {/* ... copy the table JSX ... */}
      </div>

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

      {/* Status Update Buttons */}
      {order.status !== 'approved' && order.status !== 'rejected' ? (
        <div className="bg-white rounded-lg shadow-md mb-16 p-6">
          <div className="flex flex-col items-center justify-center">
            <span className={`text-lg font-semibold ${
              order.status === 'approved' ? 'text-green-600' : 'text-red-600'
            }`}>
              {order.status === 'approved' ? 'סטטוס הושלם' : 'ההזמנה בוטלה'}
            </span>
            {order.status === 'rejected' && order.notes && order.notes.length > 0 && (
              <p className="text-red-500 mt-2">{order.notes[order.notes.length - 1].message}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md mb-16 p-6">
          <div className="flex flex-col items-center justify-center">
            <span className={`text-lg font-semibold ${
              order.status === 'approved' ? 'text-green-600' : 'text-red-600'
            }`}>
              {order.status === 'approved' ? 'סטטוס הושלם' : 'ההזמנה בוטלה'}
            </span>
            {order.status === 'rejected' && order.notes && order.notes.length > 0 && (
              <p className="text-red-500 mt-2">{order.notes[order.notes.length - 1].message}</p>
            )}
          </div>
        </div>
      )}

      <OrderUpdateDialog
        isOpen={showUpdateDialog}
        onClose={() => setShowUpdateDialog(false)}
        onConfirm={handleUpdateConfirm}
        order={order}
        stockInfo={stockInfo}
        loadingAction={loadingAction}
      />
    </div>
  );
} 