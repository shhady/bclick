'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { deleteCart } from '@/app/actions/cartActions';
import Link from 'next/link';
export default function CartPage({ clientId, supplierId, cart: initialCart }) {
  const [cart, setCart] = useState(initialCart);
  const [error, setError] = useState('');
  const router = useRouter();

  const calculateTotalPrice = () => {
    return cart?.items?.reduce((total, item) => total + item.productId.price * item.quantity, 0) || 0;
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      setError('Quantity must be at least 1');
      return;
    }

    try {
      const product = cart?.items?.find((item) => item.productId._id === productId);

      if (!product) {
        setError('Product not found in the cart');
        return;
      }

      const maxQuantity = product.productId.stock - (product.productId.reserved || 0);

      if (newQuantity > maxQuantity) {
        setError(`The maximum quantity for ${product.productId.name} is ${maxQuantity}`);
        newQuantity = maxQuantity;
      } else {
        setError('');
      }

      const updatedCart = {
        ...cart,
        items: cart?.items?.map((item) =>
          item.productId._id === productId
            ? { ...item, quantity: newQuantity }
            : item
        ),
      };

      setCart(updatedCart);

      const response = await fetch(`/api/cart`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          supplierId,
          productId,
          quantity: newQuantity,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      setError('Error updating the cart');
    }
  };

  const handleDeleteItem = async (productId) => {
    try {
      const updatedCart = {
        ...cart,
        items: cart?.items?.filter((item) => item.productId._id !== productId),
      };
      setCart(updatedCart);

      const response = await fetch(`/api/cart?clientId=${clientId}&supplierId=${supplierId}&productId=${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting cart item:', error);
      setError('Error deleting item');
    }
  };

  const handleSubmitOrder = async () => {
    try {
      let updatedCart = { ...cart };
      for (const item of cart?.items) {
        const maxQuantity = item.productId.stock - (item.productId.reserved || 0);
        if (item.quantity > maxQuantity) {
          updatedCart = {
            ...updatedCart,
            items: updatedCart?.items?.map((i) =>
              i.productId._id === item.productId._id
                ? { ...i, quantity: maxQuantity }
                : i
            ),
          };
          setError(
            `The maximum quantity available for ${item.productId.name} has been reduced to ${maxQuantity}`
          );
        }
      }

      setCart(updatedCart);

      const response = await fetch(`/api/cart/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, supplierId, items: updatedCart?.items }),
      });

      if (response.ok) {
        setCart(null);
        router.push(`/client/${clientId}/supplier-catalog/${supplierId}`);
      } else {
        throw new Error('Failed to submit the order');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      setError('Error submitting the order');
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

  if (!cart) {
    return <div className='h-screen flex flex-col items-center justify-center gap-4'>
      <h2 className='text-2xl'>העגלה שלך עם הספק הזה ריקה</h2>

          <Link href={`/client/${clientId}/supplier-catalog/${supplierId}`} className='bg-customBlue px-4 py-4 rounded-md'><button>
            חזור לקלוג
          </button>
          </Link>
        </div>;
  }

  return (
    <div className="">
        <div className='bg-gray-200 px-6 py-4 sticky top-0 left-0 md:top-20 '>
        < div className="flex justify-between items-center bg-gray-200 p-2 rounded">
       
       <h2 className="text-lg font-bold">הזמנה שלי</h2>
       <button onClick={handleDeleteCart} className="text-red-500 text-lg">
         🗑️
       </button>
        </div>
     
        <div className='p-2 grid grid-cols-2'>
      <div className="flex flex-col justify-start items-start gap-2">
          <span>תאריך: {new Date(cart.createdAt).toLocaleDateString()}</span>
          <div className="">
        <h3 className="font-bold ">סה&quot;כ: ₪{calculateTotalPrice()}</h3>
      </div>
        </div>
        <div className='flex flex-col justify-end items-end h-full gap-4'>
        <button
        onClick={() =>
          router.push(`/client/${clientId}/supplier-catalog/${supplierId}`)
        }
        className="text-gray-600 border-2 border-gray-600 px-2 w-fit rounded-md"
      >
        הוסף עוד +
      </button>
      
        </div>
       
      </div>
      </div>
     
     
      <div className="mt-4">
        {cart?.items?.map((item) => (
          <div
            key={item.productId._id}
            className="grid grid-cols-3 p-2 bg-white rounded shadow mb-2"
          >
            <Image
              src={item.productId.imageUrl?.secure_url || '/no-image.jpg'}
              alt={item.productId.name}
              width={100}
              height={100}
              className="w-full h-full max-h-[100px] max-w-[100px] min-h-[100px] min-w-[100px] md:max-h-48 md:max-w-1/2 md:min-h-48 md:min-w-fll object-contain"
            />
            <div className="flex flex-col py-2 h-full justify-between items-start md:justify-between ">
              <h3 className="font-bold">{item.productId.name}</h3>
              <p>{item.productId.weight} {item.productId.weightUnit}</p>
              <div className="flex items-center gap-2 px-2 rounded-md border-2">
              <button
                onClick={() =>
                  handleQuantityChange(
                    item.productId._id,
                    Math.max(item.quantity - 1, 1)
                  )
                }
                className=" px-2  rounded"
              >
                -
              </button>
              <span className=''>{item.quantity}</span>
              <button
                onClick={() =>
                  handleQuantityChange(
                    item.productId._id,
                    item.quantity + 1
                  )
                }
                className=" px-2  rounded"
              >
                +
              </button>
            </div>
            </div>
            <div className='flex flex-col h-full py-2  items-center justify-between md:justify-between '>
            <p className="text-lg font-bold">
              ₪{item.productId.price * item.quantity}
            </p>
           
            <button
              onClick={() => handleDeleteItem(item.productId._id)}
              className="text-red-500"
            >
              🗑️
            </button>
            </div>
            
          </div>
        ))}
      </div>

    

      <button
        onClick={handleSubmitOrder}
        className="bg-blue-500 text-white mt-4 w-full py-2 rounded"
      >
        שלח הזמנה
      </button>

      {error && <p className="text-red-500 font-bold text-center mt-4">{error}</p>}
    </div>
  );
}
