'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/constants';

interface Props {
  /** End time for the countdown - if not provided, banner shows without timer */
  endTime?: Date | null;
}

export default function TopBanner({ endTime }: Readonly<Props>) {
  const pathname = usePathname();

  const calculateTimeLeft = useCallback(() => {
    if (!endTime) {
      return { hours: 0, minutes: 0, seconds: 0 };
    }

    const now = new Date();
    const diff = endTime.getTime() - now.getTime();

    if (diff <= 0) {
      return { hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    };
  }, [endTime]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  // Don't render if time is up
  if (timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0 && endTime) {
    return null;
  }

  return (
    <div className='tw-w-full'>
      {/* Mobile Header */}
      <div className='lg:tw-hidden tw-block'>
        <div
          className='tw-h-12 tw-w-full tw-flex tw-items-center tw-justify-center tw-text-2xl tw-font-bold tw-text-[#3060FE]'
          style={{ background: '#FFEE00' }}
        >
          New Year sale!
        </div>
      </div>

      {/* Blue Gradient Section */}
      <div
        className='lg:tw-gap-0 tw-gap-3 tw-w-full tw-px-8 lg:tw-py-3 tw-py-4 tw-flex tw-items-center tw-justify-center lg:tw-flex-row tw-flex-col'
        style={{ background: 'linear-gradient(90deg, #2E4FBD 0%, #4685F4 100%)' }}
      >
        {/* Desktop - New Year Sale Title */}
        <div className='lg:tw-block tw-hidden'>
          <div className='tw-flex tw-flex-col tw-text-white'>
            <div className='tw-text-3xl tw-font-normal tw-tracking-wide tw-leading-[100%]'>NEW YEAR</div>
            <div className='tw-text-6xl tw-font-bold tw-leading-[100%]'>SALE!</div>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className='tw-h-[88px] tw-w-px tw-bg-white tw-mx-8 lg:tw-block tw-hidden'></div>

        {/* Middle - Offer Details */}
        <div className='tw-flex tw-flex-col tw-text-white tw-items-center lg:tw-items-start'>
          <div className='md:tw-text-[32px] tw-text-[5.814vw] tw-font-normal tw-mb-0'>
            <span className='tw-font-semibold'>$50</span> off 3 months
          </div>
          <div className='md:tw-text-[25px] tw-text-[5.814vw] tw-font-normal tw-tracking-wide'>CODE: LUMINEWYEAR50</div>
        </div>

        {/* Right Side - CTA Button */}
        {pathname === ROUTES.HOME && (
          <Link
            href='/ad/new-year-sale'
            className='lg:tw-ml-[6.152vw] tw-flex tw-items-center tw-no-underline tw-justify-center tw-px-16 md:tw-h-[58px] !tw-bg-[#FFEE00] tw-h-[46px] tw-py-4 tw-rounded-full tw-text-xl tw-font-bold tw-text-[#2E4FBD] hover:tw-opacity-90 tw-transition-opacity'
          >
            SHOP NOW
          </Link>
        )}
      </div>
    </div>
  );
}
