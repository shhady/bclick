'use client';
import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Create a loading component
const CartLoading = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-2xl font-bold mb-4">עגלת קניות</h1>
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="h-64 bg-gray-200 rounded mb-4"></div>
      <div className="h-32 bg-gray-200 rounded"></div>
    </div>
  </div>
);

// Dynamically import the client component with suspense
const CartClient = dynamic(() => import('./CartClient'), {
  ssr: false,
  loading: () => <CartLoading />
});

export default function CartPage() {
  return (
    <Suspense fallback={<CartLoading />}>
      <CartClient />
    </Suspense>
  );
} 