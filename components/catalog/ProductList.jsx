import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function ProductList({ products, onEdit }) {
  console.log(products);
  return (
    <div className="space-y-6 px-1 mb-24 md:mb-4">
                  {products.map((product) => (
  <div key={product._id} className="bg-white shadow-md rounded-lg p-2">
    {/* Grid Container */}
    <div className="grid grid-cols-6 gap-4 items-start">
      {/* Image (1 Column) */}
      <div className="flex items-center gap-4 text-right col-span-2 row-span-2 md:col-span-1">
        <Image
          width={1000}
          height={1000}
          src={product.imageUrl?.secure_url || "/path/to/default-image.png"}
          alt={product.name}
          className="w-full h-full max-h-[100px] max-w-[100px] min-h-[100px] min-w-[100px] md:max-h-48 md:max-w-full md:min-h-48 md:min-w-fll object-contain"
        />
      </div>

      {/* Name (2 Columns) */}
      <h2 className="col-span-2 md:col-span-1 md:text-center">{product.name}</h2>

{/* Stock (1 Column) */}
<div className="text-center hidden md:flex md:justify-center">{product.units || 0}</div>
{/* Stock (1 Column) */}
<div className="text-center hidden md:flex md:justify-center">{product.weight || 0} {" "} {product?.weightUnit}</div>

      {/* Stock (1 Column) */}
      <div className="text-center">{product.stock}</div>
      {/* Price (1 Column) */}
      <div className="text-center">₪{product.price.toLocaleString()}</div>

      {/* Button (2 Columns, Below Stock and Price) */}
      <Link href={`/supplier/update-product/${product._id}`} className="col-span-2 col-start-5  self-end">
      <button
        // onClick={() => onEdit(product)}
        className=" mt-2 bg-gray-300 text-gray-500 text-sm w-full px-4 py-2 rounded-md hover:bg-customBlue hover:text-white"
      >
        עריכה
      </button></Link>
    </div>
  </div>
))}
    </div>
  );
}
