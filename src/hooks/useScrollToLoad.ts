import { useEffect, useRef, useCallback, useState } from 'react';

interface UseScrollToLoadOptions {
  threshold?: number; // Distance from bottom to trigger load (in pixels)
  rootMargin?: string; // Root margin for intersection observer
  enabled?: boolean; // Whether scroll loading is enabled
}

interface UseScrollToLoadReturn {
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  isNearBottom: boolean;
}

export const useScrollToLoad = (
  onLoadMore: () => void,
  options: UseScrollToLoadOptions = {}
): UseScrollToLoadReturn => {
  const { rootMargin = '100px', enabled = true } = options;

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isNearBottom, setIsNearBottom] = useState(false);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && enabled) {
        setIsNearBottom(true);
        onLoadMore();
      } else {
        setIsNearBottom(false);
      }
    },
    [onLoadMore, enabled]
  );

  useEffect(() => {
    if (!loadMoreRef.current || !enabled) return;

    // Create intersection observer
    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin,
      threshold: 0.1,
    });

    // Start observing
    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, rootMargin, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    loadMoreRef,
    isNearBottom,
  };
};
