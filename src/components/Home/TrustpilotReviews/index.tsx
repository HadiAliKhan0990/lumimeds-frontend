'use client';

import Script from 'next/script';
import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { TRUSTPILOT_LOCALE_MAP, TRUSTPILOT_LANGUAGE_MAP } from '@/constants/trustpilot';
import './styles.css';

interface TrustpilotReviewsProps {
  className?: string;
  theme?: 'light' | 'dark' | 'transparent';
  locale?: string;
}

declare global {
  interface Window {
    Trustpilot?: {
      loadFromElement: (element: HTMLElement, force?: boolean) => void;
    };
  }
}

const TrustpilotReviews: React.FC<TrustpilotReviewsProps> = ({ className = '', theme = 'light', locale = 'en' }) => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('trustpilot');

  // Map Next.js locale to Trustpilot locale format
  const getTrustpilotLocale = (locale: string): string => {
    return TRUSTPILOT_LOCALE_MAP[locale] || TRUSTPILOT_LOCALE_MAP.en;
  };

  // Map locale to review language code
  const getReviewLanguage = (locale: string): string => {
    return TRUSTPILOT_LANGUAGE_MAP[locale] || TRUSTPILOT_LANGUAGE_MAP.en;
  };

  const initializeWidget = () => {
    if (globalThis.window?.Trustpilot && widgetRef.current) {
      try {
        // Clear any existing widget content first
        const existingIframe = widgetRef.current.querySelector('iframe');
        if (existingIframe) {
          existingIframe.remove();
        }

        // Force re-initialization
        globalThis.window.Trustpilot.loadFromElement(widgetRef.current, true);
        console.log('Trustpilot carousel widget initialized successfully');
      } catch (error) {
        console.error('Trustpilot carousel widget initialization failed:', error);
      }
    }
  };

  useEffect(() => {
    // Small delay to ensure DOM is ready and script is loaded
    const timer = setTimeout(() => {
      initializeWidget();
    }, 100);

    return () => clearTimeout(timer);
  }, [locale]); // Re-initialize when locale changes

  return (
    <>
      <Script
        src={process.env.NEXT_PUBLIC_TRUSTPILOT_SCRIPT_URL || '//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js'}
        strategy='afterInteractive'
        onLoad={initializeWidget}
        onError={() => {
          console.error('Failed to load Trustpilot carousel script');
        }}
      />

      <div
        className={`trustpilot-reviews-container ${className} ${theme === 'transparent' ? 'trustpilot-transparent' : ''
          }`}
      >
        <div
          ref={widgetRef}
          className='trustpilot-widget'
          data-locale={getTrustpilotLocale(locale)}
          data-template-id={locale === 'es'
            ? (process.env.NEXT_PUBLIC_TRUST_PILOT_SPANISH_TEMPLATE_ID || '53aa8912dec7e10d38f59f36')
            : (process.env.NEXT_PUBLIC_TRUST_PILOT_ENGLISH_TEMPLATE_ID || '53aa8912dec7e10d38f59f36')}
          data-businessunit-id={process.env.NEXT_PUBLIC_TRUST_PILOT_BUSINESS_ID || '66d73baba384aee5c4b3b6bb'}
          data-style-height='140px'
          data-style-width='100%'
          data-theme={theme === 'transparent' ? 'light' : theme}
          data-token={theme === 'dark'
            ? (process.env.NEXT_PUBLIC_TRUST_PILOT_THEME_TOKEN_DARK || '')
            : (process.env.NEXT_PUBLIC_TRUST_PILOT_THEME_TOKEN_LIGHT || '')}
          data-stars='5'
          data-review-languages={getReviewLanguage(locale)}
        >
          <a href={process.env.NEXT_PUBLIC_TRUSTPILOT_REVIEW_URL || 'https://www.trustpilot.com/review/lumimeds.com'} target='_blank' rel='noopener'>
            {t('linkText')}
          </a>
        </div>
      </div>
    </>
  );
};

export default TrustpilotReviews;
