import {
  isTrackingEnabled,
  META_PIXEL_ID,
  GOOGLE_ADS_ID,
  GOOGLE_ADS_CONVERSION_ADD_TO_CART,
  GOOGLE_ADS_CONVERSION_INITIATE_CHECKOUT,
  GOOGLE_ADS_CONVERSION_PURCHASE,
  GOOGLE_ADS_CONVERSION_FORM_SUBMISSION,
  GOOGLE_ADS_CONVERSION_ADD_TO_CART_NAD,
  GOOGLE_ADS_CONVERSION_INITIATE_CHECKOUT_NAD,
  GOOGLE_ADS_CONVERSION_PURCHASE_NAD,
  GOOGLE_ADS_CONVERSION_FORM_SUBMISSION_NAD,
  TIKTOK_PIXEL_ID,
  REDDIT_PIXEL_ID,
} from '@/constants/tracking';
import type { ProductCategory, SurveyCategory } from './trackingHelpers';

// Declare custom interfaces for pixel functions
interface FacebookPixelFunction {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
}

interface RedditPixelFunction {
  (...args: unknown[]): void;
  queue?: unknown[];
}

interface TikTokPixel {
  track: (event: string, params: unknown) => void;
  load?: (id: string) => void;
  queue?: unknown[];
}

// Update global Window interface
declare global {
  interface Window {
    fbq?: FacebookPixelFunction;
    _fbq?: {
      loaded?: boolean;
    };
    fbPixelReady?: boolean;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    ttq?: TikTokPixel;
    rdt?: RedditPixelFunction;
  }
}

// Get tracking functions dynamically to ensure they're always current
const getFbq = (): FacebookPixelFunction | undefined => (typeof window !== 'undefined' ? window.fbq : undefined);

const getGtag = (): ((...args: unknown[]) => void) | undefined =>
  typeof window !== 'undefined' ? window.gtag : undefined;

const getTtq = (): TikTokPixel | undefined => (typeof window !== 'undefined' ? window.ttq : undefined);

const getRdt = (): RedditPixelFunction | undefined => (typeof window !== 'undefined' ? window.rdt : undefined);

// Helper function to safely insert scripts
const insertScript = (script: HTMLScriptElement): void => {
  const firstScript = document.getElementsByTagName('script')[0];
  if (firstScript?.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }
};

/**
 * Get tracking ID from constant with validation
 * Returns null if missing (no fallback)
 */
const getTrackingId = (trackingId: string | undefined, platform: string): string | null => {
  if (!trackingId || trackingId.trim() === '') {
    // Log warnings in non-production environments
    if (process.env.NEXT_PUBLIC_ENV !== 'production') {
      console.warn(`⚠️ ${platform} tracking ID not found in environment variables`);
    }
    return null;
  }
  return trackingId.trim();
};

/**
 * Get Google Ads conversion ID based on product category
 * Uses productCategory parameter if provided, otherwise gets from Redux store (from API)
 * Returns null if category cannot be determined
 */
const getGoogleAdsConversionId = (
  conversionType: 'ADD_TO_CART' | 'INITIATE_CHECKOUT' | 'PURCHASE' | 'FORM_SUBMISSION',
  productCategory?: ProductCategory
): string | null => {
  // Use productCategory parameter if provided, otherwise get from Redux store
  let finalProductCategory: ProductCategory | undefined = productCategory;

  // If productCategory not provided, try to get from Redux store
  if (!finalProductCategory && typeof window !== 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { store } = require('@/store');
      if (store && typeof store.getState === 'function') {
        const state = store.getState();
        const product = state?.productType;

        if (product?.category && typeof product.category === 'string') {
          const categoryLower = product.category.toLowerCase();

          if (categoryLower.includes('nad')) {
            finalProductCategory = 'longevity';
          } else if (categoryLower.includes('weight_loss') || categoryLower.includes('glp')) {
            finalProductCategory = 'weight_loss';
          }
        }
      }
    } catch {
      // Silently handle Redux store access error
    }
  }

  // Return null if category cannot be determined
  if (!finalProductCategory) {
    return null;
  }

  let conversionId: string | undefined;

  if (finalProductCategory === 'longevity') {
    // Use NAD+ specific conversion IDs
    switch (conversionType) {
      case 'ADD_TO_CART':
        conversionId = GOOGLE_ADS_CONVERSION_ADD_TO_CART_NAD;
        break;
      case 'INITIATE_CHECKOUT':
        conversionId = GOOGLE_ADS_CONVERSION_INITIATE_CHECKOUT_NAD;
        break;
      case 'PURCHASE':
        conversionId = GOOGLE_ADS_CONVERSION_PURCHASE_NAD;
        break;
      case 'FORM_SUBMISSION':
        conversionId = GOOGLE_ADS_CONVERSION_FORM_SUBMISSION_NAD;
        break;
    }
  } else if (finalProductCategory === 'weight_loss') {
    // Use GLP-1 conversion IDs
    switch (conversionType) {
      case 'ADD_TO_CART':
        conversionId = GOOGLE_ADS_CONVERSION_ADD_TO_CART;
        break;
      case 'INITIATE_CHECKOUT':
        conversionId = GOOGLE_ADS_CONVERSION_INITIATE_CHECKOUT;
        break;
      case 'PURCHASE':
        conversionId = GOOGLE_ADS_CONVERSION_PURCHASE;
        break;
      case 'FORM_SUBMISSION':
        conversionId = GOOGLE_ADS_CONVERSION_FORM_SUBMISSION;
        break;
    }
  }

  if (!conversionId) {
    return null;
  }

  const platform = finalProductCategory === 'longevity' ? 'Google Ads (NAD+)' : 'Google Ads (GLP-1)';
  const fullConversionId = getTrackingId(conversionId, `${platform} ${conversionType} Conversion`);

  return fullConversionId;
};

// Meta (Facebook) Pixel
export function metaTrackAddToCart(itemId: string, itemName: string, value: number, currency = 'USD'): void {
  try {
    // Check if tracking is enabled
    if (!isTrackingEnabled()) {
      return;
    }

    const metaPixelId = getTrackingId(META_PIXEL_ID, 'Meta Pixel');
    if (!metaPixelId) {
      return;
    }

    // Try to initialize Facebook pixel if not already done
    if (typeof window !== 'undefined' && !window.fbq) {
      // Create the pixel function
      window.fbq = function (...args: unknown[]) {
        const fbqFunc = window.fbq as FacebookPixelFunction;
        if (fbqFunc?.callMethod) {
          fbqFunc.callMethod(...args);
        } else if (fbqFunc?.queue) {
          fbqFunc.queue.push(args);
        }
      };

      const fbqInit = window.fbq as FacebookPixelFunction;
      fbqInit.queue = [];
      fbqInit.loaded = false;
      fbqInit.version = '2.0';

      // Load the Facebook pixel script
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      script.onload = function () {
        const fbq = window.fbq as FacebookPixelFunction;
        fbq.loaded = true;
        fbq('init', metaPixelId);
        fbq('track', 'PageView');

        // Now fire the AddToCart event
        fbq('track', 'AddToCart', {
          value: value,
          currency: currency,
          content_ids: [itemId],
          content_type: 'product',
          content_name: itemName,
        });

        if (typeof window !== 'undefined') {
          window.fbPixelReady = true;
        }
      };
      script.onerror = function () {
        console.error('📱 Failed to load Facebook pixel script');
      };

      insertScript(script);
      return; // Exit early, the event will fire when script loads
    }

    // If pixel is already available, fire the event
    const fbq = getFbq();

    if (typeof fbq === 'function') {
      fbq('track', 'AddToCart', {
        value: value,
        currency: currency,
        content_ids: [itemId],
        content_type: 'product',
        content_name: itemName,
      });
    }
  } catch (err) {
    console.error('Meta AddToCart tracking error:', err);
  }
}

// Google Ads
export function googleTrackAddToCart(
  itemId: string,
  itemName: string,
  value: number,
  currency = 'USD',
  productCategory?: ProductCategory
): void {
  try {
    // Check if tracking is enabled
    if (!isTrackingEnabled()) {
      return;
    }

    const googleAdsId = getTrackingId(GOOGLE_ADS_ID, 'Google Ads');
    const conversionId = getGoogleAdsConversionId('ADD_TO_CART', productCategory);
    if (!googleAdsId || !conversionId) {
      return;
    }

    // Try to initialize Google Ads if not already done
    if (typeof window !== 'undefined' && !window.gtag) {
      // Initialize dataLayer if it doesn't exist
      window.dataLayer = window.dataLayer || [];

      // Create the gtag function
      window.gtag = function (...args: unknown[]) {
        if (window.dataLayer) {
          window.dataLayer.push(args);
        }
      };

      // Load the Google Ads script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`;
      script.onload = function () {
        // Initialize Google Ads
        const gtag = window.gtag;
        if (gtag) {
          gtag('js', new Date());
          gtag('config', googleAdsId);

          // Now fire the AddToCart event
          const sendTo = `${googleAdsId}/${conversionId}`;
          gtag('event', 'conversion', {
            send_to: sendTo,
            value: value,
            currency: currency,
            items: [
              {
                item_id: itemId,
                item_name: itemName,
                price: value,
                quantity: 1,
              },
            ],
          });
        }
      };
      script.onerror = function () {
        console.error('Failed to load Google Ads script');
      };

      insertScript(script);
      return; // Exit early, the event will fire when script loads
    }

    // If gtag is already available, fire the event
    const gtag = getGtag();

    if (typeof gtag === 'function') {
      const sendTo = `${googleAdsId}/${conversionId}`;

      gtag('event', 'conversion', {
        send_to: sendTo,
        value: value,
        currency: currency,
        items: [
          {
            item_id: itemId,
            item_name: itemName,
            price: value,
            quantity: 1,
          },
        ],
      });
    }
  } catch (err) {
    console.error('Google AddToCart tracking error:', err);
  }
}

// TikTok Pixel
export function tiktokTrackAddToCart(itemId: string, itemName: string, value: number, currency = 'USD'): void {
  try {
    // Check if tracking is enabled
    if (!isTrackingEnabled()) {
      return;
    }

    const tiktokPixelId = getTrackingId(TIKTOK_PIXEL_ID, 'TikTok Pixel');
    if (!tiktokPixelId) {
      return;
    }

    // Try to initialize TikTok pixel if not already done
    if (typeof window !== 'undefined' && !window.ttq) {
      // Create the ttq object
      window.ttq = {
        track: function (event: string, params: unknown) {
          const ttqInstance = window.ttq as TikTokPixel;
          if (ttqInstance?.queue) {
            ttqInstance.queue.push([event, params]);
          }
        },
        queue: [],
      };

      // Load the TikTok pixel script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://analytics.tiktok.com/i18n/pixel/sdk.js?s=${tiktokPixelId}`;
      script.onload = function () {
        // Initialize TikTok pixel
        const ttq = window.ttq as TikTokPixel;
        if (ttq?.load) {
          ttq.load(tiktokPixelId);

          // Now fire the AddToCart event
          ttq.track('AddToCart', {
            contents: [
              {
                content_id: itemId,
                content_type: 'product',
                content_name: itemName,
              },
            ],
            value: value,
            currency: currency,
          });
        }
      };
      script.onerror = function () {
        console.error('Failed to load TikTok pixel script');
      };

      insertScript(script);
      return; // Exit early, the event will fire when script loads
    }

    // If ttq is already available, fire the event
    const ttq = getTtq();

    if (ttq && typeof ttq.track === 'function') {
      ttq.track('AddToCart', {
        contents: [
          {
            content_id: itemId,
            content_type: 'product',
            content_name: itemName,
          },
        ],
        value: value,
        currency: currency,
      });
    }
  } catch (err) {
    console.error('TikTok AddToCart tracking error:', err);
  }
}

// Reddit Pixel
export function redditTrackAddToCart(itemId: string, itemName: string, value: number, currency = 'USD'): void {
  try {
    // Check if tracking is enabled
    if (!isTrackingEnabled()) {
      return;
    }

    const redditPixelId = getTrackingId(REDDIT_PIXEL_ID, 'Reddit Pixel');
    if (!redditPixelId) {
      return;
    }

    // Try to initialize Reddit pixel if not already done
    if (typeof window !== 'undefined' && !window.rdt) {
      // Create the rdt function
      window.rdt = function (...args: unknown[]) {
        const rdtInstance = window.rdt as RedditPixelFunction;
        if (rdtInstance?.queue) {
          rdtInstance.queue.push(args);
        }
      };
      (window.rdt as RedditPixelFunction).queue = [];

      // Load the Reddit pixel script
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.redditstatic.com/ads/pixel.js';
      script.onload = function () {
        // Initialize Reddit pixel
        const rdt = window.rdt as RedditPixelFunction;
        rdt('init', redditPixelId);

        // Now fire the AddToCart event
        rdt('track', 'AddToCart', {
          value: value,
          currency: currency,
          itemId: itemId,
        });
      };
      script.onerror = function () {
        console.error('Failed to load Reddit pixel script');
      };

      insertScript(script);
      return; // Exit early, the event will fire when script loads
    }

    // If rdt is already available, fire the event
    const rdt = getRdt();

    if (typeof rdt === 'function') {
      rdt('track', 'AddToCart', {
        value: value,
        currency: currency,
        itemId: itemId,
      });
    }
  } catch (err) {
    console.error('Reddit AddToCart tracking error:', err);
  }
}

// Unified Add to Cart tracking
export interface AddToCartParams {
  itemId: string;
  itemName: string;
  value: number;
  currency?: string;
  productCategory?: ProductCategory;
  surveyCategory?: SurveyCategory;
}

export function trackAddToCart({ itemId, itemName, value, currency = 'USD', productCategory }: AddToCartParams): void {
  // Add a small delay to ensure pixel is ready
  setTimeout(() => {
    metaTrackAddToCart(itemId, itemName, value, currency);
    googleTrackAddToCart(itemId, itemName, value, currency, productCategory);
    tiktokTrackAddToCart(itemId, itemName, value, currency);
    redditTrackAddToCart(itemId, itemName, value, currency);
  }, 100);
}

// Unified Initiate Checkout tracking
export interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface InitiateCheckoutParams {
  value: number;
  currency?: string;
  items: CheckoutItem[];
  productCategory?: ProductCategory;
  surveyCategory?: SurveyCategory;
}

// Meta (Facebook) Pixel
export function metaTrackInitiateCheckout(value: number, currency = 'USD', items: CheckoutItem[]): void {
  try {
    // Check if tracking is enabled
    if (!isTrackingEnabled()) {
      return;
    }

    const metaPixelId = getTrackingId(META_PIXEL_ID, 'Meta Pixel');
    if (!metaPixelId) {
      return;
    }

    if (typeof window !== 'undefined' && !window.fbq) {
      // Dynamic init (same as AddToCart)
      window.fbq = function (...args: unknown[]) {
        const fbqFunc = window.fbq as FacebookPixelFunction;
        if (fbqFunc?.callMethod) {
          fbqFunc.callMethod(...args);
        } else if (fbqFunc?.queue) {
          fbqFunc.queue.push(args);
        }
      };
      const fbqInit = window.fbq as FacebookPixelFunction;
      fbqInit.queue = [];
      fbqInit.loaded = false;
      fbqInit.version = '2.0';

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      script.onload = function () {
        const fbq = window.fbq as FacebookPixelFunction;
        fbq.loaded = true;
        fbq('init', metaPixelId);
        fbq('track', 'PageView');
        fbq('track', 'InitiateCheckout', {
          value,
          currency,
          content_ids: items.map((i) => i.id),
          content_type: 'product',
          num_items: items.length,
        });

        if (typeof window !== 'undefined') {
          window.fbPixelReady = true;
        }
      };
      script.onerror = function () {
        console.error('📱 Failed to load Facebook pixel script');
      };
      insertScript(script);
      return;
    }

    const fbq = getFbq();
    if (typeof fbq === 'function') {
      fbq('track', 'InitiateCheckout', {
        value,
        currency,
        content_ids: items.map((i) => i.id),
        content_type: 'product',
        num_items: items.length,
      });
    }
  } catch (err) {
    console.error('Meta InitiateCheckout tracking error:', err);
  }
}

// Google Ads
export function googleTrackInitiateCheckout(
  value: number,
  currency = 'USD',
  items: CheckoutItem[],
  productCategory?: ProductCategory
): void {
  try {
    // Check if tracking is enabled
    if (!isTrackingEnabled()) {
      return;
    }

    const googleAdsId = getTrackingId(GOOGLE_ADS_ID, 'Google Ads');
    const conversionId = getGoogleAdsConversionId('INITIATE_CHECKOUT', productCategory);
    if (!googleAdsId || !conversionId) {
      return;
    }
    if (typeof window !== 'undefined' && !window.gtag) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function (...args: unknown[]) {
        if (window.dataLayer) {
          window.dataLayer.push(args);
        }
      };
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`;
      script.onload = function () {
        const gtag = window.gtag;
        if (gtag) {
          gtag('js', new Date());
          gtag('config', googleAdsId);
          const sendTo = `${googleAdsId}/${conversionId}`;
          gtag('event', 'conversion', {
            send_to: sendTo,
            value: value,
            currency: currency,
            items: items.map((i) => ({
              item_id: i.id,
              item_name: i.name,
              price: i.price,
              quantity: i.quantity || 1,
            })),
          });
        }
      };
      script.onerror = function () {
        console.error('Failed to load Google Ads script');
      };
      insertScript(script);
      return;
    }

    const gtag = getGtag();
    if (typeof gtag === 'function') {
      const sendTo = `${googleAdsId}/${conversionId}`;
      gtag('event', 'conversion', {
        send_to: sendTo,
        value: value,
        currency: currency,
        items: items.map((i) => ({
          item_id: i.id,
          item_name: i.name,
          price: i.price,
          quantity: i.quantity || 1,
        })),
      });
    }
  } catch (err) {
    console.error('Google InitiateCheckout tracking error:', err);
  }
}

// TikTok Pixel
export function tiktokTrackInitiateCheckout(value: number, currency = 'USD', items: CheckoutItem[]): void {
  try {
    // Check if tracking is enabled
    if (!isTrackingEnabled()) {
      return;
    }

    const tiktokPixelId = getTrackingId(TIKTOK_PIXEL_ID, 'TikTok Pixel');
    if (!tiktokPixelId) {
      return;
    }

    if (typeof window !== 'undefined' && !window.ttq) {
      window.ttq = {
        track: function (event: string, params: unknown) {
          const ttqInstance = window.ttq as TikTokPixel;
          if (ttqInstance?.queue) {
            ttqInstance.queue.push([event, params]);
          }
        },
        queue: [],
      };
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://analytics.tiktok.com/i18n/pixel/sdk.js?s=${tiktokPixelId}`;
      script.onload = function () {
        const ttq = window.ttq as TikTokPixel;
        if (ttq?.load) {
          ttq.load(tiktokPixelId);
          ttq.track('InitiateCheckout', {
            contents: items.map((i) => ({
              content_id: i.id,
              content_type: 'product',
              content_name: i.name,
            })),
            value: value,
            currency: currency,
          });
        }
      };
      script.onerror = function () {
        console.error('Failed to load TikTok pixel script');
      };
      insertScript(script);
      return;
    }

    const ttq = getTtq();
    if (ttq && typeof ttq.track === 'function') {
      ttq.track('InitiateCheckout', {
        contents: items.map((i) => ({
          content_id: i.id,
          content_type: 'product',
          content_name: i.name,
        })),
        value: value,
        currency: currency,
      });
    }
  } catch (err) {
    console.error('TikTok InitiateCheckout tracking error:', err);
  }
}

// Reddit Pixel
export function redditTrackInitiateCheckout(value: number, currency = 'USD'): void {
  try {
    // Check if tracking is enabled
    if (!isTrackingEnabled()) {
      return;
    }

    const redditPixelId = getTrackingId(REDDIT_PIXEL_ID, 'Reddit Pixel');
    if (!redditPixelId) {
      return;
    }

    if (typeof window !== 'undefined' && !window.rdt) {
      window.rdt = function (...args: unknown[]) {
        const rdtInstance = window.rdt as RedditPixelFunction;
        if (rdtInstance?.queue) {
          rdtInstance.queue.push(args);
        }
      };
      (window.rdt as RedditPixelFunction).queue = [];
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.redditstatic.com/ads/pixel.js';
      script.onload = function () {
        const rdt = window.rdt as RedditPixelFunction;
        rdt('init', redditPixelId);
        rdt('track', 'InitiateCheckout', {
          value: value,
          currency: currency,
        });
      };
      script.onerror = function () {
        console.error('Failed to load Reddit pixel script');
      };
      insertScript(script);
      return;
    }
    const rdt = getRdt();
    if (typeof rdt === 'function') {
      rdt('track', 'InitiateCheckout', {
        value: value,
        currency: currency,
      });
    }
  } catch (err) {
    console.error('Reddit InitiateCheckout tracking error:', err);
  }
}

export function trackInitiateCheckout({
  value,
  currency = 'USD',
  items,
  productCategory,
}: InitiateCheckoutParams): void {
  setTimeout(() => {
    metaTrackInitiateCheckout(value, currency, items);
    googleTrackInitiateCheckout(value, currency, items, productCategory);
    tiktokTrackInitiateCheckout(value, currency, items);
    redditTrackInitiateCheckout(value, currency);
  }, 100);
}

// ============================================
// FORM SUBMISSION TRACKING FUNCTIONS
// ============================================

export interface FormSubmissionParams {
  formName: string;
  productCategory?: ProductCategory;
  surveyCategory?: SurveyCategory;
}

export function metaTrackFormSubmission(formName: string): void {
  try {
    // Check if tracking is enabled
    if (!isTrackingEnabled()) {
      return;
    }

    const metaPixelId = getTrackingId(META_PIXEL_ID, 'Meta Pixel');
    if (!metaPixelId) {
      return;
    }

    // Dynamic initialization logic similar to metaTrackAddToCart
    if (typeof window !== 'undefined' && !window.fbq) {
      window.fbq = function (...args: unknown[]) {
        const fbqFunc = window.fbq as FacebookPixelFunction;
        if (fbqFunc?.callMethod) {
          fbqFunc.callMethod(...args);
        } else if (fbqFunc?.queue) {
          fbqFunc.queue.push(args);
        }
      };
      const fbqInit = window.fbq as FacebookPixelFunction;
      fbqInit.queue = [];
      fbqInit.loaded = false;
      fbqInit.version = '2.0';

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      script.onload = function () {
        const fbq = window.fbq as FacebookPixelFunction;
        fbq.loaded = true;
        fbq('init', metaPixelId);
        fbq('track', 'PageView');
        fbq('track', 'Lead', {
          content_name: formName,
        });

        if (typeof window !== 'undefined') {
          window.fbPixelReady = true;
        }
      };
      script.onerror = function () {
        console.error('Failed to load Facebook pixel script for FormSubmission');
      };
      insertScript(script);
      return;
    }

    const fbq = getFbq();
    if (typeof fbq === 'function') {
      fbq('track', 'Lead', {
        content_name: formName,
      });
    }
  } catch (err) {
    console.error('Meta FormSubmission tracking error:', err);
  }
}

export function googleTrackFormSubmission(formName: string, productCategory?: ProductCategory): void {
  try {
    // Check if tracking is enabled
    if (!isTrackingEnabled()) {
      return;
    }

    const googleAdsId = getTrackingId(GOOGLE_ADS_ID, 'Google Ads');
    const conversionId = getGoogleAdsConversionId('FORM_SUBMISSION', productCategory);
    if (!googleAdsId || !conversionId) {
      return;
    }
    // Dynamic initialization logic similar to googleTrackAddToCart
    if (typeof window !== 'undefined' && !window.gtag) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function (...args: unknown[]) {
        if (window.dataLayer) {
          window.dataLayer.push(args);
        }
      };
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`;
      script.onload = function () {
        const gtag = window.gtag;
        if (gtag) {
          gtag('js', new Date());
          gtag('config', googleAdsId);
          const sendTo = `${googleAdsId}/${conversionId}`;
          gtag('event', 'conversion', {
            send_to: sendTo,
          });
        }
      };
      script.onerror = function () {
        console.error('Failed to load Google Ads script for FormSubmission');
      };
      insertScript(script);
      return;
    }

    const gtag = getGtag();
    if (typeof gtag === 'function') {
      const sendTo = `${googleAdsId}/${conversionId}`;
      gtag('event', 'conversion', {
        send_to: sendTo,
      });
    }
  } catch (err) {
    console.error('Google FormSubmission tracking error:', err);
  }
}

export function tiktokTrackFormSubmission(formName: string): void {
  try {
    // Check if tracking is enabled
    if (!isTrackingEnabled()) {
      return;
    }

    const tiktokPixelId = getTrackingId(TIKTOK_PIXEL_ID, 'TikTok Pixel');
    if (!tiktokPixelId) {
      return;
    }

    // Dynamic initialization logic similar to tiktokTrackAddToCart
    if (typeof window !== 'undefined' && !window.ttq) {
      window.ttq = {
        track: function (event: string, params: unknown) {
          const ttqInstance = window.ttq as TikTokPixel;
          if (ttqInstance?.queue) {
            ttqInstance.queue.push([event, params]);
          }
        },
        queue: [],
      };
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://analytics.tiktok.com/i18n/pixel/sdk.js?s=${tiktokPixelId}`;
      script.onload = function () {
        const ttq = window.ttq as TikTokPixel;
        if (ttq?.load) {
          ttq.load(tiktokPixelId);
          ttq.track('Contact', {
            contents: [
              {
                content_type: 'form',
                content_name: formName,
              },
            ],
          });
        }
      };
      script.onerror = function () {
        console.error('Failed to load TikTok pixel script for FormSubmission');
      };
      insertScript(script);
      return;
    }

    const ttq = getTtq();
    if (ttq && typeof ttq.track === 'function') {
      ttq.track('Contact', {
        contents: [
          {
            content_type: 'form',
            content_name: formName,
          },
        ],
      });
    }
  } catch (err) {
    console.error('TikTok FormSubmission tracking error:', err);
  }
}

export function redditTrackFormSubmission(): void {
  try {
    // Check if tracking is enabled
    if (!isTrackingEnabled()) {
      return;
    }

    const redditPixelId = getTrackingId(REDDIT_PIXEL_ID, 'Reddit Pixel');
    if (!redditPixelId) {
      return;
    }

    // Dynamic initialization logic similar to redditTrackAddToCart
    if (typeof window !== 'undefined' && !window.rdt) {
      window.rdt = function (...args: unknown[]) {
        const rdtInstance = window.rdt as RedditPixelFunction;
        if (rdtInstance?.queue) {
          rdtInstance.queue.push(args);
        }
      };
      (window.rdt as RedditPixelFunction).queue = [];
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.redditstatic.com/ads/pixel.js';
      script.onload = function () {
        const rdt = window.rdt as RedditPixelFunction;
        rdt('init', redditPixelId);
        rdt('track', 'Lead', {});
      };
      script.onerror = function () {
        console.error('Failed to load Reddit pixel script for FormSubmission');
      };
      insertScript(script);
      return;
    }

    const rdt = getRdt();
    if (typeof rdt === 'function') {
      rdt('track', 'Lead', {});
    }
  } catch (err) {
    console.error('Reddit FormSubmission tracking error:', err);
  }
}

export function trackFormSubmission({ formName, productCategory }: FormSubmissionParams): void {
  setTimeout(() => {
    metaTrackFormSubmission(formName);
    googleTrackFormSubmission(formName, productCategory);
    tiktokTrackFormSubmission(formName);
    redditTrackFormSubmission();
    ga4TrackGenerateLead(productCategory);
  }, 100);
}

// ============================================
// PURCHASE TRACKING FUNCTIONS
// ============================================

export interface PurchaseParams {
  transactionId: string;
  value: number;
  currency?: string;
  items: CheckoutItem[];
  productCategory?: ProductCategory;
  surveyCategory?: SurveyCategory;
}

export function metaTrackPurchase(transactionId: string, value: number, currency = 'USD', items: CheckoutItem[]): void {
  try {
    // Check if tracking is enabled
    if (!isTrackingEnabled()) {
      return;
    }

    const metaPixelId = getTrackingId(META_PIXEL_ID, 'Meta Pixel');
    if (!metaPixelId) {
      return;
    }

    // Dynamic initialization logic similar to metaTrackAddToCart
    if (typeof window !== 'undefined' && !window.fbq) {
      window.fbq = function (...args: unknown[]) {
        const fbqFunc = window.fbq as FacebookPixelFunction;
        if (fbqFunc?.callMethod) {
          fbqFunc.callMethod(...args);
        } else if (fbqFunc?.queue) {
          fbqFunc.queue.push(args);
        }
      };
      const fbqInit = window.fbq as FacebookPixelFunction;
      fbqInit.queue = [];
      fbqInit.loaded = false;
      fbqInit.version = '2.0';

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      script.onload = function () {
        const fbq = window.fbq as FacebookPixelFunction;
        fbq.loaded = true;
        fbq('init', metaPixelId);
        fbq('track', 'PageView');
        fbq('track', 'Purchase', {
          value: value,
          currency: currency,
          transaction_id: transactionId,
          content_ids: items.map((item) => item.id),
          content_type: 'product',
          num_items: items.length,
        });

        if (typeof window !== 'undefined') {
          window.fbPixelReady = true;
        }
      };
      script.onerror = function () {
        console.error('Failed to load Facebook pixel script for Purchase');
      };
      insertScript(script);
      return;
    }

    const fbq = getFbq();
    if (typeof fbq === 'function') {
      console.log('PRICE SENT IN FACEBOOK PURCHASE TRACKING FUNCTION IN TRACKING.TS ===>', value);
      fbq('track', 'Purchase', {
        value: value,
        currency: currency,
        transaction_id: transactionId,
        content_ids: items.map((item) => item.id),
        content_type: 'product',
        num_items: items.length,
      });
    }
  } catch (err) {
    console.error('Meta Purchase tracking error:', err);
  }
}

export function googleTrackPurchase(
  transactionId: string,
  value: number,
  currency = 'USD',
  productCategory?: ProductCategory
): void {
  try {
    // Check if tracking is enabled
    if (!isTrackingEnabled()) {
      return;
    }

    const googleAdsId = getTrackingId(GOOGLE_ADS_ID, 'Google Ads');
    const conversionId = getGoogleAdsConversionId('PURCHASE', productCategory);
    if (!googleAdsId || !conversionId) {
      return;
    }
    // Dynamic initialization logic similar to googleTrackAddToCart
    if (typeof window !== 'undefined' && !window.gtag) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function (...args: unknown[]) {
        if (window.dataLayer) {
          window.dataLayer.push(args);
        }
      };
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`;
      script.onload = function () {
        const gtag = window.gtag;
        if (gtag) {
          gtag('js', new Date());
          gtag('config', googleAdsId);
          const sendTo = `${googleAdsId}/${conversionId}`;
          gtag('event', 'conversion', {
            send_to: sendTo,
            value: value,
            currency: currency,
            transaction_id: transactionId,
          });
        }
      };
      script.onerror = function () {
        console.error('Failed to load Google Ads script for Purchase');
      };
      insertScript(script);
      return;
    }
    const gtag = getGtag();
    if (typeof gtag === 'function') {
      console.log('PRICE SENT IN GOOGLE PURCHASE TRACKING FUNCTION IN TRACKING.TS ===>', value);
      const sendTo = `${googleAdsId}/${conversionId}`;
      gtag('event', 'conversion', {
        send_to: sendTo,
        value: value,
        currency: currency,
        transaction_id: transactionId,
      });
    }
  } catch (err) {
    console.error('Google Purchase tracking error:', err);
  }
}

export function tiktokTrackPurchase(transactionId: string, value: number, currency = 'USD'): void {
  try {
    // Check if tracking is enabled
    if (!isTrackingEnabled()) {
      return;
    }

    const tiktokPixelId = getTrackingId(TIKTOK_PIXEL_ID, 'TikTok Pixel');
    if (!tiktokPixelId) {
      return;
    }

    // Dynamic initialization logic similar to tiktokTrackAddToCart
    if (typeof window !== 'undefined' && !window.ttq) {
      window.ttq = {
        track: function (event: string, params: unknown) {
          const ttqInstance = window.ttq as TikTokPixel;
          if (ttqInstance?.queue) {
            ttqInstance.queue.push([event, params]);
          }
        },
        queue: [],
      };
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://analytics.tiktok.com/i18n/pixel/sdk.js?s=${tiktokPixelId}`;
      script.onload = function () {
        const ttq = window.ttq as TikTokPixel;
        if (ttq?.load) {
          ttq.load(tiktokPixelId);
          ttq.track('CompletePayment', {
            value: value,
            currency: currency,
          });
        }
      };
      script.onerror = function () {
        console.error('Failed to load TikTok pixel script for Purchase');
      };
      insertScript(script);
      return;
    }
    const ttq = getTtq();
    if (ttq && typeof ttq.track === 'function') {
      ttq.track('CompletePayment', {
        value: value,
        currency: currency,
      });
    }
  } catch (err) {
    console.error('TikTok Purchase tracking error:', err);
  }
}

export function redditTrackPurchase(transactionId: string, value: number, currency = 'USD'): void {
  try {
    // Check if tracking is enabled
    if (!isTrackingEnabled()) {
      return;
    }

    const redditPixelId = getTrackingId(REDDIT_PIXEL_ID, 'Reddit Pixel');
    if (!redditPixelId) {
      return;
    }

    // Dynamic initialization logic similar to redditTrackAddToCart
    if (typeof window !== 'undefined' && !window.rdt) {
      window.rdt = function (...args: unknown[]) {
        const rdtInstance = window.rdt as RedditPixelFunction;
        if (rdtInstance?.queue) {
          rdtInstance.queue.push(args);
        }
      };
      (window.rdt as RedditPixelFunction).queue = [];
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.redditstatic.com/ads/pixel.js';
      script.onload = function () {
        const rdt = window.rdt as RedditPixelFunction;
        rdt('init', redditPixelId);
        rdt('track', 'Purchase', {
          value: value,
          currency: currency,
          transactionId: transactionId,
        });
      };
      script.onerror = function () {
        console.error('Failed to load Reddit pixel script for Purchase');
      };
      insertScript(script);
      return;
    }

    const rdt = getRdt();
    if (typeof rdt === 'function') {
      rdt('track', 'Purchase', {
        value: value,
        currency: currency,
        transactionId: transactionId,
      });
    }
  } catch (err) {
    console.error('Reddit Purchase tracking error:', err);
  }
}

export function trackPurchase({
  transactionId,
  value,
  currency = 'USD',
  items,
  productCategory,
}: PurchaseParams): void {
  // value iS in cents and should be converted to dollars before sending to the tracking functions
  const formattedValue = Number((value / 100).toFixed(2));
  console.log('FORMATTED VALUE IN TRACK PURCHASE FUNCTION IN TRACKING.TS ===>', formattedValue);
  setTimeout(() => {
    metaTrackPurchase(transactionId, formattedValue, currency, items);
    googleTrackPurchase(transactionId, formattedValue, currency, productCategory);
    ga4TrackPurchase(transactionId, formattedValue, currency, items);
    tiktokTrackPurchase(transactionId, formattedValue, currency);
    redditTrackPurchase(transactionId, formattedValue, currency);
  }, 100);
}

// ============================================
// GA4 TRACKING FUNCTIONS
// ============================================

export function ga4TrackPurchase(transactionId: string, value: number, currency = 'USD', items: CheckoutItem[]): void {
  try {
    // Check if tracking is enabled
    if (!isTrackingEnabled()) {
      return;
    }

    // Check if gtag is available
    if (typeof window !== 'undefined' && window.gtag) {
      console.log('PRICE SENT IN GA4 PURCHASE TRACKING FUNCTION IN TRACKING.TS ===>', value);
      // Fire GA4 purchase event
      window.gtag('event', 'purchase', {
        transaction_id: transactionId,
        value: value,
        currency: currency,
        items: items.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
        })),
      });
    }
  } catch (err) {
    console.error('GA4 Purchase tracking error:', err);
  }
}

export function ga4TrackGenerateLead(productCategory?: ProductCategory): void {
  try {
    // Check if tracking is enabled
    if (!isTrackingEnabled()) {
      return;
    }

    // Determine form details based on productCategory
    const formId = productCategory === 'longevity' ? 'nad_quiz' : 'glp1_quiz';
    const formName = productCategory === 'longevity' ? 'NAD+ Eligibility Quiz' : 'GLP-1 Eligibility Quiz';
    const leadType = productCategory === 'longevity' ? 'longevity_program' : 'weight_loss_program';

    // Check if gtag is available
    if (typeof window !== 'undefined' && window.gtag) {
      // Fire GA4 generate_lead event
      window.gtag('event', 'generate_lead', {
        value: 0,
        currency: 'USD',
        form_id: formId,
        form_name: formName,
        lead_type: leadType,
        method: 'online_form',
      });
    }
  } catch (err) {
    console.error('GA4 Generate Lead tracking error:', err);
  }
}
