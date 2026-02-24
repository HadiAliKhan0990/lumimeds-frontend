/**
 * Hotjar Tracking Helper Functions
 *
 * This module provides comprehensive helper functions for tracking user behavior
 * throughout the entire user journey from landing to checkout using Hotjar.
 *
 * Key Features:
 * - Tracks original landing page (persists through session)
 * - Tracks page views with context (page type, flow, etc.)
 * - Tracks button clicks and user actions
 * - Tracks survey progress (where users drop off)
 * - Tracks checkout flow
 * - Automatically includes landing page context with every event
 */

import { formatInTimeZone } from 'date-fns-tz';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface HotjarPageViewData {
  pageName: string;
  pagePath: string;
  pageType:
    | 'landing'
    | 'ad_landing_page'
    | 'main_website'
    | 'survey'
    | 'product_selection'
    | 'checkout'
    | 'checkout_success';
  flow?: string;
  referrer?: string;
  [key: string]: unknown; // Allow additional custom properties
}

export interface HotjarButtonClickData {
  buttonId: string;
  buttonText: string;
  pageName: string;
  pagePath: string;
  pageType: string;
  flow?: string;
  destination?: string;
  [key: string]: unknown; // Allow additional custom properties
}

export interface HotjarSurveyQuestionAnswer {
  questionText: string;
  answer: string | string[] | number | boolean | File | null;
}

export interface HotjarSurveyProgressData {
  surveyType: string;
  surveyCategory?: string;
  currentStep: number;
  totalSteps?: number;
  stepName?: string;
  action: 'started' | 'progress' | 'completed' | 'abandoned';
  flow?: string;
  surveyData?: HotjarSurveyQuestionAnswer[];
  isSurveyCompleted?: boolean;
  [key: string]: unknown;
}

export interface HotjarCheckoutData {
  step: 'initiated' | 'payment_info' | 'completed';
  products?: string[];
  totalValue?: number;
  currency?: string;
  flow?: string;
  [key: string]: unknown;
}

// ============================================================================
// SESSION STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  LANDING_PAGE: 'hotjar_landing_page',
  LANDING_PAGE_TYPE: 'hotjar_landing_page_type',
  LANDING_TIMESTAMP: 'hotjar_landing_timestamp',
  SESSION_ID: 'hotjar_session_id',
  LAST_PAGE: 'hotjar_last_page',
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if Hotjar is available in the window object
 */
function isHotjarAvailable(): boolean {
  if (typeof window === 'undefined') {
    console.warn('🔥 Hotjar tracking skipped - not in browser environment');
    return false;
  }

  if (!window.hj) {
    console.warn('🔥 Hotjar not available - window.hj is not defined');
    return false;
  }

  return true;
}

/**
 * Format timestamp in US format with timezone (MM/dd/yyyy, HH:mm:ss)
 * Uses US Eastern Time (America/New_York)
 */
function getFormattedTimestamp(): string {
  try {
    return formatInTimeZone(new Date(), 'America/New_York', 'MM/dd/yyyy, HH:mm:ss zzz');
  } catch (error) {
    console.error('🔥 Error formatting timestamp:', error);
    return new Date().toISOString();
  }
}

/**
 * Sanitize survey data for tracking
 * Converts File objects to file names and handles other non-serializable types
 */
function sanitizeSurveyData(surveyData?: HotjarSurveyQuestionAnswer[]): HotjarSurveyQuestionAnswer[] | undefined {
  if (!surveyData || !Array.isArray(surveyData)) return undefined;

  try {
    return surveyData.map((item) => ({
      questionText: item.questionText,
      answer: item.answer instanceof File ? `[File: ${item.answer.name}]` : item.answer,
    }));
  } catch (error) {
    console.error('🔥 Error sanitizing survey data:', error);
    return undefined;
  }
}

/**
 * Get session storage safely
 */
function getSessionStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage;
    }
  } catch (error) {
    console.error('🔥 SessionStorage not available:', error);
  }
  return null;
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `hj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get or create session ID
 */
function getSessionId(): string {
  const storage = getSessionStorage();
  if (!storage) return generateSessionId();

  let sessionId = storage.getItem(STORAGE_KEYS.SESSION_ID);
  if (!sessionId) {
    sessionId = generateSessionId();
    storage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
  }
  return sessionId;
}

/**
 * Determine page type from pathname
 */
function determinePageType(pathname: string): HotjarPageViewData['pageType'] {
  if (pathname === '/' || pathname === '') {
    return 'landing';
  }
  if (pathname.startsWith('/ad/')) {
    return 'ad_landing_page';
  }
  if (pathname.includes('/survey') || pathname.includes('/general-survey') || pathname.includes('/intake-form')) {
    return 'survey';
  }
  // Include all /products routes (summary, survey, individual product pages, etc.)
  if (pathname.startsWith('/products')) {
    return 'product_selection';
  }
  if (pathname.includes('/checkout-link') || pathname.includes('/checkout-success')) {
    return 'checkout_success';
  }
  if (pathname.includes('/checkout')) {
    return 'checkout';
  }
  return 'main_website';
}

/**
 * Extract page name from pathname
 */
function extractPageName(pathname: string): string {
  if (pathname === '/' || pathname === '') {
    return 'home';
  }

  // Remove leading and trailing slashes
  const cleanPath = pathname.replace(/(?:^\/|\/(?:$))/g, '');

  // For ad pages, get the ad name
  if (pathname.startsWith('/ad/')) {
    const parts = cleanPath.split('/');
    return parts[parts.length - 1] || 'unknown_ad';
  }

  // For other pages, return the last segment
  const parts = cleanPath.split('/');
  return parts[parts.length - 1] || cleanPath;
}

/**
 * Get flow parameter from URL
 */
function getFlowFromURL(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const flow = urlParams.get('flow');

    if (flow) {
      // Normalize flow values
      const flowLower = flow.toLowerCase();
      if (flowLower === 'pfa') return 'product_first';
      if (flowLower === 'sfa') return 'survey_first';
      return flowLower;
    }
  } catch (error) {
    console.error('🔥 Error getting flow from URL:', error);
  }

  return 'survey_first'; // Default flow
}

/**
 * Get all URL parameters as an object
 */
function getAllURLParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const params: Record<string, string> = {};

    urlParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  } catch (error) {
    console.error('🔥 Error getting URL params:', error);
    return {};
  }
}

/**
 * Extract category from URL path
 * Handles patterns like /products/survey/[category] or /products/[category]
 */
function getCategoryFromURL(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  try {
    const pathname = window.location.pathname;

    // Match /products/survey/[category] pattern
    const surveyRegex = /\/products\/survey\/([^/]+)/;
    const surveyMatch = surveyRegex.exec(pathname);
    if (surveyMatch) {
      return surveyMatch[1];
    }

    // Match /products/[category] pattern (but not /products/summary)
    const productRegex = /\/products\/([^/]+)/;
    const productMatch = productRegex.exec(pathname);
    if (productMatch && productMatch[1] !== 'summary' && productMatch[1] !== 'survey') {
      return productMatch[1];
    }
  } catch (error) {
    console.error('🔥 Error getting category from URL:', error);
  }

  return undefined;
}

// ============================================================================
// LANDING PAGE TRACKING
// ============================================================================

/**
 * Initialize and track landing page
 * This should be called on the first page load
 */
export function initializeLandingPage(): void {
  try {
    if (typeof window === 'undefined') return;

    const storage = getSessionStorage();
    if (!storage) return;

    // Only set landing page if not already set in this session
    const existingLandingPage = storage.getItem(STORAGE_KEYS.LANDING_PAGE);

    if (!existingLandingPage) {
      const pathname = window.location.pathname;
      const pageType = determinePageType(pathname);
      const pageName = extractPageName(pathname);
      const flow = getFlowFromURL();
      const referrer = document.referrer || 'direct';

      storage.setItem(STORAGE_KEYS.LANDING_PAGE, pathname);
      storage.setItem(STORAGE_KEYS.LANDING_PAGE_TYPE, pageType);
      storage.setItem(STORAGE_KEYS.LANDING_TIMESTAMP, Date.now().toString());

      // Track the landing page view
      trackPageView({
        pageName,
        pagePath: pathname,
        pageType,
        flow,
        referrer,
        isLandingPage: true,
      });
    }
  } catch (error) {
    console.error('🔥 Error initializing landing page:', error);
  }
}

/**
 * Clear landing page information (useful for testing or manual reset)
 */
export function clearLandingPageInfo(): void {
  const storage = getSessionStorage();
  if (!storage) return;

  storage.removeItem(STORAGE_KEYS.LANDING_PAGE);
  storage.removeItem(STORAGE_KEYS.LANDING_PAGE_TYPE);
  storage.removeItem(STORAGE_KEYS.LANDING_TIMESTAMP);
  storage.removeItem(STORAGE_KEYS.SESSION_ID);
  storage.removeItem(STORAGE_KEYS.LAST_PAGE);
}

// ============================================================================
// PAGE VIEW TRACKING
// ============================================================================

/**
 * Track page view with comprehensive context
 */
export function trackPageView(data: Partial<HotjarPageViewData> = {}): void {
  try {
    if (!isHotjarAvailable()) return;

    const pathname = data.pagePath || (typeof window !== 'undefined' ? window.location.pathname : '/');
    const pageType = data.pageType || determinePageType(pathname);
    const pageName = data.pageName || extractPageName(pathname);
    const flow = data.flow || getFlowFromURL();
    const sessionId = getSessionId();
    const urlParams = getAllURLParams();

    const eventData: HotjarPageViewData = {
      pageName,
      pagePath: pathname,
      pageType,
      flow,
      sessionId,
      referrer: data.referrer || (typeof document !== 'undefined' ? document.referrer : undefined),
      timestamp: getFormattedTimestamp(),
      ...urlParams, // Include all URL parameters
      ...data, // Allow custom overrides
    };

    // Send to Hotjar
    window.hj('event', 'page_view', eventData);

    // Update last page in storage
    const storage = getSessionStorage();
    if (storage) {
      storage.setItem(STORAGE_KEYS.LAST_PAGE, pathname);
    }
  } catch (error) {
    console.error('🔥 Hotjar page view tracking error:', error);
  }
}

// ============================================================================
// BUTTON CLICK TRACKING
// ============================================================================

/**
 * Track button clicks (especially "Get Started" and navigation buttons)
 */
export function trackButtonClick(data: Partial<HotjarButtonClickData> & { buttonId: string }): void {
  try {
    if (!isHotjarAvailable()) return;

    const pathname = data.pagePath || (typeof window !== 'undefined' ? window.location.pathname : '/');
    const pageType = data.pageType || determinePageType(pathname);
    const pageName = data.pageName || extractPageName(pathname);
    const flow = data.flow || getFlowFromURL();
    const sessionId = getSessionId();

    const eventData: HotjarButtonClickData = {
      ...data,
      buttonId: data.buttonId,
      buttonText: data.buttonText || '',
      pageName,
      pagePath: pathname,
      pageType,
      flow,
      sessionId,
      timestamp: getFormattedTimestamp(),
    };

    // Send to Hotjar
    window.hj('event', 'button_click', eventData);

    // Special event for Get Started buttons
    if (
      data.buttonId.includes('get-started') ||
      data.buttonId.includes('survey') ||
      data.buttonId.includes('product')
    ) {
      window.hj('event', 'get_started_click', eventData);
    }
  } catch (error) {
    console.error('🔥 Hotjar button click tracking error:', error);
  }
}

// ============================================================================
// SURVEY PROGRESS TRACKING
// ============================================================================

/**
 * Track survey progress and abandonment
 */
export function trackSurveyProgress(data: HotjarSurveyProgressData): void {
  try {
    if (!isHotjarAvailable()) return;

    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
    const flow = data.flow || getFlowFromURL();
    const sessionId = getSessionId();
    const categoryFromURL = getCategoryFromURL();
    const sanitizedSurveyData = sanitizeSurveyData(data.surveyData);

    const eventData = {
      ...data,
      surveyType: data.surveyType,
      surveyCategory: data.surveyCategory || categoryFromURL,
      currentStep: data.currentStep,
      totalSteps: data.totalSteps,
      stepName: data.stepName,
      action: data.action,
      flow,
      sessionId,
      pagePath: pathname,
      timestamp: getFormattedTimestamp(),
      surveyData: sanitizedSurveyData,
      isSurveyCompleted: data.isSurveyCompleted,
      answeredQuestions: sanitizedSurveyData?.length || 0,
    };

    // Send to Hotjar with specific event name based on action
    window.hj('event', `survey_${data.action}`, eventData);

    // Also send general survey_progress event
    if (data.action !== 'started' && data.action !== 'completed') {
      window.hj('event', 'survey_progress', eventData);
    }
  } catch (error) {
    console.error('🔥 Hotjar survey progress tracking error:', error);
  }
}

/**
 * Track survey step (convenience function)
 */
export function trackSurveyStep(
  surveyType: string,
  currentStep: number,
  stepName?: string,
  totalSteps?: number,
  additionalData?: Record<string, unknown>
): void {
  trackSurveyProgress({
    surveyType,
    currentStep,
    stepName,
    totalSteps,
    action: 'progress',
    ...additionalData,
  });
}

/**
 * Track survey start
 */
export function trackSurveyStart(
  surveyType: string,
  surveyCategory?: string,
  additionalData?: Record<string, unknown>
): void {
  trackSurveyProgress({
    surveyType,
    surveyCategory,
    currentStep: 0,
    action: 'started',
    ...additionalData,
  });
}

/**
 * Track survey completion
 */
export function trackSurveyComplete(
  surveyType: string,
  totalSteps: number,
  additionalData?: Record<string, unknown>
): void {
  trackSurveyProgress({
    surveyType,
    currentStep: totalSteps,
    totalSteps,
    action: 'completed',
    ...additionalData,
  });
}

/**
 * Track survey abandonment
 */
export function trackSurveyAbandoned(
  surveyType: string,
  currentStep: number,
  stepName?: string,
  totalSteps?: number,
  additionalData?: Record<string, unknown>
): void {
  trackSurveyProgress({
    surveyType,
    currentStep,
    stepName,
    totalSteps,
    action: 'abandoned',
    ...additionalData,
  });
}

// ============================================================================
// CHECKOUT FLOW TRACKING
// ============================================================================

/**
 * Track checkout flow
 */
export function trackCheckout(data: HotjarCheckoutData): void {
  try {
    if (!isHotjarAvailable()) return;

    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
    const flow = data.flow || getFlowFromURL();
    const sessionId = getSessionId();

    const eventData = {
      ...data,
      step: data.step,
      products: data.products,
      totalValue: data.totalValue,
      currency: data.currency || 'USD',
      flow,
      sessionId,
      pagePath: pathname,
      timestamp: getFormattedTimestamp(),
    };

    // Send to Hotjar with specific event name based on step
    window.hj('event', `checkout_${data.step}`, eventData);

    // Also send general checkout event
    window.hj('event', 'checkout', eventData);
  } catch (error) {
    console.error('🔥 Hotjar checkout tracking error:', error);
  }
}

/**
 * Track checkout initiation
 */
export function trackCheckoutInitiated(
  products?: string[],
  totalValue?: number,
  additionalData?: Record<string, unknown>
): void {
  trackCheckout({
    step: 'initiated',
    products,
    totalValue,
    ...additionalData,
  });
}

/**
 * Track checkout payment info entry
 */
export function trackCheckoutPaymentInfo(additionalData?: Record<string, unknown>): void {
  trackCheckout({
    step: 'payment_info',
    ...additionalData,
  });
}

/**
 * Track checkout completion
 */
export function trackCheckoutCompleted(
  products?: string[],
  totalValue?: number,
  additionalData?: Record<string, unknown>
): void {
  trackCheckout({
    step: 'completed',
    products,
    totalValue,
    ...additionalData,
  });
}

// ============================================================================
// CUSTOM EVENT TRACKING
// ============================================================================

/**
 * Track custom event with automatic context enrichment
 */
export function trackCustomEvent(eventName: string, customData: Record<string, unknown> = {}): void {
  try {
    if (!isHotjarAvailable()) return;

    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
    const pageType = determinePageType(pathname);
    const pageName = extractPageName(pathname);
    const flow = getFlowFromURL();
    const sessionId = getSessionId();

    const eventData = {
      eventName,
      pageName,
      pagePath: pathname,
      pageType,
      flow,
      sessionId,
      timestamp: getFormattedTimestamp(),
      ...customData,
    };

    // Send to Hotjar
    window.hj('event', eventName, eventData);
  } catch (error) {
    console.error('🔥 Hotjar custom event tracking error:', error);
  }
}

// ============================================================================
// TYPE DECLARATIONS
// ============================================================================

declare global {
  interface Window {
    hj: (command: string, event: string, data?: unknown) => void;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

const hotjarTracking = {
  // Initialization
  initializeLandingPage,
  clearLandingPageInfo,

  // Page tracking
  trackPageView,

  // Button tracking
  trackButtonClick,

  // Survey tracking
  trackSurveyProgress,
  trackSurveyStep,
  trackSurveyStart,
  trackSurveyComplete,
  trackSurveyAbandoned,

  // Checkout tracking
  trackCheckout,
  trackCheckoutInitiated,
  trackCheckoutPaymentInfo,
  trackCheckoutCompleted,

  // Custom events
  trackCustomEvent,
};

export default hotjarTracking;
