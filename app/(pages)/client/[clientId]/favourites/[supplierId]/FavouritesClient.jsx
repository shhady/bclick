'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import StarToggle from '../../supplier-catalog/[id]/StarToggle';

export default function FavouritesClient({ products, clientId }) {
  const [favoriteProducts, setFavoriteProducts] = useState(products);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const openPopup = (product) => setSelectedProduct(product);
  const closePopup = () => setSelectedProduct(null);

  const handleRemove = (productId) => {
    setFavoriteProducts((prev) =>
      prev.filter((product) => product._id !== productId)
    );
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {favoriteProducts.map((product) => (
          <div
            key={product._id}
            className="relative border p-4 rounded-lg shadow hover:shadow-lg transition"
          >
            {/* StarToggle positioned in the top-right corner */}
            <StarToggle
              productId={product._id}
              clientId={clientId}
              confirmRemoval={true}
              onRemove={handleRemove}
              className="absolute top-2 right-2"
            />
            <div
              className="relative w-full h-40 flex items-center justify-center overflow-hidden rounded cursor-pointer"
              onClick={() => openPopup(product)}
            >
              <Image
                src={product.imageUrl.secure_url}
                alt={product.name}
                fill
                className="object-contain max-h-full"
              />
            </div>
            <div className='flex flex-col justify-center items-center'>
            <h2 className="text-sm font-bold mt-2">{product.name}</h2>
            <p className="text-gray-600 mt-1"> יחידות במוצר: {product?.units}</p>
            <p className="text-gray-600 mt-1">משקל: {product?.weight}</p>
            <p className="text-gray-600 mt-1">מחיר: ₪{product?.price}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
          onClick={closePopup}
        >
          <div
            className="bg-white rounded-lg p-6 shadow-lg w-11/12 max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">{selectedProduct.name}</h2>
              <button
                onClick={closePopup}
                className="text-red-500 font-bold text-xl"
              >
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
              <div className="flex justify-between items-center mt-4">
                <h2 className="text-gray-600 font-bold">מחיר: ₪{selectedProduct?.price}</h2>
                <p className="text-gray-600">משקל: {selectedProduct?.weight}</p>
                <p className="text-gray-600">יחידות: {selectedProduct.units}</p>
              </div>
              <div className="flex justify-start gap-4 items-center mt-4">
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
