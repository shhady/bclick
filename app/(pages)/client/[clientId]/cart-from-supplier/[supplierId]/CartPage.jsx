'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { deleteCart } from '@/app/actions/cartActions';
import Link from 'next/link';
import debounce from 'lodash.debounce';
import { useCartContext } from '@/app/context/CartContext';
import SubmitOrder from './SubmitOrder';
import { Trash2 } from 'lucide-react';
export default function CartPage({ clientId, supplierId, cart: initialCart }) {
  const [cart, setCart] = useState({});
  const [localChanges, setLocalChanges] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();
  const { fetchCartAgain } = useCartContext();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingProducts, setUpdatingProducts] = useState({}); // Track updating state per product

  // Calculate total price
  const calculateTotalPrice = () => {
    return cart?.items?.reduce(
      (total, item) => total + item.productId.price * item.quantity,
      0
    ) || 0;
  };

  useEffect(()=>{
    setCart(initialCart)
  },[initialCart])
  // Debounced database update

  const debouncedUpdate = useCallback(
    debounce(async (productId, quantity) => {
      try {
        setUpdatingProducts((prev) => ({
          ...prev,
          [productId]: true, // Set the product as updating
        }));
  
        const response = await fetch('/api/cart', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId, supplierId, productId, quantity }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to update product quantity');
        }
      } catch (error) {
        console.error(`Error updating product ${productId}:`, error);
      } finally {
        setUpdatingProducts((prev) => ({
          ...prev,
          [productId]: false, // Reset updating state for the product
        }));
      }
    }, 500),
    []
  );
  
  const handleQuantityChange = useCallback((productId, newQuantity) => {
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
  
    setCart((prevCart) => ({
      ...prevCart,
      items: prevCart.items.map((item) =>
        item.productId._id === productId
          ? { ...item, invalid: false, errorMessage: '', quantity: newQuantity }
          : item
      ),
    }));
  
    debouncedUpdate(productId, newQuantity);
  }, [cart, debouncedUpdate]);
  

  // Save changes before leaving the page
  const saveChangesBeforeLeave = async () => {
    if (Object.keys(localChanges).length > 0) {
      await debouncedUpdate(localChanges);
    }
  };

  useEffect(() => {
    window.addEventListener('beforeunload', saveChangesBeforeLeave);
    return () => {
      window.removeEventListener('beforeunload', saveChangesBeforeLeave);
    };
  }, [saveChangesBeforeLeave]);

  
  // Confirm order
  const confirmOrder = async () => {
    await saveChangesBeforeLeave();
    // Proceed with order submission logic
    setShowConfirmation(false);
  };

  const handleSubmitOrder = async () => {
    await saveChangesBeforeLeave();
    setShowConfirmation(true);
  };

  // Handle cart deletion
  const handleDeleteCart = async () => {
    await saveChangesBeforeLeave();
    await deleteCart({ clientId, supplierId });
    setCart(null);
  };
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
  if (!cart) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl">העגלה ריקה</h2>
        <Link
          href={`/client/${clientId}/supplier-catalog/${supplierId}`}
          className="bg-customBlue px-4 py-4 rounded-md"
        >
          <button>חזור לקלוג</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mb-32 md:mb-20 ">
     {isUpdating &&  
     <div className='fixed h-screen top-0 left-0 bg-black bg-opacity-5 w-full z-50'>
        
      </div>}
      <div className="bg-gray-200 px-6 py-4 sticky top-12 left-0 md:top-20">
        <div className="flex justify-between items-center bg-gray-200 p-2 rounded">
          <h2 className="text-lg font-bold">הזמנה שלי</h2>
          <button
            onClick={handleDeleteCart}
            className="text-customGrayText text-lg"
          >
            <Trash2 />
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

      <div className="mt-2">
        {cart?.items?.map((item) => (
          <div key={item.productId._id} className="grid grid-cols-3 p-2 bg-white rounded shadow mb-2">
            <Image
              src={item.productId.imageUrl?.secure_url || '/no-image.jpg'}
              alt={item.productId.name}
              width={100}
              height={100}
              className="w-full h-full max-h-[100px] max-w-[100px] min-h-[100px] min-w-[100px] object-contain"
            />
            <div className="flex flex-col py-2 h-full justify-between items-start">
              <h3 className="font-bold">{item.productId.name}</h3>
              <p>
                {item.productId.weight} {item.productId.weightUnit}
              </p>

              <div className="flex items-center gap-1 rounded-md border-2 w-[130px]">
              <button
  className="w-full"
  onClick={() => {
    if (item.quantity === 1) {
      // Show the minimum quantity error
      setCart((prevCart) => ({
        ...prevCart,
        items: prevCart.items.map((i) =>
          i.productId._id === item.productId._id
            ? { ...i, invalid: true, errorMessage: 'כמות מינימלית היא 1' }
            : i
        ),
      }));
      return;
    }
    handleQuantityChange(item.productId._id, Math.max(item.quantity - 1, 1));
  }}
>
  -
</button>
                <input
                  type="number"
                  className={`border rounded px-2 w-16 ${item.invalid ? 'border-red-500' : ''}`}
                  value={item.quantity !== null && item.quantity !== undefined ? item.quantity : ''}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const value = e.target.value;
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
                    handleQuantityChange(item.productId._id, parseInt(value, 10));
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (value === '' || parseInt(value, 10) < 1) {
                      handleQuantityChange(item.productId._id, 1);
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
) : (
  <div className="animate-pulse h-2">
    {updatingProducts[item.productId._id] && (
     <><div className='fixed h-screen top-0 left-0 bg-black bg-opacity-5 w-full z-50'>
        
      </div>
      <span className="text-sm text-blue-500 animate-pulse">מעדכן...</span></> 
    )}
  </div>
)}
            </div>
            <div className="flex flex-col h-full py-2 items-center justify-between">
              <p className="text-lg font-bold">₪{item.productId.price * item.quantity}</p>
              <button
                onClick={async () => {
                  await handleDeleteItem(item.productId._id);
                  fetchCartAgain();
                }}
                className="text-customGrayText"
              >
                <Trash2/>
              </button>
            </div>
          </div>
        ))}
      </div>
        <div className='fixed w-full px-4 pb-4 md:px-8 md:pb-4 bottom-16 md:bottom-0 left-0 bg-[#f8f8ff]'>

        <SubmitOrder cart={cart}/>

        {/* <button
        onClick={handleSubmitOrder}
        className="bg-customBlue text-white mt-1 w-full py-2 rounded"
      >
        אישור הזמנה
      </button> */}
        </div>
      
    </div>
  );
}
