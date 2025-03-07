'use client';

import React, { useState, useEffect } from 'react';
import { Tag } from 'lucide-react';

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
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-center text-gray-700 font-medium px-2">
          <Tag className="h-4 w-4 mr-2" />
          <span>קטגוריות:</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap py-2 px-2">
          <div className="flex gap-2">
            {sortedCategories.map((category) => (
              <button
                key={category._id}
                onClick={() => {
                  setActiveCategory(category._id); // Update local state
                  handleCategoryClick(category._id); // Trigger parent callback
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === category._id
                    ? 'bg-customBlue text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
