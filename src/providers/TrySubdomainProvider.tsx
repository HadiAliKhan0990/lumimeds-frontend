'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { TrySubdomainContextValue } from '@/types/trySubdomain';

export const TrySubdomainContext = createContext<TrySubdomainContextValue | undefined>(undefined);

interface TrySubdomainProviderProps {
  children: ReactNode;
  isTrySubdomain: boolean;
}

export function TrySubdomainProvider({ children, isTrySubdomain }: TrySubdomainProviderProps) {
  return (
    <TrySubdomainContext.Provider value={{ isTrySubdomain }}>
      {children}
    </TrySubdomainContext.Provider>
  );
}

export function useTrySubdomain(): boolean {
  const context = useContext(TrySubdomainContext);
  // Always return a boolean, defaulting to false if context unavailable
  // This simplifies usage in components - they don't need nullish coalescing
  return context?.isTrySubdomain ?? false;
}
