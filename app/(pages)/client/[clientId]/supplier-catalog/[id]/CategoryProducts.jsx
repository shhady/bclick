'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import StarToggle from './StarToggle';

export default function CategoryProducts({ category, products,clientId }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const closePopup = () => {
    setIsPopupVisible(false);
    setTimeout(() => setSelectedProduct(null), 300); // Delay to match transition duration
  };

  const openPopup = (product) => {
    setSelectedProduct(product);
    setTimeout(() => setIsPopupVisible(true), 0); // Ensure transition starts correctly
  };

  // Filter products by status (active or out_of_stock)
  const filteredProducts = products.filter(
    (product) => product.status === 'active' || product.status === 'out_of_stock'
  );

  // If no products after filtering, don't render the category
  if (filteredProducts.length === 0) return null;

  return (
    <div>
      <div className="text-2xl pt-8 font-semibold px-4">{category.name}</div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mt-4 px-2">
        {filteredProducts.map((product) => (
          <div
            key={product._id}
            onClick={() => openPopup(product)}
            className="cursor-pointer border p-4 rounded-lg shadow hover:shadow-md transition flex flex-col items-center"
          >
            <div className="w-full h-40 flex items-center justify-center overflow-hidden rounded">
              <Image
                src={product?.imageUrl?.secure_url}
                alt={product.name}
                width={160}
                height={160}
                className="object-contain max-h-full"
              />
            </div>
            <h2 className="text-sm font-bold mt-2">{product.name}</h2>
            <p className="text-gray-600 mt-1">משקל: {product?.weight}</p>
            <p className="text-gray-600 mt-1">מחיר: ₪{product?.price}</p>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end transition-opacity duration-300 ${
            isPopupVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={closePopup} // Close when clicking outside
        >
          <div
            className={`bg-white shadow-lg rounded-t-lg w-full max-w-lg overflow-y-auto transition-transform duration-300 transform ${
              isPopupVisible ? 'translate-y-0' : 'translate-y-full'
            }`}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the popup
          >
            <div className="flex justify-between items-center p-4">
            <StarToggle productId={selectedProduct._id} clientId={clientId} />
                          <button onClick={closePopup} className="text-red-500 font-bold text-xl">
                X
              </button>
            </div>
            <div className="p-16">
              <Image
                src={selectedProduct?.imageUrl?.secure_url}
                alt={selectedProduct.name}
                width={400}
                height={400}
                className="w-full max-h-56 object-contain rounded"
              />
              <div className='flex justify-between items-center mt-4'>
              <h2 className="text-lg font-bold">{selectedProduct.name}</h2>
              <h2 className="text-gray-600 font-bold">מחיר: ₪{selectedProduct?.price}</h2>
              </div>
              <div className='flex justify-center gap-4 items-center'>
              <p className="text-gray-600">משקל: {selectedProduct?.weight}</p>
              <p className="text-gray-600">יחידות: {selectedProduct.units}</p>
              </div>
              <div className='flex justify-start gap-4 items-center'>
              <p className="text-gray-600">{selectedProduct?.description}</p>
              </div>
              <div className="flex justify-center items-center gap-4 mt-4">
                <button className="bg-gray-300 px-3 py-1 rounded">-</button>
                <span>1</span>
                <button className="bg-gray-300 px-3 py-1 rounded">+</button>
              </div>
              <button className="bg-customBlue text-white mt-6 px-4 py-2 rounded w-full">
              הוסף להזמנה
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
