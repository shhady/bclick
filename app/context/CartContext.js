'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getCart, deleteCart } from '@/app/actions/cartActions';
import { usePathname, useParams } from 'next/navigation';
import { useUserContext } from "@/app/context/UserContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [itemCount, setItemCount] = useState(0);
  const [currentSupplierId, setCurrentSupplierId] = useState(null);
  const pathName = usePathname();
  const params = useParams(); // <-- useParams hook now
  const { globalUser } = useUserContext();

  // Check if user is on profile or orders page
  const isProfileOrOrders =
    pathName === '/profile' ||
    pathName === '/orders' ||
    pathName === '/newprofile';
  
  // Check if user is in a supplier catalog or favorites page
  const isInSupplierCatalog = pathName.includes('/catalog/');
  const isInFavorites = pathName.includes('/favourites/');
  // Check if user is on a cart page (assuming route structure like /cart/[id])
  const isCartPage = pathName.includes('/cart');

  console.log(itemCount)
  useEffect(() => {
    const fetchCart = async () => {
      // Don't fetch cart for supplier users
      if (globalUser?.role === 'supplier') return;
      
      const pathParts = pathName ? pathName.split('/') : [];
      let clientId = null;
      let supplierId = null;
      
      if (isInSupplierCatalog) {
        // For /catalog/[supplierId], use the logged-in user's ID as clientId
        clientId = globalUser?._id;
        supplierId = pathParts[pathParts.length - 1];
        
        if (supplierId) {
          setCurrentSupplierId(supplierId);
        }
      } else if (isInFavorites) {
        // Handle favorites page - format: /client/[clientId]/favourites/[supplierId]
        clientId = pathParts[2];
        supplierId = pathParts[pathParts.length - 1];
        
        if (supplierId) {
          setCurrentSupplierId(supplierId);
        }
      } else if (isCartPage) {
        // Instead of using searchParams, use the id from useParams
        const supplierIdFromParams = params?.id;
        if (supplierIdFromParams) {
          supplierId = supplierIdFromParams;
          clientId = globalUser?._id;
        }
      }
      
      // Reset item count when not in supplier catalog, favorites, or cart page
      if (!isInSupplierCatalog && !isInFavorites && !isCartPage) {
        setItemCount(0);
        return;
      }
    
      // Check if supplier has changed
      if (supplierId && supplierId !== currentSupplierId) {
        console.log('Supplier changed from', currentSupplierId, 'to', supplierId);
        setCurrentSupplierId(supplierId);
        setCart(null);
        setItemCount(0);
      }
    
      // Only fetch cart if we have both clientId and supplierId
      if (clientId && supplierId) {
        const response = await getCart({ clientId, supplierId });
        if (response.success && response.serializedCart) {
          try {
            const cart = JSON.parse(response.serializedCart);
            const itemCount = cart?.items?.reduce(
              (total, item) => total + item.quantity,
              0
            ) || 0;
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
  }, [
    pathName,
    isInSupplierCatalog,
    isCartPage,
    globalUser?.role,
    globalUser?._id,
    currentSupplierId,
    params
  ]);
  
  // The rest of your provider (fetchCartAgain, clearCart, addItemToCart) remains unchanged
  const fetchCartAgain = async () => {
    // ... same logic as above
  };

  const clearCart = async (clientId, supplierId) => {
    try {
      await deleteCart({ clientId, supplierId });
      setCart(null);
      setItemCount(0);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const addItemToCart = (newCart) => {
    // Only update cart if in supplier catalog
    if (!isInSupplierCatalog) return;
    
    setCart(newCart);
    // Count total items (not just number of different products)
    setItemCount(newCart?.items?.reduce((total, item) => total + item.quantity, 0) || 0);
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      itemCount, 
      setItemCount, 
      addItemToCart, 
      fetchCartAgain, 
      clearCart,
      currentSupplierId
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => useContext(CartContext);
