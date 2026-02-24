import { isTrackingEnabled, MICROSOFT_UET_ID } from '@/constants/tracking';

/**
 * Microsoft UET (Universal Event Tracking) Helper Functions
 *
 * This module provides helper functions for tracking conversions and events
 * using Microsoft Advertising's UET tags.
 */

export interface UETItem {
  id: string;
  name: string;
  price: number;
  quantity?: number;
}

/**
 * Get UET ID from constant with validation
 * Returns null if missing (no fallback)
 */
const getUetId = (): string | null => {
  if (!MICROSOFT_UET_ID || MICROSOFT_UET_ID.trim() === '') {
    // Log warnings in non-production environments
    if (process.env.NEXT_PUBLIC_ENV !== 'production') {
      console.warn('⚠️ Microsoft UET ID not found in environment variables');
    }
    return null;
  }
  return MICROSOFT_UET_ID.trim();
};

/**
 * Get flow parameter from URL
 * Returns "product_first_approach" if flow=pfa, otherwise "survey_first_approach"
 */
function getFlowFromURL(): string {
  if (typeof window === 'undefined') {
    if (process.env.NEXT_PUBLIC_ENV !== 'production') {
      console.log('🎯 getFlowFromURL: window undefined, using default');
    }
    return 'survey_first_approach';
  }

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const flow = urlParams.get('flow')?.toLowerCase();
    
    if (process.env.NEXT_PUBLIC_ENV !== 'production') {
      console.log('🎯 getFlowFromURL: detected flow from URL:', flow);
    }
    
    if (flow === 'pfa') {
      if (process.env.NEXT_PUBLIC_ENV !== 'production') {
        console.log('🎯 getFlowFromURL: returning product_first_approach');
      }
      return 'product_first_approach';
    }
    
    if (process.env.NEXT_PUBLIC_ENV !== 'production') {
      console.log('🎯 getFlowFromURL: returning survey_first_approach (default)');
    }
    return 'survey_first_approach'; // Default
  } catch (error) {
    if (process.env.NEXT_PUBLIC_ENV !== 'production') {
      console.warn('🎯 Error getting flow from URL:', error);
    }
    return 'survey_first_approach'; // Default on error
  }
}

/**
 * Microsoft UET Purchase Tracking
 * Matches client's exact implementation with Enhanced Conversions support
 */
export async function microsoftTrackPurchase(
  transactionId: string,
  value: number,
  currency: string = 'USD',
  items: UETItem[] = [],
  userEmail?: string,
  userPhone?: string,
  flow?: string
): Promise<void> {
  try {
    // Check if tracking is enabled
    if (!isTrackingEnabled()) {
      return;
    }

    const uetId = getUetId();
    if (!uetId) {
      return;
    }

    if (process.env.NEXT_PUBLIC_ENV !== 'production') {
      console.log('🎯 Microsoft UET Purchase tracking started:', { transactionId, value, currency });
    }

    // Environment check with detailed logging
    if (globalThis.window === undefined) {
      if (process.env.NEXT_PUBLIC_ENV !== 'production') {
        console.warn('🎯 UET tracking skipped - not in browser environment');
      }
      return;
    }

    // Deduplication: Prevent tracking the same transaction ID multiple times
    const trackingKey = `uet_purchase_${transactionId}`;
    try {
      const alreadyTracked = sessionStorage.getItem(trackingKey);
      if (alreadyTracked === 'true') {
        if (process.env.NEXT_PUBLIC_ENV !== 'production') {
          console.warn('🎯 UET Purchase already tracked for transaction:', transactionId, '- skipping duplicate');
        }
        return;
      }
      sessionStorage.setItem(trackingKey, 'true');
    } catch (storageError) {
      // If sessionStorage is not available, continue anyway
      if (process.env.NEXT_PUBLIC_ENV !== 'production') {
        console.warn('🎯 Could not check tracking deduplication:', storageError);
      }
    }

    // UET availability check with fallback
    if (!globalThis.window.uetq) {
      if (process.env.NEXT_PUBLIC_ENV !== 'production') {
        console.warn('🎯 UET not available - initializing queue manually');
      }
      try {
        globalThis.window.uetq = globalThis.window.uetq || [];
      } catch (initError) {
        console.error('🎯 UET queue initialization failed:', initError);
        return;
      }
    }

    // Parameter validation with detailed error messages
    if (!transactionId || typeof transactionId !== 'string' || transactionId.trim() === '') {
      console.error('🎯 UET Purchase tracking failed - transactionId is required and must be a non-empty string');
      return;
    }

    if (value === undefined || value === null || Number.isNaN(value) || value < 0) {
      console.error('🎯 UET Purchase tracking failed - valid positive value is required, got:', value);
      return;
    }

    if (!currency || typeof currency !== 'string' || currency.trim() === '') {
      console.error('🎯 UET Purchase tracking failed - valid currency is required');
      return;
    }

    // Validate items array
    if (!Array.isArray(items)) {
      if (process.env.NEXT_PUBLIC_ENV !== 'production') {
        console.warn('🎯 UET Purchase - items is not an array, using empty array');
      }
      items = [];
    }

    // Get flow from parameter or URL
    const flowValue = flow || getFlowFromURL();

    // Build event data with validation
    const eventData = {
      revenue_value: Number(value),
      currency: String(currency),
      transaction_id: String(transactionId),
      flow: flowValue,
      items: items.map((item) => {
        try {
          return {
            id: String(item.id || ''),
            name: String(item.name || ''),
            price: Number(item.price || 0),
            quantity: Number(item.quantity || 1),
          };
        } catch (itemError) {
          console.error('🎯 UET Purchase - error processing item:', itemError, item);
          return {
            id: 'unknown',
            name: 'Unknown Item',
            price: 0,
            quantity: 1,
          };
        }
      }),
    };

    // Set Enhanced Conversions if user data is provided
    if (userEmail) {
      try {
        await microsoftSetEnhancedConversion(userEmail, userPhone || '', false);
      } catch (enhancedError) {
        console.error('🎯 Enhanced Conversions error during Purchase:', enhancedError);
        // Continue with regular tracking even if enhanced conversions fail
      }
    }

    // Push event with comprehensive error handling
    try {
      if (process.env.NEXT_PUBLIC_ENV !== 'production') {
        console.log('🎯 About to push Purchase event with flow:', flowValue);
        console.log('🎯 Complete eventData being sent:', JSON.stringify(eventData, null, 2));
      }
      globalThis.window.uetq.push('event', 'Purchase', eventData);
      if (process.env.NEXT_PUBLIC_ENV !== 'production') {
        console.log('🎯 Microsoft UET Purchase tracked successfully:', {
          transactionId,
          value,
          currency,
          flow: flowValue,
          enhancedConversions: !!userEmail,
        });
      }
    } catch (pushError) {
      console.error('🎯 UET Purchase push error:', pushError);
      console.error('🎯 Event data that failed:', eventData);
      // Don't throw - just log the error and continue
    }
  } catch (error) {
    console.error('🎯 Microsoft UET Purchase tracking error:', error);
    // Don't throw - prevent website crashes
  }
}

/**
 * Microsoft UET Add to Cart Tracking
 * Matches client's exact implementation
 */
export function microsoftTrackAddToCart(
  itemId: string,
  itemName: string,
  value: number,
  currency: string = 'USD',
  flow?: string
): void {
  try {
    // Check if tracking is enabled
    if (!isTrackingEnabled()) {
      return;
    }

    const uetId = getUetId();
    if (!uetId) {
      return;
    }

    if (process.env.NEXT_PUBLIC_ENV !== 'production') {
      console.log('🎯 Microsoft UET AddToCart tracking started:', { itemId, itemName, value, currency });
    }

    // Environment check with detailed logging
    if (globalThis.window === undefined) {
      if (process.env.NEXT_PUBLIC_ENV !== 'production') {
        console.warn('🎯 UET tracking skipped - not in browser environment');
      }
      return;
    }

    // UET availability check with fallback
    if (!globalThis.window.uetq) {
      if (process.env.NEXT_PUBLIC_ENV !== 'production') {
        console.warn('🎯 UET not available - initializing queue manually');
      }
      try {
        globalThis.window.uetq = globalThis.window.uetq || [];
      } catch (initError) {
        console.error('🎯 UET queue initialization failed:', initError);
        return;
      }
    }

    // Parameter validation with detailed error messages
    if (!itemId || typeof itemId !== 'string' || itemId.trim() === '') {
      console.error('🎯 UET AddToCart tracking failed - itemId is required and must be a non-empty string');
      return;
    }

    if (!itemName || typeof itemName !== 'string' || itemName.trim() === '') {
      console.error('🎯 UET AddToCart tracking failed - itemName is required and must be a non-empty string');
      return;
    }

    if (value === undefined || value === null || Number.isNaN(value) || value < 0) {
      console.error('🎯 UET AddToCart tracking failed - valid positive value is required, got:', value);
      return;
    }

    if (!currency || typeof currency !== 'string' || currency.trim() === '') {
      console.error('🎯 UET AddToCart tracking failed - valid currency is required');
      return;
    }

    // Get flow from parameter or URL
    const flowValue = flow || getFlowFromURL();

    // Build event data with validation
    const eventData = {
      revenue_value: Number(value),
      currency: String(currency),
      flow: flowValue,
      items: [
        {
          id: String(itemId),
          name: String(itemName),
          price: Number(value),
          quantity: 1,
        },
      ],
    };

    // Push event with comprehensive error handling
    try {
      if (process.env.NEXT_PUBLIC_ENV !== 'production') {
        console.log('🎯 About to push AddToCart event with flow:', flowValue);
        console.log('🎯 Complete eventData being sent:', JSON.stringify(eventData, null, 2));
      }
      globalThis.window.uetq.push('event', 'add_to_cart', eventData);
      if (process.env.NEXT_PUBLIC_ENV !== 'production') {
        console.log('🎯 Microsoft UET AddToCart tracked successfully:', { itemId, itemName, value, currency, flow: flowValue });
      }
    } catch (pushError) {
      console.error('🎯 UET AddToCart push error:', pushError);
      console.error('🎯 Event data that failed:', eventData);
      // Don't throw - just log the error and continue
    }
  } catch (error) {
    console.error('🎯 Microsoft UET AddToCart tracking error:', error);
    // Don't throw - prevent website crashes
  }
}

/**
 * Microsoft UET Initiate Checkout Tracking
 * Matches client's exact implementation
 */
export function microsoftTrackInitiateCheckout(
  value: number,
  currency: string = 'USD',
  items: UETItem[] = [],
  flow?: string
): void {
  try {
    // Check if tracking is enabled
    if (!isTrackingEnabled()) {
      return;
    }

    const uetId = getUetId();
    if (!uetId) {
      return;
    }

    if (process.env.NEXT_PUBLIC_ENV !== 'production') {
      console.log('🎯 Microsoft UET InitiateCheckout tracking started:', { value, currency });
    }

    // Environment check with detailed logging
    if (globalThis.window === undefined) {
      if (process.env.NEXT_PUBLIC_ENV !== 'production') {
        console.warn('🎯 UET tracking skipped - not in browser environment');
      }
      return;
    }

    // UET availability check with fallback
    if (!globalThis.window.uetq) {
      if (process.env.NEXT_PUBLIC_ENV !== 'production') {
        console.warn('🎯 UET not available - initializing queue manually');
      }
      try {
        globalThis.window.uetq = globalThis.window.uetq || [];
      } catch (initError) {
        console.error('🎯 UET queue initialization failed:', initError);
        return;
      }
    }

    // Parameter validation with detailed error messages
    if (value === undefined || value === null || Number.isNaN(value) || value < 0) {
      console.error('🎯 UET InitiateCheckout tracking failed - valid positive value is required, got:', value);
      return;
    }

    if (!currency || typeof currency !== 'string' || currency.trim() === '') {
      console.error('🎯 UET InitiateCheckout tracking failed - valid currency is required');
      return;
    }

    // Validate items array
    if (!Array.isArray(items)) {
      if (process.env.NEXT_PUBLIC_ENV !== 'production') {
        console.warn('🎯 UET InitiateCheckout - items is not an array, using empty array');
      }
      items = [];
    }

    // Get flow from parameter or URL
    const flowValue = flow || getFlowFromURL();

    // Build event data with validation
    const eventData = {
      revenue_value: Number(value),
      currency: String(currency),
      flow: flowValue,
      items: items.map((item) => {
        try {
          return {
            id: String(item.id || ''),
            name: String(item.name || ''),
            price: Number(item.price || 0),
            quantity: Number(item.quantity || 1),
          };
        } catch (itemError) {
          console.error('🎯 UET InitiateCheckout - error processing item:', itemError, item);
          return {
            id: 'unknown',
            name: 'Unknown Item',
            price: 0,
            quantity: 1,
          };
        }
      }),
    };

    // Push event with comprehensive error handling
    try {
      if (process.env.NEXT_PUBLIC_ENV !== 'production') {
        console.log('🎯 About to push InitiateCheckout event with flow:', flowValue);
        console.log('🎯 Complete eventData being sent:', JSON.stringify(eventData, null, 2));
      }
      globalThis.window.uetq.push('event', 'begin_checkout', eventData);
      if (process.env.NEXT_PUBLIC_ENV !== 'production') {
        console.log('🎯 Microsoft UET InitiateCheckout tracked successfully:', { value, currency, flow: flowValue });
      }
    } catch (pushError) {
      console.error('🎯 UET InitiateCheckout push error:', pushError);
      console.error('🎯 Event data that failed:', eventData);
      // Don't throw - just log the error and continue
    }
  } catch (error) {
    console.error('🎯 Microsoft UET InitiateCheckout tracking error:', error);
    // Don't throw - prevent website crashes
  }
}

/**
 * Microsoft UET Form Submission Tracking
 * Matches client's exact implementation with Enhanced Conversions support
 */
export async function microsoftTrackFormSubmission(
  formName: string,
  leadValue: number = 0,
  userEmail?: string,
  userPhone?: string,
  flow?: string
): Promise<void> {
  try {
    // Check if tracking is enabled
    if (!isTrackingEnabled()) {
      return;
    }

    const uetId = getUetId();
    if (!uetId) {
      return;
    }

    if (process.env.NEXT_PUBLIC_ENV !== 'production') {
      console.log('🎯 Microsoft UET FormSubmission tracking started:', { formName, leadValue });
    }

    // Environment check with detailed logging
    if (globalThis.window === undefined) {
      if (process.env.NEXT_PUBLIC_ENV !== 'production') {
        console.warn('🎯 UET tracking skipped - not in browser environment');
      }
      return;
    }

    // UET availability check with fallback
    if (!globalThis.window.uetq) {
      if (process.env.NEXT_PUBLIC_ENV !== 'production') {
        console.warn('🎯 UET not available - initializing queue manually');
      }
      try {
        globalThis.window.uetq = globalThis.window.uetq || [];
      } catch (initError) {
        console.error('🎯 UET queue initialization failed:', initError);
        return;
      }
    }

    // Parameter validation with detailed error messages
    if (!formName || typeof formName !== 'string' || formName.trim() === '') {
      console.error('🎯 UET FormSubmission tracking failed - formName is required and must be a non-empty string');
      return;
    }

    if (leadValue === undefined || leadValue === null || Number.isNaN(leadValue) || leadValue < 0) {
      if (process.env.NEXT_PUBLIC_ENV !== 'production') {
        console.warn('🎯 UET FormSubmission - invalid leadValue provided, using 0:', leadValue);
      }
      leadValue = 0;
    }

    // Get flow from parameter or URL
    const flowValue = flow || getFlowFromURL();

    // Build event data with validation
    const eventData = {
      event_label: String(formName),
      revenue_value: Number(leadValue),
      currency: 'USD',
      flow: flowValue,
    };

    // Set Enhanced Conversions if user data is provided
    if (userEmail) {
      try {
        await microsoftSetEnhancedConversion(userEmail, userPhone || '', false);
      } catch (enhancedError) {
        console.error('🎯 Enhanced Conversions error during FormSubmission:', enhancedError);
        // Continue with regular tracking even if enhanced conversions fail
      }
    }

    // Push event with comprehensive error handling
    try {
      if (process.env.NEXT_PUBLIC_ENV !== 'production') {
        console.log('🎯 About to push FormSubmission event with flow:', flowValue);
        console.log('🎯 Complete eventData being sent:', JSON.stringify(eventData, null, 2));
      }
      globalThis.window.uetq.push('event', 'submit_lead_form', eventData);
      if (process.env.NEXT_PUBLIC_ENV !== 'production') {
        console.log('🎯 Microsoft UET FormSubmission tracked successfully:', {
          formName,
          leadValue,
          flow: flowValue,
          enhancedConversions: !!userEmail,
        });
      }
    } catch (pushError) {
      console.error('🎯 UET FormSubmission push error:', pushError);
      console.error('🎯 Event data that failed:', eventData);
      // Don't throw - just log the error and continue
    }
  } catch (error) {
    console.error('🎯 Microsoft UET FormSubmission tracking error:', error);
    // Don't throw - prevent website crashes
  }
}

/**
 * Helper function to normalize and hash email addresses
 * Follows Microsoft's formatting requirements before hashing
 */
function normalizeEmail(email: string): string {
  if (!email) return '';

  let normalized = email.toLowerCase().trim();

  // Remove everything between "+" and "@"
  normalized = normalized.replaceAll(/\+[^@]*@/g, '@');

  // Remove periods before "@"
  const [localPart, domain] = normalized.split('@');
  if (localPart && domain) {
    normalized = localPart.replaceAll('.', '') + '@' + domain;
  }

  // Remove trailing period
  normalized = normalized.replace(/\.$/, '');

  return normalized;
}

/**
 * Helper function to normalize phone numbers to E.164 format
 * Example: converts (425) 555-0123 to +14255550123
 */
function normalizePhone(phone: string): string {
  if (!phone) return '';

  // Remove all non-digit characters except leading +
  let normalized = phone.replaceAll(/[^\d+]/g, '');

  // If no country code, assume US (+1)
  if (!normalized.startsWith('+')) {
    normalized = '+1' + normalized;
  }

  return normalized;
}

/**
 * SHA-256 hashing function (optional - Microsoft will hash if not provided)
 */
async function sha256Hash(str: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.error('🎯 SHA-256 hashing error:', error);
    return str; // Return original string if hashing fails
  }
}

/**
 * Helper function to add unhashed user data
 */
function addUnhashedUserData(
  userData: { [key: string]: string },
  normalizedEmail: string,
  normalizedPhone: string
): void {
  if (normalizedEmail) {
    userData.em = normalizedEmail;
  }
  if (normalizedPhone) {
    userData.ph = normalizedPhone;
  }
}

/**
 * Helper function to add hashed user data
 */
async function addHashedUserData(
  userData: { [key: string]: string },
  normalizedEmail: string,
  normalizedPhone: string
): Promise<void> {
  try {
    if (normalizedEmail) {
      userData.em = await sha256Hash(normalizedEmail);
    }
    if (normalizedPhone) {
      userData.ph = await sha256Hash(normalizedPhone);
    }
  } catch (hashError) {
    console.error('🎯 Enhanced Conversions hashing error:', hashError);
    // Fallback to unhashed data
    addUnhashedUserData(userData, normalizedEmail, normalizedPhone);
  }
}

/**
 * Helper function to build user data for enhanced conversions
 */
async function buildEnhancedUserData(
  normalizedEmail: string,
  normalizedPhone: string,
  autoHash: boolean
): Promise<{ [key: string]: string }> {
  const userData: { [key: string]: string } = {};

  if (autoHash) {
    await addHashedUserData(userData, normalizedEmail, normalizedPhone);
  } else {
    addUnhashedUserData(userData, normalizedEmail, normalizedPhone);
  }

  return userData;
}

/**
 * Helper function to push user data to UET queue
 */
function pushEnhancedUserData(
  userData: { [key: string]: string },
  normalizedEmail: string,
  normalizedPhone: string
): void {
  if (Object.keys(userData).length === 0) {
    if (process.env.NEXT_PUBLIC_ENV !== 'production') {
      console.warn('🎯 Enhanced Conversions - no valid user data to send');
    }
    return;
  }

  try {
    globalThis.window.uetq.push('set', {
      pid: userData,
    });
    if (process.env.NEXT_PUBLIC_ENV !== 'production') {
      console.log('🎯 Microsoft Enhanced Conversions set successfully:', {
        email: normalizedEmail,
        phone: normalizedPhone ? 'provided' : 'not provided',
      });
    }
  } catch (pushError) {
    console.error('🎯 Enhanced Conversions push error:', pushError);
    console.error('🎯 User data that failed:', userData);
  }
}

/**
 * Set Enhanced Conversion data for better tracking
 * Call this AFTER the base UET tag and BEFORE conversion events
 *
 * @param email - User's email address (will be normalized and hashed)
 * @param phone - User's phone number (will be normalized to E.164)
 * @param autoHash - If true, automatically hash the data (default: false, Microsoft will hash)
 */
export async function microsoftSetEnhancedConversion(
  email: string,
  phone: string = '',
  autoHash: boolean = false
): Promise<void> {
  try {
    if (process.env.NEXT_PUBLIC_ENV !== 'production') {
      console.log('🎯 Microsoft Enhanced Conversions started:', {
        email: email ? 'provided' : 'not provided',
        phone: phone ? 'provided' : 'not provided',
        autoHash,
      });
    }

    // Environment check
    if (globalThis.window === undefined) {
      if (process.env.NEXT_PUBLIC_ENV !== 'production') {
        console.warn('🎯 Enhanced Conversions skipped - not in browser environment');
      }
      return;
    }

    // UET availability check with fallback
    if (!globalThis.window.uetq) {
      if (process.env.NEXT_PUBLIC_ENV !== 'production') {
        console.warn('🎯 UET not available - initializing queue manually');
      }
      try {
        globalThis.window.uetq = globalThis.window.uetq || [];
      } catch (initError) {
        console.error('🎯 UET queue initialization failed:', initError);
        return;
      }
    }

    // Validate email parameter
    if (!email || typeof email !== 'string' || email.trim() === '') {
      if (process.env.NEXT_PUBLIC_ENV !== 'production') {
        console.warn('🎯 Enhanced Conversions - no valid email provided');
      }
      return;
    }

    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);

    const userData = await buildEnhancedUserData(normalizedEmail, normalizedPhone, autoHash);
    pushEnhancedUserData(userData, normalizedEmail, normalizedPhone);
  } catch (error) {
    console.error('🎯 Microsoft Enhanced Conversions error:', error);
    // Don't throw - prevent website crashes
  }
}

// Extend Window interface to include UET
declare global {
  interface Window {
    uetq: {
      push: (event: string, data: unknown, ag?: unknown) => void;
    };
  }
}
