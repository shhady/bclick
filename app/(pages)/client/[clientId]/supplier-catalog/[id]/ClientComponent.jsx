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

// Main ClientComponent
export default function ClientComponent({
    categories, supplier, products: initialProducts, clientId, favorites: initialFavorites, totalProducts 
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

  console.log(selectedCategoryId);

  return (
    <div className='mb-20'>
          {globalUser?.role === 'supplier' &&    <div className='fixed top-0 md:top-20 w-full left-0 bg-black  text-center text-white p-6 z-50'>
       <div className='mb-2'>
      התוכן בקטלוג שלך כפי שיופיע לאחרים
         </div>
       <Link href={'/profile'} className='bg-gray-700 px-3 py-2 rounded-lg'><button >צא מתצוגה </button></Link> 
      </div>}
      <Suspense fallback={<Loader />}>
      
      <SupplierCover supplier={supplier}/>
      <SupplierDetails 
        supplier={supplier} 
        clientId={clientId}
      />
      <SupplierCategories handleCategoryClick={handleCategoryClick} categories={categories} products={products}/>
      <ProductsOfCategory favorites={favorites} categoryId={selectedCategoryId} supplierId={supplier._id} clientId={clientId}/>

      </Suspense>
      <>

         
        
        </>
    </div>
  );
}