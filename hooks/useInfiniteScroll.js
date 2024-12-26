import { useEffect, useRef, useCallback } from 'react';

export function useInfiniteScroll(loadMore, options = {}) {
  const {
    loading = false,
    hasMore = true,
    threshold = '100px',
    initialFetchDone = false
  } = options;

  const observerRef = useRef();

  const lastElementRef = useCallback(node => {
    if (loading) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && initialFetchDone) {
        loadMore();
      }
    }, {
      rootMargin: threshold
    });

    if (node) {
      observerRef.current.observe(node);
    }
  }, [loading, hasMore, initialFetchDone, loadMore]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return lastElementRef;
}