'use client';
import React from 'react';

export default function OrderDetailsPage({ order, onClose }) {
  const totalPriceBeforeTax = order.total / (1 + order.tax);
  const taxAmount = order.total - totalPriceBeforeTax;

  return (
    <div className="p-4">
        <div className=' flex justify-end items-center'>
        <button onClick={onClose} className="text-red-500 text-xl">X</button>

        </div>
    <div className='flex justify-between items-center mt-4'>
    <h1 className="text-xl font-bold mt-4">מס' הזמנה: {order.orderNumber}</h1>
      <p>תאריך: {new Date(order.date).toLocaleDateString('he-IL')}</p>

    </div>
      
      <table className="table-auto w-full border-collapse border border-gray-300 mt-12">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">פריט</th>
            <th className="border border-gray-300 px-4 py-2">כמות</th>
            <th className="border border-gray-300 px-4 py-2">מחיר ליחידה</th>
            <th className="border border-gray-300 px-4 py-2">סה"כ</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.productId._id}>
              <td className="border border-gray-300 px-4 py-2">{item.productId.name}</td>
              <td className="border border-gray-300 px-4 py-2">{item.quantity}</td>
              <td className="border border-gray-300 px-4 py-2">₪{item.productId.price.toFixed(2)}</td>
              <td className="border border-gray-300 px-4 py-2">₪{(item.quantity * item.productId.price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4">
        <p>סה"כ לפני מע"מ: ₪{totalPriceBeforeTax.toFixed(2)}</p>
        <p>מע"מ (17%): ₪{taxAmount.toFixed(2)}</p>
        <p className="font-bold">סה"כ להזמנה: ₪{order.total.toFixed(2)}</p>
      </div>

      {order.notes && (
        <div className="mt-4">
          <h2 className="font-bold">הערות:</h2>
          <p>{order.notes}</p>
        </div>
      )}

      <button
        onClick={onClose}
        className="px-4 py-2 bg-blue-500 text-white mt-4 rounded"
      >
        חזור
      </button>
    </div>
  );
}
