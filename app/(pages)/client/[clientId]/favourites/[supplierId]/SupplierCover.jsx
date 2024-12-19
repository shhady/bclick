import Image from 'next/image';
import React from 'react';

export default function SupplierCover({ supplier }) {
  const imageUrl = supplier?.coverImage?.secure_url
    ? `${supplier.coverImage.secure_url}`
    : null;

  return (
    <div className="h-50 lg:h-72 bg-customBlue rounded-b-xl">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={supplier.name ? `${supplier.name} Cover Image` : 'Supplier Cover Image'}
          width={500}
          height={500}
          priority // Ensures early loading for better LCP
          placeholder="blur"
          blurDataURL={supplier.coverImage.blurDataURL || "data:image/jpeg;base64,..."} // Optimized placeholder
          className="object-cover w-full h-full rounded-b-xl"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Responsive sizes
        />
      ) : (
        <div className="flex items-center justify-center h-full text-white bg-gray-400">
          No Cover Image Available
        </div>
      )}
    </div>
  );
}
