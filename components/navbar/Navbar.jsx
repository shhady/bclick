'use client';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { FaShoppingCart, FaUser, FaTags, FaList } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
import { useUserContext } from '@/app/context/UserContext';
import { SlHandbag } from "react-icons/sl";
import { FaWhatsapp } from "react-icons/fa";

const Navbar = () => {
  const { globalUser } = useUserContext();
  const [clientProfilePageOrOrders, setClientProfilePageOrOrders] = useState(true)
  const pathName = usePathname();
  
  const getIconColor = (path) => {
    return pathName?.includes(path) ? 'text-customBlue' : 'text-gray-600';
  };

  useEffect(()=>{
    setClientProfilePageOrOrders((pathName === '/profile') || (pathName === '/orders') && globalUser?.role === 'client'  ? true : false);
  },[pathName,globalUser])
 
  const renderShareButtonsMobile = () => {
    if (pathName === '/profile' && globalUser?.role === 'client' || pathName === '/orders' && globalUser?.role === 'client')  {
      
      const shareBody = `פרטים:\n\nשם: ${globalUser?.name}\nטלפון: ${globalUser?.phone}\nאימייל: ${globalUser?.email}\nשם עסק: ${globalUser?.businessName}\nמספר לקוח: ${globalUser?.clientNumber}\n`;

      return (
        <div className="">
          <Link
            href={`https://wa.me/?text=${encodeURIComponent(shareBody)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600  flex flex-col md:flex-row justify-center items-center gap-1"
          >
            <FaWhatsapp size={20}/> 
            <div className='text-sm md:text-base'>שתף פרופיל</div>
            
            
          </Link>
        </div>
      );
    }
    return null;
  };
  const renderShareButtonsDesktop = () => {
    if (pathName === '/profile' || pathName === '/orders') {
      
      const shareBody = `פרטים:\n\nשם: ${globalUser?.name}\nטלפון: ${globalUser?.phone}\nאימייל: ${globalUser?.email}\nשם עסק: ${globalUser?.businessName}\nמספר לקוח: ${globalUser?.clientNumber}\n`;

      return (
        <div className="flex flex-col md:flex-row justify-center items-center space-x-4">
          <Link
            href={`https://wa.me/?text=${encodeURIComponent(shareBody)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 flex flex-col md:flex-row justify-center items-center gap-1"
          >
             <div className='text-sm md:text-base'>שתף פרופיל</div>
            <FaWhatsapp size={18}/> 
           
            
            
          </Link>
        </div>
      );
    }
    return null;
  };


  return (
    <div>
      {/* Desktop Navigation */}
      <div className="fixed top-0 w-full hidden md:flex justify-between items-center px-8 py-4 bg-white shadow-lg z-50 h-20" dir='ltr'>
        <div className='w-[100px] min-w-[100px]'>
          <Link href={'/'}>
            <Image src="/bclick-logo.jpg" alt="Logo" width={100} height={100} className="rounded-full" priority />
          </Link>
        </div>
        {globalUser ? (
          <div className="flex justify-center items-center gap-5">
             {clientProfilePageOrOrders ? (<></>):(<><Link href={globalUser?.role === 'supplier' ? `/supplier/${globalUser?._id}/catalog` : ''} className={`${getIconColor('catalog')}`}>
              קטלוג
            </Link></>)}
            
            {globalUser.role === 'supplier' &&   <Link href={globalUser?.role === 'supplier' ? `/supplier/${globalUser?._id}/clients` : '/clients'} className={`${getIconColor('client')}`}>
              לקוחות
            </Link>}
           {clientProfilePageOrOrders ? (<></>): (<>{globalUser?.role === 'client'&&  <Link href={'/cart'} className={`${getIconColor('cart')}`}>
               עגלה
            </Link>}</>)} 
          
            {globalUser.role === 'admin' && (
              <Link href="/admin/all-users" className={`${getIconColor('admin/all-users')}`}>
                לקוחות
              </Link>
            )}
            <Link href="/orders" className={`${getIconColor('orders')}`}>
              הזמנות
            </Link>
          
            <Link href="/profile" className={`${getIconColor('profile')}`}>
              פרופיל
            </Link>
          </div>
        ) : null}
        <div className='min-w-[100px]'>  {clientProfilePageOrOrders && <>{renderShareButtonsDesktop()}</>}</div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed z-50 bottom-0 left-0 w-full bg-white shadow-lg flex justify-around items-center pt-3 pb-6 border-t border-gray-300 h-[70px]">
        {globalUser ? (
          <>
          {clientProfilePageOrOrders ? (<></>):(<> <Link href={globalUser.role === 'supplier' ? `/supplier/${globalUser._id}/catalog` : ''} className={`flex flex-col items-center ${getIconColor('catalog')}`}>
              <FaTags size={20} />
              <span className="text-xs mt-1">קטלוג</span>
            </Link></>)}
           
           {globalUser.role === 'supplier' && <Link href={globalUser.role === 'supplier' ? `/supplier/${globalUser._id}/clients` : '/clients'} className={`flex flex-col items-center ${getIconColor('client')}`}>
               <FaList size={20} />
              <span className="text-xs mt-1">לקוחות</span>
            </Link>}
            {clientProfilePageOrOrders ? (<></>): (<>{globalUser.role === 'client'&& 
            <Link href={globalUser.role === 'supplier' ? `/supplier/${globalUser._id}/clients` : '/clients'} className={`flex flex-col items-center ${getIconColor('cart')}`}>
              {globalUser.role === 'client' ? <FaList size={20} /> : <SlHandbag size={20} />}
              <span className="text-xs mt-1">עגלה</span>
            </Link>}</>)} 
            {globalUser.role === 'admin' && (
              <Link href="/admin/all-users" className={`flex flex-col items-center ${getIconColor('admin/all-users')}`}>
                <FaList size={20} />
                <span className="text-xs mt-1">לקוחות</span>
              </Link>
            )}
                        {clientProfilePageOrOrders && <>{renderShareButtonsMobile()}</>}

            <Link href="/orders" className={`min-w-[68px] flex flex-col items-center ${getIconColor('orders')}`}>
              <FaShoppingCart size={20} />
              <span className="text-xs mt-1">הזמנות</span>
            </Link>
            <Link href="/profile" className={`min-w-[68px] flex flex-col items-center ${getIconColor('profile')}`}>
              <FaUser size={20} />
              <span className="text-xs mt-1">פרופיל</span>
            </Link>
          </>
        ) : (
          <div className="relative w-[80px] h-[80px]">
            <Image
              src="/bclick-logo.jpg"
              alt="logo"
              fill
              className="object-contain"
              priority
              sizes="80px"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
