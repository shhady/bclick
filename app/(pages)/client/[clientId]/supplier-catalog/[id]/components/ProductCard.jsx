 'use client';

import Image from 'next/image';
import { memo } from 'react';

export default memo(function ProductCard({ product, showProductDetail, cart }) {
  return (
    <div
      onClick={() => showProductDetail(product)}
      className="cursor-pointer border p-4 rounded-lg shadow hover:shadow-md transition flex flex-col items-center bg-white"
    >
      <div className="relative w-full h-40 flex items-center justify-center overflow-hidden rounded">
        <Image
          src={product?.imageUrl?.secure_url || '/no-image.jpg'}
          alt={product.name}
          width={160}
          height={160}
          className="object-contain max-h-full"
          loading="lazy"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
        />
      </div>
      <h2 className="text-sm font-bold mt-2">{product.name}</h2>
      <p className="text-gray-600 mt-1">משקל: {product?.weight}</p>
      <p className="text-gray-600 mt-1">מחיר: ₪{product?.price}</p>
      <div className='flex justify-center items-center gap-4'>
        <p className="text-gray-600">
          {cart?.items.find((item) => item.productId?._id === product?._id)
            ? <span className='text-customBlue'>עדכן כמות</span>
            : ''}
        </p>
        {product.stock - (product.reserved || 0) === 0 && 
          <p className="text-red-500">אינו זמין במלאי</p>}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.product._id === nextProps.product._id &&
         prevProps.cart?.items?.length === nextProps.cart?.items?.length;
}); 