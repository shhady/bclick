import React from 'react';

export default function SupplierCategories({ serializedCategories, onCategoryClick }) {
  return (
    <div className="bg-gray-400 h-[35px] lg:h-[50px] flex items-center overflow-x-auto whitespace-nowrap">
      <div className="flex items-center gap-4 px-4">
        {serializedCategories?.map((category) => (
          <button
            key={category._id}
            onClick={() => onCategoryClick(category._id)}
            className="text-[18px] font-semibold text-gray-700 hover:text-customBlue transition"
          >
            {category.name}
          </button>
        ))}
        
      </div>
    </div>
  );
}