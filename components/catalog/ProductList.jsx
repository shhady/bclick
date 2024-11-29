import React from "react";
import Image from "next/image";

export default function ProductList({ products, onEdit }) {
  console.log(products);
  return (
    <div className="space-y-4 px-1 mb-16 md:mb-0">
                  {/* <div className=" grid-cols-4 gap-4 items-center pb-2 border-b-2 border-gray-500 hidden md:grid"> */}
                  {/* <div className="text-center font-semibold"></div>
                    <div className="text-center font-semibold">שם</div>
                    <div className="text-center font-semibold">מלאי</div>
                    <div className="text-center font-semibold">מחיר</div> */}
                  {/* </div> */}
                  {products.map((product) => (
  <div key={product._id} className="bg-white shadow-md rounded-lg p-2">
    {/* Grid Container */}
    <div className="grid grid-cols-6 gap-4 items-start">
      {/* Image (1 Column) */}
      <div className="flex items-center gap-4 text-right col-span-2 row-span-2">
        <Image
          width={1000}
          height={1000}
          src={product.imageUrl?.secure_url || "/path/to/default-image.png"}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Name (2 Columns) */}
      <h2 className="col-span-2 text-start">{product.name}</h2>

      {/* Stock (1 Column) */}
      <div className="text-center">{product.stock}</div>

      {/* Price (1 Column) */}
      <div className="text-center">₪{product.price.toLocaleString()}</div>

      {/* Button (2 Columns, Below Stock and Price) */}
      <button
        onClick={() => onEdit(product)}
        className="col-span-2 col-start-5 mt-2 bg-gray-300 text-gray-500 px-4 py-2 rounded-md hover:bg-blue-600"
      >
        עריכה
      </button>
    </div>
  </div>
))}
    </div>
  );
}
