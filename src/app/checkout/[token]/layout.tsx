import Script from 'next/script';
import { PropsWithChildren } from 'react';

export default function Layout({ children }: Readonly<PropsWithChildren>) {
  return (
    <>
      {children}
      <Script src='https://js.stripe.com/v3/' strategy='afterInteractive' />
    </>
  );
}
