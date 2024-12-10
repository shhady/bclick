'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FaShoppingCart, FaUser, FaTags, FaList} from 'react-icons/fa';
import { SlHandbag } from 'react-icons/sl';
import Image from 'next/image';
import Link from 'next/link';
import { useUserContext } from '@/app/context/UserContext';

const Navbar = () => {
  const { globalUser } = useUserContext();
  const pathName = usePathname();
  const router = useRouter();
  const [popupMessage, setPopupMessage] = useState('');

  const getIconColor = (path) => {
    return pathName?.includes(path) ? 'text-customBlue' : 'text-gray-600';
  };

  const isProfileOrOrders = pathName === '/profile' || pathName === '/orders';

  const handlePopup = (message) => {
    setPopupMessage(message);
    setTimeout(() => setPopupMessage(''), 3000); // Clear the popup message after 3 seconds
  };

  const navigateToSupplierCatalog = () => {
    const pathParts = pathName.split('/');
    const clientId = pathParts[2];
    const supplierId = pathParts[pathParts.length - 1];
    router.push(`/client/${clientId}/supplier-catalog/${supplierId}`);
  };
  const navigateToSupplierCart = () => {
    const pathParts = pathName.split('/');
    const clientId = pathParts[2];
    const supplierId = pathParts[pathParts.length - 1];
    router.push(`/client/${clientId}/cart-from-supplier/${supplierId}`);
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
        <FaTags size={20} className='md:hidden'/>
        <span className="text-xs md:text-base mt-1">קטלוג</span>
      </button>

      {/* Cart */}
      <button
        // disabled={isProfileOrOrders}
        onClick={() =>
          isProfileOrOrders
            ? handlePopup('בחר ספק כדי לצפות במוצרים בעגלה שלו')
            : navigateToSupplierCart()
        }
        className={`flex flex-col items-center ${
          isProfileOrOrders ? 'text-gray-400 cursor-not-allowed' : getIconColor('cart')
        }`}
      >
        <SlHandbag size={20} className='md:hidden'/>
        <span className="text-xs md:text-base mt-1">עגלה</span>
      </button>
    </>
  );

  const renderLinks = () => {
    if (!globalUser) return <div className='md:hidden'><Image src={'/bclick-logo.jpg'} alt='logo' width={4000} height={100} className='h-[40px] w-fit'/></div>;

    if (globalUser.role === 'client') {
      return (
        <>
          {renderClientNav()}
          {/* Orders */}
          <Link href="/orders" className={`flex flex-col items-center ${getIconColor('orders')}`}>
            <FaShoppingCart size={20} className='md:hidden'/>
            <span className="text-xs md:text-base mt-1">הזמנות</span>
          </Link>
          {/* Profile */}
          <Link href="/profile" className={`flex flex-col items-center ${getIconColor('profile')}`}>
            <FaUser size={20} className='md:hidden'/>
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
          <FaTags size={20} className='md:hidden'/>
          <span className="text-xs md:text-base mt-1">קטלוג</span>
        </Link>

        {/* Clients */}
        {globalUser.role === 'supplier' && (
          <Link
            href={`/supplier/${globalUser._id}/clients`}
            className={`flex flex-col items-center ${getIconColor('client')}`}
          >
            <FaList size={20} className='md:hidden'/>
            <span className="text-xs md:text-base mt-1">לקוחות</span>
          </Link>
        )}

        {/* Orders */}
        <Link href="/orders" className={`flex flex-col items-center ${getIconColor('orders')}`}>
          <FaShoppingCart size={20} className='md:hidden'/>
          <span className="text-xs md:text-base mt-1">הזמנות</span>
        </Link>

        {/* Profile */}
        <Link href="/profile" className={`flex flex-col items-center ${getIconColor('profile')}`}>
          <FaUser size={20} className='md:hidden'/>
          <span className="text-xs md:text-base mt-1">פרופיל</span>
        </Link>
      </>
    );
  };

  return (
    <div>
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
        <div className="flex justify-center items-center gap-5">{renderLinks()}</div>
        <div className="w-[100px] min-w-[100px]"></div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed z-50 bottom-0 left-0 w-full bg-white shadow-lg flex justify-around items-center pt-3 pb-6 border-t border-gray-300 h-[70px]">
        {renderLinks()}
      </div>
    </div>
  );
};

export default Navbar;
