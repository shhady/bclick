'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { deleteCart } from '@/app/actions/cartActions';
import Link from 'next/link';
import debounce from 'lodash.debounce';
import { useCartContext } from '@/app/context/CartContext';

export default function CartPage({ clientId, supplierId, cart: initialCart }) {
  const [cart, setCart] = useState(initialCart);
  const [pendingChanges, setPendingChanges] = useState('');
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();
  const [pendingUpdates, setPendingUpdates] = useState({});
  const { fetchCartAgain, setItemCount } = useCartContext();

  // Calculate total price
  const calculateTotalPrice = () => {
    return cart?.items?.reduce((total, item) => total + item.productId.price * item.quantity, 0) || 0;
  };
  const debouncedUpdate = useCallback(
    debounce(async (productId, quantity) => {
      if (quantity < 1) return; // Don't update invalid quantities

      try {
        const response = await fetch('/api/cart', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId,
            supplierId,
            productId,
            quantity,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update quantity');
        }

        // Remove pending update status
        setPendingUpdates((prev) => {
          const { [productId]: _, ...rest } = prev;
          return rest;
        });
      } catch (err) {
        console.error('Error updating quantity:', err);
      }
    }, 500),
    [] // Empty dependency ensures the function is only created once
  );
 
// Validates the new quantity and updates the cart state
const validateAndUpdateQuantity = (productId, newQuantity) => {
  const existingItem = cart.items.find((item) => item.productId._id === productId);
  if (!existingItem) return;

  const maxAvailable = existingItem.productId.stock - (existingItem.productId.reserved || 0);

  if (newQuantity > maxAvailable) {
    setCart((prevCart) => ({
      ...prevCart,
      items: prevCart.items.map((item) =>
        item.productId._id === productId
          ? { ...item, invalid: true, errorMessage: `הכמות מקסימלית ${maxAvailable}` }
          : item
      ),
    }));
    return;
  }

  if (newQuantity < 1) {
    setCart((prevCart) => ({
      ...prevCart,
      items: prevCart.items.map((item) =>
        item.productId._id === productId
          ? { ...item, invalid: true, errorMessage: 'כמות מינימלית היא 1' }
          : item
      ),
    }));
    return;
  }

  // Clear invalid state if quantity is valid
  setCart((prevCart) => ({
    ...prevCart,
    items: prevCart.items.map((item) =>
      item.productId._id === productId
        ? { ...item, invalid: false, errorMessage: '', quantity: newQuantity }
        : item
    ),
  }));

  // Trigger database update
  debouncedUpdate(productId, newQuantity);

  // Mark the item as pending for updates
  setPendingUpdates((prevUpdates) => ({
    ...prevUpdates,
    [productId]: true,
  }));
};

// Handles quantity change for both button clicks and input changes
const handleQuantityChange = (productId, newQuantity) => {
  validateAndUpdateQuantity(productId, newQuantity);
};
  
  // Validate stock before proceeding
  const validateStock = () => {
    const errors = [];
    const updatedCart = { ...cart };

    updatedCart.items.forEach((item) => {
      const maxAvailable = item.productId.stock - (item.productId.reserved || 0);
      if (item.quantity > maxAvailable) {
        errors.push({
          productId: item.productId._id,
          maxAvailable,
        });
        updatedCart.items = updatedCart.items.map((i) =>
          i.productId._id === item.productId._id ? { ...i, quantity: maxAvailable } : i
        );
      }
    });

    setCart(updatedCart);
    return errors;
  };

  // Confirm and submit the order
  const handleSubmitOrder = async () => {
    const stockErrors = validateStock();

    if (stockErrors.length > 0) {
      setValidationError(
        stockErrors
          .map(
            (error) =>
              `המקסימום שניתן להזמין עבור ${cart.items.find((item) => item.productId._id === error.productId).productId.name} הוא ${error.maxAvailable}`
          )
          .join('\n')
      );
      return;
    }

    setShowConfirmation(true);
  };

  const confirmOrder = async () => {
    try {
      const total = calculateTotalPrice();
      const orderDetails = {
        clientId,
        supplierId,
        date: new Date(),
        items: cart.items.map((item) => ({
          productId: item.productId._id,
          quantity: item.quantity,
          price: item.productId.price,
          total: item.quantity * item.productId.price,
        })),
        total,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderDetails),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      await deleteCart({ clientId, supplierId });
      setCart(null);
      setShowConfirmation(false);

      router.push(`/client/${clientId}/supplier-orders`);
    } catch (error) {
      console.error('Error submitting order:', error);
      setError('Error submitting the order');
      setShowConfirmation(false);
    }
  };
  const handleDeleteCart = async () => {
    try {
      await deleteCart({ clientId, supplierId });
      setCart(null);
    } catch (error) {
      console.error('Error deleting cart:', error);
    }
  };
  // Handle item deletion
  const handleDeleteItem = async (productId) => {
    try {
      setCart((prevCart) => ({
        ...prevCart,
        items: prevCart.items.filter((item) => item.productId._id !== productId),
      }));
      
     
      await fetch(`/api/cart?clientId=${clientId}&supplierId=${supplierId}&productId=${productId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting cart item:', error);
      setError('Error deleting item');
    }
  };

console.log(cart);
  if (!cart) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl">העגלה שלך עם הספק הזה ריקה</h2>
        <Link href={`/client/${clientId}/supplier-catalog/${supplierId}`} className="bg-customBlue px-4 py-4 rounded-md">
          <button>חזור לקלוג</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mb-20">
      <div>

      </div>
      <div className="bg-gray-200 px-6 py-4 sticky top-0 left-0 md:top-20">
        <div className="flex justify-between items-center bg-gray-200 p-2 rounded">
          <h2 className="text-lg font-bold">הזמנה שלי</h2>
          <button  onClick={async () => {
      await handleDeleteCart(); // Ensure the cart is deleted first
      fetchCartAgain();        // Trigger the cart fetch after deletion
    }} className="text-red-500 text-lg">
            🗑️
          </button>
        </div>

        <div className="p-2 grid grid-cols-2">
          <div className="flex flex-col justify-start items-start gap-2">
            <span>תאריך: {new Date(cart.createdAt).toLocaleDateString()}</span>
            <h3 className="font-bold">סה&quot;כ: ₪{calculateTotalPrice()}</h3>
          </div>
          <div className="flex flex-col justify-end items-end h-full gap-4">
            <button
              onClick={() => router.push(`/client/${clientId}/supplier-catalog/${supplierId}`)}
              className="text-gray-600 border-2 border-gray-600 px-2 w-fit rounded-md"
            >
              הוסף עוד +
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4">
        {cart?.items?.map((item) => (
          <div key={item.productId._id} className="grid grid-cols-3 p-2 bg-white rounded shadow mb-2">
            <Image
              
src={item.productId.imageUrl?.secure_url || '/no-image.jpg'}
alt={item.productId.name}
width={100}
height={100}
className="w-full h-full max-h-[100px] max-w-[100px] min-h-[100px] min-w-[100px] md:max-h-48 md:max-w-1/2 md:min-h-48 md:min-w-fll object-contain"
/>
            <div className="flex flex-col py-2 h-full justify-between items-start">
              <h3 className="font-bold">{item.productId.name}</h3>
              <p>
                {item.productId.weight} {item.productId.weightUnit}
              </p>

              <div className="flex items-center gap-1 rounded-md border-2 w-[130px]">
              <button
    className="w-full"
    onClick={() =>
      handleQuantityChange(item.productId._id, Math.max(item.quantity - 1, 1))
    }
  >
    -
  </button>                {/* <span>{item.quantity}</span> */}
                <input
    type="number"
    className={`border rounded px-2 w-16 ${item.invalid ? 'border-red-500' : ''}`}
    value={item.quantity || ''} // Allow empty input
    onFocus={(e) => e.target.select()} // Select the entire value on focus
    onChange={(e) => {
      const value = e.target.value;

      // Allow clearing the input temporarily
      if (value === '') {
        setCart((prevCart) => ({
          ...prevCart,
          items: prevCart.items.map((i) =>
            i.productId._id === item.productId._id
              ? { ...i, quantity: '', invalid: true, errorMessage: 'חייב 1 לפחות' }
              : i
          ),
        }));
        return;
      }

      const newValue = parseInt(value, 10);
      handleQuantityChange(item.productId._id, newValue);
    }}
    onBlur={(e) => {
      const value = e.target.value;

      // Reset to minimum if empty or invalid on blur
      if (value === '' || parseInt(value, 10) < 1) {
        validateAndUpdateQuantity(item.productId._id, item.quantity);
      }
    }}
  />
  <button
    className="w-full"
    onClick={() => handleQuantityChange(item.productId._id, item.quantity + 1)}
  >
    +
  </button>
</div>
              {item.invalid ? (
      <span className="text-red-500 text-sm h-2">{item.errorMessage}</span>
    ):(<span className="animate-pulse h-2"></span>)}
    {pendingUpdates[item.productId._id] && !item.invalid ? (
      <span className="animate-pulse h-2 text-sm">מעדכן...</span>
    ):( <span className="animate-pulse h-2"></span>)}
    {pendingChanges ? (
      <span className="text-red-500 text-sm h-2">{pendingChanges}</span>
    ):(<span className="animate-pulse h-2"></span>)}
            </div>
            <div className="flex flex-col h-full py-2 items-center justify-between">
              <p className="text-lg font-bold">₪{item.productId.price * item.quantity}</p>
              <button onClick={async () => {
      await handleDeleteItem(item.productId._id); // Ensure the cart is deleted first
      fetchCartAgain();        // Trigger the cart fetch after deletion
    }} className="text-red-500">
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleSubmitOrder} className="bg-customBlue text-white mt-4 w-full py-2 rounded">
        אישור הזמנה
      </button>

      {validationError && (
        <p className="text-red-500 font-bold text-center mt-4 whitespace-pre-line">{validationError}</p>
      )}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded shadow-lg text-center">
            <p>האם אתה בטוח שברצונך להמשיך עם ההזמנה?</p>
            <div className="flex justify-center gap-4 mt-4">
              <button onClick={confirmOrder} className="bg-green-500 text-white px-4 py-2 rounded">
                אישור
              </button>
              <button onClick={() => setShowConfirmation(false)} className="bg-gray-300 px-4 py-2 rounded">
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 font-bold text-center mt-4">{error}</p>}
    </div>
  );
}

