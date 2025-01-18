'use client';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function ReorderConfirmationDialog({ isOpen, onClose, order, stockInfo, isReordering, setIsReordering, onSuccess, globalUser }) {
  const [editedItems, setEditedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (order) {
      setEditedItems(order.items.map(item => {
        const available = stockInfo?.[item.productId._id]?.available || 0;
        const initialQuantity = Math.min(item.quantity, available);
        return {
          ...item,
          availableStock: available,
          quantity: initialQuantity,
          hasError: initialQuantity > available
        };
      }));
      setLoading(false);
    }
  }, [order, stockInfo]);

  const handleConfirm = async () => {
    if (!order || !globalUser) return;

    try {
      setIsReordering(true);
      const orderData = {
        supplierId: order.supplierId._id,
        clientId: globalUser._id,
        items: editedItems.map(item => ({
          productId: item.productId._id,
          quantity: parseInt(item.quantity),
          price: item.productId.price,
          total: parseInt(item.quantity) * item.productId.price
        })),
        total: editedItems.reduce((sum, item) => 
          sum + (parseInt(item.quantity) * item.productId.price), 0
        ),
        status: 'pending',
        orderNumber: Math.floor(100000 + Math.random() * 900000).toString(),
        createdAt: new Date(),
      };

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create order');
      }

      const newOrder = await response.json();
      onSuccess(newOrder);
      onClose();
      toast({
        title: 'הצלחה',
        description: 'ההזמנה נוצרה בהצלחה',
      });
    } catch (error) {
      console.error('Reorder error:', error);
      toast({
        title: 'שגיאה',
        description: error.message || 'שגיאה ביצירת ההזמנה',
        variant: 'destructive',
      });
    } finally {
      setIsReordering(false);
    }
  };

  const handleQuantityChange = (index, value) => {
    setEditedItems(prev => prev.map((item, i) => {
      if (i === index) {
        const newQuantity = value === '' ? '' : parseInt(value);
        return {
          ...item,
          quantity: newQuantity,
          hasError: newQuantity !== '' && (newQuantity <= 0 || newQuantity > item.availableStock)
        };
      }
      return item;
    }));
  };

  const handleDeleteItem = (index) => {
    setEditedItems(prev => prev.filter((_, i) => i !== index));
  };

  if (!isOpen || loading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-45 flex items-center justify-center p-4">
      {isReordering && <div className="fixed w-full h-screen bg-black bg-opacity-25 top-0 left-0 z-50"></div>}
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">אישור הזמנה חוזרת</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
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
                        onClick={() => handleDeleteItem(index)}
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
              onClick={handleConfirm}
              disabled={editedItems.some(item => 
                item.hasError || 
                item.quantity === '' || 
                item.quantity <= 0
              ) || editedItems.length === 0}
              className="px-4 py-2 bg-customBlue text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isReordering ? (<span className='animate-pulse'>מאשר הזמנה...</span>) : (<>אשר הזמנה</>)}  
            </button>
          </div>
          {editedItems.length === 0 && (
            <p className="text-center text-red-500 mt-4">
              לא ניתן לעדכן הזמנה ללא פריטים
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 