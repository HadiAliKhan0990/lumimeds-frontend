/**
 * Tracking Constants
 * 
 * Centralized constants for all tracking platform IDs and configuration.
 * All tracking IDs are hardcoded here - no environment variables needed.
 */

/**
 * Check if tracking is enabled
 * Only checks if environment is production
 */
export const isTrackingEnabled = (): boolean => {
  return process.env.NEXT_PUBLIC_ENV === 'production';
};

// Meta (Facebook) Pixel
export const META_PIXEL_ID = '441019062220099';

// Google Analytics
export const GOOGLE_ANALYTICS_ID = 'G-11FEFXG6F7';

// Google Ads
export const GOOGLE_ADS_ID = 'AW-11493817485';

// Google Ads Conversion IDs - GLP-1 (Weight Loss)
export const GOOGLE_ADS_CONVERSION_ADD_TO_CART = 'OAZ3CLikzv8aEI351ugq';
export const GOOGLE_ADS_CONVERSION_INITIATE_CHECKOUT = 'kr3pCKL9vf8aEI351ugq';
export const GOOGLE_ADS_CONVERSION_PURCHASE = 'xojhCOSG58QaEI351ugq';
export const GOOGLE_ADS_CONVERSION_FORM_SUBMISSION = 'dbmWCM-4zv8aEI351ugq';

// Google Ads Conversion IDs - NAD+ (Longevity)
export const GOOGLE_ADS_CONVERSION_ADD_TO_CART_NAD = 'bqtKCKOL2NUbEI351ugq';
export const GOOGLE_ADS_CONVERSION_INITIATE_CHECKOUT_NAD = 'us_ZCKCL2NUbEI351ugq';
export const GOOGLE_ADS_CONVERSION_PURCHASE_NAD = 'gkEmCMyeydUbEI351ugq';
export const GOOGLE_ADS_CONVERSION_FORM_SUBMISSION_NAD = 'hDuSCKDd2dUbEI351ugq';

// TikTok Pixel
export const TIKTOK_PIXEL_ID = 'D0SSTK3C77UEHH7PRQ3G';

// Reddit Pixel
export const REDDIT_PIXEL_ID = 'a2_gf92npq8snwq';

// Microsoft UET
export const MICROSOFT_UET_ID = '187214916';

// Google Tag Manager
export const GTM_ID = 'GTM-WMQG6DHR';

// CallRail
export const CALLRAIL_ID = '835387806/e6a1ee369fd96253c0b0/12';

// Hotjar
export const HOTJAR_ID = '6548539';

