'use client';
import { useState, useEffect } from 'react';
import { useNewUserContext } from '@/app/context/NewUserContext';
import NewProfileMenu from '@/components/new-profile/NewProfileMenu';
import { Briefcase, Users, ShoppingCart, FileText, Package, Clock } from 'lucide-react';
import Link from 'next/link';

export default function NewSupplierProfile() {
  const { newUser } = useNewUserContext();
  const [loading, setLoading] = useState(true);

  // Calculate statistics from newUser context
  const totalClients = newUser?.relatedUsers?.length || 0;
  const totalProducts = newUser?.products?.length || 0;
  const totalOrders = newUser?.orders?.length || 0;
  const pendingOrdersCount = newUser?.orders?.filter(order => order.status === 'pending').length || 0;
  const processingOrdersCount = newUser?.orders?.filter(order => order.status === 'processing').length || 0;

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 text-center">
          {/* Clients Card */}
          <Link href={`/supplier/${newUser?._id}/clients`} className="bg-red-50 p-4 rounded-lg flex gap-4 items-center cursor-pointer hover:shadow-md transition">
            <div className="bg-red-100 p-3 rounded-full mr-4">
              <Users className="text-red-600 h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">סה&quot;כ לקוחות</p>
              <p className="text-xl font-bold">{totalClients}</p>
            </div>
          </Link>
          
         
          
          {/* Products Card */}
          <Link href={`/supplier/${newUser?._id}/catalog`} className="bg-green-50 p-4 rounded-lg flex gap-4 items-center cursor-pointer hover:shadow-md transition">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <Package className="text-green-600 h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">סה&quot;כ מוצרים</p>
              <p className="text-xl font-bold">{totalProducts}</p>
            </div>
          </Link>
           {/* Orders Card */}
           <Link href="/orders" className="bg-blue-50 p-4 rounded-lg flex gap-4 items-center cursor-pointer hover:shadow-md transition">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <ShoppingCart className="text-blue-600 h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">סה&quot;כ הזמנות</p> 
              <p className="text-xl font-bold">{totalOrders}</p>
            </div>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Pending Orders Card */}
          <Link href="/orders" className="bg-orange-50 p-4 rounded-lg flex gap-4 items-center cursor-pointer hover:shadow-md transition">
            <div className="bg-orange-100 p-3 rounded-full mr-4">
              <FileText className="text-orange-600 h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">הזמנות בהמתנה</p>
              <p className="text-xl font-bold">{pendingOrdersCount}</p>
            </div>
          </Link>
          <Link href="/orders" className="bg-purple-50 p-4 rounded-lg flex gap-4 items-center cursor-pointer hover:shadow-md transition">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <Clock className="text-purple-600 h-6 w-6" />
            </div>
            <div>
                <p className="text-sm text-gray-600">הזמנות בטיפול</p>
              <p className="text-xl font-bold">{processingOrdersCount}</p>
            </div>
          </Link>
          {/* Business Details Summary */}
          {/* <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="bg-purple-100 p-2 rounded-full mr-3">
                <Briefcase className="text-purple-600 h-5 w-5" />
              </div>
              <p className="text-sm font-medium">פרטי עסק</p>
            </div>
            <p className="text-sm truncate">{newUser?.businessName || 'לא צוין'}</p>
            <p className="text-xs text-gray-600 truncate">{newUser?.address || 'לא צוין'}, {newUser?.city || ''}</p>
          </div> */}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href={`/supplier/${newUser?._id}/catalog`} className="bg-customBlue text-white py-3 px-4 rounded-md hover:bg-blue-600 transition flex gap-4 items-center justify-center">
            <Briefcase className="mr-2 h-5 w-5" />
            <span>ניהול קטלוג</span>
          </Link>
          <Link href={`/supplier/${newUser?._id}/clients`} className="bg-customBlue text-white py-3 px-4 rounded-md hover:bg-blue-600 transition flex gap-4 items-center justify-center">
            <Users className="mr-2 h-5 w-5" />
            <span>ניהול לקוחות</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 