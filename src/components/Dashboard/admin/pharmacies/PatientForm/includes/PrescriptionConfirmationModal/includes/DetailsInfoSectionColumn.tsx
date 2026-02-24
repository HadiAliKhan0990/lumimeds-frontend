import { useWindowWidth } from '@/hooks/useWindowWidth';
import { PropsWithChildren } from 'react';

export const DetailsInfoSectionColumn = ({ children }: PropsWithChildren) => {
  const { windowWidth } = useWindowWidth();

  const isMobile = windowWidth <= 576;
  return <div className={`w-50 d-flex flex-column ${isMobile ? 'w-100' : 'w-50'} gap-1`}>{children}</div>;
};
