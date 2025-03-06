'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getCart, deleteCart } from '@/app/actions/cartActions';
import { usePathname, useSearchParams } from 'next/navigation';
    
import { useUserContext } from "@/app/context/UserContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [itemCount, setItemCount] = useState(0);
  const [currentSupplierId, setCurrentSupplierId] = useState(null);
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const { globalUser } = useUserContext();

  // Check if user is on profile or orders page
  const isProfileOrOrders = pathName === '/profile' || pathName === '/orders' || 
                           pathName === '/newprofile' || pathName === '/orders';
  
  // Check if user is in a supplier catalog or cart page
  const isInSupplierCatalog = pathName.includes('/supplier-catalog/');
  const isCartPage = pathName === '/cart';

  useEffect(() => {
    const fetchCart = async () => {
      // Don't fetch cart for supplier users
      if (globalUser?.role === 'supplier') return;
      
      // Parse path to get client and supplier IDs
      const pathParts = pathName ? pathName.split('/') : [];
      let clientId = null;
      let supplierId = null;
      
      if (isInSupplierCatalog) {
        clientId = pathParts[2];
        supplierId = pathParts[pathParts.length - 1];
        
        // Store the current supplier ID when in supplier catalog
        if (supplierId) {
          setCurrentSupplierId(supplierId);
        }
      } else if (isCartPage) {
        // If on cart page, try to get supplier ID from query params
        const supplierIdFromQuery = searchParams.get('supplierId');
        if (supplierIdFromQuery) {
          supplierId = supplierIdFromQuery;
          clientId = globalUser?._id;
        }
      }
      
      // Reset item count when not in supplier catalog and not on cart page
      if (!isInSupplierCatalog && !isCartPage) {
        setItemCount(0);
        return;
      }
    
      // Check if supplier has changed
      if (supplierId && supplierId !== currentSupplierId) {
        console.log('Supplier changed from', currentSupplierId, 'to', supplierId);
        setCurrentSupplierId(supplierId);
        // Reset cart when supplier changes
        setCart(null);
        setItemCount(0);
      }

      // Only fetch cart if we have both clientId and supplierId
      if (clientId && supplierId) {
        const response = await getCart({ clientId, supplierId });
        if (response.success && response.serializedCart) {
          try {
            const cart = JSON.parse(response.serializedCart);
            // Count total items (not just number of different products)
            const itemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
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
  }, [pathName, isInSupplierCatalog, isCartPage, globalUser?.role, globalUser?._id, currentSupplierId, searchParams]);

  const fetchCartAgain = async () => {
    // Don't fetch cart for supplier users
    if (globalUser?.role === 'supplier') return;
    
    // Parse path to get client and supplier IDs
    const pathParts = pathName ? pathName.split('/') : [];
    let clientId = null;
    let supplierId = null;
    
    if (isInSupplierCatalog) {
      clientId = pathParts[2];
      supplierId = pathParts[pathParts.length - 1];
    } else if (isCartPage) {
      // If on cart page, try to get supplier ID from query params
      const supplierIdFromQuery = searchParams.get('supplierId');
      if (supplierIdFromQuery) {
        supplierId = supplierIdFromQuery;
        clientId = globalUser?._id;
      }
    }
    
    // Reset item count when not in supplier catalog and not on cart page
    if (!isInSupplierCatalog && !isCartPage) {
      setItemCount(0);
      return;
    }

    // Check if supplier has changed
    if (supplierId && supplierId !== currentSupplierId) {
      console.log('Supplier changed from', currentSupplierId, 'to', supplierId);
      setCurrentSupplierId(supplierId);
      // Reset cart when supplier changes
      setCart(null);
      setItemCount(0);
    }

    // Only fetch cart if we have both clientId and supplierId
    if (clientId && supplierId) {
      const response = await getCart({ clientId, supplierId });
      if (response.success && response.serializedCart) {
        try {
          const cart = JSON.parse(response.serializedCart);
          // Count total items (not just number of different products)
          const itemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
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