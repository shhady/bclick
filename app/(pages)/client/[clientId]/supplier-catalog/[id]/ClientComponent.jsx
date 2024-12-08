// ClientComponent.jsx
'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Loader from '@/components/loader/Loader';
import Link from 'next/link';
import { Suspense } from 'react';
import { useUserContext } from "@/app/context/UserContext";
import StarToggle from './StarToggle';
const SupplierCategories = dynamic(() => import('./SupplierCategories'));
const SupplierCover = dynamic(() => import('../../favourites/[supplierId]/SupplierCover'));
const SupplierDetails = dynamic(() => import('./SupplierDetails'));

// ProductGrid Component
function ProductGrid({ 
  products, 
  clientId, 
  onFavoriteToggle,
  showProductDetail 
}) {

  console.log(products);
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mt-4 px-2">
     
      {products.map((product) => (
        <div
          key={product._id}
          className="cursor-pointer border p-4 rounded-lg shadow hover:shadow-md transition flex flex-col items-center"
          onClick={() => showProductDetail(product)}
        >
          <div 
            className="relative w-full h-40 flex items-center justify-center overflow-hidden rounded"
           
          >
            {/* <StarToggle 
              productId={product._id} 
              clientId={clientId} 
              onFavoriteToggle={onFavoriteToggle}
              className="absolute top-2 right-2 z-10"
            /> */}
            <Image
              src={product?.imageUrl?.secure_url || '/no-image.jpg'}
              alt={product.name}
              width={160}
              height={160}
              className="object-contain max-h-full"
            />
          </div>
          <h2 className="text-sm font-bold mt-2">{product.name}</h2>
          <p className="text-gray-600 mt-1">משקל: {product?.weight}</p>
          <p className="text-gray-600 mt-1">מחיר: ₪{product?.price}</p>
        </div>
      ))}
    </div>
  );
}

// ProductDetailModal Component
function ProductDetailModal({ 
  product, 
  isVisible, 
  onClose, 
  clientId, 
  onFavoriteToggle 
}) {
  if (!product) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white shadow-lg rounded-t-lg w-full max-w-lg overflow-y-auto transition-transform duration-300 transform ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className=" relative flex justify-between items-center p-4">
          <div className='absolute top-4 right-4'>
          <StarToggle 
            productId={product._id} 
            clientId={clientId} 
            onFavoriteToggle={onFavoriteToggle}
          />
          </div>
        
          <button onClick={onClose} className="text-red-500 font-bold text-xl absolute top-4 left-4">
            X
          </button>
        </div>
        <div className="p-16">
          <Image
            src={product?.imageUrl?.secure_url || '/no-image.jpg'}
            alt={product.name}
            width={400}
            height={400}
            className="w-full max-h-56 object-contain rounded"
          />
          <div className='flex justify-between items-center mt-4'>
            <h2 className="text-lg font-bold">{product.name}</h2>
            <h2 className="text-gray-600 font-bold">מחיר: ₪{product?.price}</h2>
          </div>
          <div className='flex justify-center gap-4 items-center'>
            <p className="text-gray-600">משקל: {product?.weight}</p>
            <p className="text-gray-600">יחידות: {product.units}</p>
          </div>
          <div className='flex justify-start gap-4 items-center'>
            <p className="text-gray-600">{product?.description}</p>
          </div>
          <div className="flex justify-center items-center gap-4 mt-4">
            <button className="bg-gray-300 px-3 py-1 rounded">-</button>
            <span>1</span>
            <button className="bg-gray-300 px-3 py-1 rounded">+</button>
          </div>
          <button className="bg-customBlue text-white mt-6 px-4 py-2 rounded w-full">
            הוסף להזמנה
          </button>
        </div>
      </div>
    </div>
  );
}

// Main ClientComponent
export default function ClientComponent({
    categories, supplier, products: initialProducts, clientId, favorites: initialFavorites, totalProducts 
}) {
    const [products, setProducts] = useState(initialProducts);
    const [favorites, setFavorites] = useState(initialFavorites);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
  const { globalUser, setGlobalUser, setError } = useUserContext();
  const observer = useRef();
  const categoryRefs = useRef({}); // To store references for categories
    console.log(clientId);
//   const filteredProducts = useMemo(() => {
//     return showAll ? products : favorites;
//   }, [showAll, products, favorites]);

  const loadMoreProducts = useCallback(async () => {
    if (loading || products.length >= totalProducts) return;

    setLoading(true);
    const res = await fetch(`/api/products?supplierId=${supplier._id}&page=${page + 1}&limit=20`);
    const data = await res.json();
    setProducts((prev) => [...prev, ...data.products]);
    setPage((prev) => prev + 1);
    setLoading(false);
  }, [loading, page, products.length, supplier._id, totalProducts]);

  const lastProductRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && products.length < totalProducts) {
          loadMoreProducts();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, loadMoreProducts, products.length, totalProducts]
  );

  const filteredProducts = useMemo(() => products, [products]);

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
        setFavorites(current => 
          isFavorite 
            ? [...current, products.find(p => p._id === productId)]
            : current.filter(p => p._id !== productId)
        );
      }
    } catch (error) {
      console.error('Favorite toggle failed:', error);
    }
  }, [clientId, products]);
  console.log(favorites);
  const showProductDetail = (product) => {
    setSelectedProduct(product);
  };

  const closeProductDetail = () => {
    setSelectedProduct(null);
  };
  const scrollToCategory = (categoryId) => {
    if (categoryRefs.current[categoryId]) {
      categoryRefs.current[categoryId].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className='mb-20'>
          {globalUser?.role === 'supplier' &&    <div className='fixed top-0 md:top-20 w-full left-0 bg-black  text-center text-white p-6 z-50'>
       <div className='mb-2'>
      התוכן בקטלוג שלך כפי שיופיע לאחרים
         </div>
       <Link href={'/profile'} className='bg-gray-700 px-3 py-2 rounded-lg'><button >צא מתצוגה </button></Link> 
      </div>}
      {/* <Suspense fallback={<Loader />}> */}
      
      <SupplierCover supplier={supplier}/>
      <SupplierDetails 
        supplier={supplier} 
        // showAll={showAll} 
        // setShowAll={setShowAll} 
        clientId={clientId}
      />
      {/* </Suspense> */}
      <>
        {/* <Suspense fallback={<Loader />}> */}
         <SupplierCategories categories={categories} products={products} onCategoryClick={scrollToCategory}/>
         {/* </Suspense> */}

        <div className="categories">
          {categories.map((category) => {
            const categoryProducts = filteredProducts.filter(
              (product) => product.categoryId === category._id
            );

            if (categoryProducts.length === 0) return null;

            return (
              <div key={category._id} ref={(el) => (categoryRefs.current[category._id] = el)}>
                <h2 className="text-2xl font-bold mt-4 px-4 py-2">{category.name}</h2>
                <Suspense fallback={<Loader />}>   <ProductGrid
                  products={categoryProducts}
                  clientId={clientId}
                  onFavoriteToggle={handleFavoriteToggle}
                  showProductDetail={(product) => setSelectedProduct(product)}
                /></Suspense>
              </div>
            );
          })}
        </div>
        </>
      
      <ProductDetailModal 
        product={selectedProduct}
        isVisible={!!selectedProduct}
        onClose={closeProductDetail}
        clientId={clientId}
        onFavoriteToggle={handleFavoriteToggle}
      />
    </div>
  );
}