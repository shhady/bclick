'use client';

import Link from 'next/link';
import React from 'react';
import { useUserContext } from '@/app/context/UserContext';

export default function SupplierProfile() {
  const { globalUser } = useUserContext(); // Access globalUser from the context
  const totalClients = globalUser?.relatedUsers?.length || 0; // Safely get the length of relatedUsers

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
        {/* Clients */}
      <Link href="/supplier/all-clients" className="flex items-center justify-between w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center w-full">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-black">{totalClients}</h2>
            <p className="text-gray-600">סה"כ לקוחות</p>
          </div>
          <div className="w-12 h-12 bg-red-300 rounded-full"></div>
        </div>
      </Link>

      {/* Orders */}
      <Link href="/supplier/all-orders" className="flex items-center justify-between w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center w-full">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-black">45</h2>
            <p className="text-gray-600">סה"כ הזמנות</p>
          </div>
          <div className="w-12 h-12 bg-blue-300 rounded-full"></div>
        </div>
      </Link>

      
      {/* Products */}
      <Link href="/supplier/catalog" className="flex items-center justify-between w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center w-full">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-black">100</h2>
            <p className="text-gray-600">מוצרים מוצרים</p>
          </div>
          <div className="w-12 h-12 bg-green-300 rounded-full"></div>
        </div>
      </Link>
    </div>
  );
}
