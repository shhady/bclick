// app/client/supplier/[id]/SupplierDetails.jsx
'use client';

import React from 'react';
import Image from "next/image";
import Link from 'next/link';
import { MapPin, Phone, Building2, Star } from 'lucide-react';
    
import { useUserContext } from "@/app/context/UserContext";

export default function SupplierDetails({ 
  supplier, 
  showAll, 
  setShowAll,
  clientId
}) {
  const { globalUser, setGlobalUser, setError } = useUserContext();

  return (
    <div>
      <div className="bg-white shadow-md rounded-lg p-4  transform -translate-y-6 mx-auto max-w-3xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {supplier?.logo && (
              <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-white shadow-md">
                <Image
                  src={supplier.logo}
                  alt={supplier?.businessName || 'ספק'}
                  fill
                  className="object-cover"
                />
              </div>
            )}
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
          </div>
          
          <div className="flex flex-col items-end">
            {globalUser?.role === 'client' ? (
              <Link 
                href={`/client/${clientId}/favourites/${supplier._id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all bg-amber-100 text-amber-700 hover:bg-amber-200"
              >
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span>מועדפים</span>
              </Link>
            ) : (
              <button 
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all bg-amber-100 text-amber-700 hover:bg-amber-200"
              >
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span>מועדפים</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// New component for view mode toggle
