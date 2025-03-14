'use client';

import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { FaShoppingCart, FaUser, FaTags, FaList} from 'react-icons/fa';
import { SlHandbag } from 'react-icons/sl';
import Image from 'next/image';
import Link from 'next/link';
import { useUserContext } from '@/app/context/UserContext';
import { getCart } from '@/app/actions/cartActions';
import { useCartContext } from '@/app/context/CartContext';
import { useNewUserContext } from '@/app/context/NewUserContext';

// Add this component before your main Navbar component
const NavbarSkeleton = () => (
  <div className="fixed w-full z-50">
    {/* Desktop Skeleton */}
    <div className="hidden md:flex justify-between items-center px-8 py-4 bg-white shadow-lg h-20">
      {/* Logo Skeleton */}
      <div className="w-[100px] h-[100px] bg-gray-200 rounded-full animate-pulse"></div>

      {/* Navigation Items Skeleton */}
      <div className="flex flex-row-reverse justify-center items-center gap-8">
        {[1, 2, 3, 4].map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-1">
            <div className="w-[28px] h-[28px] bg-gray-200 rounded animate-pulse"></div>
            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Right Spacer */}
      <div className="w-[100px]"></div>
    </div>

    {/* Mobile Skeleton */}
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white shadow-lg border-t border-gray-300 h-[70px] flex justify-around items-center pt-3 pb-6">
      {[1, 2, 3, 4].map((_, index) => (
        <div key={index} className="flex flex-col items-center gap-1">
          <div className="w-[20px] h-[20px] bg-gray-200 rounded animate-pulse"></div>
          <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  </div>
);

// Add this function at the top of your file, outside the component
const getLocalStorageCount = () => {
  if (typeof window === 'undefined') return 0;
  try {
    const count = localStorage.getItem('pendingOrdersCount');
    return count ? parseInt(count, 10) : 0;
  } catch (e) {
    return 0;
  }
};

const setLocalStorageCount = (count) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('pendingOrdersCount', count.toString());
  } catch (e) {
    console.error('Error saving count to localStorage:', e);
  }
};

const Navbar = () => {
  const { id } = useParams();
  const pathName = usePathname();
  const router = useRouter();
  const [popupMessage, setPopupMessage] = useState('');
  const { itemCount } = useCartContext();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCartTooltip, setShowCartTooltip] = useState(false);
  const [supplierId, setSupplierId] = useState();
  const { newUser } = useNewUserContext();
  const { globalUser } = useUserContext();
  
  // Initialize with the stored count from localStorage
  const [pendingOrdersCount, setPendingOrdersCount] = useState(getLocalStorageCount());
  const pendingCountRef = useRef(getLocalStorageCount());
  const lastApiCallTime = useRef(0);
  const isDebugMode = false; // Set to true only when debugging
  
  // Add a flag to track first mount
  const isFirstMount = useRef(true);
  
  // Function to log only in debug mode
  const debugLog = useCallback((...args) => {
    if (isDebugMode) {
      console.log(...args);
    }
  }, []);
  
  // Function to update the count in all places
  const updateCount = useCallback((newCount, source) => {
    debugLog(`Updating pending orders count to: ${newCount} (source: ${source})`);
    
    // Always update on first mount, otherwise only if different
    if ((isFirstMount.current || pendingCountRef.current !== newCount) && 
        typeof newCount === 'number' && newCount >= 0) {
      setPendingOrdersCount(newCount);
      pendingCountRef.current = newCount;
      setLocalStorageCount(newCount);
      
      // Also store the last update time
      if (typeof window !== 'undefined') {
        localStorage.setItem('pendingCountLastUpdated', Date.now().toString());
      }
      
      // If this was the first mount, clear the flag
      if (isFirstMount.current) {
        isFirstMount.current = false;
      }
    }
  }, [debugLog]);
  
  // Function to calculate pending orders count from user data
  const calculatePendingOrders = useCallback(() => {
    debugLog('Calculating pending orders from user data');
    
    // First try to use newUser if available
    if (newUser?.orders && Array.isArray(newUser.orders)) {
      const count = newUser.orders.filter(order => order.status === 'pending').length;
      
      // Only update if count is different from current count
      if (count !== pendingCountRef.current) {
        updateCount(count, 'calculated');
      }
      return;
    }
    
    // Fall back to globalUser if newUser is not available
    if (globalUser?.orders && Array.isArray(globalUser.orders)) {
      const count = globalUser.orders.filter(order => order.status === 'pending').length;
      
      // Only update if count is different from current count
      if (count !== pendingCountRef.current) {
        updateCount(count, 'calculated');
      }
    }
  }, [newUser?.orders, globalUser?.orders, updateCount, debugLog]);
  
  // Function to fetch the latest orders count from the API with better rate limiting
  const fetchLatestOrdersCount = useCallback(async (userId, force = false) => {
    if (!userId) return;
    
    // Get the last update time from localStorage
    const lastUpdateTime = typeof window !== 'undefined' 
      ? parseInt(localStorage.getItem('pendingCountLastUpdated') || '0', 10)
      : 0;
    
    const now = Date.now();
    
    // Rate limit API calls - only fetch if:
    // 1. It's forced, OR
    // 2. It's been more than 5 minutes since the last update, OR
    // 3. It's been more than 2 minutes since the last API call
    if (!force && 
        now - lastUpdateTime < 300000 && // 5 minutes
        now - lastApiCallTime.current < 120000) { // 2 minutes
      debugLog('Skipping API call due to rate limiting');
      return;
    }
    
    lastApiCallTime.current = now;
    
    try {
      debugLog('Fetching latest orders count for user:', userId);
      const response = await fetch(`/api/orders/pending-count?clerkId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch pending orders count');
      
      const data = await response.json();
      
      // Only update if count is different from current count
      if (data.count !== pendingCountRef.current) {
        updateCount(data.count, 'api');
      }
    } catch (error) {
      console.error('Error fetching pending orders count:', error);
    }
  }, [updateCount, debugLog]);
  
  // Initial calculation when component mounts - IMPORTANT: use layout effect
  useLayoutEffect(() => {
    // Force immediate calculation from user data
    if (newUser?.orders && Array.isArray(newUser.orders)) {
      const count = newUser.orders.filter(order => order.status === 'pending').length;
      updateCount(count, 'initial-mount');
    }
    
    // Then fetch from API to ensure we have the latest data
    if (newUser?._id) {
      fetchLatestOrdersCount(newUser._id, true);
    }
    
    // Set up interval to refresh count every 5 minutes
    const intervalId = setInterval(() => {
      if (newUser?._id) {
        fetchLatestOrdersCount(newUser._id, false);
      }
    }, 300000); // Every 5 minutes
    
    return () => clearInterval(intervalId);
  }, [newUser?._id, newUser?.orders, fetchLatestOrdersCount, updateCount]);
  
  useEffect(() => {
    if (id) {
      setSupplierId(id);
    }
  }, [id]);

  // Check if user is currently viewing a supplier catalog, favorites, or cart
  const isInSupplierCatalog = pathName.includes('/catalog/') || 
                             pathName.includes('/favourites') || 
                             pathName.includes('/cart/');
  
  // Define pathParts at the component level
  const pathParts = pathName ? pathName.split('/') : [];
  const currentSupplierId = isInSupplierCatalog && pathParts.length > 0 ? pathParts[pathParts.length - 1] : null;
  
  // Use pathname changes to track navigation
  useEffect(() => {
    setIsTransitioning(false);
  }, [pathName]);

  // Handle navigation start
  const handleNavigation = (path) => {
    setIsTransitioning(true);
    router.push(path);
  };

  const getIconColor = (path) => {
    return pathName?.includes(path) ? 'text-customBlue' : 'text-gray-600';
  };

  const isProfileOrOrders = pathName === '/newprofile' || pathName.includes('/orders') ;
  const isOrdersPage = pathName === '/orders';
  
  const handlePopup = (message) => {
    setPopupMessage(message);
    setTimeout(() => setPopupMessage(''), 3000);
  };

  const navigateToSupplierCatalog = () => {
    // Get the stored supplierId from localStorage if available
    if(supplierId){
      handleNavigation(`/catalog/${supplierId}`);
    }else{
      handleNavigation(`/catalog/${newUser?._id}`);
    }
  };

  const renderClientNav = () => (
    <>
      {/* Catalog */}
      <button
        // disabled={isProfileOrOrders}
        onClick={() =>
          isProfileOrOrders
            ? handlePopup('בחר ספק כדי לצפות בקטלוג שלו')
            : navigateToSupplierCatalog()
        }
        className={`flex flex-col items-center ${
          isProfileOrOrders ? 'text-gray-400 cursor-not-allowed' : getIconColor('catalog')
        }`}
      >
        <FaTags className="text-[20px] md:text-[28px]"/>
        <span className="text-xs md:text-base mt-1">קטלוג</span>
      </button>

      {/* Cart */}
      {isInSupplierCatalog ? (
        <div className="relative">
          <Link
            href={`/cart/${supplierId}`}
            className={`flex flex-col items-center ${getIconColor('cart')}`}
          >
            <SlHandbag className="text-[20px] md:text-[28px]" />
            <span className="text-xs md:text-base mt-1">עגלה</span>
          </Link>

          {/* Badge for item count - always show when items exist */}
          {itemCount > 0 && !pathName.includes('/cart/') && (
            <span className="absolute top-0 left-4 md:left-7 bg-customRed text-white rounded-full text-xs px-2">
              {itemCount}
            </span>
          )}
        </div>
      ) : (
        <div 
          className="flex flex-col items-center relative text-gray-400 cursor-not-allowed"
          onMouseEnter={() => setShowCartTooltip(true)}
          onMouseLeave={() => setShowCartTooltip(false)}
          onClick={() => handlePopup('בחר ספק כדי לצפות בעגלה שלו')}
        >
          <SlHandbag className="text-[20px] md:text-[28px]" />
          <span className="text-xs md:text-base mt-1">עגלה</span>
          
          {/* Tooltip for disabled cart */}
          {showCartTooltip && (
            <div className="absolute top-full mt-2 bg-gray-800 text-white text-xs rounded py-1 px-2 w-48 text-center z-50">
              בחר ספק כדי לצפות בעגלה שלו
            </div>
          )}
        </div>
      )}
    </>
  );

  const renderLinks = () => {
    if (!newUser) return <div className='md:hidden'><Image src={'/bclick-logo.jpg'} alt='logo' width={100} height={100} className='h-[40px] w-fit'/></div>;

    if (newUser.role === 'client') {
      return (
        <>
          {renderClientNav()}
          {/* Orders */}
          <Link href="/orders" className={`flex flex-col items-center ${getIconColor('orders')}`}>
            <FaShoppingCart className="text-[20px] md:text-[28px]" />
            <span className="text-xs md:text-base mt-1">הזמנות</span>
          </Link>
          {/* Profile */}
          <Link href="/newprofile" className={`flex flex-col items-center ${getIconColor('profile')}`}>
            <FaUser className="text-[20px] md:text-[28px]" />
            <span className="text-xs md:text-base mt-1">פרופיל</span>
          </Link>
        </>
      );
    }

    return (
      <>
        {/* Catalog */}
        <Link
          href={
            newUser.role === 'supplier' 
              ? `/catalog/${newUser._id}` 
              : isCartPage && supplierId
                ? `/catalog/${supplierId}`
                : '/catalog'
          }
          className={`flex flex-col items-center ${getIconColor('catalog')}`}
        >
          <FaTags className="text-[20px] md:text-[28px]"/>
          <span className="text-xs md:text-base mt-1">קטלוג</span>
        </Link>

        {/* Clients */}
        {newUser.role === 'supplier' && (
          <Link
            href={`/supplier/${newUser._id}/clients`}
            className={`flex flex-col items-center ${getIconColor('client')}`}
          >
            <FaList className="text-[20px] md:text-[28px]" />
            <span className="text-xs md:text-base mt-1">לקוחות</span>
          </Link>
        )}

        {/* Orders */}
        <Link href="/orders" className={`flex flex-col items-center relative ${getIconColor('orders')}`}>
          <FaShoppingCart className="text-[20px] md:text-[28px]" />
          <span className="text-xs md:text-base mt-1">הזמנות</span>
          
          {/* Badge for pending orders */}
          {!isOrdersPage && pendingCountRef.current > 0 && (
            <span className="absolute top-0 left-4 md:left-7 bg-customRed text-white rounded-full text-xs px-2">
              {pendingCountRef.current}
            </span>
          )}
        </Link>
        
        {/* Profile */}
        <Link href="/newprofile" className={`flex flex-col items-center ${getIconColor('profile')}`}>
          <FaUser className="text-[20px] md:text-[28px]" />
          <span className="text-xs md:text-base mt-1">פרופיל</span>
        </Link>
      </>
    );
  };

  return (
    <div>
      {/* Loading indicator */}
      {/* {(isRefreshing || isTransitioning) && (
        <div className="fixed top-0 left-0 w-full h-1 bg-blue-100">
          <div className="h-full bg-customBlue animate-progress-bar" 
               style={{ 
                 width: '100%',
                 transition: 'width 300ms ease-in-out',
                 animation: 'progress 2s ease-in-out infinite'
               }} />
        </div>
      )} */}

      {/* Popup Message */}
      {popupMessage && (
        <div className="fixed bottom-[100px] left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-50">
          {popupMessage}
        </div>
      )}

      {/* Desktop Navigation */}
      <div className="fixed top-0 w-full hidden md:flex justify-between items-center px-8 py-4 bg-white shadow-lg z-50 h-20" dir="ltr">
        <div className="w-[100px] min-w-[100px]">
          <Link href="/">
            <Image src="/bclick-logo.jpg" alt="Logo" width={100} height={100} className="rounded-full" priority />
          </Link>
        </div>
        <div className="flex flex-row-reverse justify-center items-center gap-8">
          {renderLinks()}
        </div>
        <div className="w-[100px] min-w-[100px]"></div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed z-50 bottom-0 left-0 w-full bg-white shadow-lg flex justify-around items-center pt-3 pb-6 border-t border-gray-300 h-[70px]">
        {renderLinks()}
      </div>
    </div>
  );
};

class NavbarErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Navbar Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <NavbarSkeleton />;
    }
    return this.props.children;
  }
}

// Wrap your Navbar component
export default function NavbarWrapper() {
  return (
    <NavbarErrorBoundary>
      <Navbar />
    </NavbarErrorBoundary>
  );
}