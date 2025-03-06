'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Create a loading component
const NotFoundLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-[#2C3E50] mb-4">404 - דף לא נמצא</h1>
      <p className="text-gray-600 mb-8">טוען...</p>
    </div>
  </div>
);

// Dynamically import the client component with suspense
const NotFoundClient = dynamic(() => import('./NotFoundClient'), {
  ssr: false,
  loading: () => <NotFoundLoading />
});

export default function NotFound() {
  return (
    <Suspense fallback={<NotFoundLoading />}>
      <NotFoundClient />
    </Suspense>
  );
} 