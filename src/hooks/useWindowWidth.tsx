'use client';

import { useState, useEffect } from 'react';

/**
 * A React hook to track the current window width.
 * Safely handles SSR by checking for `typeof window`.
 *
 * @returns {number} The current window width in pixels.
 */

export function useWindowWidth() {
  // Initialize state with current window width or 0 during SSR
  const [windowWidth, setWindowWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return 0;
  });

  useEffect(() => {
    // Skip if not in browser
    if (typeof window === 'undefined') {
      return;
    }

    // Handler to call on window resize
    function handleResize(): void {
      setWindowWidth(window.innerWidth);
    }

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array - only run once on mount

  return { windowWidth };
}
