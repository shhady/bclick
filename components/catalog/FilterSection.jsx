import Link from "next/link";
import React from "react";
import { PlusCircle, CircleDashed } from "lucide-react";

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
      <div className="bg-gray-100 p-1 rounded-lg shadow-inner mb-5">
        <div className="grid grid-cols-4 w-full gap-1">
          <button
            onClick={() => handleStatusChange("active")}
            className={`py-2.5 rounded-lg transition-all duration-300 font-medium text-sm ${
              selectedStatus === "active"
                ? "bg-customBlue text-white shadow-md"
                : "bg-transparent text-gray-700 hover:bg-gray-200"
            }`}
          >
            פורסם
          </button>
          <button
            onClick={() => handleStatusChange("draft")}
            className={`py-2.5 rounded-lg transition-all duration-300 font-medium text-sm ${
              selectedStatus === "draft"
                ? "bg-customBlue text-white shadow-md"
                : "bg-transparent text-gray-700 hover:bg-gray-200"
            }`}
          >
            טיוטה
          </button>
          <button
            onClick={() => handleStatusChange("low_stock")}
            className={`relative py-2.5 rounded-lg transition-all duration-300 font-medium text-sm flex items-center justify-center ${
              selectedStatus === "low_stock"
                ? "bg-customBlue text-white shadow-md"
                : "bg-transparent text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span>חסר במלאי</span>
            {lowStockNotification && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            )}
          </button>
          <button
            onClick={() => handleStatusChange("hidden")}
            className={`py-2.5 rounded-lg transition-all duration-300 font-medium text-sm ${
              selectedStatus === "hidden"
                ? "bg-customBlue text-white shadow-md"
                : "bg-transparent text-gray-700 hover:bg-gray-200"
            }`}
          >
            מוסתר
          </button>
        </div>
      </div>

      {/* Category Filter and Create Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2.5 flex-1 focus:outline-none focus:ring-2 focus:ring-customBlue shadow-sm bg-white"
        >
          <option value="">כל המוצרים</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name} {category.status === 'hidden' ? '(מוסתר)' : ''}
            </option>
          ))}
        </select>
        
        <Link href={`/supplier/catalog/create-category/${supplierId}`} className="sm:w-auto"> 
          <button className="w-full sm:w-auto bg-white border border-gray-200 text-gray-800 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-all duration-300 shadow-sm flex items-center justify-center gap-2">
            <PlusCircle size={18} className="text-customBlue" />
            <span>צור קטגוריה</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
