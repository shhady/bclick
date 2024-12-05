// app/client/supplier/[id]/SupplierDetails.jsx
'use client';

import Image from "next/image";

export default function SupplierDetails({ supplier }) {
  console.log(supplier);
  return (
    <div>
       {supplier?.coverImage && (
    <div className='h-50 lg:h-72 bg-customBlue rounded-b-xl'>
 <Image
            src={supplier?.coverImage?.secure_url}
            width={1000}
            height={1000}
            alt='cover'
            className='w-full h-full object-cover max-h-1/4'
            priority
          />
        </div>
         
        )}
      
      <div className="flex items-start justify-between gap-4 p-4 shadow-md">
        <div>
          <h1 className="text-1xl font-semibold">{supplier?.businessName || 'משתמש'}</h1>
          <p>{supplier?.city}</p>
          <p>{supplier?.phone || 'טלפון לא הוזן'}</p>
        </div>
        <div className="flex flex-col items-center justify-end gap-2">
          {/* <ProfileMenu onEdit={onEdit}/> */}
         <button className="flex justify-center items-center border-2 gap-2 px-3 rounded-lg">
         <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.5 0L11.6329 6.56434H18.535L12.9511 10.6213L15.084 17.1857L9.5 13.1287L3.91604 17.1857L6.04892 10.6213L0.464963 6.56434H7.36712L9.5 0Z" fill="#FFE8A3"/>
</svg>
מועדפים
         </button>
        </div>
      </div>
      {/* <p>{user.email}</p> */}
      {/* Render other user details as needed */}
    </div>
  );
}
