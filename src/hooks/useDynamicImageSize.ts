'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Dynamically calculates image height based on a fixed width and natural aspect ratio,
 * while caching the previous height during loading.
 *
 * @param {string} src - Image URL
 * @param {number} fixedWidth - Desired fixed width (e.g., 200px)
 * @returns { height: number; aspectRatio: number; isLoading: boolean; error: Error | null }
 */

export const useDynamicImageSize = (src: string, fixedWidth: number) => {
  const [height, setHeight] = useState<number>(fixedWidth); // Default: square (1:1)
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Cache the previous height while new image loads
  const cachedHeight = useRef<number>(fixedWidth);

  useEffect(() => {
    if (!src) return;

    // Set loading state while we fetch the new image
    setIsLoading(true);

    const img = new Image();
    img.src = src;

    img.onload = () => {
      const naturalRatio = img.naturalHeight / img.naturalWidth;
      setAspectRatio(naturalRatio);
      const newHeight = fixedWidth * naturalRatio;
      setHeight(newHeight);
      cachedHeight.current = newHeight; // Update cache
      setIsLoading(false);
    };

    img.onerror = () => {
      setError(new Error('Image failed to load'));
      setIsLoading(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, fixedWidth]);

  // Return cached height while loading, otherwise current height
  return { height: isLoading ? cachedHeight.current : height, aspectRatio, isLoading, error };
};
