// ClientComponent.jsx
'use client';

import React, { Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useUserContext } from "@/app/context/UserContext";

// Lazy load components
const SupplierCategories = dynamic(() => import('./SupplierCategories'), {
  loading: () => <div className="h-20 animate-pulse bg-gray-200 rounded" />
});

const SupplierCover = dynamic(() => import('../../favourites/[supplierId]/SupplierCover'), {
  loading: () => <div className="h-40 animate-pulse bg-gray-200 rounded" />
});

const SupplierDetails = dynamic(() => import('./SupplierDetails'), {
  loading: () => <div className="h-32 animate-pulse bg-gray-200 rounded" />
});

const ProductsOfCategory = dynamic(() => import('./[categoryId]/ProductsOfCategory'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-200 rounded" />
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

  return (
    <div className='mb-20'>
      {globalUser?.role === 'supplier' && (
        <SupplierWarningBanner />
      )}

      <Suspense fallback={<SkeletonLoader type="cover" />}>
        <SupplierCover supplier={supplier} />
      </Suspense>

      <div>
        <Suspense fallback={<SkeletonLoader type="details" />}>
          <SupplierDetails 
            supplier={supplier} 
            clientId={clientId}
          />
        </Suspense>

        <Suspense fallback={<SkeletonLoader type="categories" />}>
          <SupplierCategories 
            handleCategoryClick={setSelectedCategoryId} 
            categories={categories} 
          />
        </Suspense>

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
  );
}

// Separate components for better organization
const SupplierWarningBanner = () => (
  <div className='fixed top-0 md:top-20 w-full left-0 bg-black opacity-80 text-center text-white p-6 z-50'>
    <div className='mb-2'>
      התוכן בקטלוג כפי שמופיע ללקוחות
    </div>
    <Link href={'/profile'} className='bg-gray-700 px-3 py-2 rounded-lg'>
      <button>צא מתצוגה</button>
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
    <div className={`${skeletons[type]} animate-pulse bg-gray-200 rounded`} />
  );
};