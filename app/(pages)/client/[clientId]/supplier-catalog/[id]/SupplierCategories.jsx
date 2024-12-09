'use client';

import React, { useState, useEffect } from 'react';

export default function SupplierCategories({
  categories = [], // Default to an empty array if categories are not provided
  onCategoryClick,
  handleCategoryClick,
  products = [], // Default to an empty array if products are not provided
}) {
  // Filter categories: only those with `status: 'shown'` and with matching products
  const filteredCategories = categories.filter(
    (category) =>
      category.status === 'shown' &&
      products.some((product) => product.categoryId === category._id)
  );

  // If no categories match, fallback to all `status: 'shown'` categories
  const displayCategories = filteredCategories.length
    ? filteredCategories
    : categories.filter((category) => category.status === 'shown');

  // Add "כל המוצרים" as the first category
  const allProductsCategory = { _id: 'all-products', name: 'כל המוצרים', status: 'shown' };

  // Ensure "כללי" is prioritized if it exists and meets criteria
  const generalCategory = displayCategories.find((category) => category.name === 'כללי');
  const otherCategories = displayCategories.filter((category) => category.name !== 'כללי');

  // Combine categories
  const sortedCategories = [
    allProductsCategory,
    ...(generalCategory ? [generalCategory] : []),
    ...otherCategories,
  ];

  // Initialize active category to "כל המוצרים" by default
  const [activeCategory, setActiveCategory] = useState(allProductsCategory._id);

  useEffect(() => {
    // Call handleCategoryClick for the default active category on mount
    if (activeCategory) {
      handleCategoryClick(activeCategory);
    }
  }, [activeCategory, handleCategoryClick]);

  return (
    <div className="bg-[#D9D9D9] h-[35px] lg:h-[50px] flex items-center overflow-x-auto whitespace-nowrap sticky top-[104px] md:top-[184px] z-50 shadow-xl">
      <div className="flex items-center gap-4 px-4">
        קטגוריות:
        {sortedCategories.map((category) => (
          <button
            key={category._id}
            onClick={() => {
              setActiveCategory(category._id); // Update local state
              handleCategoryClick(category._id); // Trigger parent callback
            }}
            className={`text-[18px] transition ${
              activeCategory === category._id
                ? 'text-customBlue'
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
