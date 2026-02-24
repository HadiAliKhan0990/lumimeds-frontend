import { PropsWithChildren } from 'react';

export const DetailsInfoSectionContainer = ({ children }: PropsWithChildren) => {
  return <div className='d-flex flex-column flex-md-row p-3 border rounded-2 gap-2'>{children}</div>;
};
