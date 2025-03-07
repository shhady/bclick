'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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

const Navbar = () => {
  const { globalUser, isRefreshing } = useUserContext();
  const pathName = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [popupMessage, setPopupMessage] = useState('');
  const { itemCount } = useCartContext();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCartTooltip, setShowCartTooltip] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  
  // Try to use NewUserContext if available
  let newUser = null;
  let newUserPendingCount = 0;
   console.log(globalUser._id)
   console.log(searchParams.get('supplierId'))
  try {
    const newUserContext = useNewUserContext();
    if (newUserContext) {
      newUser = newUserContext.newUser;
      // Calculate pending orders count from newUser context
      newUserPendingCount = newUser?.orders?.filter(order => order.status === 'pending').length || 0;
    }
  } catch (error) {
    console.log('NewUserContext not available in Navbar, using fallback');
    // NewUserContext not available, we'll use the API fallback
  }
  
  // Check if user is currently viewing a supplier catalog
  const isInSupplierCatalog = pathName.includes('/supplier-catalog/' ) || pathName.includes('/favourites');
  
  // Define pathParts at the component level
  const pathParts = pathName ? pathName.split('/') : [];
  const currentSupplierId = isInSupplierCatalog && pathParts.length > 0 ? pathParts[pathParts.length - 1] : null;

  // Fetch pending orders count for suppliers
  useEffect(() => {
    const fetchPendingOrders = async () => {
      if (!globalUser || globalUser.role !== 'supplier' || !globalUser._id) return;
      
      // If NewUserContext is available and has the user data, use that count
      if (newUser && newUser._id === globalUser._id) {
        setPendingOrdersCount(newUserPendingCount);
        console.log('Using pending orders count from NewUserContext:', newUserPendingCount);
        return;
      }
      
      try {
        // Fallback: Fetch orders with pending status for this supplier from API
        const response = await fetch(`/api/orders?userId=${globalUser._id}&role=supplier&status=pending`);
        if (response.ok) {
          const data = await response.json();
          setPendingOrdersCount(data.orders.length);
          console.log('Fetched pending orders for supplier from API:', data.orders.length);
        }
      } catch (error) {
        console.error('Error fetching pending orders:', error);
      }
    };

    fetchPendingOrders();
  }, [globalUser, newUser, newUserPendingCount]);

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

  const isProfileOrOrders = pathName === '/newprofile' || pathName === '/orders';
  const isOrdersPage = pathName === '/orders';
  
  const handlePopup = (message) => {
    setPopupMessage(message);
    setTimeout(() => setPopupMessage(''), 3000);
  };

  const navigateToSupplierCatalog = () => {
    // Get the stored supplierId from localStorage if available
    let supplierId;
    if (typeof window !== 'undefined') {
      supplierId = localStorage.getItem('currentSupplierId');
    }
    
    // If we have a supplierId in localStorage, use it
    if (supplierId) {
      handleNavigation(`/client/${globalUser._id}/supplier-catalog/${supplierId}`);
    } else {
      // Fallback to the URL parameter if available
      const urlSupplierId = searchParams.get('supplierId');
      if (urlSupplierId) {
        handleNavigation(`/client/${globalUser._id}/supplier-catalog/${urlSupplierId}`);
      } else {
        // If no supplierId is available, just go to the client's home page
        handleNavigation(`/client/${globalUser._id}`);
      }
    }
  };

  const navigateToSupplierCart = () => {
    // Get the stored supplierId from localStorage if available
    let supplierId;
    if (typeof window !== 'undefined') {
      supplierId = localStorage.getItem('currentSupplierId');
    }
    
    // If we have a supplierId, use it for the cart URL
    if (supplierId) {
      handleNavigation(`/client/${globalUser._id}/cart-from-supplier/${supplierId}`);
    } else {
      // Otherwise just go to the main cart page
      handleNavigation('/cart');
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
        <Link
          href={`/cart?supplierId=${currentSupplierId}`}
          className={`flex flex-col items-center relative ${getIconColor('cart')}`}
        >
          <SlHandbag className="text-[20px] md:text-[28px]" />
          <span className="text-xs md:text-base mt-1">עגלה</span>

          {/* Badge for item count - only show when in supplier catalog and items exist */}
          {itemCount > 0 && (
            <span className="absolute top-0 left-4 md:left-7 bg-customRed text-white rounded-full text-xs px-2">
              {itemCount}
            </span>
          )}
        </Link>
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
    if (!globalUser) return <div className='md:hidden'><Image src={'/bclick-logo.jpg'} alt='logo' width={100} height={100} className='h-[40px] w-fit'/></div>;

    if (globalUser.role === 'client') {
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
            globalUser.role === 'supplier' 
              ? `/supplier/${globalUser._id}/catalog` 
              : isCartPage && searchParams.get('supplierId')
                ? `/client/${globalUser._id}/supplier-catalog/${searchParams.get('supplierId')}`
                : '/catalog'
          }
          className={`flex flex-col items-center ${getIconColor('catalog')}`}
        >
          <FaTags  className="text-[20px] md:text-[28px]"/>
          <span className="text-xs md:text-base mt-1">קטלוג</span>
        </Link>

        {/* Clients */}
        {globalUser.role === 'supplier' && (
          <Link
            href={`/supplier/${globalUser._id}/clients`}
            className={`flex flex-col items-center ${getIconColor('client')}`}
          >
            <FaList  className="text-[20px] md:text-[28px]" />
            <span className="text-xs md:text-base mt-1">לקוחות</span>
          </Link>
        )}

        {/* Orders */}
        <Link href="/orders" className={`flex flex-col items-center relative ${getIconColor('orders')}`}>
          <FaShoppingCart  className="text-[20px] md:text-[28px]"  />
          <span className="text-xs md:text-base mt-1">הזמנות </span>
          
          {/* Badge for pending orders */}
          {!isOrdersPage && (
            <>
              {newUser && newUser.role === 'supplier' && pendingOrdersCount > 0 ? (
                <span className="absolute top-0 left-4 md:left-7 bg-customRed text-white rounded-full text-xs px-2">
                  {pendingOrdersCount}
                </span>
              ) : (
                newUser?.orders?.filter((order) => order.status === 'pending').length > 0 && (
                  <span className="absolute top-0 left-4 md:left-7 bg-customRed text-white rounded-full text-xs px-2">
                    {newUser?.orders?.filter((order) => order.status === 'pending').length}
                  </span>
                )
              )}
            </>
          )}
        </Link>
        {/* Profile */}
        <Link href="/newprofile" className={`flex flex-col items-center ${getIconColor('profile')}`}>
          <FaUser  className="text-[20px] md:text-[28px]" />
          <span className="text-xs md:text-base mt-1">פרופיל</span>
        </Link>
      </>
    );
  };

  return (
    <div>
      {/* Loading indicator */}
      {(isRefreshing || isTransitioning) && (
        <div className="fixed top-0 left-0 w-full h-1 bg-blue-100">
          <div className="h-full bg-customBlue animate-progress-bar" 
               style={{ 
                 width: '100%',
                 transition: 'width 300ms ease-in-out',
                 animation: 'progress 2s ease-in-out infinite'
               }} />
        </div>
      )}

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
