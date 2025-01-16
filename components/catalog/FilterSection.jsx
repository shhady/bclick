import Link from "next/link";
import React from "react";

export default function FilterSection({
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  handleStatusChange,
  lowStockNotification,
  categories,
  supplierId
}) {
  return (
    <div className="flex-col w-full items-center gap-4 mb-6">
      {/* Status Buttons */}
      <div className="grid grid-cols-4 w-full items-center gap-2 max-[385px]:gap-1 mb-6">
        <button
          onClick={() => handleStatusChange("active")}
          className={`px-2 max-[385px]:px-1 py-2 rounded-md text-sm ${
            selectedStatus === "active"
              ? "bg-customBlue text-white"
              : "bg-gray-300 text-gray-700 hover:bg-gray-400"
          }`}
        >
          פורסם
        </button>
        <button
          onClick={() => handleStatusChange("draft")}
          className={`px-2 max-[385px]:px-1 py-2 rounded-md text-sm ${
            selectedStatus === "draft"
              ? "bg-customBlue text-white"
              : "bg-gray-300 text-gray-700 hover:bg-gray-400"
          }`}
        >
          טיוטה
        </button>
        <button
          onClick={() => handleStatusChange("low_stock")}
          className={`relative px-2 max-[385px]:px-1 py-2 rounded-md text-sm ${
            selectedStatus === "low_stock"
              ? "bg-customBlue text-white"
              : "bg-gray-300 text-gray-700 hover:bg-gray-400"
          }`}
        >
          חסר במלאי
          {lowStockNotification && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
          )}
        </button>
        <button
          onClick={() => handleStatusChange("hidden")}
          className={`px-2 max-[385px]:px-1 py-2 rounded-md text-sm ${
            selectedStatus === "hidden"
              ? "bg-customBlue text-white"
              : "bg-gray-300 text-gray-700 hover:bg-gray-400"
          }`}
        >
          מוסתר
        </button>
      </div>

      {/* Category Filter and Create Button */}
      <div className="flex items-center gap-2 w-full">
        
        <select
  value={selectedCategory}
  onChange={(e) => setSelectedCategory(e.target.value)}
  className="border rounded-md px-4 py-2 flex-1 "
>          <option value="">כל המוצרים</option>
  {categories.map((category) => (
      <option key={category._id} value={category._id}>
        {category.name} {category.status === 'hidden' ? '(מוסתר)' : ''}
      </option>
    ))}
</select>
        <Link href={`/supplier/catalog/create-category/${supplierId}`} > 
          <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 text-sm">
          צור קטגוריה
        </button></Link>
      </div>
    </div>
  );
}
