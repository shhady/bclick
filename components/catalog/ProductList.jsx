import React from "react";
import Image from "next/image";

export default function ProductList({ products, onEdit }) {
  console.log(products);
  return (
    <div className="space-y-4 px-6">
                  {/* <div className=" grid-cols-4 gap-4 items-center pb-2 border-b-2 border-gray-500 hidden md:grid"> */}
                  {/* <div className="text-center font-semibold"></div>
                    <div className="text-center font-semibold">שם</div>
                    <div className="text-center font-semibold">מלאי</div>
                    <div className="text-center font-semibold">מחיר</div> */}
                  {/* </div> */}
      {products.map((product) => (
        <div key={product._id} className="bg-white shadow-md rounded-lg p-6">
          <div className="grid grid-cols-4 gap-4 items-center">
            <div className="flex items-center gap-4 text-right">
              <Image
                width={1000}
                height={1000}
                src={product.imageUrl?.secure_url || "/path/to/default-image.png"}
                alt={product.name}
                className="w-16 h-16 object-contain rounded-md border"
              />
            </div>
            <h2 className="font-bold text-center">{product.name}</h2>

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
