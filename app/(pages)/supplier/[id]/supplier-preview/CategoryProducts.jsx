'use client';

import React, {useState} from 'react';
import Image from 'next/image';

export default function CategoryProducts({ category, products }) {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const closePopup = () => setSelectedProduct(null);


  if (products.length === 0) return null;

  return (
    <div>
      <div className="text-2xl pt-8 font-semibold px-4">{category.name}</div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mt-4 px-2">
        {products.map((product) => (
          <div
            key={product._id}
            onClick={() => setSelectedProduct(product)}
 
            className="cursor-pointer border p-4 rounded-lg shadow hover:shadow-md transition flex flex-col items-center"
          >
            <div className="relative w-full h-40 flex items-center justify-center overflow-hidden rounded">
              <Image
                src={product.imageUrl.secure_url}
                alt={product.name}
                fill
                className="object-contain max-h-full"
                placeholder='blur'
                blurDataURL='/blogo192.png'
              />
            </div>
            <h2 className="text-sm font-bold mt-2">{product.name}</h2>
            <p className="text-gray-600 mt-1">משקל: {product.weight}</p>
            <p className="text-gray-600 mt-1">מחיר: ₪{product.price}</p>
          </div>
        ))}
      </div>
      {/* {selectedProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end"
          onClick={closePopup} // Close when clicking outside
        >
          <div
            className="bg-white shadow-lg rounded-t-lg w-full max-w-lg overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the popup
          >
            <div className="flex justify-between items-center p-4">
              <button className="text-customBlue font-bold">Star</button>
              <button onClick={closePopup} className="text-red-500 font-bold text-xl">
                X
              </button>
            </div>
            <div className="p-4 flex flex-col justify-center items-center">
              <Image
                src={selectedProduct.imageUrl.secure_url}
                alt={selectedProduct.name}
                width={400}
                height={400}
                className="w-full max-h-56 object-cover rounded"
              />
              <h2 className="text-lg font-bold mt-4">{selectedProduct.name}</h2>
              <p className="text-gray-600">Weight: {selectedProduct.weight}</p>
              <p className="text-gray-600">Price: ₪{selectedProduct.price}</p>
              <p className="text-gray-600">Units: {selectedProduct.units}</p>
              <div className="flex items-center gap-4 mt-4">
                <button className="bg-gray-300 px-3 py-1 rounded">-</button>
                <span>1</span>
                <button className="bg-gray-300 px-3 py-1 rounded">+</button>
              </div>
              <button className="bg-customBlue text-white mt-6 px-4 py-2 rounded w-full">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}
