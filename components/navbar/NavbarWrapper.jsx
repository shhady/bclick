import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import Navbar with loading state
const Navbar = dynamic(() => import("./Navbar"), {
  loading: () => <div className="w-full h-16 bg-white shadow animate-pulse" />
});

export default async function NavbarWrapper({params}) {
  // Safely extract ID from params if available
  let id = null;
  if (params) {
    try {
      id = params.id;
    } catch (error) {
      console.error("Error extracting ID from params:", error);
    }
  }
  
  return (
    <Suspense fallback={<div className="w-full h-16 bg-white shadow animate-pulse" />}>
      <Navbar id={id} />
    </Suspense>
  );
} 