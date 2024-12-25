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
import ProductsOfCategory from './[categoryId]/ProductsOfCategory';
const SupplierCategories = dynamic(() => import('./SupplierCategories'));
const SupplierCover = dynamic(() => import('../../favourites/[supplierId]/SupplierCover'));
const SupplierDetails = dynamic(() => import('./SupplierDetails'));

// ProductGrid Component
// ProductDetailModal Component

// Main ClientComponent
export default function ClientComponent({
    categories, supplier, products: initialProducts, clientId, favorites: initialFavorites, totalProducts,cart 
}) {
    const [products, setProducts] = useState(initialProducts);
    const [favorites, setFavorites] = useState(initialFavorites);
    // const [selectedProduct, setSelectedProduct] = useState(null);
    // const [loading, setLoading] = useState(false);
    // const [page, setPage] = useState(1);
  const { globalUser, setGlobalUser, setError } = useUserContext();
  const [selectedCategoryId, setSelectedCategoryId] = useState('all-products');
  const handleCategoryClick = (categoryId) => {
    setSelectedCategoryId(categoryId);
  };
  // const observer = useRef();


  return (
    <div className='mb-20'>
          {globalUser?.role === 'supplier' &&    <div className='fixed top-0 md:top-20 w-full left-0 bg-black  text-center text-white p-6 z-50'>
       <div className='mb-2'>
      התוכן בקטלוג שלך כפי שיופיע לאחרים
         </div>
       <Link href={'/profile'} className='bg-gray-700 px-3 py-2 rounded-lg'><button >צא מתצוגה </button></Link> 
      </div>}
      <Suspense fallback={<Loader />}>

      <SupplierCover supplier={supplier}/>      </Suspense>

      <Suspense fallback={<Loader />}>
      
      
      <SupplierDetails 
        supplier={supplier} 
        clientId={clientId}
      />
      <SupplierCategories handleCategoryClick={handleCategoryClick} categories={categories} products={products}/>
      <ProductsOfCategory cart={cart} favorites={favorites} categoryId={selectedCategoryId} supplierId={supplier._id.toString()} clientId={clientId}/>

      </Suspense>
      <>

         
        
        </>
    </div>
  );
}