import { PropsWithChildren } from 'react';
import GoogleShoppingTryNavbar from '@/components/Ads/GoogleShoppingTry/includes/Navbar';
import GoogleShoppingTryFooter from '@/components/Ads/GoogleShoppingTry/includes/Footer';
import { headers } from 'next/headers';

export default async function StarterPackLayout({ children }: Readonly<PropsWithChildren>) {
  const headersList = await headers();
  const host = headersList.get('host');
  const trySubdomain = process.env.NEXT_PUBLIC_TRY_SUBDOMAIN || 'try';
  const isTrySubdomain = host?.includes(`${trySubdomain}.`);
  
  if (isTrySubdomain) {
    const navbarLogoColor = '#000';
    const footerLogoColor = '#fff';
    return (
      <div className='tw-relative'>
        <GoogleShoppingTryNavbar
          className='tw-absolute tw-top-0 tw-left-0 tw-right-0 tw-z-50 tw-pt-[10px]'
          logoColor={navbarLogoColor}
        />
        {children}
        <GoogleShoppingTryFooter logoColor={footerLogoColor} variant='dark' />
      </div>
    );
  }
  return children;
}