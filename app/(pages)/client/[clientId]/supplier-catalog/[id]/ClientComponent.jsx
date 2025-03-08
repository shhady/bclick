// ClientComponent.jsx
'use client';

import React, { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useUserContext } from "@/app/context/UserContext";
import { ShoppingBag, AlertCircle, ArrowLeft } from 'lucide-react';
import { useCartContext } from "@/app/context/CartContext";

// Store the current supplierId in localStorage for navbar navigation
function storeCurrentSupplier(supplierId) {
  if (typeof window !== 'undefined') {
    console.log("Storing supplierId in localStorage from catalog:", supplierId);
    localStorage.setItem('currentSupplierId', supplierId);
  }
}

// Lazy load components
const SupplierCategories = dynamic(() => import('./SupplierCategories'), {
  loading: () => <div className="h-20 animate-pulse bg-gray-200 rounded-lg" />
});

const SupplierCover = dynamic(() => import('../../favourites/[supplierId]/SupplierCover'), {
  loading: () => <div className="h-40 animate-pulse bg-gray-200 rounded-lg" />
});

const SupplierDetails = dynamic(() => import('./SupplierDetails'), {
  loading: () => <div className="h-32 animate-pulse bg-gray-200 rounded-lg" />
});

const ProductsOfCategory = dynamic(() => import('./[categoryId]/ProductsOfCategory'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-200 rounded-lg" />
});

export default function ClientComponent({
  categories, 
  supplier, 
  clientId, 
  favorites: initialFavorites, 
  cart 
}) {
  const [favorites] = useState(initialFavorites);
  const [selectedCategoryId, setSelectedCategoryId] = useState('all-products');
  const { globalUser } = useUserContext();
  const { itemCount } = useCartContext();

  return (
    <div className='mb-20 bg-[#f8f8ff]'>
      {globalUser?.role === 'supplier' && (
        <SupplierWarningBanner />
      )}

      <div className="relative">
        <Suspense fallback={<SkeletonLoader type="cover" />}>
          <SupplierCover supplier={supplier} />
        </Suspense>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <Suspense fallback={<SkeletonLoader type="details" />}>
              <SupplierDetails 
                supplier={supplier} 
                clientId={clientId}
              />
            </Suspense>
          </div>

          <div className="mb-6">
            <Suspense fallback={<SkeletonLoader type="categories" />}>
              <SupplierCategories 
                handleCategoryClick={setSelectedCategoryId} 
                categories={categories} 
              />
            </Suspense>
          </div>

          <div className="mb-8">
            <Suspense fallback={<SkeletonLoader type="products" />}>
              <ProductsOfCategory 
                cart={cart}
                favorites={favorites}
                categoryId={selectedCategoryId}
                supplierId={supplier._id}
                clientId={clientId}
              />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Floating cart button */}
      {(cart?.items?.length > 0 || itemCount > 0) && (
        <Link 
          href={`/cart/${supplier._id}`}
          className="fixed bottom-24 md:bottom-8 right-8 bg-customBlue text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-50 flex items-center justify-center"
        >
          <ShoppingBag className="h-6 w-6" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {itemCount || cart?.items?.length || 0}
          </span>
        </Link>
      )}
    </div>
  );
}

// Separate components for better organization
const SupplierWarningBanner = () => (
  <div className='fixed top-0 md:top-20 w-full left-0 bg-black bg-opacity-80 text-center text-white p-4 z-50 backdrop-blur-sm'>
    <div className='mb-2 font-medium'>
      התוכן בקטלוג כפי שמופיע ללקוחות
    </div>
    <Link href={'/newprofile'} className='inline-block bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors'>
      <span className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        צא מתצוגה
      </span>
    </Link> 
  </div>
);

// Skeleton loaders for each component type
const SkeletonLoader = ({ type }) => {
  const skeletons = {
    cover: "h-40",
    details: "h-32",
    categories: "h-20",
    products: "h-96"
  };

  return (
    <div className={`${skeletons[type]} animate-pulse bg-gray-200 rounded-lg mb-4`} />
  );
};