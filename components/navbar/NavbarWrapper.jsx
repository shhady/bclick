'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import Navbar with loading state
const Navbar = dynamic(() => import("./Navbar"), {
  loading: () => <div className="w-full h-16 bg-white shadow animate-pulse" />,
  ssr: false
});

export default function NavbarWrapper() {
  return (
    <Suspense fallback={<div className="w-full h-16 bg-white shadow animate-pulse" />}>
      <Navbar />
    </Suspense>
  );
} 