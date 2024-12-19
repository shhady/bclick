import Image from 'next/image';
import React from 'react';

export default function SupplierCover({ supplier }) {
  return (
    <div className="h-50 lg:h-72 bg-customBlue rounded-b-xl">
      {supplier?.coverImage ? (
        <Image
          src={supplier.coverImage.secure_url}
          alt={supplier.name ? `${supplier.name} Cover Image` : 'Supplier Cover Image'}
          width={1920}
          height={1080}
          placeholder="blur"
          blurDataURL={supplier.coverImage.blurDataURL || "data:image/jpeg;base64,..."} // Dynamic placeholder
          className="object-cover w-full h-full rounded-b-xl" // Ensures consistent layout
        />
      ) : (
        <div className="flex items-center justify-center h-full text-white bg-gray-400">
          No Cover Image Available
        </div>
      )}
    </div>
  );
}
