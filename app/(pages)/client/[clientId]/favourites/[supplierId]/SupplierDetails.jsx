'use client';

import React from 'react';
import Image from "next/image";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SupplierDetails({ 
  supplier, 
  clientId 
}) {
  const pathName = usePathname();

  // Check if the current page is the "favorites" page
  const isFavoritesPage = pathName?.includes('/favourites/');

  return (
    <div className="sticky top-0 md:top-20 z-50">
      <div 
        className="bg-white z-10 shadow-md p-4 flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-1xl font-semibold">{supplier?.businessName || 'משתמש'}</h1>
          <p>{supplier?.city}</p>
          <p>{supplier?.phone || 'טלפון לא הוזן'}</p>
        </div>
        <div className="flex flex-col items-center justify-end gap-2">
          <Link href={`/client/${clientId}/favourites/${supplier._id}`}>
            <button 
              className={`flex w-full justify-center items-center gap-1 px-2 py-1 rounded-lg transition-all bg-gray-200 text-gray-700`}
            >
              <svg 
                width="19" 
                height="18" 
                viewBox="0 0 19 18" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1"
              >
                <path 
                  d="M9.5 0L11.6329 6.56434H18.535L12.9511 10.6213L15.084 17.1857L9.5 13.1287L3.91604 17.1857L6.04892 10.6213L0.464963 6.56434H7.36712L9.5 0Z" 
                  fill={"#FFD700"}
                />
              </svg>
              {isFavoritesPage ? 'המועדפים שלי' : 'מועדפים'}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
