 'use client';

import { useState } from 'react';
import Image from 'next/image';
import StarToggle from '../StarToggle';
import { addToCart,getCart } from '@/app/actions/cartActions';
import { useCartContext } from '@/app/context/CartContext';
export default function ProductDetailModal({ 
  product, 
  isVisible, 
  onClose, 
  clientId, 
  onFavoriteToggle, 
  supplierId, 
  cart: myCart 
}) {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [cart, setCart] = useState(myCart);
  const [reserved, setReserved] = useState(product?.reserved || 0);
  const [availableStock, setAvailableStock] = useState(
    product?.stock - (product?.reserved || 0)
  ); 
   const [isUpdating, setIsUpdating] = useState(false);
   const { fetchCartAgain } = useCartContext();


  useEffect(() => {
    setReserved(product?.reserved || 0);
    setAvailableStock(product?.stock - (product?.reserved || 0));
    const existingItem = cart?.items.find(
      (item) => item?.productId?._id === product?._id
    );
    if (existingItem) {
      setQuantity(existingItem.quantity);
    } else {
      setQuantity(1);
    }
    setError('');
  }, [product, cart]);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) {
      setError('כמות לא יכולה להיות פחות מ-1');
      return;
    }

    if (newQuantity > availableStock) {
      setError(`הכמות המקסימלית הזמינה היא ${availableStock}`);
      return;
    }

    setQuantity(newQuantity);
    setError('');
  };

  const addToCartHandler = async () => {
    if (quantity > availableStock) {
      setError(`רק ${availableStock} זמין במלאי`);
      return;
    }
    setIsUpdating(true);
    try {
      const response = await addToCart({
        clientId,
        supplierId,
        productId: product._id,
        quantity,
      });

      if (response.success) {
        setCart(response.cart);
        setAvailableStock(response.updatedAvailableStock);
        setReserved(response.reserved);
        setError('');
        fetchCartAgain()
        onClose();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('שגיאה בהוספת מוצר לעגלה');
      console.error('Add to cart error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!product) return null;
  
  console.log(error);
  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white shadow-lg rounded-t-lg w-full max-w-lg overflow-y-auto transition-transform duration-300 transform ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex justify-between items-center p-4">
          <div className='absolute top-4 right-4'>
            <StarToggle
              productId={product._id} 
              clientId={clientId} 
              onFavoriteToggle={onFavoriteToggle}
            />
          </div>
          <button onClick={onClose} className="text-red-500 font-bold text-xl absolute top-4 left-4">
            X
          </button>
        </div>
        <div className="p-16">
          <Image
            src={product?.imageUrl?.secure_url || '/no-image.jpg'}
            alt={product.name}
            width={400}
            height={400}
            className="w-full max-h-56 object-contain rounded"
          />
          <div className='flex justify-between items-center mt-4'>
            <h2 className="text-lg font-bold">{product.name}</h2>
            <h2 className="text-gray-600 font-bold">₪{product?.price}</h2>
          </div>
          <div className='flex justify-center gap-4 items-center'>
            <p className="text-gray-600">משקל: {product?.weight}</p>
            <p className="text-gray-600">יחידות: {product.units}</p>
          </div>
          <div className='flex justify-start gap-4 items-center'>
            <p className="text-gray-600">{product?.description}</p>
          </div>
          <div className='flex justify-center gap-4 items-center'>
            <p className="text-gray-600">
              {reserved > 0 && `שמור: ${reserved}`}
            </p>
            <p className="text-gray-600">
              זמין במלאי: {availableStock} יחידות
            </p>
          </div>
          {availableStock === 0 ? (
            <p className="text-red-500 font-bold text-center">מוצר אין זמין במלאי</p>
          ) : (
            <div>
              <div className="flex justify-center items-center gap-4 mt-4">
                <button
                  className="bg-gray-300 px-3 py-1 rounded"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  // disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(Math.max(1, parseInt(e.target.value, 10)))}
                  className="w-20 border border-gray-300 rounded px-2 py-1 text-center"
                />
                <button
                  className="bg-gray-300 px-3 py-1 rounded"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  // disabled={quantity >= availableStock}
                >
                  +
                </button>
              </div>
              {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
              <button
                className={`bg-customBlue text-white mt-4 px-4 py-2 rounded w-full ${isUpdating ? 'animate-pulse' : ''}`}
                onClick={addToCartHandler}
                disabled={isUpdating}
              >
                {isUpdating ? ' שומר ...' : cart?.items.find((item) => item.productId._id === product._id)
                  ? 'עדכן כמות'
                  : 'הוסף להזמנה'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


  