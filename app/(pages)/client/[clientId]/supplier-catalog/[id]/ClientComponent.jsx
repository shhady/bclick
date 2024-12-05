'use client';

import React, { useState, useEffect, useRef } from 'react';
import CategoryProducts from './CategoryProducts';
import SupplierCategories from './SupplierCategories';
import Loader from '@/components/loader/Loader';
import FavouritesClient from './FavouritesClient';
import SupplierDetails from './SupplierDetails';

export default function ClientComponent({
  categories,
  supplierId,
  clientId,
  serializedFavorites,
  supplier,
}) {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState(serializedFavorites || []);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const PRODUCTS_PER_PAGE = 20;
  const categoryRefs = useRef({});
  const [showAll, setShowAll] = useState(true);

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

      setProducts((prev) => {
        const newProducts = data.products.filter(
          (newProduct) => !prev.some((existing) => existing._id === newProduct._id)
        );
        return [...prev, ...newProducts];
      });

      setHasMore(data.products.length === PRODUCTS_PER_PAGE);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await fetch(`/api/favourites/${clientId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch favorites: ${response.status}`);
      }
      const data = await response.json();
      setFavorites(data.products || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
    }
  };

  useEffect(() => {
    if (showAll) {
      // Reset state for "All Products" and fetch products
    //   setProducts([]);
      setPage(1);
      setHasMore(true);
      fetchProducts();
    } else {
      // Fetch favorites when switching to "Favorites"
      fetchFavorites();
    }
  }, [showAll]);

  const handleFavoriteChange = (productId, isFavorite) => {
    if (isFavorite) {
      const product = products.find((p) => p._id === productId);
      if (product) setFavorites((prev) => [...prev, product]);
    } else {
      setFavorites((prev) => prev.filter((p) => p._id !== productId));
    }
  };

  return (
    <div>
      <SupplierDetails supplier={supplier} setShowAll={setShowAll} showAll={showAll} />
      {showAll ? (
        <>
          <SupplierCategories
            serializedCategories={categories}
            products={products}
            onCategoryClick={scrollToCategory}
          />
          <div className="categories">
            {sortedCategories.map((category) => (
              <div ref={(el) => (categoryRefs.current[category._id] = el)} key={category._id}>
                <CategoryProducts
                  category={category}
                  products={products.filter((product) => product.categoryId === category._id)}
                  clientId={clientId}
                  onFavoriteChange={handleFavoriteChange}
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        <FavouritesClient
          products={favorites}
          clientId={clientId}
          onFavoriteChange={handleFavoriteChange}
        />
      )}
      {loading && (
        <div className="text-center">
          <Loader />
        </div>
      )}
    </div>
  );
}
