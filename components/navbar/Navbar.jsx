'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FaShoppingCart, FaUser, FaTags, FaList} from 'react-icons/fa';
import { SlHandbag } from 'react-icons/sl';
import Image from 'next/image';
import Link from 'next/link';
import { useUserContext } from '@/app/context/UserContext';
import { getCart } from '@/app/actions/cartActions';
import { useCartContext } from '@/app/context/CartContext';

const Navbar = () => {
  const { globalUser, isRefreshing } = useUserContext();
  const pathName = usePathname();
  const router = useRouter();
  const [popupMessage, setPopupMessage] = useState('');
  const { itemCount } = useCartContext();
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  const isProfileOrOrders = pathName === '/profile' || pathName === '/orders';
  const isOrdersPage = pathName === '/orders';
  
  const handlePopup = (message) => {
    setPopupMessage(message);
    setTimeout(() => setPopupMessage(''), 3000);
  };

  const navigateToSupplierCatalog = () => {
    const pathParts = pathName.split('/');
    const clientId = pathParts[2];
    const supplierId = pathParts[pathParts.length - 1];
    handleNavigation(`/client/${clientId}/supplier-catalog/${supplierId}`);
  };

  const navigateToSupplierCart = () => {
    const pathParts = pathName.split('/');
    const clientId = pathParts[2];
    const supplierId = pathParts[pathParts.length - 1];
    handleNavigation(`/client/${clientId}/cart-from-supplier/${supplierId}`);
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
       <button
        onClick={() =>
          isProfileOrOrders
            ? handlePopup('בחר ספק כדי לצפות במוצרים בעגלה שלו')
            : navigateToSupplierCart()
        }
        className={`flex flex-col items-center relative ${
          isProfileOrOrders ? 'text-gray-400 cursor-not-allowed' : getIconColor('cart')
        }`}
      >
        <SlHandbag className="text-[20px] md:text-[28px]" />
        <span className="text-xs md:text-base mt-1">עגלה</span>

        {/* Badge for item count */}
        {itemCount > 0 && (
          <span className="absolute top-0 left-4 md:left-7 bg-customRed text-white rounded-full text-xs px-2">
            {itemCount}
          </span>
        )}
      </button>
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
          <Link href="/profile" className={`flex flex-col items-center ${getIconColor('profile')}`}>
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
          href={globalUser.role === 'supplier' ? `/supplier/${globalUser._id}/catalog` : '/catalog'}
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
        {isOrdersPage ? (<></>) :(<>{globalUser?.orders?.filter((order) => order.status === 'pending').length > 0 && (
            <span className="absolute top-0 left-4 md:left-7 bg-customRed text-white rounded-full text-xs px-2">
              {globalUser?.orders?.filter((order) => order.status === 'pending').length}
            </span>
          )}</> )}
          {/* Badge for pending orders */}
         
        </Link>
        {/* Profile */}
        <Link href="/profile" className={`flex flex-col items-center ${getIconColor('profile')}`}>
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
