'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Suspense } from 'react';
import Loader from '@/components/loader/Loader';
import ClientComponent from '../../client/[clientId]/supplier-catalog/[id]/ClientComponent';
import { useInView } from '@/hooks/use-intersection-observer';
import { debounce } from 'lodash';

export default function CatalogClientPage({ 
  supplier, 
  categories, 
  initialProducts,
  initialFavorites, 
  cart, 
  clientId, 
  supplierId 
}) {
  // State for products and pagination
  const [products, setProducts] = useState(initialProducts || []);
  const [favorites, setFavorites] = useState(initialFavorites || []);
  const [page, setPage] = useState(2); // Start from page 2 since page 1 is loaded server-side
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // Use react-intersection-observer for better infinite scrolling
  const { ref: sentinelRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: '200px',
  });
  
  // Debounced fetch function to prevent too many requests
  const debouncedFetch = useCallback(
    debounce(async () => {
      if (!hasMore || loading) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/products?supplierId=${supplierId}&page=${page}&limit=20`);
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const data = await response.json();
        
        if (!data.products || data.products.length === 0) {
          setHasMore(false);
        } else {
          // Filter out duplicates
          const newProducts = data.products.filter(
            newProduct => !products.some(existingProduct => existingProduct._id === newProduct._id)
          );
          
          if (newProducts.length === 0) {
            setHasMore(false);
          } else {
            setProducts(prev => [...prev, ...newProducts]);
            setPage(prev => prev + 1);
          }
        }
      } catch (error) {
        console.error('Error fetching more products:', error);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }, 300),
    [hasMore, loading, page, products, supplierId]
  );
  
  // Fetch more products when sentinel is in view
  useEffect(() => {
    if (inView) {
      debouncedFetch();
    }
  }, [inView, debouncedFetch]);
  
  // Handle favorite toggle
  const handleFavoriteToggle = useCallback(async (productId, isFavorite) => {
    try {
      const endpoint = isFavorite 
        ? `/api/favourites/add` 
        : `/api/favourites/remove`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ clientId, productId }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        if (isFavorite) {
          // Add to favorites
          const product = products.find(p => p._id === productId);
          if (product) {
            setFavorites(prev => [...prev, product]);
          }
        } else {
          // Remove from favorites
          setFavorites(prev => prev.filter(p => p._id !== productId));
        }
        
        // Update product's favorite status
        setProducts(prev => 
          prev.map(p => 
            p._id === productId 
              ? { ...p, isFavorite } 
              : p
          )
        );
      }
    } catch (error) {
      console.error('Favorite toggle failed:', error);
    }
  }, [clientId, products]);
  
  return (
    <div className="catalog-client-page">
      <Suspense fallback={<Loader />}>
        <ClientComponent 
          supplier={supplier}
          categories={categories}
          favorites={favorites}
          cart={cart}
          clientId={clientId}
          products={products} // Pass all products including server-side and client-side loaded
          onFavoriteToggle={handleFavoriteToggle}
        />
        
        {/* Infinite scroll sentinel */}
        {hasMore && (
          <div 
            ref={sentinelRef}
            className="h-20 w-full flex items-center justify-center my-4"
          >
            {loading && <Loader />}
          </div>
        )}
        
        {!hasMore && (
          <div className="text-center py-8 text-gray-500">
            אין עוד מוצרים לטעינה
          </div>
        )}
      </Suspense>
    </div>
  );
} 