'use client';
import React, { useState } from 'react';
import { useUserContext } from '@/app/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import { OrderUpdateDialog } from '@/components/OrderUpdateDialog';

export default function OrderDetailsPage({ order, onClose, onUpdateOrderStatus, onDeleteOrder, onOrderUpdate }) {
  const { globalUser, updateGlobalUser } = useUserContext();
  const { toast } = useToast();
  const [note, setNote] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [stockInfo, setStockInfo] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null); // New state to track the current loading action
  const canModifyOrder = order?.status === 'pending' && globalUser?.role === 'client';
  const isSupplier = globalUser?.role === 'supplier';

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
      // Log the data being sent
    

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

      if (onOrderUpdate) {
        onOrderUpdate(data.order);
      }

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

  const handleAccept = async () => {
    setLoadingAction('accepting');
    try {
      // const response = await fetch('/api/orders/update', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     orderId: order._id,
      //     status: 'approved',
      //     note: note || 'ההזמנה אושרה',
      //     userId: globalUser._id
      //   }),
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.error || 'Failed to approve order');
      // }

      await onUpdateOrderStatus(order._id, 'approved', note);
      toast({
        title: 'הצלחה',
        description: 'ההזמנה אושרה בהצלחה ונשלח מייל ללקוח',
      });
      onClose();
    } catch (error) {
      setErrorMessage('שגיאה באישור ההזמנה. אנא נסה שוב.');
      toast({
        title: 'שגיאה',
        description: error.message || 'שגיאה באישור ההזמנה',
        variant: 'destructive',
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReject = async () => {
    if (!note) {
      setErrorMessage('יש להוסיף הערה לדחייה.');
      return;
    }

    setLoadingAction('rejecting');
    try {
      // const response = await fetch('/api/orders/update', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     orderId: order._id,
      //     status: 'rejected',
      //     note: note,
      //     userId: globalUser._id
      //   }),
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.error || 'Failed to reject order');
      // }

      await onUpdateOrderStatus(order._id, 'rejected', note);
      toast({
        title: 'הצלחה',
        description: 'ההזמנה נדחתה בהצלחה',
      });
      onClose();
    } catch (error) {
      setErrorMessage('שגיאה בדחיית ההזמנה. אנא נסה שוב.');
      toast({
        title: 'שגיאה',
        description: error.message || 'שגיאה בדחיית ההזמנה',
        variant: 'destructive',
      });
    } finally {
      setLoadingAction(null);
    }
  };
  const handleDeleteOrder = async () => {
    setLoadingAction('deleting');
    try {
      await onDeleteOrder(order._id);
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'שגיאה במחיקת ההזמנה. אנא נסה שוב.',
        variant: 'destructive',
      });
    } finally {
      setLoadingAction(null);
    }
  };
  return (
    <div className="container mx-auto p-4">
            {loadingAction && <div className="fixed w-full h-screen bg-black bg-opacity-25 top-0 left-0 z-50"></div>}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">מס&apos; הזמנה: {order?.orderNumber}</h1>
          <p className="text-gray-500 text-sm">תאריך: {new Date(order.createdAt).toLocaleDateString('he-IL')}</p>
          <p className="text-gray-600">
            {globalUser?.role === 'client' 
              ? `ספק: ${order?.supplierId?.businessName}`
              : `לקוח: ${order?.clientId?.businessName}`
            }
          </p>
        </div>
        <button onClick={onClose} className="text-red-500 text-xl">
          X
        </button>
      </div>

     

      {/* Order Table */}
      <table className="table-auto w-full border-collapse border border-gray-300 mt-12">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">פריט</th>
            <th className="border border-gray-300 px-4 py-2">כמות</th>
            <th className="border border-gray-300 px-4 py-2">מחיר ליחידה</th>
            <th className="border border-gray-300 px-4 py-2">סה&quot;כ</th>
          </tr>
        </thead>
        <tbody>
          {order?.items.map((item) => (
            <tr key={item?.productId._id}>
              <td className="border border-gray-300 px-4 py-2">{item?.productId?.name}</td>
              <td className="border border-gray-300 px-4 py-2">{item?.quantity}</td>
              <td className="border border-gray-300 px-4 py-2">₪{item?.productId?.price.toFixed(2)}</td>
              <td className="border border-gray-300 px-4 py-2">
                ₪{(item?.quantity * item?.productId?.price).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Order Summary */}
      <div className="mt-4 flex flex-col justify-end items-end">
        <p>
          <strong>סה&quot;כ לפני מע&quot;מ:</strong> ₪{(order?.total / (1 + order?.tax)).toFixed(2)}
        </p>
        <p>
          <strong>מע&quot;מ (18%):</strong> ₪{(order?.total - order?.total / (1 + order?.tax)).toFixed(2)}
        </p>
        <p className="font-bold">
          <strong>סה&quot;כ להזמנה:</strong> ₪{order?.total.toFixed(2)}
        </p>
      </div>
      <div className="mt-4">
        {/* <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          חזור
        </button> */}

        {/* Add Note Section */}
        {order?.status === 'pending' && (
          <div className="mt-4 ">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={isSupplier ? "הוסף הערה (חובה לדחייה)" : "הוסף הערה (אופציונלי)"}
              className="border w-full lg:w-1/2 mt-2 p-2 rounded"
            ></textarea>

            {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}

            <div className="mt-4">
             

              {isSupplier && (
                <div className="flex justify-between items-center">
                  <button 
                    onClick={handleAccept} 
                    disabled={loadingAction !== null}
                    className="px-4 py-2 bg-customGreen text-white rounded hover:bg-customGreen-600"
                  >
                     {loadingAction === 'accepting' ? 'מאשר...' : 'אישור הזמנה'}
                  </button>
                  <button 
                    onClick={handleReject} 
                    disabled={loadingAction !== null}
                    className="px-4 py-2 bg-customRed text-white rounded hover:bg-red-600"
                  >
                    {loadingAction === 'rejecting' ? <span className='animate-pulse'> דוחה הזמנה...</span>  : 'דחיית הזמנה'}
                  </button>
                </div>
              )}

              {canModifyOrder && (
                <div className="flex justify-between items-center">
                  
                  <button
                    onClick={handleUpdateClick}
                    disabled={loadingAction !== null}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                  >
                     {loadingAction === 'updating' ? <span className='animate-pulse'> מעדכן...</span> : 'עדכן הזמנה'}
                  </button>
                  <button
                    onClick={() => handleDeleteOrder(order._id)}
                    disabled={loadingAction !== null}
                    className="px-4 py-2 bg-customRed text-white rounded"
                  >
                    {loadingAction === 'deleting' ? <span className='animate-pulse'>מוחק...</span>  : 'מחק הזמנה'}
                  </button>
                </div>
              )}
            </div>
            <div className='flex justify-center items-center'>
            <button
                onClick={onClose}
                className="px-4 py-2 bg-customBlue text-white rounded w-1/2  mt-4"
              >
                חזור
              </button>
            </div>
           
          </div>
        )}
      </div>
      {/* Notes Section */}
      {order?.notes?.length > 0 && (
        <div className="mt-4">
          <h2 className="font-bold">הערות:</h2>
          <ul className="list-disc ml-4">
            {order.notes.map((note, index) => (
              <li key={index}>
                <p>{note.message}</p>
                <p className="text-gray-500 text-sm">
                  תאריך: {new Date(note.date).toLocaleDateString('he-IL')}
                </p>
              </li>
            ))}
          </ul>
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
