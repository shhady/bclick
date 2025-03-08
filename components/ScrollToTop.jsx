'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Ensure the DOM is fully loaded
    if (typeof window !== 'undefined') {
      // Use requestAnimationFrame to ensure smooth scrolling
      window.requestAnimationFrame(() => {
        window.scrollTo({
          top: 0,
          behavior: 'instant' // Use 'instant' instead of 'smooth' to prevent jarring effects
        });
      });
    }
  }, [pathname]);

  return null;
} 