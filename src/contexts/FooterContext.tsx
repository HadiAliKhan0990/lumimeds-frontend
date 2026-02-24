'use client';

import { createContext, useContext, useState, PropsWithChildren, useMemo } from 'react';

type FooterVariant = 'default' | 'light' | 'dosing-guide';

interface FooterContextType {
  variant: FooterVariant;
  setVariant: (variant: FooterVariant) => void;
}

const FooterContext = createContext<FooterContextType | undefined>(undefined);

export function FooterProvider({ children }: Readonly<PropsWithChildren>) {
  const [variant, setVariant] = useState<FooterVariant>('default');

  const values = useMemo(
    () => ({
      variant,
      setVariant,
    }),
    [variant, setVariant]
  );

  return <FooterContext.Provider value={values}>{children}</FooterContext.Provider>;
}

export function useFooter() {
  const context = useContext(FooterContext);
  if (context === undefined) {
    throw new Error('useFooter must be used within a FooterProvider');
  }
  return context;
}
