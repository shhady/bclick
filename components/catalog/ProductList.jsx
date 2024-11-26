import React from "react";
import Image from "next/image";

export default function ProductList({ products, onEdit }) {
  return (
    <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 items-center pb-2 border-b-2 border-gray-500">
                    <div className="text-center font-semibold">שם מוצר</div>
                    <div className="text-center font-semibold">מלאי</div>
                    <div className="text-center font-semibold">מחיר</div>
                  </div>
      {products.map((product) => (
        <div key={product._id} className="bg-white shadow-md rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="flex items-center gap-4 text-right">
              <Image
                width={16}
                height={16}
                src={product.imageUrl?.secure_url || "/path/to/default-image.png"}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-md border"
              />
              <h2 className="font-bold">{product.name}</h2>
            </div>
            <div className="text-center">{product.stock}</div>
            <div className="text-center">₪{product.price.toLocaleString()}</div>
          </div>
          <button
            onClick={() => onEdit(product)}
            className="mt-2 w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            עריכה
          </button>
        </div>
      ))}
    </div>
  );
}
