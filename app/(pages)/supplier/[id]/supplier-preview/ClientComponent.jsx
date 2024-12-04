'use client';

import React, { useRef } from 'react';
import CategoryProducts from './CategoryProducts';
import SupplierCategories from './SupplierCategories';

export default function ClientComponent({ categories, products }) {
  const categoryRefs = useRef({});

  const scrollToCategory = (categoryId) => {
    if (categoryRefs.current[categoryId]) {
      categoryRefs.current[categoryId].scrollIntoView({ behavior: 'smooth', block: "center"  });
    }
  };

  return (
    <div>
      <SupplierCategories serializedCategories={categories} onCategoryClick={scrollToCategory} />
      <div className="categories">
        {categories.map((category) => (
          <div ref={(el) => (categoryRefs.current[category._id] = el)} key={category._id}>
            <CategoryProducts
              key={category._id}
              category={category}
              products={products.filter((product) => product.categoryId === category._id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
