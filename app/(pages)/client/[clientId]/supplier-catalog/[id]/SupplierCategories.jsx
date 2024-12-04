import React from 'react';

export default function SupplierCategories({ serializedCategories, onCategoryClick, products }) {
  // Filter categories to only include those with products
  const filteredCategories = serializedCategories.filter((category) =>
    products.some((product) => product.categoryId === category._id)
  );

  // Sort categories and move 'כללי' to the beginning
  const sortedCategories = filteredCategories.sort((a, b) => {
    if (a.name === 'כללי') return -1;
    if (b.name === 'כללי') return 1;
    return 0;
  });

  return (
    <div className="bg-gray-400 h-[35px] lg:h-[50px] flex items-center overflow-x-auto whitespace-nowrap">
      <div className="flex items-center gap-4 px-4">
        {sortedCategories.map((category) => (
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
