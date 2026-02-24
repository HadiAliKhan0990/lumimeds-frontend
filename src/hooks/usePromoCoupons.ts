'use client';

import { useState, useCallback, useMemo } from 'react';
import { useApplyCouponMutation } from '@/store/slices/checkoutApiSlice';
import { getAllCoupons, isCouponActive, CouponData } from '@/lib/couponUtils';
import priceIdsData from '@/data/priceIds.json';

// Determine environment - matches pattern used in CheckoutForm.tsx and middleware.ts
const priceIdMap = process.env.NEXT_PUBLIC_ENV === 'production' 
  ? priceIdsData.production 
  : priceIdsData.staging;

export interface CouponProduct {
  key: string;
  priceId?: string;
  name: string;
}

/**
 * Resolves a priceId from the product definition or falls back to the priceIds map
 * @param product - The coupon product definition
 * @returns The priceId or undefined if not found
 */
function resolvePriceId(product: CouponProduct): string | undefined {
  return priceIdMap[product.key as keyof typeof priceIdMap];
}

export interface CouponRule {
  patientType: string;
  products: CouponProduct[];
}

// Re-export CouponData from couponUtils for backwards compatibility
export type { CouponData } from '@/lib/couponUtils';

export interface DiscountInfo {
  originalAmount: number;
  amountAfterDiscount: number;
  discountAmount: number;
  discountType: string;
  couponCode: string;
  appliesTo: 'new' | 'all' | 'existing';
}

export type ProductDiscounts = Record<string, DiscountInfo>;

/**
 * Gets active coupons with applyMode: 'auto' from the coupons.json file
 * @param saleType - If provided, only returns coupons that have this sale type in their sales array.
 *                   If not provided, falls back to filtering by 'general_sale'.
 * @param overrideTime - If true, bypasses time checks (for testing)
 */
function getActiveAutoCoupons(saleType?: string, overrideTime = false): Record<string, CouponData> {
  const activeCoupons: Record<string, CouponData> = {};
  const allCoupons = getAllCoupons();

  // Determine which sale type to filter by
  const targetSaleType = saleType || 'general_sale';

  for (const [couponCode, couponData] of Object.entries(allCoupons)) {
    // Only include coupons with:
    // 1. applyMode: 'auto'
    // 2. Target sale type in sales array
    // 3. Currently active (within time window) - or overrideTime is true
    const isAutoApply = couponData.applyMode === 'auto';
    const hasSaleType = couponData.sales?.includes(targetSaleType) ?? false;
    
    if (isAutoApply && hasSaleType && isCouponActive(couponData, overrideTime)) {
      activeCoupons[couponCode] = couponData;
    }
  }

  return activeCoupons;
}

export type PatientType = 'new' | 'existing' | 'all';

export function usePromoCoupons(saleType?: string, patientType: PatientType = 'new', overrideTime = false) {
  const [productDiscounts, setProductDiscounts] = useState<ProductDiscounts>({});
  const [applyCoupon] = useApplyCouponMutation();

  // Get active auto-apply coupons from the JSON file, filtered by saleType if provided
  // If overrideTime is true, ignores start/end time checks
  const coupons = useMemo(() => getActiveAutoCoupons(saleType, overrideTime), [saleType, overrideTime]);

  // Find the coupon for a given priceId - only matches coupons with applyMode: 'auto'
  // Uses resolvePriceId to match both explicit priceIds and key-based lookups
  // Also filters by patientType: matches rules with "all" or the specific patientType
  const findCouponForPriceId = useCallback(
    (priceId: string): { couponCode: string; couponData: CouponData; appliesTo: 'new' | 'all' | 'existing' } | null => {
      if (!coupons || Object.keys(coupons).length === 0) return null;

      for (const [couponCode, couponData] of Object.entries(coupons)) {
        for (const rule of couponData.rules) {
          // Only consider rules that match the patient type
          // "all" matches everyone, otherwise must match exactly
          const isPatientTypeMatch = rule.patientType === 'all' || rule.patientType === patientType;
          if (!isPatientTypeMatch) continue;

          const matchingProduct = rule.products.find((p) => {
            const resolvedPriceId = resolvePriceId(p);
            return resolvedPriceId === priceId;
          });
          if (matchingProduct) {
            return { couponCode, couponData, appliesTo: rule.patientType as 'new' | 'all' | 'existing' };
          }
        }
      }

      return null;
    },
    [coupons, patientType]
  );

  // Fetch discount for a specific priceId
  const fetchDiscountForProduct = useCallback(
    async (priceId: string): Promise<DiscountInfo | null> => {
      const couponInfo = findCouponForPriceId(priceId);
      if (!couponInfo) return null;

      try {
        const response = await applyCoupon({
          priceId,
          couponCode: couponInfo.couponCode,
          overrideTime,
        }).unwrap();

        if (response.success && response.data) {
          return {
            ...response.data,
            couponCode: couponInfo.couponCode,
            appliesTo: couponInfo.appliesTo,
          };
        }
      } catch (error) {
        console.error(`Failed to apply coupon for priceId ${priceId}:`, error);
      }

      return null;
    },
    [findCouponForPriceId, applyCoupon, overrideTime]
  );

  // Fetch discounts for multiple priceIds at once
  const fetchDiscountsForProducts = useCallback(
    async (priceIds: string[]): Promise<ProductDiscounts> => {
      const discounts: ProductDiscounts = {};

      const promises = priceIds.map(async (priceId) => {
        const discount = await fetchDiscountForProduct(priceId);
        if (discount) {
          discounts[priceId] = discount;
        }
      });

      await Promise.all(promises);
      setProductDiscounts((prev) => ({ ...prev, ...discounts }));
      return discounts;
    },
    [fetchDiscountForProduct]
  );

  // Get discount info for a specific priceId (from cache)
  const getDiscountForPriceId = useCallback(
    (priceId: string): DiscountInfo | undefined => {
      return productDiscounts[priceId];
    },
    [productDiscounts]
  );

  // Check if a priceId has an eligible coupon (without fetching)
  const hasCouponForPriceId = useCallback(
    (priceId: string): boolean => {
      return findCouponForPriceId(priceId) !== null;
    },
    [findCouponForPriceId]
  );

  return {
    coupons,
    productDiscounts,
    isLoading: false, // No async loading needed since we read from JSON directly
    fetchDiscountForProduct,
    fetchDiscountsForProducts,
    getDiscountForPriceId,
    hasCouponForPriceId,
    findCouponForPriceId,
  };
}
