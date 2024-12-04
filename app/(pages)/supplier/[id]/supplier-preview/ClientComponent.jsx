'use client';

import React, { useState, useEffect, useRef } from 'react';
import CategoryProducts from './CategoryProducts';
import SupplierCategories from './SupplierCategories';
import Loader from '@/components/loader/Loader';

export default function ClientComponent({ categories, supplierId }) {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const PRODUCTS_PER_PAGE = 20;
  const categoryRefs = useRef({});

  const sortedCategories = [...categories].sort((a, b) => {
    if (a.name === 'כללי') return -1;
    if (b.name === 'כללי') return 1;
    return 0;
  });

  const scrollToCategory = (categoryId) => {
    if (categoryRefs.current[categoryId]) {
      categoryRefs.current[categoryId].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const fetchProducts = async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const response = await fetch(
        `/api/products/get-supplier-products?supplierId=${supplierId}&page=${page}&limit=${PRODUCTS_PER_PAGE}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const data = await response.json();

      // Avoid adding duplicate products
      setProducts((prev) => {
        const newProducts = data.products.filter(
          (newProduct) => !prev.some((existing) => existing._id === newProduct._id)
        );
        return [...prev, ...newProducts];
      });

      setHasMore(data.products.length === PRODUCTS_PER_PAGE); // Check if more products exist
      setPage((prev) => prev + 1); // Increment page after successful fetch
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when supplierId changes
  useEffect(() => {
    setProducts([]); // Clear existing products
    setPage(1); // Reset to the first page
    setHasMore(true); // Reset hasMore to true
    fetchProducts(); // Fetch the first batch
  }, [supplierId]);

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 200
    ) {
      fetchProducts();
    }
  };

  // Attach scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading]);

  return (
    <div>
      <SupplierCategories
        serializedCategories={categories}
        products={products} // Pass products to filter categories
        onCategoryClick={scrollToCategory}
      />
      <div className="categories">
        {sortedCategories.map((category) => (
          <div ref={(el) => (categoryRefs.current[category._id] = el)} key={category._id}>
            <CategoryProducts
              category={category}
              products={products.filter((product) => product.categoryId === category._id)}
            />
          </div>
        ))}
      </div>
      {loading && (
        <div className="text-center">
          <Loader />
        </div>
      )}
    </div>
  );
}
