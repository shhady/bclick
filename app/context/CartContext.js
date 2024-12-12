'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getCart } from '@/app/actions/cartActions';
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

      if(isProfileOrOrders) setItemCount(null);
      if (clientId && supplierId) {
        const response = await getCart({ clientId, supplierId });
        console.log(response); // Log the response for debugging
  
        if (response.success && response.serializedCart) {
          try {
            const cart = JSON.parse(response.serializedCart); // Parse the serializedCart
            const itemCount = cart?.items?.length || 0; // Safeguard in case items is undefined
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

    if(isProfileOrOrders) setItemCount(null);
    if (clientId && supplierId) {
      const response = await getCart({ clientId, supplierId });
      console.log(response); // Log the response for debugging

      if (response.success && response.serializedCart) {
        try {
          const cart = JSON.parse(response.serializedCart); // Parse the serializedCart
          const itemCount = cart?.items?.length || 0; // Safeguard in case items is undefined
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

  console.log(itemCount);
  const addItemToCart = (newCart) => {
    setCart(newCart);
    setItemCount(newCart?.items?.reduce((total, item) => total + item.quantity, 0) || 0);
  };

  return (
    <CartContext.Provider value={{ cart, itemCount,setItemCount, addItemToCart, fetchCartAgain }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => useContext(CartContext);
