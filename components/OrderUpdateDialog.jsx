'use client';
import { useState, useEffect } from 'react';

export function OrderUpdateDialog({ isOpen, onClose, onConfirm, order, stockInfo, loadingAction }) {
  const [editedItems, setEditedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (order && stockInfo) {
      // Make sure stockInfo exists and has the necessary data
      try {
        setEditedItems(order.items.map(item => {
          const productId = item.productId._id.toString();
          // Check if stockInfo has data for this product
          if (!stockInfo[productId]) {
            console.warn(`No stock info for product ${productId}`);
            return {
              ...item,
              productId: item.productId,
              availableStock: 0, // Default to 0 if no stock info
              originalQuantity: item.quantity,
              quantity: item.quantity,
              hasError: true,
              isEmpty: false
            };
          }
          
          return {
            ...item,
            productId: item.productId,
            availableStock: stockInfo[productId].stock,
            originalQuantity: item.quantity,
            quantity: item.quantity,
            hasError: false,
            isEmpty: false
          };
        }));
      } catch (error) {
        console.error("Error setting edited items:", error);
      }
      setLoading(false);
    }
  }, [order, stockInfo]);

  const handleQuantityChange = (index, value) => {
    setEditedItems(prev => prev.map((item, i) => {
      if (i === index) {
        const newQuantity = value === '' ? '' : parseInt(value);
        return {
          ...item,
          quantity: newQuantity,
          hasError: typeof newQuantity === 'number' && (newQuantity <= 0 || newQuantity > item.availableStock),
          isEmpty: value === ''
        };
      }
      return item;
    }));
  };

  const handleConfirm = () => {
    // Validate all quantities
    if (hasInvalidInputs) return;

    // Only include items that weren't deleted and have valid quantities
    const updatedItems = editedItems
      .filter(item => item.quantity > 0)
      .map(item => ({
        productId: item.productId._id,
        quantity: parseInt(item.quantity),
        price: item.productId.price,
        total: item.productId.price * parseInt(item.quantity)
      }));

    onConfirm(updatedItems);
  };

  // If dialog is not open or still loading, don't render anything
  if (!isOpen || loading) return null;

  // Check if any items have errors or empty values
  const hasInvalidInputs = editedItems.some(item => item.hasError || item.isEmpty);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-45 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">עדכון הזמנה</h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
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
                  <th className="text-center p-2 border">כמות נוכחית</th>
                  <th className="text-center p-2 border">כמות חדשה</th>
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
                      {item.originalQuantity}
                    </td>
                    <td className="text-center p-2 border">
                      <input
                        type="number"
                        onFocus={(e) => e.target.select()}
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        className={`w-20 text-center border p-1 rounded ${
                          item.hasError || item.isEmpty ? 'border-red-500' : 'border-gray-300'
                        }`}
                        min="1"
                        max={item.availableStock}
                      />
                      {item.isEmpty && (
                        <div className="text-red-500 text-sm mt-1">
                          נדרש הזין כמות
                        </div>
                      )}
                      {item.hasError && !item.isEmpty && (
                        <div className="text-red-500 text-sm mt-1">
                          כמות לא תקינה
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
              onClick={handleConfirm}
              disabled={hasInvalidInputs || loadingAction === 'updating' || editedItems.length === 0}
              className="px-4 py-2 bg-customBlue text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingAction === 'updating' ? 'מעדכן...' : 'עדכן הזמנה'}
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