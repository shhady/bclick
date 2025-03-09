
'use client';

import React, { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useUserContext } from "@/app/context/UserContext";
import { ShoppingBag, AlertCircle, ArrowLeft, Phone, MapPin } from 'lucide-react';
// import SupplierCover from '@/app/(pages)/client/[clientId]/supplier-catalog/[id]/SupplierCover';

// Lazy load components
const SupplierCategories = dynamic(() => import('../../(pages)/client/[clientId]/supplier-catalog/[id]/SupplierCategories'), {
  loading: () => <div className="h-20 animate-pulse bg-gray-200 rounded-lg" />
});

const SupplierCover = dynamic(() => import('../../(pages)/client/[clientId]/supplier-catalog/[id]/SupplierCover') ,{
  loading: () => <div className="h-40 animate-pulse bg-gray-200 rounded-lg" />
});



const PublicProductsOfCategory = dynamic(() => import('./PublicProductsOfCategory'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-200 rounded-lg" />
});

// Skeleton loaders
const SkeletonLoader = ({ type }) => {
  switch (type) {
    case 'cover':
      return <div className="h-40 animate-pulse bg-gray-200 rounded-lg" />;
    case 'details':
      return <div className="h-32 animate-pulse bg-gray-200 rounded-lg" />;
    case 'categories':
      return <div className="h-20 animate-pulse bg-gray-200 rounded-lg" />;
    case 'products':
      return <div className="h-96 animate-pulse bg-gray-200 rounded-lg" />;
    default:
      return null;
  }
};

// Banner for related clients
const RelatedClientBanner = ({ supplierId }) => (
  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <AlertCircle className="h-5 w-5 text-blue-500" />
      </div>
      <div className="ml-3">
        <p className="text-sm text-blue-700">
          אתה לקוח רשום של ספק זה. 
          <Link href={`/catalog/${supplierId}`} className="font-medium underline ml-1">
            לחץ כאן לצפייה בקטלוג המלא עם אפשרויות הזמנה
          </Link>
        </p>
      </div>
    </div>
  </div>
);

// Banner for inactive related clients
const InactiveClientBanner = ({ supplierId }) => (
  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <AlertCircle className="h-5 w-5 text-yellow-500" />
      </div>
      <div className="ml-3">
        <p className="text-sm text-yellow-700">
          החשבון שלך אינו פעיל אצל ספק זה. אנא צור קשר עם הספק לקבלת גישה מלאה לקטלוג.
        </p>
      </div>
    </div>
  </div>
);

export default function PublicCatalogComponent({
  categories, 
  supplier, 
  clientId,
  isRelatedClient,
  isInactiveClient,
  supplierId,
  products
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState('all-products');
  const { globalUser } = useUserContext();

  return (
    <div className='mb-20 bg-[#f8f8ff]'>
      {isRelatedClient && (
        <RelatedClientBanner supplierId={supplierId} />
      )}
      
      {isInactiveClient && (
        <InactiveClientBanner supplierId={supplierId} />
      )}

      <div className="relative">
        <Suspense fallback={<SkeletonLoader type="cover" />}>
          <SupplierCover supplier={supplier} />
        </Suspense>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <Suspense fallback={<SkeletonLoader type="details" />}>
            <div className="bg-white shadow-md rounded-lg p-4  transform -translate-y-6 mx-auto max-w-3xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
           
            <div>
              <h1 className="text-xl font-bold text-gray-800">{supplier?.businessName || 'ספק'}</h1>
              <div className="flex gap-2 items-center text-gray-600 mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                <p>{supplier?.city || 'לא צוין מיקום'}</p>
              </div>
              <div className="flex gap-2 items-center text-gray-600 mt-1">
                <Phone className="h-4 w-4 mr-1" />
                <p>{supplier?.phone || 'טלפון לא הוזן'}</p>
              </div>
            </div>
            </div>
            </div>
            </div>
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
              <PublicProductsOfCategory 
                supplierId={supplierId}
                categoryId={selectedCategoryId}
                initialProducts={products.filter(p => 
                  selectedCategoryId === 'all-products' || 
                  p.categoryId === selectedCategoryId
                )}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
} 