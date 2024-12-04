'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { FaShoppingCart, FaUser, FaTags, FaList } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
import { useUserContext } from '@/app/context/UserContext';
import { SlHandbag } from "react-icons/sl";

const Navbar = () => {
  const { globalUser } = useUserContext();
  const pathName = usePathname();
  
  const getIconColor = (path) => {
    return pathName?.includes(path) ? 'text-customBlue' : 'text-gray-600';
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
            <Link href={globalUser.role === 'supplier' ? `/supplier/${globalUser._id}/catalog` : '/catalog'} className={`${getIconColor('catalog')}`}>
              קטלוג
            </Link>
            {globalUser.role === 'supplier' &&   <Link href={globalUser.role === 'supplier' ? `/supplier/${globalUser._id}/clients` : '/clients'} className={`${getIconColor('client')}`}>
              לקוחות
            </Link>}
            {globalUser.role === 'client'&&  <Link href={'/cart'} className={`${getIconColor('cart')}`}>
               עגלה
            </Link>}
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
        <div className='w-[100px] min-w-[100px]'></div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white shadow-lg flex justify-around items-center pt-3 pb-6 border-t border-gray-300 h-[70px]">
        {globalUser ? (
          <>
            <Link href={globalUser.role === 'supplier' ? `/supplier/${globalUser._id}/catalog` : '/catalog'} className={`flex flex-col items-center ${getIconColor('catalog')}`}>
              <FaTags size={20} />
              <span className="text-xs mt-1">קטלוג</span>
            </Link>
           {globalUser.role === 'supplier' && <Link href={globalUser.role === 'supplier' ? `/supplier/${globalUser._id}/clients` : '/clients'} className={`flex flex-col items-center ${getIconColor('client')}`}>
               <FaList size={20} />
              <span className="text-xs mt-1">לקוחות</span>
            </Link>}
            {globalUser.role === 'client'&& 
            <Link href={globalUser.role === 'supplier' ? `/supplier/${globalUser._id}/clients` : '/clients'} className={`flex flex-col items-center ${getIconColor('cart')}`}>
              {globalUser.role === 'client' ? <FaList size={20} /> : <SlHandbag size={20} />}
              <span className="text-xs mt-1">עגלה</span>
            </Link>}
            {globalUser.role === 'admin' && (
              <Link href="/admin/all-users" className={`flex flex-col items-center ${getIconColor('admin/all-users')}`}>
                <FaList size={20} />
                <span className="text-xs mt-1">לקוחות</span>
              </Link>
            )}
            <Link href="/orders" className={`flex flex-col items-center ${getIconColor('orders')}`}>
              <FaShoppingCart size={20} />
              <span className="text-xs mt-1">הזמנות</span>
            </Link>
            <Link href="/profile" className={`flex flex-col items-center ${getIconColor('profile')}`}>
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
