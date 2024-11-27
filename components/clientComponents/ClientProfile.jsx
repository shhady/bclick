'use client';

import React, { useState, useEffect } from 'react';
import { useUserContext } from "@/app/context/UserContext";
import Link from 'next/link';
import Image from 'next/image';

export default function ClientProfile() {
  const [suppliers, setSuppliers] = useState([]);
  const [message, setMessage] = useState('');
  const { globalUser } = useUserContext(); // Access the global user context

  useEffect(() => {
    const fetchSuppliers = async () => {
      if (!globalUser || !globalUser._id) {
        setMessage('Failed to fetch suppliers. Please try again later.');
        return;
      }

      try {
        const response = await fetch(`/api/clients/get-suppliers?clientId=${globalUser._id}`);
        if (response.ok) {
          const data = await response.json();
          setSuppliers(data);
        } else {
          setMessage('Error fetching suppliers. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching suppliers:', error);
        setMessage('Error fetching suppliers. Please try again later.');
      }
    };

    fetchSuppliers();
  }, [globalUser]);

  return (
    <div className="flex flex-col items-center justify-center p-6">
         {globalUser?.relatedUsers?.length > 0 ? (
        <div className="w-full max-w-md p-4 mb-4 bg-green-100 text-green-800 rounded-lg text-center shadow-md">
          <p>
            <strong>מחפשים ספקים נוספים?</strong> פנו לספקים חדשים ובקשו מהם להוסיף אתכם
            למערכת.
          </p>
          {/* <h1 className="text-2xl font-bold mb-4">הספקים שלי</h1> */}

        </div>
      ) : (
        <div className="w-full max-w-md p-4 mb-4 bg-yellow-100 text-yellow-800 rounded-lg text-center shadow-md">
          <p>
            <strong>אין לך ספקים עדיין.</strong> תוכל לבקש מספקים להוסיף אותך למערכת
            ולהתחיל ליהנות מהשירותים שלהם!
          </p>
        </div>
      )}


      {/* {suppliers.length === 0 ? (
       <div className="text-center p-6 bg-yellow-100 border border-yellow-300 rounded-lg">
       <p className="text-lg text-yellow-800 font-semibold mb-4">
         אין לך ספקים עדיין. תבקש מהספק להוסיף אותך.
       </p>
       <p className="text-yellow-600">
         צור קשר עם ספקים כדי להוסיף אותם לרשימתך ולהתחיל לשתף פעולה.
       </p>
     </div>
      ) : ( */}
        <>
          {suppliers.map((supplier) => (
              <Link
                key={supplier._id}
                href={`/client/supplier/${supplier._id}`}
                className="flex items-center justify-start w-full gap-4 max-w-md p-4 bg-white shadow-lg rounded-lg border border-gray-200"
              >
                <div className="flex-shrink-0">
                  <Image
                    width={100}
                    height={100}
                    src={supplier.profileImage}
                    alt={supplier.businessName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-black">{supplier.businessName}</h2>
                  <p className="text-gray-600">{supplier.name}</p>
                  <p className="text-sm text-gray-500 mt-2">{supplier.ordersCount} ס&quot;כ הזמנות</p>
                </div>
                
              </Link>
            ))}
            
        </>
      {/* )} */}
    </div>
  );
}
