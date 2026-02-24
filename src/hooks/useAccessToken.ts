'use client';

import { useState, useEffect } from 'react';
import { getAuth } from '@/lib/tokens';

/**
 * Hook to get access token from server-side cookies
 * Note: Cookies are HttpOnly, so we use a server action to read them
 * This hook should only be used when you need the token in a client component
 * For server components, use getAuth() directly
 */
export const useAccessToken = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get access token from server-side cookies via server action
    const fetchToken = async () => {
      try {
        const auth = await getAuth();
        setAccessToken(auth.accessToken || null);
      } catch (error) {
        console.error('Failed to get access token:', error);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
  }, []);

  return { accessToken, isLoading };
};
