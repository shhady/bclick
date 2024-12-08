'use client'
import React, { useState } from 'react';

export default function SupplierCategories({ categories, onCategoryClick, products }) {
  // State to track the selected category
  const [selectedCategory, setSelectedCategory] = useState(
    categories.find((category) => category.name === 'כללי')?._id || null
  );

  // Filter categories to only include those with products
  const filteredCategories = categories.filter((category) =>
    products?.some((product) => product.categoryId === category._id)
  );

  // Sort categories and move 'כללי' to the beginning
  const sortedCategories = filteredCategories.sort((a, b) => {
    if (a.name === 'כללי') return -1;
    if (b.name === 'כללי') return 1;
    return 0;
  });

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId); // Update the selected category state
    onCategoryClick(categoryId); // Call the parent handler
  };

  return (
    <div className="bg-[#D9D9D9] h-[35px] lg:h-[50px] flex items-center overflow-x-auto whitespace-nowrap sticky top-[104px] md:top-[184px] z-50 shadow-xl">
      <div className="flex items-center gap-4 px-4">
        קטגוריות:
        {sortedCategories.map((category) => (
          <button
            key={category._id}
            onClick={() => handleCategoryClick(category._id)}
            className={`text-[18px]  transition ${
              selectedCategory === category._id
                ? 'text-customBlue' // Apply blue color to the selected category
                : 'text-gray-700 hover:text-customBlue'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
