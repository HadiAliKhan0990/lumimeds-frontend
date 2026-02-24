/**
 * Trustpilot Configuration
 * Uses environment variables directly
 */
export const TRUSTPILOT_CONFIG = {
  // Business Unit ID from client
  BUSINESS_UNIT_ID: process.env.NEXT_PUBLIC_TRUSTPILOT_BUSINESS_UNIT_ID || '66d73baba384aee5c4b3b6bb',

  // API Credentials (server-side only)
  API_KEY: process.env.NEXT_PUBLIC_TRUSTPILOT_API_KEY || '',
  SECRET_KEY: process.env.NEXT_PUBLIC_TRUSTPILOT_SECRET_KEY || '',

  // API Base URL
  API_BASE_URL: process.env.NEXT_PUBLIC_TRUSTPILOT_API_URL || 'https://api.trustpilot.com/v1',

  // Review page URL
  REVIEW_URL: process.env.NEXT_PUBLIC_TRUSTPILOT_REVIEW_URL || 'https://www.trustpilot.com/review/lumimeds.com',

  // Widget configuration
  TEMPLATE_ID: {
    en: process.env.NEXT_PUBLIC_TRUST_PILOT_ENGLISH_TEMPLATE_ID || '53aa8912dec7e10d38f59f36',
    es: process.env.NEXT_PUBLIC_TRUST_PILOT_SPANISH_TEMPLATE_ID || '53aa8912dec7e10d38f59f36',
  },
  HEIGHT: '140px',
  WIDTH: '100%',
  TOKEN: process.env.NEXT_PUBLIC_TRUST_PILOT_THEME_TOKEN_LIGHT || '',
  SCRIPT_URL:
    process.env.NEXT_PUBLIC_TRUSTPILOT_SCRIPT_URL || '//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js',
} as const;

/**
 * Locale mappings for Trustpilot
 */
export const TRUSTPILOT_LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  es: 'es-ES',
  // Add more locale mappings as needed
} as const;

/**
 * Review language mappings
 */
export const TRUSTPILOT_LANGUAGE_MAP: Record<string, string> = {
  en: 'en',
  es: 'es',
  // Add more language mappings as needed
} as const;
