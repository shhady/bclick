'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Suspense } from 'react';
import Loader from '@/components/loader/Loader';
import PublicCatalogComponent from './PublicCatalogComponent';
import { useInView } from '@/hooks/use-intersection-observer';
import { debounce } from 'lodash';

export default function PublicCatalogPage({ 
  supplier, 
  categories, 
  initialProducts,
  clientId,
  isRelatedClient,
  isInactiveClient,
  supplierId,
  relationStatus,
  viewerRole
}) {
  return (
    <div className="public-catalog-page">
      <Suspense fallback={<Loader />}>
        <PublicCatalogComponent 
          supplier={supplier}
          categories={categories}
          clientId={clientId}
          isRelatedClient={isRelatedClient}
          isInactiveClient={isInactiveClient}
          supplierId={supplierId}
          products={initialProducts || []}
          relationStatus={relationStatus}
          viewerRole={viewerRole}
        />
      </Suspense>
    </div>
  );
} 