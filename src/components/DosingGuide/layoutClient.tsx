'use client';

import { useFooter } from '@/contexts/FooterContext';
import { PropsWithChildren, useEffect } from 'react';

export default function DosingGuideLayoutClient({ children }: Readonly<PropsWithChildren>) {
  const { setVariant } = useFooter();

  useEffect(() => {
    setVariant('dosing-guide');

    return () => {
      setVariant('default');
    };
  }, [setVariant]);

  return <>{children}</>;
}
