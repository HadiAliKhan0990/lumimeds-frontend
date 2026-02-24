import { PropsWithChildren } from 'react';

interface Props extends PropsWithChildren {
  title: string;
}

export const DetailsInfoSection = ({ title, children }: Props) => {
  return (
    <>
      <p className='fw-semibold mb-2'>{title}</p>
      <div>{children}</div>
    </>
  );
};
