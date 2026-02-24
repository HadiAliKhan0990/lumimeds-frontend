'use client';
import HeroImage from '@/assets/ads/new-year-new-you/hero-banner.png';
import HeroImageMobile from '@/assets/ads/new-year-new-you/hero-image-mobile.png';
import Notification from '@/assets/ads/new-year-new-you/notification.svg';
import Profilemobile from '@/assets/ads/shared-images/Profile-mobile.png';
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
    <div className='md:tw-w-full'>
      <div className='tw-flex tw-justify-between lg:tw-flex-row tw-flex-col-reverse tw-items-center md:tw-gap-20 tw-gap-12 tw-bg-[#4685F4] 2xl:tw-pl-[15.472vw] lg:tw-pb-0 tw-pb-16 lg:tw-pl-[8.472vw] tw-px-0'>
        <div className='tw-flex tw-flex-col tw-w-full lg:tw-max-w-[541px] tw-max-w-full lg:tw-px-0 tw-px-9'>
          <h1 className='md:tw-text-[64px] tw-text-5xl tw-text-white tw-font-bold tw-tracking-[-0.48px] md:tw-leading-[110%] tw-mb-0'>
            Make 2026
            <span className='tw-block tw-text-[#F3FF53]'>Your Year!</span>
          </h1>
          <h6 className='tw-text-2xl tw-font-lato tw-text-white tw-leading-[134%] tw-my-6'>
            Start Your LumiMeds Wellness Journey This January
          </h6>
          <div className='tw-flex tw-flex-col tw-gap-6'>
            <button
              type='button'
              onClick={handleNavigation}
              disabled={isLoading}
              className='tw-flex tw-items-center tw-justify-center tw-gap-2 tw-w-full tw-h-16 tw-bg-[#F3FF53] tw-font-bold tw-text-[#222A3F] md:tw-text-xl tw-text-2xl tw-rounded-full tw-transition-all tw-duration-300 hover:tw-bg-black-600 hover:tw-shadow-lg hover:tw-scale-[1.02] disabled:tw-opacity-60 disabled:tw-cursor-not-allowed disabled:hover:tw-scale-100'
            >
              {isLoading && <Spinner className='border-2' size='sm' />}
              <span className='md:tw-block tw-hidden'>Check Your Eligibility</span>
              <span className='md:tw-hidden tw-block'>Get Started</span>
            </button>
            <div className='tw-text-[13px] tw-text-white tw-font-lato tw-tracking-[-0.13px] tw-w-full tw-text-center md:tw-mt-0 md:tw-block tw-hidden'>
              Prescription Required
            </div>
          </div>
          <div className='tw-w-full tw-h-full tw-flex tw-flex-col tw-justify-center tw-items-center tw-mt-9'>
            <Review />
          </div>
        </div>
        <div className='lg:tw-max-w-[681px] tw-w-full tw-relative'>
          <div className='tw-hidden lg:tw-block'>
            <Image src={HeroImage} alt='Hero Image Mobile' className='tw-w-full' />
          </div>
          <div className='tw-block lg:tw-hidden'>
            <Image src={HeroImageMobile} alt='Hero Image Mobile' className='tw-w-full' />
          </div>
          <div className='tw-absolute tw-top-[37.5%] tw-left-1/2 -tw-translate-x-1/2'>
            <Image src={Notification} alt='Notification' className='tw-w-full' />
          </div>
        </div>
      </div>
      {/* Mobile Hero Image */}
      <div className='tw-w-full tw-h-full tw-relative tw-hidden'>
        <Image src={HeroImageMobile} alt='Hero Image Mobile' className='tw-h-auto tw-w-full' />
        <div className='tw-absolute tw-top-[37.5%] tw-left-1/2 -tw-translate-x-1/2'>
          <Image src={Notification} alt='Notification' className='tw-w-full' />
        </div>
        <div className='tw-flex tw-flex-col tw-w-full tw-py-5 tw-px-8 tw-mb-24'>
          <h1 className='tw-text-[40px] tw-tracking-[-0.48px] md:tw-leading-[110%] tw-mb-0'>
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
              className='tw-flex tw-items-center tw-justify-center tw-gap-2 tw-w-full lg:tw-h-16 md:tw-h-16 tw-h-auto tw-bg-black-22 tw-font-bold tw-text-white md:tw-text-xl tw-text-2xl tw-rounded-full tw-transition-all tw-duration-300 hover:tw-bg-black-600 hover:tw-shadow-lg hover:tw-scale-[1.02] disabled:tw-opacity-60 disabled:tw-cursor-not-allowed disabled:hover:tw-scale-100'
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
              <div className='tw-block md:tw-hidden'>
                <div className='tw-w-full tw-flex tw-flex-row sm:tw-flex-row tw-justify-between tw-items-center tw-gap-5 2xl:tw-gap-6'>
                  <div className='tw-w-[100px]'>
                    <Image src={Profilemobile} alt='Review' className='tw-h-auto tw-w-full' />
                  </div>
                  <div className='tw-h-full tw-flex tw-flex-col tw-justify-center tw-items-center sm:tw-items-start'>
                    <p className='tw-text-white tw-font-lato lg:tw-text-xl tw-text-base tw-leading-[120%] tw-tracking-[0.02rem] tw-mb-0 tw-whitespace-nowrap'>
                      Join 15k
                      <span className='tw-block'>Patients!</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className='tw-w-full tw-h-full tw-flex tw-flex-col tw-justify-center tw-items-center tw-mt-9'>
                <Review />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
