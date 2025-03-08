'use client';

import React from 'react';
import Image from "next/image";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, Star } from 'lucide-react';

export default function SupplierDetails({ 
  supplier, 
  clientId 
}) {
  const pathName = usePathname();

  // Check if the current page is the "favorites" page
  const isFavoritesPage = pathName?.includes('/favourites/');

  return (
    <div >
      <div 
        className="bg-white z-10 shadow-md p-4 flex items-start justify-between gap-4"
      >
       <div>
              <h1 className="text-xl font-bold text-gray-800">{supplier?.businessName || 'ספק'}</h1>
              <div className="flex gap-2 items-center text-gray-600 mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                <p>{supplier?.city || 'לא צוין מיקום'}</p>
              </div>
              <div className="flex gap-2 items-center text-gray-600 mt-1">
                <Phone className="h-4 w-4 mr-1" />
                <p>{supplier?.phone || 'טלפון לא הוזן'}</p>
              </div>
            </div>
        {/* <div className="flex flex-col items-center justify-end gap-2">
          <Link href={`/client/${clientId}/favourites/${supplier._id}`}>
            <button 
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all bg-amber-100 text-amber-700 hover:bg-amber-200"
              >
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span>מועדפים</span>
            </button>
          </Link>
        </div> */}
      </div>
    </div>
  );
}
