'use client';

import { useState, useContext } from 'react';
import { getTrySubdomain } from '@/constants';
import { TrySubdomainContext } from '@/providers/TrySubdomainProvider';

/**
 * Custom hook to detect if the current page is on the try subdomain.
 * 
 * This hook:
 * 1. First tries to use the server-side value from TrySubdomainProvider context
 * 2. Falls back to client-side detection if context is unavailable
 * 3. Always returns a boolean value
 * 
 * @returns {boolean} True if on try subdomain, false otherwise
 */
export function useTrySubdomainDetection(): boolean {
  // Client-side fallback detection (runs unconditionally)
  const [isTrySubdomainClient] = useState(() => {
    if (typeof document === 'undefined') return false;
    // Check data attribute first (set by blocking script before React hydration)
    const htmlElement = document.documentElement;
    if (htmlElement.getAttribute('data-try-subdomain') === 'true') {
      return true;
    }
    // Fallback to checking hostname directly
    // Get try subdomain from environment variable (try-staging for staging, try for production/localhost)
    if (typeof window !== 'undefined') {
      const trySubdomain = getTrySubdomain();
      return window.location.hostname.startsWith(`${trySubdomain}.`);
    }
    return false;
  });
  
  // Check if context is available (to distinguish between "context not available" vs "context value is false")
  const context = useContext(TrySubdomainContext);
  
  // Use server-side value from context if available, otherwise fallback to client-side detection
  // This prevents hydration mismatch when server-side detection is available
  return context?.isTrySubdomain ?? isTrySubdomainClient;
}
