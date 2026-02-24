'use client';
import Image from 'next/image';
import HeroImageDesktop from '@/assets/ads/new-year-sale/main-banner.jpg';
import HeroImageMobile from '@/assets/ads/new-year-sale/main-banner-mobile.jpg';

interface HeroProps {
  handleGetStarted: () => void;
}
export default function Hero({ handleGetStarted }: HeroProps) {
  return (
    <div
      className='tw-relative tw-w-full lg:pb-0 tw-overflow-hidden tw-mx-auto new-year-sale-button-padding'
      style={{ maxWidth: '2048px' }}
    >
      <div className='tw-absolute tw-z-10 tw-bottom-[-20px] tw-left-1/2 tw--translate-x-1/2 tw--translate-y-1/2 tw-rotate-[-6deg] tw-font-dm-sans tw-bg-[#1f2d55] tw-whitespace-nowrap tw-flex md:tw-gap-28 tw-gap-12 lg:tw-h-[80px] md:tw-h-16 tw-h-12 tw-items-center tw-justify-center tw-w-[200%]'>
        {Array.from({ length: 20 }).map((_, index) => (
          <span key={index} className='tw-text-[#F3FF53] tw-font-bold lg:tw-text-[63px] md:tw-text-5xl tw-text-3xl'>
            SALE
          </span>
        ))}
      </div>
      <div className='tw-absolute lg:tw-z-0 tw-z-10 tw-top-20 tw-left-1/2 tw--translate-x-1/2 lg:tw--translate-y-1/2 tw-translate-y-[360px] tw-rotate-[7deg] tw-font-dm-sans tw-bg-[#1f2d55] tw-whitespace-nowrap tw-flex md:tw-gap-28 tw-gap-12 lg:tw-h-[80px] md:tw-h-16 tw-h-12 tw-items-center tw-justify-center tw-w-[200%]'>
        {Array.from({ length: 50 }).map((_, index) => (
          <span key={index} className='tw-text-[#F3FF53] tw-font-bold lg:tw-text-[63px] md:tw-text-5xl tw-text-3xl'>
            SALE
          </span>
        ))}
      </div>
      <div className='tw-w-full tw-flex tw-gap-10 tw-flex-col md:tw-flex-col lg:tw-flex-row tw-items-center tw-justify-between tw-mx-auto tw-overflow-hidden'>
        <div className='tw-flex-1 tw-w-full lg:tw-ml-[4.861vw] md:tw-ml-6 tw-mx-auto md:tw-px-0 tw-px-5 lg:tw-py-0 md:tw-pt-28 tw-pt-20 md:tw-pb-40 tw-pb-24 tw-text-center tw-order-2 md:tw-order-2 lg:tw-order-1'>
          <h1 className='lg:tw-text-[90px] md:tw-text-7xl tw-text-[45px] tw-font-lumitype tw-font-bold tw-text-black-22 tw-leading-[100%]'>
            <span className='tw-block'>Your 2026</span>
            <span className='tw-block'>Glow-Up</span>
            <span className='tw-block'>Starts Here</span>
          </h1>
          <h4 className='lg:tw-text-[32px] md:tw-text-3xl tw-text-xl tw-font-lato tw-text-[#1C274C] !tw-leading-[120%] tw-mt-4 tw-mb-6 md:tw-max-w-full tw-mx-auto'>
            <span className='tw-block'>Save $50 on all 3-Month</span>
            <span className='md:tw-block tw-inline'>Compounded GLP-1 and </span>
            <span className='md:tw-block tw-inline'>NAD+ Plans</span>
          </h4>
          <p className='tw-font-lato tw-my-6'>
            <span className='tw-block'>Discount applied at checkout.</span>
            <span className='tw-block'>New patients only.</span>
            <span className='tw-block'>Prescription required.</span>
          </p>
          <div className='tw-flex md:tw-max-w-[367px] tw-max-w-48 tw-mx-auto'>
            <button
              type='button'
              onClick={handleGetStarted}
              className='tw-flex tw-items-center tw-justify-center tw-gap-2 tw-w-full lg:tw-h-[67px] md:tw-h-16 tw-h-8 tw-bg-blue-46 tw-font-bold tw-text-white md:tw-text-[26px] tw-text-sm tw-font-lumitype tw-rounded-full tw-transition-all tw-duration-300 tw-shadow-[0_5.583px_5.583px_rgba(0,0,0,0.25)] hover:tw-bg-black-600 hover:tw-shadow-lg hover:tw-scale-[1.02] disabled:tw-opacity-60 disabled:tw-cursor-not-allowed disabled:hover:tw-scale-100'
            >
              <span>Get Started</span>
            </button>
          </div>
        </div>
        <div className='xl:tw-max-w-[688px] lg:tw-max-w-[50%] tw-w-full tw-relative z-1 tw-order-1 md:tw-order-1 lg:tw-order-2'>
          <Image
            src={HeroImageMobile}
            alt='Hero Image'
            className='tw-object-cover tw-w-full tw-h-[430px] lg:tw-hidden'
          />
          <Image
            src={HeroImageDesktop}
            alt='Hero Image'
            className='tw-h-full tw-object-cover tw-w-full tw-hidden lg:tw-block'
          />
        </div>
      </div>
    </div>
  );
}
