'use client';

import { useBannerVisibility } from '@/hooks/useBannerVisibility';
import FlashSaleTopBanner from './FlashSale/TopBanner';
import FlashSalePopUpBanner from './FlashSale/PopUpBanner';
import GeneralSaleTopBanner from './GeneralSale/TopBanner';
import GeneralSalePopUpBanner from './GeneralSale/PopUpBanner';

interface BannerProviderProps {
  /** Show top banner */
  showTopBanner?: boolean;
  /** Show popup banner */
  showPopup?: boolean;
  /** Children to render */
  children?: React.ReactNode;
}

/**
 * BannerProvider component that conditionally renders banners based on active sales
 * Checks coupon timing from coupons.json to determine which banners to show
 * 
 * Usage:
 * <BannerProvider showTopBanner showPopup>
 *   <YourPageContent />
 * </BannerProvider>
 */
export default function BannerProvider({
  showTopBanner = true,
  showPopup = false,
  children,
}: BannerProviderProps) {
  const { isFlashSaleActive, isGeneralSaleActive, flashSaleEndTime, generalSaleEndTime } = useBannerVisibility();

  return (
    <>
      {/* Flash Sale Banners - higher priority */}
      {isFlashSaleActive && (
        <>
          {showTopBanner && <FlashSaleTopBanner endTime={flashSaleEndTime} />}
          {showPopup && <FlashSalePopUpBanner endTime={flashSaleEndTime} />}
        </>
      )}

      {/* General Sale Banners - show only if flash sale is not active */}
      {!isFlashSaleActive && isGeneralSaleActive && (
        <>
          {showTopBanner && <GeneralSaleTopBanner endTime={generalSaleEndTime} />}
          {showPopup && <GeneralSalePopUpBanner endTime={generalSaleEndTime} />}
        </>
      )}

      {children}
    </>
  );
}

/**
 * Wrapper for pages that only need top banner
 */
export function TopBannerOnly({ children }: { children?: React.ReactNode }) {
  return (
    <BannerProvider showTopBanner showPopup={false}>
      {children}
    </BannerProvider>
  );
}

/**
 * Wrapper for pages that need both top banner and popup
 */
export function TopBannerWithPopup({ children }: { children?: React.ReactNode }) {
  return (
    <BannerProvider showTopBanner showPopup>
      {children}
    </BannerProvider>
  );
}

