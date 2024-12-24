'use client';
import { useState, useEffect } from 'react';

export function ReorderConfirmationDialog({ isOpen, onClose, onConfirm, order, stockInfo }) {
  const [editedItems, setEditedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (order) {
      setEditedItems(order.items.map(item => {
        const available = stockInfo?.[item.productId._id]?.available || 0;
        return {
          ...item,
          availableStock: available,
          quantity: Math.min(item.quantity, available),
          hasError: item.quantity > available
        };
      }));
      setLoading(false);
    }
  }, [order, stockInfo]);

  const handleQuantityChange = (index, value) => {
    setEditedItems(prev => prev.map((item, i) => {
      if (i === index) {
        const newQuantity = value === '' ? 0 : parseInt(value);
        return {
          ...item,
          quantity: newQuantity,
          hasError: newQuantity <= 0 || newQuantity > item.availableStock
        };
      }
      return item;
    }));
  };

  if (!isOpen || loading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">אישור הזמנה חוזרת</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <span className="text-2xl">×</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-right p-2 border">מוצר</th>
                  <th className="text-center p-2 border">כמות זמינה</th>
                  <th className="text-center p-2 border">כמות מבוקשת</th>
                  <th className="text-center p-2 border">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {editedItems.map((item, index) => (
                  <tr key={item.productId._id} 
                      className={`border-b ${item.hasError ? 'border-red-500 bg-red-50' : ''}`}>
                    <td className="p-2 border">{item.productId.name}</td>
                    <td className="text-center p-2 border">
                      {item.availableStock}
                      {item.hasError && (
                        <div className="text-red-500 text-sm">
                          מקסימום כמות להזמנה: {item.availableStock}
                        </div>
                      )}
                    </td>
                    <td className="text-center p-2 border">
                      <input
                        type="number"
                        value={item.quantity || ''}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        className={`w-20 text-center border p-1 rounded ${
                          item.hasError ? 'border-red-500' : 'border-gray-300'
                        }`}
                        min="1"
                        max={item.availableStock}
                      />
                      {item.quantity <= 0 && (
                        <div className="text-red-500 text-sm mt-1">
                          נדרש להזין כמות
                        </div>
                      )}
                    </td>
                    <td className="text-center p-2 border">
                      <button
                        onClick={() => {
                          setEditedItems(prev => prev.filter((_, i) => i !== index));
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        מחק
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md"
            >
              ביטול
            </button>
            <button
              onClick={() => {
                const updatedOrder = {
                  ...order,
                  items: editedItems
                };
                onConfirm(updatedOrder);
              }}
              disabled={editedItems.some(item => item.hasError || item.quantity <= 0)}
              className="px-4 py-2 bg-customBlue text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              אשר הזמנה
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 