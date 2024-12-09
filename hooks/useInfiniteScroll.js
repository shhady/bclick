import { useEffect, useRef } from 'react';

export default function useInfiniteScroll({ 
  onLoadMore, 
  hasMore, 
  isLoading 
}) {
  const observerRef = useRef(null);

  useEffect(() => {
    // Only set up observer if more content can be loaded and not currently loading
    if (!hasMore || isLoading) return;

    // Create Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        // Trigger load more when target is fully visible
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { 
        threshold: 1.0, // Fully visible
        rootMargin: '0px' 
      }
    );

    // Observe the target element
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    // Cleanup observer
    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasMore, isLoading, onLoadMore]);

  return { observerRef };
}