'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getCart, deleteCart } from '@/app/actions/cartActions';
import { usePathname } from 'next/navigation';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [itemCount, setItemCount] = useState(0);
  const pathName = usePathname();
  const isProfileOrOrders = pathName === '/profile' || pathName === '/orders';

  useEffect(() => {
    const fetchCart = async () => {
      const pathParts = pathName.split('/');
      const clientId = pathParts[2];
      const supplierId = pathParts[pathParts.length - 1];

      if (isProfileOrOrders) setItemCount(null);
      if (clientId && supplierId) {
        const response = await getCart({ clientId, supplierId });
        if (response.success && response.serializedCart) {
          try {
            const cart = JSON.parse(response.serializedCart);
            const itemCount = cart?.items?.length || 0;
            setCart(cart);
            setItemCount(itemCount);
          } catch (error) {
            console.error('Error parsing serializedCart:', error);
            setItemCount(0);
          }
        } else {
          setItemCount(0);
        }
      }
    };

    fetchCart();
  }, [pathName]);

  const fetchCartAgain = async () => {
    const pathParts = pathName.split('/');
    const clientId = pathParts[2];
    const supplierId = pathParts[pathParts.length - 1];

    if (isProfileOrOrders) setItemCount(null);
    if (clientId && supplierId) {
      const response = await getCart({ clientId, supplierId });
      if (response.success && response.serializedCart) {
        try {
          const cart = JSON.parse(response.serializedCart);
          const itemCount = cart?.items?.length || 0;
          setCart(cart);
          setItemCount(itemCount);
        } catch (error) {
          console.error('Error parsing serializedCart:', error);
          setItemCount(0);
        }
      } else {
        setItemCount(0);
      }
    }
  };

  const clearCart = async (clientId, supplierId) => {
    console.log(clientId, supplierId);
    try {
      await deleteCart({ clientId, supplierId });
      setCart(null);
      setItemCount(0);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const addItemToCart = (newCart) => {
    setCart(newCart);
    setItemCount(newCart?.items?.reduce((total, item) => total + item.quantity, 0) || 0);
  };

  return (
    <CartContext.Provider value={{ cart, itemCount, setItemCount, addItemToCart, fetchCartAgain, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => useContext(CartContext);