'use client';
import { useState, useEffect } from 'react';
import { useNewUserContext } from '@/app/context/NewUserContext';
import NewProfileMenu from '@/components/new-profile/NewProfileMenu';
import { ShoppingBag, Clock, FileText, Search, Hourglass } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function NewClientProfile() {
  const { newUser } = useNewUserContext();
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const ordersCount = newUser?.orders?.length || 0;
  const pendingOrdersCount = newUser?.orders?.filter(order => order.status === 'pending').length || 0;
  const processingOrdersCount = newUser?.orders?.filter(order => order.status === 'processing').length || 0;

  // Log the newUser data to debug
  useEffect(() => {
    if (newUser?.relatedUsers) {
      console.log('NewClientProfile - newUser.relatedUsers:', newUser.relatedUsers);
      
      // Check specifically for cover images
      newUser.relatedUsers.forEach((supplier, index) => {
        if (supplier.user) {
          console.log(`Supplier ${index} - ${supplier.user.businessName} - coverImage:`, 
            supplier.user.coverImage ? 'Present' : 'Missing',
            supplier.user.coverImage
          );
        }
      });
    }
  }, [newUser?.relatedUsers]);

  // Preserve the nested structure of suppliers
  useEffect(() => {
    if (newUser?.relatedUsers) {
      const activeSuppliers = newUser.relatedUsers.filter(supplier => 
        supplier.status === 'active' && supplier.user
      );
      
      console.log('NewClientProfile - activeSuppliers count:', activeSuppliers.length);
      
      // Set suppliers directly without deep copy to preserve object references
      setSuppliers(activeSuppliers);
    }
  }, [newUser?.relatedUsers]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">הספקים שלי</h1>
          <NewProfileMenu onEdit={() => {}} />
        </div> */}
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6 text-center">
          <div className="bg-orange-50 p-4 rounded-lg flex items-center">
            <div className="bg-orange-100 p-3 rounded-full mr-4">
              <Clock className="text-orange-600 h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">הזמנות בהמתנה</p>
              <p className="text-xl font-bold">{pendingOrdersCount}</p>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <Hourglass className="text-blue-600 h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">הזמנות בטיפול</p>
              <p className="text-xl font-bold">{processingOrdersCount}</p>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <FileText className="text-purple-600 h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">סה&quot;כ הזמנות</p>
              <p className="text-xl font-bold">{ordersCount}</p>
            </div>
          </div>
        </div>
        
        {/* Search bar */}
        {/* <div className="relative mb-6">
          <input
            type="text"
            placeholder="חפש ספקים..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-customBlue"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
         */}
        {/* Suppliers list */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">ספקים פעילים</h2>
          <div className="flex flex-col lg:flex-row gap-4">

         
          {suppliers?.length > 0 ? (
            suppliers.map((supplier) => {
              console.log('Rendering supplier:', supplier);
              return (
                <Link
                  key={supplier._id}
                  href={`/catalog/${supplier?.user?._id}`}
                  className="flex items-center justify-start w-full gap-4 max-w-md p-4 bg-white shadow-lg rounded-lg border border-gray-200"
                >
                  <div className="flex-shrink-0">
                    {console.log('Rendering image for supplier:', supplier.user?.businessName, 'coverImage:', supplier.user?.coverImage)}
                    <Image
                      width={100}
                      height={100}
                      src={supplier?.user?.profileImage ||supplier?.user?.coverImage?.secure_url ||  '/no-image.jpg'}
                      alt={supplier?.user?.businessName || 'photo'}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      priority
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-black">{supplier?.user?.businessName}</h2>
                    <p className="text-gray-600">{supplier?.user?.name}</p>
                    {/* <p className="text-sm text-gray-500 mt-2">{supplier?.user?.ordersCount || 0} ס"כ הזמנות</p> */}
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'לא נמצאו ספקים התואמים את החיפוש' : 'אין ספקים פעילים'}
            </div>
          )}
           </div>
          {/* {suppliers.length > 0 && (
            <button className="w-full mt-4 bg-customBlue text-white py-3 px-4 rounded-md hover:bg-blue-600 transition flex items-center justify-center">
              <ShoppingBag className="mr-2 h-5 w-5" />
              <span>חפש ספקים נוספים</span>
            </button>
          )} */}
        </div>
      </div>
    </div>
  );
} 