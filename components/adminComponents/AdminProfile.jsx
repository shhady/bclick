'use client'
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

export default function AdminProfile() {
  const [totalUsers, setTotalUsers] = useState(0); // State to hold total users count
  const [loading, setLoading] = useState(true);

  // Fetch total users count
  useEffect(() => {
    const fetchUsersCount = async () => {
      try {
        const response = await fetch(`/api/users/total-users`); // Endpoint specifically for the total user count
        if (response.ok) {
          const data = await response.json();
          setTotalUsers(data.totalUsers); // Set total users count
        } else {
          console.error('Failed to fetch total users');
        }
      } catch (error) {
        console.error('Error fetching users count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsersCount();
  }, []);
  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      {/* users */}
      <Link href='/admin/all-users' className="flex items-center justify-between w-full max-w-md p-6 bg-white rounded-lg shadow-md"> 
      <div className='flex justify-between items-center w-full'>
      
         <div className="text-center">
          <h2 className="text-3xl font-bold text-black">{totalUsers}</h2>
          <p className="text-gray-600">סה"כ לקוחות</p>
        </div>
        
        <div className="w-12 h-12 bg-red-300 rounded-full"></div>
      </div>
      </Link>
      {/* orders */}
      <Link href='/admin/all-orders' className="flex items-center justify-between w-full max-w-md p-6 bg-white rounded-lg shadow-md"> 

      <div className='flex justify-between items-center w-full'>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-black">45</h2>
          <p className="text-gray-600">סה"כ הזמנות</p>
        </div>
        <div className="w-12 h-12 bg-blue-300 rounded-full"></div>
      </div>
    </Link>
      {/* Products */}
      <Link href='/admin/all-products' className="flex items-center justify-between w-full max-w-md p-6 bg-white rounded-lg shadow-md"> 

      <div className='flex justify-between items-center w-full'>
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
