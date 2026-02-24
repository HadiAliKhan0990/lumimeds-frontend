'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

interface PopUpBannerProps {
  /** End time for the countdown - if not provided, defaults to 12 hours from now */
  endTime?: Date | null;
  /** Storage key for dismissal state */
  storageKey?: string;
}

const DISMISSED_KEY = 'flashSalePopupDismissed';

export default function PopUpBanner({ endTime, storageKey = DISMISSED_KEY }: PopUpBannerProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Don't show popup on flash sale page - user is already there
  const isOnFlashSalePage = pathname === '/ad/new-year-flash-sale';

  // Check localStorage on mount to see if popup was dismissed
  useEffect(() => {
    if (typeof window !== 'undefined' && !isOnFlashSalePage) {
      const dismissed = localStorage.getItem(storageKey);
      if (!dismissed) {
        setIsOpen(true);
      }
    }
  }, [storageKey, isOnFlashSalePage]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const calculateTimeLeft = useCallback(() => {
    if (!endTime) {
      return { hours: 12, minutes: 0 };
    }

    const now = new Date();
    const diff = endTime.getTime() - now.getTime();

    if (diff <= 0) {
      return { hours: 0, minutes: 0 };
    }

    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
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

  const handleClose = () => {
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, 'true');
    }
  };

  const handleCopyCoupon = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode).then(() => {
      toast.success(`Copied: ${couponCode}`);
    }).catch(() => {
      toast.error('Failed to copy');
    });
  };

  // Don't show if on flash sale page, not open, or time expired
  if (isOnFlashSalePage) return null;
  if (!isOpen) return null;
  if (timeLeft.hours === 0 && timeLeft.minutes === 0 && endTime) {
    return null;
  }

  return (
    <div className='tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-black tw-bg-opacity-70'>
      <div 
        ref={popupRef}
        className='tw-relative tw-w-full tw-max-w-5xl tw-mx-4 md:tw-rounded-3xl tw-rounded-xl tw-overflow-hidden tw-shadow-2xl 2xl:tw-scale-100 xl:tw-scale-65 lg:tw-scale-75 tw-scale-80'
      >
        {/* Yellow Header */}
        <div 
          className="md:tw-h-[100px] tw-h-12 tw-w-full tw-flex tw-items-center tw-justify-center md:tw-text-[80px] tw-text-4xl tw-font-bold tw-text-[#3060FE]"
          style={{background: '#FFEE00'}}
        >
          FLASH SALE!
        </div>
        
        {/* Blue Content Section */}
        <div 
          className="tw-w-full md:tw-p-12 tw-p-6 tw-flex tw-flex-col"
          style={{ background: 'linear-gradient(180deg, #2E4FBD 0%, #2B4189 100%)' }}
        >
          {/* Offers Section */}
          <div className="tw-flex md:tw-flex-row tw-flex-col tw-justify-center lg:tw-gap-12 tw-gap-2 md:tw-mb-16 tw-mb-0 tw-order-2 md:tw-order-1">
            {/* $100 Off */}
            <div className="tw-flex tw-flex-col tw-items-center tw-text-center lg:gap-0 tw-gap-2">
              <div className="lg:tw-text-[104px] tw-text-[70px] tw-leading-[100%] tw-font-bold tw-text-white tw-mb-0">
                $100 off
              </div>
              <div className="lg:tw-text-[44px] tw-text-[37px] tw-text-white tw-mb-0 md:tw-min-h-28 tw-flex tw-items-center tw-flex-col tw-justify-center">
                3 month plans
              </div>
              <button 
                onClick={() => handleCopyCoupon('LUMIFLASH100')}
                className="tw-px-8 tw-py-4 tw-rounded-full tw-text-xl tw-font-semibold tw-text-[#4A5FA3] md:tw-max-w-auto tw-max-w-[322px] hover:tw-opacity-80 tw-transition-opacity tw-cursor-pointer"
                style={{background: '#FFEE00'}}
              >
                CODE: LUMIFLASH100
              </button>
            </div>

            {/* $50 Off */}
            <div className="tw-flex tw-flex-col tw-items-center tw-text-center lg:gap-0 tw-gap-2">
              <div className="lg:tw-text-[104px] tw-text-[70px] tw-leading-[100%] tw-font-bold tw-text-white tw-mb-0">
                $50 off
              </div>
              <div className="tw-text-[22px] tw-text-white tw-mb-0 md:tw-min-h-28 tw-flex tw-items-center md:tw-flex-col tw-flex-row tw-justify-center tw-text-center">
                <span className='tw-block'>Tirzepatide</span>
                <span className='tw-block'> Starter Pack</span>
              </div>
              <button 
                onClick={() => handleCopyCoupon('LUMIFLASH50')}
                className="tw-px-8 tw-py-4 tw-rounded-full tw-text-xl tw-font-semibold tw-text-[#4A5FA3] md:tw-max-w-auto tw-max-w-[322px] hover:tw-opacity-80 tw-transition-opacity tw-cursor-pointer"
                style={{background: '#FFEE00'}}
              >
                CODE: LUMIFLASH50
              </button>
            </div>
            <div className="tw-text-white tw-text-xl tw-text-center tw-mt-4 tw-mb-10 md:tw-hidden tw-block">*New patients only</div>
          </div>

          {/* Sale Ends In */}
          <div className="tw-text-center md:tw-order-2 tw-order-1">
            <div className="md:tw-text-[32px] tw-text-base tw-font-bold tw-tracking-[0.643px] tw-text-white md:tw-mb-8 tw-mb-2">
              SALE ENDS IN:
            </div>

            {/* Countdown Timer - Hours and Minutes only */}
            <div className="tw-flex tw-items-center tw-justify-center md:tw-gap-8 tw-gap-4 md:tw-mb-0 tw-mb-8">
              {/* Hours */}
              <div className="tw-flex tw-flex-col tw-items-center">
                <div 
                  className="tw-flex tw-flex-col tw-items-center tw-justify-between md:tw-text-8xl tw-text-5xl tw-text-white md:tw-p-5 tw-p-3 md:tw-min-w-[173px] tw-min-w-[86px] md:tw-min-h-[200px] tw-min-h-[100px] tw-rounded-2xl md:tw-mb-2"
                  style={{background: '#1B358B'}}
                >
                  {formatTime(timeLeft.hours)}
                  <div className="md:tw-text-[44px] tw-text-xl tw-text-white tw-mt-0">Hours</div>
                </div>
              </div>

              {/* Dots Separator */}
              <div className="tw-flex tw-flex-col md:tw-gap-12 tw-gap-7">
                <div className="md:tw-w-6 md:tw-h-6 tw-w-[10px] tw-h-[10px] tw-rounded-full tw-bg-white"></div>
                <div className="md:tw-w-6 md:tw-h-6 tw-w-[10px] tw-h-[10px] tw-rounded-full tw-bg-white"></div>
              </div>

              {/* Minutes */}
              <div className="tw-flex tw-flex-col tw-items-center">
                <div 
                  className="tw-flex tw-flex-col tw-items-center tw-justify-between md:tw-text-8xl tw-text-5xl tw-text-white md:tw-p-5 tw-p-3 md:tw-min-w-[173px] tw-min-w-[86px] md:tw-min-h-[200px] tw-min-h-[100px] tw-rounded-2xl md:tw-mb-2"
                  style={{background: '#1B358B'}}
                >
                  {formatTime(timeLeft.minutes)}
                  <div className="md:tw-text-[44px] tw-text-xl tw-text-white">Mins</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
