'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartContext } from '@/app/context/CartContext';
import { deleteCart } from '@/app/actions/cartActions';

export default function SubmitOrder({ cart, clientId, supplierId }) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState(''); // State to store the textarea value
  const router = useRouter();
  const { clearCart } = useCartContext();

  const handleSubmitOrder = () => {
    setShowConfirmation(true);
  };

  const confirmOrder = async () => {
    setLoading(true);
    setErrorMessage('');
    
    try {
      // Validate stock
      const response = await fetch('/api/orders/validate-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          supplierId,
          items: cart.items.map((item) => ({
            productId: item.productId._id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        setErrorMessage(result.message || 'שגיאה בעת בדיקת המלאי');
        return;
      }

      // Create order
      const orderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId:cart.clientId,
          supplierId:cart.supplierId,
          items: cart.items.map((item) => ({
            productId: item.productId._id,
            quantity: item.quantity,
            price: item.productId.price,
            total: item.quantity * item.productId.price,
            name: item.productId.name,
            barCode: item.productId.barCode
          })),
          total: cart.items.reduce(
            (sum, item) => sum + item.quantity * item.productId.price,
            0
          ),
          tax: 0.17,
          note, // Include the optional note in the order payload
        }),
      });

      if (!orderResponse.ok) {
        const orderResult = await orderResponse.json();
        setErrorMessage(orderResult.message || 'שגיאה בעת יצירת ההזמנה');
        return;
      }

      // Clear cart and navigate to profile
      await clearCart(cart.clientId, cart.supplierId);
    //   await deleteCart({ clientId, supplierId });

      router.push('/profile');
    } catch (error) {
      setErrorMessage('שגיאה בעת עיבוד ההזמנה');
      console.error('Order submission failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleSubmitOrder}
        className="bg-customBlue text-white mt-1 w-full py-2 rounded"
      >
        אישור הזמנה
      </button>
      {showConfirmation && (
        <div
          className="fixed top-0 left-0 w-full h-screen flex justify-center items-center bg-black bg-opacity-40"
          onClick={(e) => {e.stopPropagation()}} // Prevent background click from closing
        >
          <div className="bg-white p-6 rounded-md shadow-lg z-50">
            <p>האם אתה בטוח שברצונך ליצור את ההזמנה?</p>
            {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
            {errorMessage ? (<div onClick={() => {setShowConfirmation(false);setErrorMessage('')}}>חזור</div>):( <> <textarea
              name="message"
              className="border w-full mt-2 p-2 rounded"
              placeholder="הוסף הערה (אופציונלי)"
              value={note}
              onChange={(e) => setNote(e.target.value)} // Update the note state
            />
           <div className="flex justify-end gap-2 mt-4">
            <button
                onClick={confirmOrder}
                className="bg-green-500 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                {loading ? 'מעבד...' : 'כן'}
              </button>
              <button
                onClick={() => {setShowConfirmation(false);setErrorMessage('')}}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                לא
              </button>
            </div></>)}  
          </div>
        </div>
      )}
    </div>
  );
}
