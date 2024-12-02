'use client'
import React from 'react';
import { FaShoppingCart, FaUser, FaTags, FaList } from 'react-icons/fa'; // Import icons
import Image from 'next/image';
import Link from 'next/link';
import { useUserContext } from '@/app/context/UserContext';
import { SlHandbag } from "react-icons/sl";

const Navbar = () => {
    const { globalUser, setGlobalUser, setError } = useUserContext();
    console.log(globalUser);
  return (
    <div >
      {/* Desktop Navigation */}
      <div className="fixed top-0 w-full hidden md:flex justify-between items-center px-8 py-4 bg-white shadow-lg z-50 h-20">
      <div className='w-[100px] min-w-[100px]'></div>
        <div className="flex justify-center items-center gap-5">
        {(globalUser?.role === 'supplier') && (
        <Link href={`/supplier/${globalUser._id}/catalog`} className="text-gray-600 hover:text-customBlue">
            קטלוג
          </Link>
          )}
           {(globalUser?.role === 'client') && (
        <Link href="/catalog" className="text-gray-600 hover:text-customBlue">
            קטלוג
          </Link>
          )}
          {(globalUser?.role === 'admin') && (
  <Link href="/admin/all-users" className="text-gray-600 hover:text-customBlue">
    לקוחות
  </Link>
)}
        {(globalUser?.role === 'supplier') && (
          <Link href={`/supplier/${globalUser._id}/clients`} className="text-gray-600 hover:text-customBlue">
          לקוחות
        </Link>
            )}
          {globalUser?.role === 'client' && <Link href="/clients" className="text-gray-600 hover:text-customBlue">
            עגלה
          </Link>}
          <Link href="/orders" className="text-gray-600 hover:text-customBlue">
            הזמנות
          </Link>
        
          <Link href="/profile" className="text-gray-600 hover:text-customBlue">
            פרופיל
          </Link>
          
         
        </div>
        <div className="flex items-center space-x-4">
          <Image src="/bclick-logo.jpg" alt="Logo" width={100} height={70} className="rounded-full" />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white shadow-lg flex justify-around items-center pt-2 pb-6 border-t border-gray-300">
      {(globalUser?.role === 'supplier') && (
      <Link href={`/supplier/${globalUser._id}/catalog`} className="flex flex-col items-center text-gray-600 hover:text-customBlue">
          <FaTags size={20} />
          <span className="text-xs mt-1">קטלוג</span>
        </Link>
        )} 
        {(globalUser?.role === 'client') && (
      <Link href="/catalog" className="flex flex-col items-center text-gray-600 hover:text-customBlue">
          <FaTags size={20} />
          <span className="text-xs mt-1">קטלוג</span>
        </Link>
        )} 
        {globalUser?.role === 'client' && <Link href="/clients" className="text-gray-600 hover:text-customBlue">
          <SlHandbag size={20} />
          <span className="text-xs mt-1">עגלה</span>
          </Link>}
          {(globalUser?.role === 'supplier') && (
  <Link href={`/supplier/${globalUser._id}/clients`} className="flex flex-col items-center text-gray-600 hover:text-customBlue">
    <FaList size={20} />
    <span className="text-xs mt-1">לקוחות</span>
  </Link>
)} 
{(globalUser?.role === 'admin') && (
    <Link href="/admin/all-users" className="flex flex-col items-center text-gray-600 hover:text-customBlue">
      <FaList size={20} />
      <span className="text-xs mt-1">לקוחות</span>
    </Link>
  )}
        <Link href="/orders" className="flex flex-col items-center text-gray-600 hover:text-customBlue">
          <FaShoppingCart size={20} />
          <span className="text-xs mt-1">הזמנות</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center text-gray-600 hover:text-customBlue">
          <FaUser size={20} />
          <span className="text-xs mt-1">פרופיל</span>
        </Link>
        
        
        
          
        
      </div>
    </div>
  );
};

export default Navbar;
