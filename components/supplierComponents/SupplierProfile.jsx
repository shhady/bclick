'use client';

import Link from 'next/link';
import React from 'react';
import { useUserContext } from '@/app/context/UserContext';

export default function SupplierProfile() {
  const { globalUser } = useUserContext(); // Access globalUser from the context
  const totalClients = globalUser?.relatedUsers?.length || 0; // Safely get the length of relatedUsers
  const totalProducts = globalUser?.products?.length || 0;
  return (
    <div className="flex flex-col items-center space-y-2 p-6 mb-24">
        {/* Clients */}
      <Link href={`/supplier/${globalUser._id}/clients`} className="flex items-center justify-between w-full max-w-md p-4 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center w-full">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-black">{totalClients}</h2>
            <p className="text-gray-600">סה&quot;כ לקוחות</p>
          </div>
          <div className="w-12 h-12 bg-red-300 rounded-full"></div>
        </div>
      </Link>

      {/* Orders */}
      <Link href="/supplier/all-orders" className="flex items-center justify-between w-full max-w-md p-4 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center w-full">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-black">45</h2>
            <p className="text-gray-600">סה&quot;כ הזמנות</p>
          </div>
          <div className="w-12 h-12 bg-blue-300 rounded-full"></div>
        </div>
      </Link>

      
      {/* Products */}
      <Link href={`/supplier/${globalUser._id}/catalog`} className="flex items-center justify-between w-full max-w-md p-4 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center w-full">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-black">{totalProducts}</h2>
            <p className="text-gray-600">מוצרים </p>
          </div>
          <div className="w-12 h-12 bg-green-300 rounded-full"></div>
        </div>
      </Link>
    </div>
  );
}
