import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Pencil } from "lucide-react";

export default function ProductList({ products, onEdit }) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-8">
      {products.map((product) => (
        <div key={product._id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:border-gray-200">
          {/* Mobile View - Stacked Layout */}
          <div className="block md:hidden">
            <div className="flex items-center gap-3 mb-3">
              {/* Image */}
              <div className="flex-shrink-0">
                <Image 
                  loading="lazy" 
                  blurDataURL="/blogo.png" 
                  placeholder="blur"
                  width={70} 
                  height={70}
                  src={product.imageUrl?.secure_url || '/no-image.jpg'}
                  alt={product.name}
                  className="w-16 h-16 object-contain rounded-lg"
                />
              </div>
              
              {/* Title and Details */}
              <div className="flex-1">
                <h2 className="font-medium text-gray-800 line-clamp-2 mb-1">{product.name}</h2>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-gray-100 text-gray-800 py-1 px-2 rounded-full text-xs font-bold">
                    ₪{product.price.toLocaleString()}
                  </span>
                  <span className={`py-1 px-2 rounded-full text-xs ${
                    product.stock === 0 
                      ? 'bg-red-100 text-red-700' 
                      : product.stock < 5
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    מלאי: {product.stock}
                  </span>
                  {/* Added weight unit to mobile view */}
                  {product.weight && (
                    <span className="bg-purple-50 text-purple-700 py-1 px-2 rounded-full text-xs">
                      משקל: {product.weight} {product.weightUnit || ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Mobile Edit Button */}
            <Link href={`/supplier/catalog/update-product/${product._id}`} className="block w-full">
              <button className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-customBlue hover:text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-sm">
                <Pencil size={16} />
                <span>עריכה</span>
              </button>
            </Link>
          </div>

          {/* Desktop View - Grid Layout with 7 columns including edit button */}
          <div className="hidden md:grid md:grid-cols-7 md:gap-4 md:items-center">
            {/* Image (1 Column) */}
            <div className="flex items-center justify-center col-span-1">
              <Image loading="lazy" blurDataURL="/blogo.png" placeholder="blur"
                width={1000}
                height={1000}
                src={product.imageUrl?.secure_url || '/no-image.jpg'}
                alt={product.name}
                className="w-24 h-24 object-contain rounded-lg"
              />
            </div>

            {/* Name (1 Column) */}
            <div className="col-span-1 flex flex-col">
              <h2 className="font-medium text-gray-800 line-clamp-2">{product.name}</h2>
            </div>

            {/* Units (1 Column) */}
            <div className="flex justify-center items-center text-center">
              <span className="bg-blue-50 text-blue-700 py-1 px-3 rounded-full text-sm">
                {product.units || '—'}
              </span>
            </div>

            {/* Weight (1 Column) */}
            <div className="flex justify-center items-center text-center">
              <span className="bg-purple-50 text-purple-700 py-1 px-3 rounded-full text-sm">
                {product.weight ? `${product.weight} ${product.weightUnit || ''}` : '—'}
              </span>
            </div>

            {/* Stock (1 Column) */}
            <div className="flex justify-center items-center">
              <span className={`py-1 px-3 rounded-full text-sm ${
                product.stock === 0 
                  ? 'bg-red-100 text-red-700' 
                  : product.stock < 5
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {product.stock}
              </span>
            </div>

            {/* Price (1 Column) */}
            <div className="flex justify-center items-center">
              <span className="bg-gray-100 text-gray-800 py-1 px-3 rounded-full text-sm font-bold">
                ₪{product.price.toLocaleString()}
              </span>
            </div>
            
            {/* Edit Button (1 Column) - Now part of the grid */}
            <div className="flex justify-center items-center">
              <Link href={`/supplier/catalog/update-product/${product._id}`}>
                <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-customBlue hover:text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-sm">
                  <Pencil size={16} />
                  <span>עריכה</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
