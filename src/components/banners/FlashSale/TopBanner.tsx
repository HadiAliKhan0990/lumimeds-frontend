'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface TopBannerProps {
  /** End time for the countdown - if not provided, defaults to 12 hours from now */
  endTime?: Date | null;
}

export default function TopBanner({ endTime }: TopBannerProps) {
  const router = useRouter();
  
  const calculateTimeLeft = useCallback(() => {
    if (!endTime) {
      // Default to 12 hours if no endTime provided
      return { hours: 12, minutes: 0, seconds: 0 };
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

  const formatTime = (num: number): string => String(num).padStart(2, '0');

  const handleShopNow = () => {
    router.push('/ad/new-year-flash-sale');
  };

  // Don't render if time is up
  if (timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0 && endTime) {
    return null;
  }

  return (
    <div className='tw-w-full tw-font-dm-sans'>
      {/* Yellow Header */}
      <div
        className='tw-h-12 tw-w-full tw-flex tw-items-center tw-justify-center xl:tw-text-3xl tw-text-2xl tw-font-bold tw-text-[#3060FE]'
        style={{ background: '#FFEE00' }}
      >
        FLASH SALE | 12 HOURS ONLY
      </div>

      {/* Blue Gradient Section */}
      <div
        className='tw-w-full tw-px-8 lg:tw-py-2 tw-py-5'
        style={{ background: 'linear-gradient(90deg, #2E4FBD 0%, #4685F4 100%)' }}
      >
        <div className='tw-max-w-[1400px] tw-w-full lg:tw-flex-row tw-flex-col xl:tw-gap-0 tw-gap-3 tw-mx-auto tw-flex tw-items-center tw-justify-between'>
          {/* Desktop */}
          <div className='md:tw-block tw-hidden'>
            <div className='tw-flex tw-flex-col md:tw-gap-1 tw-text-white'>
              <div className='tw-flex md:tw-flex-row tw-flex-col tw-items-center tw-justify-between md:tw-gap-4 lg:tw-text-[1.458vw] lg:tw-text-2xl md:tw-text-xl !tw-leading-normal'>
                <div>
                  <span className='tw-font-bold'>$100 OFF</span>
                  <span className='lg:tw-font-light tw-font-bold'> 3 MONTH VALUE PLANS*</span>
                </div>
                <span className='lg:tw-font-light tw-font-bold xl:tw-min-w-80'>CODE: LUMIFLASH100</span>
              </div>
              <div className='tw-flex md:tw-flex-row tw-flex-col tw-items-center tw-justify-between md:tw-gap-4 lg:tw-text-[1.458vw] lg:tw-text-2xl md:tw-text-xl !tw-leading-normal'>
                <div>
                  <span className='tw-font-bold'>$50 OFF</span>
                  <span className='lg:tw-font-light tw-font-bold'> TIRZEPATIDE STARTER PACK*</span>
                </div>
                <span className='lg:tw-font-light tw-font-bold xl:tw-min-w-80'>CODE: LUMIFLASH50</span>
              </div>
            </div>
          </div>
            
          {/* Mobile */}
          <div className='md:tw-hidden tw-block'>
            <div className='tw-flex tw-flex-col md:tw-gap-1 tw-text-white tw-uppercase'>
              <div className='tw-flex md:tw-flex-row tw-flex-col tw-items-center tw-justify-between md:tw-gap-4 tw-text-xl !tw-leading-normal'>
                <span className='tw-font-bold'>$100 OFF 3 MOnth </span>
                <span className='lg:tw-font-light tw-font-bold'>Value Plans</span>
                <span className='lg:tw-font-light tw-font-bold'>code: lumiflash100</span>
              </div>
              <div className='tw-h-[1px] tw-my-1 tw-w-full tw-bg-white'></div>
              <div className='tw-flex md:tw-flex-row tw-flex-col tw-items-center tw-justify-between md:tw-gap-4 tw-text-xl !tw-leading-normal'>
                <span className='tw-font-bold'>$50 OFF Tirzepatide</span>
                <span className='lg:tw-font-light tw-font-bold'>starter pack</span>
                <span className='lg:tw-font-light tw-font-bold'>CODE: LUMIFLASH50</span>
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className='tw-flex tw-items-center tw-gap-2 tw-relative'>
            <div className='tw-flex tw-flex-col tw-items-center'>
              <div className='xl:tw-text-5xl md:tw-text-4xl tw-text-5xl tw-text-[#FFEE00]'>{formatTime(timeLeft.hours)}</div>
              <div className='tw-text-sm tw-text-[#FFEE00]'>Hours</div>
            </div>
            <div className='xl:tw-text-5xl md:tw-text-4xl tw-text-5xl tw-text-[#FFEE00] tw-relative -tw-top-3'>:</div>
            <div className='tw-flex tw-flex-col tw-items-center'>
              <div className='xl:tw-text-5xl md:tw-text-4xl tw-text-5xl tw-text-[#FFEE00]'>{formatTime(timeLeft.minutes)}</div>
              <div className='tw-text-sm tw-text-[#FFEE00]'>Mins</div>
            </div>
            <div className='xl:tw-text-5xl md:tw-text-4xl tw-text-5xl tw-text-[#FFEE00] tw-relative -tw-top-3'>:</div>
            <div className='tw-flex tw-flex-col tw-items-center'>
              <div className='xl:tw-text-5xl md:tw-text-4xl tw-text-5xl tw-text-[#FFEE00]'>{formatTime(timeLeft.seconds)}</div>
              <div className='tw-text-sm tw-text-[#FFEE00]'>Seconds</div>
            </div>
          </div>

          {/* Shop Now Button */}
          <div className='tw-flex tw-flex-col tw-items-center tw-gap-1'>
            <button
              onClick={handleShopNow}
              className='md:tw-block tw-hidden tw-px-12 tw-py-2 xl:tw-h-[57px] tw-h-[40px] tw-font-semibold tw-rounded-full xl:tw-text-xl tw-text-base tw-text-[#3060FE] hover:tw-opacity-90 tw-transition-opacity'
              style={{ background: '#FFEE00' }}
            >
              SHOP NOW
            </button>
            <div className='tw-text-[10px] tw-text-white'>*New patients only, except for NAD+</div>
          </div>
        </div>
      </div>
    </div>
  );
}
