'use client';

import Image from 'next/image';
import Script from 'next/script';
import { useCallback, useEffect, useRef, useState } from 'react';
import ProfileIcons from '../../../assets/ads/black-friday-sale/ProfileIcons.png';

declare global {
  interface Window {
    Trustpilot?: {
      loadFromElement: (element: HTMLElement, force?: boolean) => void;
    };
  }
}

export default function Review() {
  const [isWidgetLoading, setIsWidgetLoading] = useState(true);
  const widgetContainerRef = useRef<HTMLDivElement>(null);

  const initializeTrustpilot = useCallback(() => {
    if (typeof window === 'undefined' || !window.Trustpilot) return;
    if (!widgetContainerRef.current) return;

    const widgets = widgetContainerRef.current.querySelectorAll<HTMLElement>('.trustpilot-widget');
    widgets.forEach((widget) => {
      window.Trustpilot?.loadFromElement(widget, true);
    });

    setIsWidgetLoading(false);
  }, []);

  useEffect(() => {
    initializeTrustpilot();
  }, [initializeTrustpilot]);

  const handleScriptLoad = () => {
    initializeTrustpilot();
  };

  return (
    <>
      {/* TrustBox script */}
      <Script
        src='https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js'
        strategy='afterInteractive'
        onLoad={handleScriptLoad}
      />

      <div
        ref={widgetContainerRef}
        className='tw-relative tw-w-full tw-mx-auto tw-h-full tw-flex tw-flex-col tw-justify-center tw-items-center tw-gap-4 2xl:tw-gap-6 md:tw-my-20 tw-mt-4'
      >
        {isWidgetLoading && (
          <div className='tw-absolute tw-inset-0 tw-z-10 tw-flex tw-items-center tw-justify-center tw-p-4'>
            <div className='tw-w-full tw-max-w-md tw-rounded-lg tw-border tw-border-gray-200 tw-bg-white tw-p-4'>
              <div className='tw-flex tw-items-center tw-gap-4'>
                <div className='tw-size-12 tw-rounded-full tw-bg-gray-200 tw-animate-pulse'></div>
                <div className='tw-flex-1 tw-space-y-2'>
                  <div className='tw-h-3 tw-rounded tw-bg-gray-200'></div>
                  <div className='tw-h-3 tw-w-1/2 tw-rounded tw-bg-gray-200'></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div
          className={`tw-w-full tw-h-full tw-flex tw-flex-col tw-justify-center tw-items-center tw-gap-4 2xl:tw-gap-6 ${
            isWidgetLoading
              ? 'tw-opacity-0 tw-pointer-events-none'
              : 'tw-opacity-100 tw-transition-opacity tw-duration-300'
          }`}
        >
          <div className='tw-w-full tw-flex tw-flex-col tw-justify-center tw-items-center tw-max-w-[820px] 2xl:tw-max-w-[1000px]'>
            {/* Desktop TrustBox widget */}
            <div
              className={`tw-w-full tw-hidden md:tw-block ${
                isWidgetLoading
                  ? 'tw-opacity-0 tw-pointer-events-none'
                  : 'tw-opacity-100 tw-transition-opacity tw-duration-300'
              }`}
            >
              <div
                className='trustpilot-widget'
                data-locale='en-US'
                data-template-id='5406e65db0d04a09e042d5fc'
                data-businessunit-id='66d73baba384aee5c4b3b6bb'
                data-style-height='28px'
                data-style-width='100%'
                data-token='57815b58-3fe2-45f6-b35e-f2d9bd9fa3c3'
              >
                <a href='https://www.trustpilot.com/review/lumimeds.com' target='_blank' rel='noopener'>
                  Trustpilot
                </a>
              </div>
            </div>

            {/* Mobile TrustBox widget */}
            <div
              className={`tw-w-full tw-block md:tw-hidden ${
                isWidgetLoading
                  ? 'tw-opacity-0 tw-pointer-events-none'
                  : 'tw-opacity-100 tw-transition-opacity tw-duration-300'
              }`}
            >
              <div
                className='trustpilot-widget'
                data-locale='en-US'
                data-template-id='5406e65db0d04a09e042d5fc'
                data-businessunit-id='66d73baba384aee5c4b3b6bb'
                data-style-height='28px'
                data-style-width='100%'
                data-token='1b2ea267-e301-415e-b3d1-3ea0bffe5760'
              >
                <a href='https://www.trustpilot.com/review/lumimeds.com' target='_blank' rel='noopener'>
                  Trustpilot
                </a>
              </div>
            </div>
          </div>

          <div className='tw-w-full tw-h-full tw-flex tw-flex-col tw-justify-center tw-items-center tw-max-w-[360px] 2xl:tw-max-w-[612px] tw-font-inter'>
            <div className='tw-w-full tw-flex md:tw-flex-col tw-flex-row sm:tw-flex-row tw-justify-center tw-items-center tw-gap-5 2xl:tw-gap-6 tw-px-8'>
              <Image src={ProfileIcons} alt='Review' className='tw-h-auto' />
              <div className='tw-h-full tw-flex tw-flex-col tw-justify-center tw-items-center sm:tw-items-start'>
                <p className='tw-text-[#002C8C] tw-text-[1.6rem] xl:tw-text-[2rem] tw-text-lg tw-font-bold tw-leading-[120%] tw-tracking-[0.02rem] tw-font-Inter tw-whitespace-nowrap tw-mb-0'>
                  15k+
                </p>
                <p className='tw-text-[#737373] md:tw-text-base tw-text-xs tw-font-normal tw-leading-[120%] tw-font-Inter tw-whitespace-nowrap tw-mb-0'>
                  Journeys
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
