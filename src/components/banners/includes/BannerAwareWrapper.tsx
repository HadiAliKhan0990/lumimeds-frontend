'use client';

import SaleBanners from '@/components/banners/SaleBanners';
import { NON_SALE_PAGES, ROUTES } from '@/constants';
import { useBannerVisibility } from '@/hooks/useBannerVisibility';
import { PropsWithChildren, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import priceIdsData from '@/data/priceIds.json';

interface Props extends PropsWithChildren {
  hideNavAndFooter: boolean;
  pathname: string;
  isGoogleShoppingPage: boolean;
}

// Starter priceId based on environment
const starterPriceId = process.env.NEXT_PUBLIC_ENV === 'production'
  ? priceIdsData.production.glp1_gip_3m_starter
  : priceIdsData.staging.glp1_gip_3m_starter;

// Wrapper component to handle banner margin with Suspense
export function BannerAwareWrapper({ children, hideNavAndFooter, pathname, isGoogleShoppingPage }: Readonly<Props>) {
  const { isFlashSaleActive, isGeneralSaleActive } = useBannerVisibility();
  const searchParams = useSearchParams();
  const isNonSalePage = NON_SALE_PAGES.some((route) => pathname === route);
  
  // Check if on checkout page with starter priceId
  const isCheckoutPage = pathname.startsWith(ROUTES.CHECKOUT);
  const priceId = searchParams.get('priceId');
  const isStarterCheckout = isCheckoutPage && priceId === starterPriceId;

  const hasBanner = (isFlashSaleActive || isGeneralSaleActive) && !hideNavAndFooter && !isNonSalePage && !isStarterCheckout;

  // Add/remove banner-active class on body for CSS targeting
  useEffect(() => {
    if (hasBanner) {
      document.body.classList.add('banner-active');
    } else {
      document.body.classList.remove('banner-active');
    }
    return () => {
      document.body.classList.remove('banner-active');
    };
  }, [hasBanner]);

  // When no banner, add extra top padding for fixed navbar on desktop
  const noBannerPadding = !hasBanner && !hideNavAndFooter && !isGoogleShoppingPage ? 'lg:tw-pt-[100px]' : '';

  return (
    <>
      {/* Popup banner - shown on all pages where banner is active */}
      {hasBanner && <SaleBanners showTopBanner={false} showPopup />}

      <div className={`d-flex flex-column flex-grow-1 bg-light ${hideNavAndFooter && !isGoogleShoppingPage ? 'tw-pt-6 md:tw-pt-16' : ''} ${noBannerPadding}`}>
        {children}
      </div>
    </>
  );
}
