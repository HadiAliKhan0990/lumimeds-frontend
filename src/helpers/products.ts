import { ROUTES, ENDPOINTS, getTrySubdomain } from '@/constants';
import { capitalizeFirst } from '@/lib/helper';
import { PlanProduct, ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import type { ProductPrice, ProductType } from '@/store/slices/productTypeSlice';
import { PlanType } from '@/types/medications';
import type { Dispatch } from '@reduxjs/toolkit';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { TransitionStartFunction } from 'react';
import type { HandleVerifyRedirectToCheckoutPayload } from '@/types/products';
import { fetcher } from '@/lib/fetcher';
import { useTranslations } from 'next-intl';

/**
 * Extracts the month duration from product name/description and formats it as "X-month"
 * @param text Product name or description containing month information
 * @returns Formatted string like "1-month", "2-month", etc. or null if no match found
 */
export function formatMonthDuration(text: string | null): string {
  // Match patterns like "1-Month", "2 Month", "3-Month Supply", etc.
  const match = text?.match(/(\d+)\s*-?\s*month/i);

  if (match?.[1]) {
    return match[1];
  }

  return '';
}

export const getProductDetails = (price: ProductPrice, product: ProductType) => {
  if (product.planType === PlanType.RECURRING) {
    if (price.billingIntervalCount === 1)
      return {
        name: `${capitalizeFirst(product?.metadata?.planTier) || ''} ${product.durationText}`,
        description: 'Monthly Payments',
      };
    else
      return {
        name: `${capitalizeFirst(product?.metadata?.planTier) || ''} ${product.durationText}`,
        description: `One Payment of $${price.amount}`,
      };
  } else {
    return {
      name: `${capitalizeFirst(product?.metadata?.planTier) || ''} ${product.durationText}`,
      subHeader: 'One-Time Purchase',
      description: `One Payment of $${price.amount}`,
    };
  }
};

export const getFormattedPrice = (price: number | undefined) => {
  if (!price) return 0;

  if (Number.isInteger(price)) {
    return price;
  } else {
    return price.toFixed(2);
  }
};

export const getRoundedPrice = (price: number | undefined) => {
  if (!price) return 0;

  if (Number.isInteger(price)) {
    return price;
  } else {
    return Math.round(price);
  }
};

/**
 * Checks if a category has a valid intakeSurveyId
 */
const getCategoryIntakeSurveyId = (category: PlanProduct): string => {
  return category?.intakeSurveyId && typeof category.intakeSurveyId === 'string' ? category.intakeSurveyId : '';
};

/**
 * Finds the first product with a valid surveyId in a category
 */
const findProductSurveyId = (category: PlanProduct): string => {
  const products = category?.products;
  if (!Array.isArray(products)) {
    return '';
  }

  for (const product of products) {
    if (product?.surveyId && typeof product.surveyId === 'string') {
      return product.surveyId;
    }
  }
  return '';
};

/**
 * Safely extracts survey ID from product list data without throwing errors
 * @param data Product list data from fetchProducts
 * @returns Survey ID string or empty string if not found
 */
export const extractSurveyId = (data: ProductTypesResponseData): string => {
  try {
    if (!data || typeof data !== 'object') {
      return '';
    }

    for (const category of Object.values(data)) {
      if (!category || typeof category !== 'object') {
        continue;
      }

      // Check for intakeSurveyId first
      const intakeSurveyId = getCategoryIntakeSurveyId(category);
      if (intakeSurveyId) {
        return intakeSurveyId;
      }

      // Fallback to product surveyId
      const productSurveyId = findProductSurveyId(category);
      if (productSurveyId) {
        return productSurveyId;
      }
    }

    return '';
  } catch (error) {
    console.warn('Error extracting survey ID:', error);
    return '';
  }
};

/**
 * Safely extracts intake survey expiry days from product list data
 * @param data Product list data from fetchProducts
 * @returns Number of days until expiry, or null if not provided
 */
export const extractIntakeSurveyExpiryDays = (data: ProductTypesResponseData): number | null => {
  try {
    if (!data || typeof data !== 'object') {
      return null;
    }

    for (const category of Object.values(data)) {
      if (!category || typeof category !== 'object') {
        continue;
      }

      const days = (category as { intakeSurveyExpiry?: number }).intakeSurveyExpiry;
      if (typeof days === 'number' && days > 0) {
        return days;
      }
    }
    return null;
  } catch (error) {
    console.warn('Error extracting intake survey expiry days:', error);
    return null;
  }
};

export async function redirectToSurvey(
  product: ProductType,
  dispatch: Dispatch,
  startTransition: TransitionStartFunction,
  router: AppRouterInstance,
  source?: string,
  saleType?: string,
  overrideTime?: boolean
) {
  // Determine survey route first
  const surveyRoute =
    product?.medicineName === 'weight loss'
      ? ROUTES.PATIENT_INTAKE
      : product?.medicineName === 'longevity'
        ? ROUTES.LONGEVITY_PATIENT_INTAKE
        : ROUTES.PATIENT_INTAKE;

  const params = new URLSearchParams();
  if (source) params.set('source', source);
  if (saleType) params.set('sale_type', saleType);
  if (overrideTime) params.set('overrideTime', 'true');

  const surveyUrl = params.toString() ? `${surveyRoute}?${params.toString()}` : surveyRoute;

  // Check if we need to redirect to main domain first
  if (redirectToMainDomainIfNeeded(surveyUrl)) return;
  
  const { setProductType } = await import('@/store/slices/productTypeSlice');
  dispatch(setProductType(product));
  startTransition(() => router.push(surveyUrl));
}

export async function handleSurveyCompleted({
  dispatch,
  startTransition,
  router,
  product,
  saleType,
  overrideTime,
}: HandleVerifyRedirectToCheckoutPayload) {
  const { setProductType } = await import('@/store/slices/productTypeSlice');
  dispatch(setProductType(product));

  // Check if user came from /ad/starter-pack or has source=google-merchant
  const isFromGoogleMerchant =
    typeof window !== 'undefined' &&
    (window.location.pathname === '/ad/starter-pack' ||
      new URLSearchParams(window.location.search).get('source') === 'google-merchant');

  const params = new URLSearchParams();
  if (isFromGoogleMerchant) params.set('source', 'google-merchant');
  if (saleType) params.set('sale_type', saleType);
  if (overrideTime) params.set('overrideTime', 'true');

  const baseUrl = isFromGoogleMerchant ? ROUTES.PRODUCT_SUMMARY_GOOGLE_MERCHANT : ROUTES.PRODUCT_SUMMARY;
  const redirectUrl = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;

  if (redirectToMainDomainIfNeeded(redirectUrl)) return;
  startTransition(() => router.push(redirectUrl));
}

// Helper function to get main domain URL
function getMainDomainUrl(): string {
  if (typeof window === 'undefined') return '';
  const hostname = window.location.hostname;

  // For localhost, use the current origin without the try subdomain
  if (hostname === 'try.localhost' || hostname.endsWith('.localhost')) {
    const port = window.location.port || '3000';
    return `http://localhost:${port}`;
  }

  // For other environments, use NEXT_PUBLIC_SITE_URL from environment variable
  // This ensures correct redirect to staging/production domains
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (baseUrl) {
    try {
      const url = new URL(baseUrl);
      return `${url.protocol}//${url.host}`;
    } catch {
      // If baseUrl is invalid, fallback to removing try subdomain from current origin
      return window.location.origin.replace(/^https?:\/\/try(-staging)?\./, (match) => {
        return match.includes('try-staging') ? 'https://' : 'https://';
      });
    }
  }

  // Fallback: remove try subdomain from current origin
  return window.location.origin.replace(/^https?:\/\/try(-staging)?\./, 'https://');
}

// Helper function to redirect to main domain if on try subdomain
function redirectToMainDomainIfNeeded(targetPath: string): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  // Get try subdomain from environment variable (try-staging for staging, try for production/localhost)
  const trySubdomain = getTrySubdomain();
  const isOnTrySubdomain = hostname.startsWith(`${trySubdomain}.`);

  if (isOnTrySubdomain) {
    const mainDomain = getMainDomainUrl();
    window.location.href = `${mainDomain}${targetPath}`;
    return true; // Indicates redirect happened
  }
  return false; // No redirect needed
}

export async function handleVerifyRedirectToCheckout({
  selectedProduct,
  product,
  dispatch,
  startTransition,
  router,
  isSurveyCompleted,
  checkoutUser,
  surveyCategory,
  saleType,
  overrideTime,
}: HandleVerifyRedirectToCheckoutPayload) {
  // Check if user came from /ad/starter-pack
  const isFromGoogleMerchant = typeof window !== 'undefined' && window.location.pathname === '/ad/starter-pack';

  // Determine flow from query param (?flow=pfa|sfa)
  // This helper runs on the client (called from UI handlers), so it's safe to access window
  try {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const flow = (params?.get('flow') || '').toLowerCase();

    if (flow === 'pfa') {
      const { setProductType } = await import('@/store/slices/productTypeSlice');
      dispatch(setProductType(product));

      const urlParams = new URLSearchParams();
      urlParams.set('flow', flow);
      if (isFromGoogleMerchant) urlParams.set('source', 'google-merchant');
      if (saleType) urlParams.set('sale_type', saleType);
      if (overrideTime) urlParams.set('overrideTime', 'true');

      const baseUrl = isFromGoogleMerchant ? ROUTES.PRODUCT_SUMMARY_GOOGLE_MERCHANT : ROUTES.PRODUCT_SUMMARY;
      const summaryUrl = `${baseUrl}?${urlParams.toString()}`;

      if (redirectToMainDomainIfNeeded(summaryUrl)) return;
      startTransition(() => router.push(summaryUrl));
      return;
    }
  } catch (e) {
    console.log('Error parsing query params:', e);
  }

  interface SessionUser {
    id: string;
    email: string;
    role: string;
  }

  interface SessionResponse {
    data: {
      authenticated: boolean;
      user?: SessionUser;
    };
  }

  let isAuthenticated = false;
  try {
    const sessionResponse = await fetcher<SessionResponse>(ENDPOINTS.SESSION, {
      method: 'GET',
    });
    isAuthenticated = sessionResponse?.data?.authenticated ?? false;
  } catch (error) {
    console.log('Error checking session:', error);
    isAuthenticated = false;
  }

  if (isAuthenticated) {
    const targetPath = ROUTES.PATIENT_PAYMENTS_SUBSCRIPTIONS;
    if (redirectToMainDomainIfNeeded(targetPath)) return;
    startTransition(() => router.push(targetPath));
    return;
  }

  if (checkoutUser && selectedProduct?.id === product.id) {
    if (isSurveyCompleted) {
      await handleSurveyCompleted({
        selectedProduct,
        product,
        dispatch,
        startTransition,
        router,
        isSurveyCompleted,
        saleType,
        overrideTime,
      });
    } else {
      const source = isFromGoogleMerchant ? 'google-merchant' : undefined;
      await redirectToSurvey(product, dispatch, startTransition, router, source, saleType, overrideTime);
    }
  } else if (isSurveyCompleted && surveyCategory && product?.medicineName !== surveyCategory.replace('_', ' ')) {
    const source = isFromGoogleMerchant ? 'google-merchant' : undefined;
    await redirectToSurvey(product, dispatch, startTransition, router, source, saleType, overrideTime);
  } else if (isSurveyCompleted) {
    // Ensure product is stored in Redux before redirecting to product summary
    // This handles the case where a user selects a different product after completing survey
    const { setProductType } = await import('@/store/slices/productTypeSlice');
    dispatch(setProductType(product));

    const sourceParam =
      typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('source') : null;

    const shouldUseGoogleMerchant = isFromGoogleMerchant || sourceParam === 'google-merchant';

    const urlParams = new URLSearchParams();
    if (shouldUseGoogleMerchant) urlParams.set('source', 'google-merchant');
    if (saleType) urlParams.set('sale_type', saleType);
    if (overrideTime) urlParams.set('overrideTime', 'true');

    const baseUrl = shouldUseGoogleMerchant ? ROUTES.PRODUCT_SUMMARY_GOOGLE_MERCHANT : ROUTES.PRODUCT_SUMMARY;
    const summaryUrl = urlParams.toString() ? `${baseUrl}?${urlParams.toString()}` : baseUrl;

    if (redirectToMainDomainIfNeeded(summaryUrl)) return;
    startTransition(() => router.push(summaryUrl));
  } else {
    const source = isFromGoogleMerchant ? 'google-merchant' : undefined;
    await redirectToSurvey(product, dispatch, startTransition, router, source, saleType, overrideTime);
  }
}

export const getBadgeText = (product: ProductType, t?: ReturnType<typeof useTranslations>): string | undefined => {
  const planTier = product.metadata?.planTier?.toLowerCase();

  // If t provided, use translated badge text
  if (t) {
    if (planTier === 'starter') return t('badges.starter');
    if (planTier === 'value') return t('badges.value');
    if (planTier === 'monthly') return t('badges.monthly');
  }

  // Default to original metadata text
  return product.metadata?.planTier ?? (t ? t('badges.monthly') : 'Monthly');
};
