import { useState, useEffect, useCallback, useRef } from 'react';
import { client } from '@/lib/baseQuery';
import { extractS3Key } from '@/lib/helper';

const urlCache = new Map<string, { url: string; expiresAt: number }>();

interface UseSignedFileUrlReturn {
  signedUrl: string;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch signed URLs for S3 files
 * @param fileKey - The S3 key or full URL
 * @param endpoint - The API endpoint to use (default: '/surveys/file-url')
 * @returns Object with signedUrl, isLoading, and error
 */
export function useSignedFileUrl(fileKey: string | undefined, endpoint: string = '/surveys/file-url'): UseSignedFileUrlReturn {
  const [signedUrl, setSignedUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const fetchingRef = useRef(false);

  const fetchSignedUrl = useCallback(async () => {
    if (!fileKey) {
      setSignedUrl('');
      return;
    }

    // Check cache first (use fileKey + endpoint as cache key to avoid conflicts)
    // Use double colon as separator to avoid collision with fileKeys containing single colon
    const cacheKey = `${endpoint}::${fileKey}`;
    const cached = urlCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      setSignedUrl(cached.url);
      return;
    }

    if (fetchingRef.current) return;

    fetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      // Extract key from full URL if needed using utility function
      const key = extractS3Key(fileKey);

      const { data } = await client.get(`${endpoint}?key=${encodeURIComponent(key)}`);
      
      if (!mountedRef.current) return;

      const newUrl: string | undefined = data.data?.url;
      if (newUrl) {
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
        urlCache.set(cacheKey, { url: newUrl, expiresAt });
        setSignedUrl(newUrl);
        setError(null);
      } else {
        setError('Unable to fetch file URL');
      }
    } catch (err) {
      console.error('Error fetching signed file URL:', err);
      if (mountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Unable to fetch file URL';
        setError(errorMessage);
      }
    } finally {
      if (mountedRef.current) {
        fetchingRef.current = false;
        setIsLoading(false);
      }
    }
  }, [fileKey, endpoint]);

  useEffect(() => {
    mountedRef.current = true;
    fetchSignedUrl();

    return () => {
      mountedRef.current = false;
    };
  }, [fetchSignedUrl]);

  return { signedUrl, isLoading, error };
}