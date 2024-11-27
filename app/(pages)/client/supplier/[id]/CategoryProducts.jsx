// app/client/supplier/[id]/CategoryProducts.jsx
'use client';

import { useRef } from 'react';

export default function CategoryProducts({ category, products,serializedCategories }) {
  const categoryRef = useRef(null);
console.log(products);
  const scrollToCategory = () => {
    categoryRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
        
      <button onClick={scrollToCategory} className='bg-red-500'>{category.name}</button>
      <div ref={categoryRef}>
        {products.map((product) => (
          <div key={product._id}>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            {/* Render other product details as needed */}
          </div>
        ))}
      </div>
    </div>
  );
}
