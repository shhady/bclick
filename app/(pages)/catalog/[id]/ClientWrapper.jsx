'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Loader from '@/components/loader/Loader';

// Import the client components with the ssr: false option
const CatalogClientPage = dynamic(() => import('./CatalogClientPage'), { ssr: false });
const CatalogSupplierPage = dynamic(() => import('./CatalogSupplierPage'), { ssr: false });

export function ClientCatalogWrapper({ 
  supplier, 
  categories, 
  initialProducts, 
  initialFavorites, 
  cart, 
  clientId, 
  supplierId 
}) {
  return (
    <Suspense fallback={<Loader />}>
      <CatalogClientPage 
        supplier={supplier}
        categories={categories}
        initialProducts={initialProducts}
        initialFavorites={initialFavorites}
        cart={cart}
        clientId={clientId}
        supplierId={supplierId}
      />
    </Suspense>
  );
}

export function SupplierCatalogWrapper({ 
  initialProducts, 
  categories, 
  supplierId 
}) {
  return (
    <Suspense fallback={<Loader />}>
      <CatalogSupplierPage 
        initialProducts={initialProducts}
        categories={categories}
        supplierId={supplierId}
      />
    </Suspense>
  );
} 