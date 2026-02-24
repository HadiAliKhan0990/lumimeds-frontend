import { useCallback, useRef } from 'react';

export const useDebounceHandler = () => {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const debouncedHandler = useCallback((delay: number, callback: () => void) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback();
    }, delay);
  }, []);

  return { debouncedHandler };
};
