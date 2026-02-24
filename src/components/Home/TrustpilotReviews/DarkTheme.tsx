'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import './styles.css';

interface TrustpilotDarkThemeProps {
  className?: string;
}

interface TrustpilotWindow extends Window {
  Trustpilot?: {
    loadFromElement: (element: HTMLElement, force?: boolean) => void;
  };
}

const TrustpilotDarkTheme: React.FC<TrustpilotDarkThemeProps> = ({ className = '' }) => {
  const widgetRef = useRef<HTMLDivElement>(null);

  const initializeWidget = () => {
    const trustpilotWindow = window as TrustpilotWindow;
    if (typeof window !== 'undefined' && trustpilotWindow.Trustpilot && widgetRef.current) {
      try {
        // Clear any existing widget content first
        const existingIframe = widgetRef.current.querySelector('iframe');
        if (existingIframe) {
          existingIframe.remove();
        }

        // Force re-initialization
        trustpilotWindow.Trustpilot.loadFromElement(widgetRef.current, true);
        console.log('Trustpilot dark theme carousel widget initialized successfully');
      } catch (error) {
        console.error('Trustpilot dark theme carousel widget initialization failed:', error);
      }
    }
  };

  useEffect(() => {
    // Small delay to ensure DOM is ready and script is loaded
    const timer = setTimeout(() => {
      initializeWidget();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Script
        src='//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js'
        strategy='afterInteractive'
        onLoad={() => {
          console.log('Trustpilot dark theme carousel script loaded');
          initializeWidget();
        }}
        onError={() => {
          console.error('Failed to load Trustpilot dark theme carousel script');
        }}
      />

      <div className={`trustpilot-reviews-container ${className}`}>
        <div
          ref={widgetRef}
          className='trustpilot-widget'
          data-locale='en-US'
          data-template-id='53aa8912dec7e10d38f59f36'
          data-businessunit-id='66d73baba384aee5c4b3b6bb'
          data-style-height='140px'
          data-style-width='100%'
          data-theme='dark'
          data-token='c61365a7-85f8-4be1-aec9-3f81ccf0519f'
          data-stars='5'
          data-review-languages='en'
        >
          <a href='https://www.trustpilot.com/review/lumimeds.com' target='_blank' rel='noopener'>
            Trustpilot
          </a>
        </div>
      </div>
    </>
  );
};

export default TrustpilotDarkTheme;
