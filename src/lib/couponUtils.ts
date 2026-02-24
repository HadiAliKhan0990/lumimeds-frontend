/**
 * Shared coupon utility functions
 * Used by usePromoCoupons hook and useBannerVisibility hook
 */

import couponsData from '@/data/coupons.json';

export interface CouponData {
  startTimePST?: string;
  endTimePST?: string;
  applyMode?: string;
  sales?: string[];
  rules: Array<{
    patientType: string;
    products: Array<{
      key: string;
      name: string;
    }>;
  }>;
}

export type CouponsMap = Record<string, CouponData>;

/**
 * Converts a PST/PDT datetime string to a UTC Date object
 * Input format: "YYYY-MM-DDTHH:mm:ss" interpreted as America/Los_Angeles timezone
 */
export function parsePSTTime(pstTimeString: string): Date {
  const [datePart, timePart] = pstTimeString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second] = (timePart || '00:00:00').split(':').map(Number);

  // Create date string in ISO format with explicit timezone
  // We need to determine if DST is active for this specific date in LA
  const tempDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0)); // noon UTC
  
  // Format this date in LA timezone to check if DST is active
  const laFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    timeZoneName: 'short',
  });
  const formatted = laFormatter.format(tempDate);
  const isDST = formatted.includes('PDT');
  
  // PST = UTC-8, PDT = UTC-7
  const offsetHours = isDST ? 7 : 8;
  
  // Convert PST/PDT time to UTC by adding the offset
  return new Date(Date.UTC(year, month - 1, day, hour + offsetHours, minute, second || 0));
}

/**
 * Checks if the current time is within the valid window for a coupon
 * @param coupon - The coupon data to check
 * @param overrideTime - If true, bypasses time checks (for testing)
 */
export function isCouponActive(coupon: CouponData, overrideTime = false): boolean {
  if (overrideTime) return true;

  const now = new Date();
  
  // Check start time
  if (coupon.startTimePST) {
    const startTime = parsePSTTime(coupon.startTimePST);
    if (now < startTime) return false;
  }
  
  // Check end time
  if (coupon.endTimePST) {
    const endTime = parsePSTTime(coupon.endTimePST);
    if (now > endTime) return false;
  }
  
  return true;
}

/**
 * Gets all coupons from coupons.json
 */
export function getAllCoupons(): CouponsMap {
  return couponsData.coupons as CouponsMap;
}

/**
 * Gets active coupons filtered by sale type
 * @param saleType - The sale type to filter by (e.g., 'flash_sale', 'general_sale')
 * @param overrideTime - If true, bypasses time checks
 */
export function getActiveCouponsBySaleType(saleType: string, overrideTime = false): CouponsMap {
  const allCoupons = getAllCoupons();
  const activeCoupons: CouponsMap = {};

  for (const [couponCode, couponData] of Object.entries(allCoupons)) {
    const hasSaleType = couponData.sales?.includes(saleType) ?? false;
    
    if (hasSaleType && isCouponActive(couponData, overrideTime)) {
      activeCoupons[couponCode] = couponData;
    }
  }

  return activeCoupons;
}

/**
 * Checks if any coupon with a specific sale type is currently active
 * @param saleType - The sale type to check (e.g., 'flash_sale', 'general_sale')
 * @param overrideTime - If true, bypasses time checks
 */
export function isSaleTypeActive(saleType: string, overrideTime = false): boolean {
  const activeCoupons = getActiveCouponsBySaleType(saleType, overrideTime);
  return Object.keys(activeCoupons).length > 0;
}

/**
 * Gets the end time of the first active coupon for a sale type
 * Used for countdown timers
 * @param saleType - The sale type to check
 * @param overrideTime - If true, bypasses time checks
 */
export function getSaleEndTime(saleType: string, overrideTime = false): Date | null {
  const activeCoupons = getActiveCouponsBySaleType(saleType, overrideTime);
  const couponCodes = Object.keys(activeCoupons);
  
  if (couponCodes.length === 0) return null;
  
  // Get the first coupon's end time
  const firstCoupon = activeCoupons[couponCodes[0]];
  if (firstCoupon.endTimePST) {
    return parsePSTTime(firstCoupon.endTimePST);
  }
  
  return null;
}

/**
 * Checks if a specific coupon is currently active
 * @param couponCode - The coupon code to check (e.g., 'LumiFlash100')
 * @param overrideTime - If true, bypasses time checks
 */
export function isSpecificCouponActive(couponCode: string, overrideTime = false): boolean {
  const allCoupons = getAllCoupons();
  const coupon = allCoupons[couponCode];
  
  if (!coupon) return false;
  
  return isCouponActive(coupon, overrideTime);
}

/**
 * Gets the end time for a specific coupon
 * @param couponCode - The coupon code to get end time for
 */
export function getCouponEndTime(couponCode: string): Date | null {
  const allCoupons = getAllCoupons();
  const coupon = allCoupons[couponCode];
  
  if (!coupon || !coupon.endTimePST) return null;
  
  return parsePSTTime(coupon.endTimePST);
}

