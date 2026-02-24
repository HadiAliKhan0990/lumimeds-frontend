'use client';
import HeroImage from '@/assets/ads/longevity-microdosages/hero-image.jpg';
import HeroImageMobile from '@/assets/ads/longevity-microdosages/hero-image-mobile.jpg';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { showToast } from '@/lib/toast';
import Review from '@/components/shared/Review';


export default function Hero() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigation = async () => {
    setIsLoading(true);

    // Small delay to ensure React renders the spinner before navigation
    setTimeout(async () => {
      try {
        await router.push(ROUTES.PATIENT_INTAKE);
        // If navigation succeeds, component will unmount, so no need to reset loading
      } catch (error) {
        console.error('Navigation error:', error);
        showToast({
          title: 'Navigation Error',
          message: 'Unable to navigate. Please try again.',
          type: 'error',
        });
        setIsLoading(false);
      }
    }, 50); // 50ms delay to ensure spinner renders
  };

  return (
    <div className='md:tw-w-full xl:tw-h-[calc(100vh-72px)] md:tw-h-[calc(80vh-72px)] tw-h-full'>
      <div className='tw-w-full tw-h-full tw-bg-cover tw-bg-center tw-bg-no-repeat tw-relative tw-z-10 md:tw-block tw-hidden' style={{ backgroundImage: `url(${HeroImage.src})` }}>
        <div className='tw-w-full tw-h-full tw-flex tw-items-center xl:tw-pl-[9.236vw] tw-pl-5'>
          <div className='tw-flex tw-flex-col tw-w-full tw-max-w-[541px]'>
            <h1 className='tw-text-5xl tw-font-lumitype tw-tracking-[-0.48px] md:tw-leading-[110%] tw-mb-0'>
              Good Things Come in Microdoses
            </h1>
            <h6 className='tw-text-2xl tw-font-lato tw-text-black-22 tw-leading-[134%] tw-my-6'>
              Designed to optimize your health and well-being with more manageable side effects.
            </h6>
            <div className='tw-flex tw-flex-col tw-gap-6'>
              <button
                type='button'
                onClick={handleNavigation}
                disabled={isLoading}
                className='tw-flex tw-items-center tw-justify-center tw-gap-2 tw-w-full lg:tw-h-16 md:tw-h-16 tw-h-auto tw-bg-black-22 tw-font-bold tw-text-white md:tw-text-xl tw-text-2xl tw-font-lumitype tw-rounded-full tw-transition-all tw-duration-300 hover:tw-bg-black-600 hover:tw-shadow-lg hover:tw-scale-[1.02] disabled:tw-opacity-60 disabled:tw-cursor-not-allowed disabled:hover:tw-scale-100'
              >
                {isLoading && <Spinner className='border-2' size='sm' />}
                <span>Check Your Eligibility</span>
              </button>
              <div className='tw-text-[13px] tw-text-[#797979] tw-font-lato tw-tracking-[-0.13px] tw-w-full tw-text-center md:tw-mt-0'>
                Prescription Required
              </div>
            </div>
            <div className='tw-w-full tw-h-full tw-flex tw-flex-col tw-justify-center tw-items-center tw-mt-6'>
              <div className='tw-w-full tw-h-full tw-flex tw-flex-row xl:tw-justify-between tw-justify-start tw-items-center tw-gap-5'>
                {/* For Desktop */}
                <div className='md:tw-block tw-hidden'>
                  <div className='tw-w-full tw-h-full tw-flex tw-flex-col tw-justify-center tw-items-center tw-mt-9'>
                    <Review />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Hero Image */}
      <div className='tw-block md:tw-hidden tw-w-full tw-h-full'>
        <Image src={HeroImageMobile} alt='Hero Image Mobile' className='tw-h-auto tw-w-full' />
        <div className='tw-flex tw-flex-col tw-w-full tw-py-5 tw-px-8 tw-mb-24'>
          <h2 className='tw-text-[40px] tw-font-lumitype tw-tracking-[-0.48px] md:tw-leading-[110%] tw-mb-0'>
            Good Things Come in Microdoses
          </h2>
          <h6 className='tw-text-2xl tw-font-lato tw-text-black-22 tw-leading-[134%] tw-my-6'>
            Designed to optimize your health and well-being with more manageable side effects.
          </h6>
          <div className='tw-flex tw-flex-col tw-gap-6'>
            <button
              type='button'
              onClick={handleNavigation}
              disabled={isLoading}
              className='tw-flex tw-items-center tw-justify-center tw-gap-2 tw-w-full lg:tw-h-16 md:tw-h-16 tw-h-auto tw-bg-black-22 tw-font-bold tw-text-white md:tw-text-xl tw-text-2xl tw-font-lumitype tw-rounded-full tw-transition-all tw-duration-300 hover:tw-bg-black-600 hover:tw-shadow-lg hover:tw-scale-[1.02] disabled:tw-opacity-60 disabled:tw-cursor-not-allowed disabled:hover:tw-scale-100'
            >
              {isLoading && <Spinner className='border-2' size='sm' />}
              <span>Get Started</span>
            </button>
            <div className='tw-text-[13px] tw-text-[#797979] tw-font-lato tw-tracking-[-0.13px] tw-w-full tw-text-center md:tw-mt-0'>
              Prescription Required
            </div>
          </div>
          <div className='tw-w-full tw-h-full tw-flex tw-flex-col tw-justify-center tw-items-center tw-mt-6'>
            <div className='tw-w-full tw-h-full tw-flex tw-flex-row tw-justify-between tw-items-center tw-gap-5'>
              <div className='tw-block md:tw-hidden tw-w-full'>
                <div className='tw-w-full tw-h-full tw-flex tw-flex-col tw-justify-center tw-items-center tw-mt-9'>
                  <Review />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
