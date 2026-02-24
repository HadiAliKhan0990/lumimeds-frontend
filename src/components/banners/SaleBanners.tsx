'use client';

import { Suspense } from 'react';
import { useBannerVisibility } from '@/hooks/useBannerVisibility';
import FlashSaleTopBanner from './FlashSale/TopBanner';
import FlashSalePopUpBanner from './FlashSale/PopUpBanner';
import GeneralSaleTopBanner from './GeneralSale/TopBanner';
import GeneralSalePopUpBanner from './GeneralSale/PopUpBanner';

interface SaleBannersProps {
  /** Show top banner - default true */
  showTopBanner?: boolean;
  /** Show popup banner - default false (use on landing pages) */
  showPopup?: boolean;
  /** Priority: which sale to show if multiple are active - default 'flash_sale' */
  priority?: 'flash_sale' | 'general_sale';
}

/**
 * Reusable component that displays sale banners based on active coupons
 * 
 * Usage:
 * - Homepage with popup: <SaleBanners showTopBanner showPopup />
 * - Product pages (top only): <SaleBanners showTopBanner />
 * - Checkout (top only): <SaleBanners showTopBanner />
 */
function SaleBannersContent({ 
  showTopBanner = true, 
  showPopup = false,
  priority = 'flash_sale'
}: SaleBannersProps) {
  const { 
    isFlashSaleActive, 
    isGeneralSaleActive, 
    flashSaleEndTime,
    generalSaleEndTime 
  } = useBannerVisibility();

  // Determine which sale to show based on priority
  const showFlashSale = priority === 'flash_sale' 
    ? isFlashSaleActive 
    : isFlashSaleActive && !isGeneralSaleActive;
  
  const showGeneralSale = priority === 'general_sale'
    ? isGeneralSaleActive && !isFlashSaleActive
    : !isFlashSaleActive && isGeneralSaleActive;

  // If no active sale, don't render anything
  if (!showFlashSale && !showGeneralSale) {
    return null;
  }

  return (
    <>
      {/* Flash Sale Banners */}
      {showFlashSale && (
        <>
          {showTopBanner && <FlashSaleTopBanner endTime={flashSaleEndTime} />}
          {showPopup && <FlashSalePopUpBanner endTime={flashSaleEndTime} />}
        </>
      )}

      {/* General Sale Banners */}
      {showGeneralSale && (
        <>
          {showTopBanner && <GeneralSaleTopBanner endTime={generalSaleEndTime} />}
          {showPopup && <GeneralSalePopUpBanner endTime={generalSaleEndTime} />}
        </>
      )}
    </>
  );
}

/**
 * Main export - wrapped in Suspense for useSearchParams
 */
export default function SaleBanners(props: SaleBannersProps) {
  return (
    <Suspense fallback={null}>
      <SaleBannersContent {...props} />
    </Suspense>
  );
}

/**
 * Pre-configured variants for common use cases
 */

// For landing pages / homepage - show both top banner and popup
export function SaleBannersWithPopup() {
  return <SaleBanners showTopBanner showPopup />;
}

// For product/checkout pages - show only top banner
export function SaleBannersTopOnly() {
  return <SaleBanners showTopBanner />;
}

