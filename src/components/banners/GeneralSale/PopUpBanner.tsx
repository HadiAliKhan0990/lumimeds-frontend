'use client';
import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { IoMdClose } from 'react-icons/io';

interface PopUpBannerProps {
  /** End time for the countdown - if not provided, banner shows without timer */
  endTime?: Date | null;
  /** Storage key for dismissal state */
  storageKey?: string;
}

const DISMISSED_KEY = 'generalSalePopupDismissed';

export default function PopUpBanner({ endTime, storageKey = DISMISSED_KEY }: PopUpBannerProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Don't show popup on new year sale page - user is already there
  const isOnSalePage = pathname === '/ad/new-year-sale';

  // Check localStorage on mount to see if popup was dismissed
  useEffect(() => {
    if (typeof window !== 'undefined' && !isOnSalePage) {
      const dismissed = localStorage.getItem(storageKey);
      if (!dismissed) {
        setIsOpen(true);
      }
    }
  }, [storageKey, isOnSalePage]);

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

  const handleClose = () => {
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, 'true');
    }
  };

  const handleCopyCoupon = () => {
    navigator.clipboard
      .writeText('LUMINEWYEAR50')
      .then(() => {
        toast.success('Copied: LUMINEWYEAR50');
      })
      .catch(() => {
        toast.error('Failed to copy');
      });
  };

  // Check if sale has ended
  if (endTime) {
    const now = new Date();
    if (now > endTime) {
      return null;
    }
  }

  // Don't show if on sale page or not open
  if (isOnSalePage) return null;
  if (!isOpen) return null;

  return (
    <div className='tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-black tw-bg-opacity-70'>
      <div
        ref={popupRef}
        className='tw-relative tw-w-full tw-max-w-5xl tw-mx-4 md:tw-rounded-3xl tw-rounded-xl tw-overflow-hidden tw-shadow-2xl 2xl:tw-scale-90 xl:tw-scale-65 lg:tw-scale-75 tw-scale-80'
      >
        <button
          type='button'
          aria-label='Close flash sale pop-up'
          onClick={handleClose}
          className='tw-absolute tw-top-3 tw-right-3 tw-z-30 tw-flex tw-items-center tw-justify-center tw-h-8 md:tw-h-11 tw-w-8 md:tw-w-11 tw-rounded-full tw-bg-white tw-text-[#1B358B] tw-shadow-xl tw-border tw-border-white/70 hover:tw-bg-gray-50 tw-transition-all tw-p-0'
        >
          <IoMdClose className='tw-size-6 tw-flex-shrink-0 tw-text-primary' />
        </button>
        <div
          className='tw-w-full lg:tw-gap-[50px] xl:tw-gap-[30px] md:tw-gap-8 tw-gap-5 tw-mx-auto tw-rounded-3xl md:tw-px-12 tw-px-[7.442vw] lg:tw-pt-[7.031vw] lg:tw-pb-20 tw-pt-20 tw-pb-12 tw-flex tw-flex-col tw-items-center tw-justify-center tw-text-center'
          style={{ background: 'linear-gradient(180deg, #2E4FBD 0%, #1C274C 100%)' }}
        >
          {/* New Year Sale Title */}
          <div>
            <div className='md:tw-text-[100px] tw-text-[13.023vw] lg:tw-text-[135px] tw-font-normal lg:tw-leading-[135px] md:tw-leading-[100px] tw-leading-[13.023vw] tw-text-white tw-tracking-[-5px] tw-mb-0'>
              NEW YEAR
            </div>
            <div className='lg:tw-text-[264px] md:tw-text-[200px] tw-text-[25.581vw] md:tw-tracking-[-15px] tw-tracking-[0.643px] tw-font-bold tw-text-white lg:tw-leading-[200px] md:tw-leading-[200px] tw-leading-[25.581vw]'>
              SALE!
            </div>
          </div>

          {/* Offer Details */}
          <div>
            <div className='md:tw-text-6xl tw-text-[8.372vw] lg:tw-text-[86px] tw-font-normal tw-text-white tw-mb-0'>
              <span className='tw-font-semibold'>$50</span> off
            </div>
            <div className='md:tw-text-4xl tw-text-[17px] lg:tw-text-[41px] tw-font-normal tw-text-white'>
              3 Month Plans
            </div>
          </div>

          {/* Promo Code */}
          <button
            onClick={handleCopyCoupon}
            className='lg:tw-px-16 tw-px-8 lg:tw-h-[100px] md:tw-h-[80px] tw-h-[40px] tw-py-6 tw-rounded-full tw-flex tw-items-center tw-justify-center hover:tw-opacity-80 tw-transition-opacity tw-cursor-pointer'
            style={{ background: '#FFEE00' }}
          >
            <div className='lg:tw-text-3xl md:tw-text-xl tw-text-[3.721vw] md:tw-text-[40px] tw-font-normal tw-text-[#2E4FBD]'>
              CODE: LUMINEWYEAR50
            </div>
          </button>

          {/* Disclaimer */}
          {/* <div className='md:tw-text-xl tw-text-xs tw-text-white'>*New patients only</div> */}
        </div>
      </div>
    </div>
  );
}
