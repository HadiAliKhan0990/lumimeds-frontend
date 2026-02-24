'use client';
import NewYearConfetti from '@/assets/ads/new-year-flash-sale/new-year-confetti.png';
import NewYearConfettiMobile from '@/assets/ads/new-year-flash-sale/new-year-confetti-mobile.png';
import FlashSaleImage from '@/assets/ads/new-year-flash-sale/flash-sale.png';
import { Spinner } from 'react-bootstrap';
import Image from 'next/image';
import { usePatientIntakeNavigation } from '../../hooks/usePatientIntakeNavigation';

export default function Hero() {
  const { isLoading, handleNavigation } = usePatientIntakeNavigation();

  const discounts = [
    {
      amount: '$100 off',
      description: '3 month value plans',
      code: 'LUMIFLASH100',
      descriptionClassName: 'lg:tw-text-[40px] md:tw-text-[28px] tw-text-[32px] tw-leading-normal',
      hasBreak: false,
    },
    {
      amount: '$50 off',
      description: 'Compounded Tirzepatide (GLP-1/GIP) Starter Pack',
      code: 'LUMIFLASH50',
      descriptionClassName: 'md:tw-text-[28px] tw-text-base tw-leading-tight',
      hasBreak: true,
    },
  ];

  return (
    <>
      <style>{`
        .hero-banner-newyear {
          background-image: url(${NewYearConfettiMobile.src});
          background-size: cover;
          background-position: top center;
          background-repeat: no-repeat;
          
        }
        @media (min-width: 768px) {
        .hero-banner-newyear {
          background-image: url(${NewYearConfetti.src});
          background-size: 100% 100%;
          background-position: top center;
          background-repeat: no-repeat;
          }
        }
      `}</style>
      <div className='hero-banner-newyear tw-relative tw-w-full tw-min-h-auto md:tw-mb-32 tw-mb-12 tw-overflow-hidden'>
        <div className='tw-relative tw-max-w-[1150px] tw-mx-auto tw-w-full tw-px-5'>
          <div className='tw-mx-auto tw-text-center tw-pt-24'>
            <h1 className='tw-text-white tw-hidden md:tw-block tw-text-[44px] tw-font-bold tw-text-center tw-uppercase tw-leading-tight tw-tracking-[0.867px]'>
              We&apos;re Dropping Our Prices! <br />
              12 hours only!
            </h1>
            <div className='tw-flex tw-justify-center'>
              <Image src={FlashSaleImage} alt='Flash Sale' className='tw-w-auto tw-h-auto' />
            </div>
            <h6 className='tw-text-white tw-text-2xl tw-text-center tw-leading-[110%] tw-mt-5 tw-hidden md:tw-block'>
              Save up to $100 during LumiMeds&apos; 12-Hour Flash Sale
            </h6>
          </div>

          <div className='tw-flex tw-flex-col md:tw-flex-row tw-items-center tw-justify-center tw-my-14 lg:tw-gap-16 tw-gap-4'>
            {discounts.flatMap((discount, index) => [
              <div
                key={`discount-${index}`}
                className='tw-flex-1 tw-flex tw-flex-col tw-items-center tw-justify-center'
              >
                <h2 className='tw-text-white tw-whitespace-nowrap lg:tw-text-8xl md:tw-text-6xl xl:tw-text-9xl tw-text-[76px] tw-font-bold md:tw-leading-normal leading-[80px] tw-mb-0'>
                  {discount.amount}
                </h2>
                <h3 className={`tw-text-white tw-font-normal tw-text-center ${discount.descriptionClassName}`}>
                  {discount.hasBreak ? (
                    <>
                      Compounded Tirzepatide <br />
                      (GLP-1/GIP) Starter Pack
                    </>
                  ) : (
                    <>
                      <span className='md:tw-hidden'>3 month plans</span>
                      <span className='tw-hidden md:tw-inline'>{discount.description}</span>
                    </>
                  )}
                </h3>
                <h4 className='tw-text-white tw-font-normal md:tw-text-[28px] tw-text-base tw-mt-4 tw-mb-0'>
                  CODE: {discount.code}
                </h4>
              </div>,
              ...(index < discounts.length - 1
                ? [
                    <div
                      key={`divider-${index}`}
                      className='tw-w-[3px] tw-hidden md:tw-block tw-h-full lg:tw-min-h-[280px] tw-min-h-[240px] tw-bg-white'
                    ></div>,
                  ]
                : []),
            ])}
          </div>
          <div className='tw-flex tw-justify-center'>
            <button
              type='button'
              onClick={handleNavigation}
              disabled={isLoading}
              className='tw-flex tw-items-center tw-justify-center tw-font-normal md:tw-min-w-80 md:tw-w-auto tw-w-full md:tw-h-14 tw-h-[60px] tw-bg-[#FFEE00] tw-text-[#2B4699] tw-text-2xl tw-rounded-full tw-transition-all tw-duration-300 hover:tw-bg-black-600 hover:tw-shadow-lg hover:tw-scale-[1.02] disabled:tw-opacity-60 disabled:tw-cursor-not-allowed disabled:hover:tw-scale-100'
            >
              {isLoading && <Spinner className='border-2 tw-mr-2' size='sm' />}
              <span>Shop the Flash Sale</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
