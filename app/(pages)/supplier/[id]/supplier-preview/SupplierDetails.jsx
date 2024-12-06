// app/client/supplier/[id]/SupplierDetails.jsx
'use client';

import React from 'react';
import Image from "next/image";

export default function SupplierDetails({ 
  supplier, 
  showAll, 
  setShowAll 
}) {
  return (
    <div className= "sticky top-0 md:top-20 z-40">
      {/* Supplier Cover Image */}
      {/* {supplier?.coverImage && (
        <div className='h-50 lg:h-72 bg-customBlue rounded-b-xl '>
          <Image
            src={supplier?.coverImage?.secure_url}
            width={1000}
            height={1000}
            alt='cover'
            className='w-full h-full object-cover max-h-1/4'
            priority
          />
        </div>
      )} */}

      {/* Sticky Supplier Details */}
      <div 
        className=" bg-white z-10 shadow-md p-4 flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-1xl font-semibold">{supplier?.businessName || 'משתמש'}</h1>
          <p>{supplier?.city}</p>
          <p>{supplier?.phone || 'טלפון לא הוזן'}</p>
        </div>
        <div className="flex flex-col items-center justify-end gap-2">
          <ViewModeToggle 
            mode={showAll} 
            onToggle={setShowAll} 
          />
        </div>
      </div>
    </div>
  );
}

// New component for view mode toggle
function ViewModeToggle({ mode, onToggle }) {
  return (
    <div className="flex flex-col md:flex-row justify-center items-center gap-2">
      <button 
        onClick={() => onToggle(true)}
        className={`flex w-full justify-center items-center gap-2 px-3 py-1 rounded-lg transition-all ${
          mode ? 'bg-customBlue text-white' : 'bg-gray-200 text-gray-700'
        }`}
      >
        כל המוצרים
      </button>
      <button 
        onClick={() => onToggle(false)}
        className={`w-full flex justify-center items-center gap-2 px-3 py-1 rounded-lg transition-all ${
          !mode ? 'bg-customBlue text-white' : 'bg-gray-200 text-gray-700'
        }`}
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
            fill={!mode ? "#FFD700" : "#FFD700"}
          />
        </svg>
        מועדפים
      </button>
    </div>
  );
}
