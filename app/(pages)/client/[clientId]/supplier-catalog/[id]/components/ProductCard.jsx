'use client';

import Image from 'next/image';
import { memo } from 'react';

export default memo(function ProductCard({ product, showProductDetail, cart }) {
  return (
    <div
      onClick={() => showProductDetail(product)}
      className="aspect-[3/4] border p-4 rounded-lg shadow hover:shadow-md transition flex flex-col bg-white"
    >
      <div className="relative aspect-square w-full mb-4">
        <Image
          src={product?.imageUrl?.secure_url || '/no-image.jpg'}
          alt={product.name}
          fill
          className="object-contain rounded"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
          priority={false}
          loading="lazy"
        />
      </div>
      <div className="flex-1 flex flex-col">
        <h2 className="text-sm font-bold line-clamp-2 min-h-[40px]">{product.name}</h2>
        <div className="mt-auto space-y-1">
          <p className="text-gray-600 text-sm">משקל: {product?.weight || '-'}</p>
          <p className="text-gray-600 text-sm">מחיר: ₪{product?.price || '-'}</p>
          <div className='flex justify-between items-center gap-2 min-h-[24px]'>
            {cart?.items.find((item) => item.productId?._id === product?._id) && (
              <span className='text-customBlue text-sm'>עדכן כמות</span>
            )}
            {product.stock - (product.reserved || 0) === 0 && (
              <span className="text-red-500 text-sm">אינו זמין במלאי</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.product._id === nextProps.product._id &&
         prevProps.cart?.items?.length === nextProps.cart?.items?.length;
}); 