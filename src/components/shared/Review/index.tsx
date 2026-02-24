'use client';
import Image from 'next/image';
import Script from 'next/script';
import { useCallback, useEffect, useRef, useState } from 'react';
import ProfileIcons from '@/assets/ads/shared-images/ProfileIcons.png';
import Profilemobile from '@/assets/ads/shared-images/Profile-mobile.png';

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
        className='tw-relative tw-w-full tw-mx-auto tw-h-full tw-flex tw-flex-row tw-justify-between tw-items-center tw-gap-4 2xl:tw-gap-6'
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
          className={`tw-w-full tw-h-full tw-flex tw-flex-row tw-justify-between tw-items-center tw-gap-4 2xl:tw-gap-6 ${
            isWidgetLoading
              ? 'tw-opacity-0 tw-pointer-events-none'
              : 'tw-opacity-100 tw-transition-opacity tw-duration-300'
          }`}
        >
          <div className='tw-w-full tw-flex md:tw-flex-row tw-flex-col tw-gap-8 md:tw-gap-0 tw-justify-between tw-items-center'>
            <div className='tw-w-full tw-h-full tw-flex tw-flex-col tw-justify-center tw-items-center tw-max-w-[360px] 2xl:tw-max-w-[612px]'>
              {/* For Desktop */}
              <div className='md:tw-block tw-hidden'>
                <div className='tw-w-full tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-center tw-gap-5 2xl:tw-gap-6'>
                  <div className='lg:tw-w-[220px] tw-w-[100px]'>
                    <Image src={ProfileIcons} alt='Review' className='tw-h-auto tw-w-full' />
                  </div>
                  <div className='tw-h-full tw-flex tw-flex-col tw-justify-center tw-items-center sm:tw-items-start'>
                    <p className='tw-text-black-22 lg:tw-text-xl tw-text-base tw-leading-[120%] tw-tracking-[0.02rem] tw-mb-0 tw-whitespace-nowrap'>
                      Join 15k
                      <span className='tw-block'>Patients!</span>
                    </p>
                  </div>
                </div>
              </div>
              {/* For Mobile */}
              <div className='tw-block md:tw-hidden tw-w-full'>
                <div className='tw-w-full tw-flex tw-flex-row sm:tw-flex-row tw-justify-center tw-items-center tw-gap-5 2xl:tw-gap-6'>
                  <div className='tw-w-[100px]'>
                    <Image src={Profilemobile} alt='Review' className='tw-h-auto tw-w-full' />
                  </div>
                  <div className='tw-h-full tw-flex tw-flex-col tw-justify-center tw-items-center sm:tw-items-start'>
                    <p className='tw-text-black-22 lg:tw-text-xl tw-text-base tw-leading-[120%] tw-tracking-[0.02rem] tw-mb-0 tw-whitespace-nowrap'>
                      Join 15k
                      <span className='tw-block'>Patients!</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`tw-w-full tw-relative md:-tw-right-9 tw-right-0 ${
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
                <a href='https://www.trustpilot.com/review/lumimeds.com' target='_blank' rel='noopener noreferrer'>
                  Trustpilot
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
