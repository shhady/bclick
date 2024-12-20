'use client';
import React, { useState } from 'react';
import { useUserContext } from '@/app/context/UserContext';
import { useToast } from '@/hooks/use-toast';

export default function OrderDetailsPage({ order, onClose, onUpdateOrder, onDeleteOrder, onUpdateOrderStatus }) {
  const { globalUser,updateGlobalUser  } = useUserContext();
  const { toast } = useToast();
  const [note, setNote] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const totalPriceBeforeTax = order?.total / (1 + order?.tax);
  const taxAmount = order?.total - totalPriceBeforeTax;
  const handleAccept = async () => {
    setErrorMessage('');
    try {
      await onUpdateOrderStatus(order._id, 'approved', null); // Update status
      toast({
        title: 'Success',
        description: 'ההזמנה אושרה בהצלחה!',
      });
      const updatedOrders = globalUser.orders.map((o) =>
        o._id === order._id ? { ...o, status: 'approved' } : o
      );
      updateGlobalUser({ orders: updatedOrders });
      onClose(); // Close the details page and go back to the table
    } catch (error) {
      setErrorMessage('שגיאה באישור ההזמנה. אנא נסה שוב.');
    }
  };

  const handleReject = async () => {
    if (!note) {
      setErrorMessage('יש להוסיף הערה לדחייה.');
      return;
    }
    setErrorMessage('');
    try {
      await onUpdateOrderStatus(order._id, 'rejected', note); // Update status
      toast({
        title: 'Success',
        description: 'ההזמנה נדחתה בהצלחה!',
      });
      const updatedOrders = globalUser.orders.map((o) =>
        o._id === order._id ? { ...o, status: 'rejected' } : o
      );
      updateGlobalUser({ orders: updatedOrders });
      onClose(); // Close the details page and go back to the table
    } catch (error) {
      setErrorMessage('שגיאה בדחיית ההזמנה. אנא נסה שוב.');
    }
  };

  const handleUpdate = async () => {
    if (!note) {
      setErrorMessage('יש להוסיף פרטים לעדכון ההזמנה.');
      return;
    }
    setErrorMessage('');
    try {
      await onUpdateOrder(order._id, 'pending', note);
      toast({
        title: 'Success',
        description: 'ההזמנה עודכנה בהצלחה!',
      });
      onClose(); // Close the details page and go back to the table
    } catch (error) {
      setErrorMessage('שגיאה בעדכון ההזמנה. אנא נסה שוב.');
    }
  };
  const handleDelete = async () => {
    try {
      await onDeleteOrder(order._id); // Call the passed function to delete the order
    } catch (error) {
      setErrorMessage('שגיאה במחיקת ההזמנה. אנא נסה שוב.');
    }
  };
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">מס&apos; הזמנה: {order?.orderNumber}</h1>
          <p className="text-gray-500 text-sm">תאריך: {new Date(order.createdAt).toLocaleDateString('he-IL')}</p>
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
          <strong>סה&quot;כ לפני מע&quot;מ:</strong> ₪{totalPriceBeforeTax.toFixed(2)}
        </p>
        <p>
          <strong>מע&quot;מ (17%):</strong> ₪{taxAmount.toFixed(2)}
        </p>
        <p className="font-bold">
          <strong>סה&quot;כ להזמנה:</strong> ₪{order.total.toFixed(2)}
        </p>
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


      {/* Add Note Section */}
      {order?.status === 'pending' && (
        <div className="mt-4">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="הוסף הערה (אופציונלי)"
            className="border w-full mt-2 p-2 rounded"
          ></textarea>

          {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}

          <div >
            {globalUser?.role === 'supplier' ? (
              <div  className=' mt-4'>
                <div className='flex justify-between items-center gap-2'>
                <button onClick={handleAccept} className="px-4 py-2 bg-green-500 text-white rounded">
                   אישור הזמנה
                </button>
                <button onClick={handleReject} className="px-4 py-2 bg-red-500 text-white rounded">
                    דחיית הזמנה
                </button>
                </div>
               
                <button onClick={onClose} className="px-4 py-2 bg-customBlue text-white rounded mt-4">
                     חזור
                 </button>
              </div>
            ) : globalUser?.role === 'client' ? (
                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded">
    מחק הזמנה
  </button>

            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
