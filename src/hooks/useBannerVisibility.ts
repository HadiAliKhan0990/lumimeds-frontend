'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { isSpecificCouponActive, getCouponEndTime } from '@/lib/couponUtils';

export type BannerType = 'flash_sale' | 'general_sale';

// Coupon codes that control banner visibility
const FLASH_SALE_COUPON = 'LumiFlash100';
const GENERAL_SALE_COUPON = 'LumiNewYear50';

export interface BannerVisibility {
  isFlashSaleActive: boolean;
  isGeneralSaleActive: boolean;
  flashSaleEndTime: Date | null;
  generalSaleEndTime: Date | null;
  activeBanners: BannerType[];
}

/**
 * Hook to determine which banners should be visible based on active coupons
 * - Flash Sale banner depends on LumiFlash100 coupon timing
 * - General Sale banner depends on LumiNewYear50 coupon timing
 * Supports overrideTime query param for testing
 */
export function useBannerVisibility(): BannerVisibility {
  const searchParams = useSearchParams();
  const overrideTime = searchParams.get('overrideTime') === 'true';

  const visibility = useMemo(() => {
    // Flash sale depends specifically on LumiFlash100 coupon
    const isFlashSaleActive = isSpecificCouponActive(FLASH_SALE_COUPON, overrideTime);
    
    // General sale depends specifically on LumiNewYear50 coupon
    const isGeneralSaleActive = isSpecificCouponActive(GENERAL_SALE_COUPON, overrideTime);
    
    const flashSaleEndTime = isFlashSaleActive ? getCouponEndTime(FLASH_SALE_COUPON) : null;
    const generalSaleEndTime = isGeneralSaleActive ? getCouponEndTime(GENERAL_SALE_COUPON) : null;
    
    const activeBanners: BannerType[] = [];
    if (isFlashSaleActive) activeBanners.push('flash_sale');
    if (isGeneralSaleActive) activeBanners.push('general_sale');

    return {
      isFlashSaleActive,
      isGeneralSaleActive,
      flashSaleEndTime,
      generalSaleEndTime,
      activeBanners,
    };
  }, [overrideTime]);

  return visibility;
}

/**
 * Hook for countdown timer logic
 * Returns time remaining until end time
 */
export function useCountdown(endTime: Date | null) {
  const getTimeRemaining = () => {
    if (!endTime) return { hours: 0, minutes: 0, seconds: 0, isExpired: true };

    const now = new Date();
    const diff = endTime.getTime() - now.getTime();

    if (diff <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds, isExpired: false };
  };

  return { getTimeRemaining };
}

