'use client';

import React, { useState, useEffect } from 'react';
import { useUserContext } from "@/app/context/UserContext";
import Link from 'next/link';
import Image from 'next/image';
import { CloudFog } from 'lucide-react';

export default function ClientProfile({user}) {
  const [suppliers, setSuppliers] = useState([]);
  const [message, setMessage] = useState('');
  const { globalUser } = useUserContext(); // Access the global user context

  return (
    <div className="flex flex-col items-center justify-center p-6">
         {user?.relatedUsers?.length > 0 ? (
        <div className="w-full max-w-md p-4 mb-4 bg-customGreen-100 text-green-800 rounded-lg text-center shadow-md">
          <p>
            <strong>מחפשים ספקים נוספים?</strong> פנו לספקים חדשים ובקשו מהם להוסיף אתכם
            למערכת.
          </p>

        </div>
      ) : (
        <div className="w-full max-w-md p-4 mb-4 bg-yellow-100 text-yellow-800 rounded-lg text-center shadow-md">
          <p>
            <strong>אין לך ספקים עדיין.</strong> תוכל לבקש מספקים להוסיף אותך למערכת
            ולהתחיל ליהנות מהשירותים שלהם!
          </p>
        </div>
      )}

          {user?.relatedUsers?.map((supplier) => (
              <Link
                key={supplier._id}
                href={`/client/${globalUser?._id}/supplier-catalog/${supplier?.user?._id}`}
                className="flex items-center justify-start w-full gap-4 max-w-md p-4 bg-white shadow-lg rounded-lg border border-gray-200"
              >
                <div className="flex-shrink-0">
                  <Image
                    width={100}
                    height={100}
                    src={supplier?.user?.profileImage}
                    alt={supplier?.businessName || 'photo'}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-black">{supplier?.user?.businessName}</h2>
                  <p className="text-gray-600">{supplier?.user?.name}</p>
                  <p className="text-sm text-gray-500 mt-2">{supplier?.user?.ordersCount} ס&quot;כ הזמנות</p>
                </div>
                
              </Link>
            ))}
            
      
      
    </div>
  );
}
