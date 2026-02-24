import HeroImage from '../../../assets/ads/healthy-weight-loss/Hero.png';
import Arrow from '../../../assets/ads/healthy-weight-loss/Arrow.png';
import Profiles from '../../../assets/ads/healthy-weight-loss/Profiles.png';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { useState } from 'react';
import { Spinner } from 'react-bootstrap';

export default function HeroSection() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  return (
    <section className='tw-flex tw-w-auto tw-flex-col md:tw-flex-row tw-gap-12 md:tw-gap-6 tw-items-center tw-justify-center tw-bg-[#FCFAF7] tw-mx-4 md:tw-mx-14 tw-px-0 tw-pt-4 tw-pb-0 lg:tw-px-2 lg:tw-py-6 xl:tw-px-3 xl:tw-py-12'>
      {/* Left Section - Hero Image */}
      <div className='tw-flex tw-items-center tw-justify-center'>
        <Image
          src={HeroImage}
          alt='Healthy Weight Loss'
          className='md:tw-max-w-[180px] lg:tw-max-w-[200px] xl:tw-max-w-[300px] tw-h-auto tw-object-contain tw-rounded-2xl'
        />
      </div>

      {/* Middle Section - Headline and CTA */}
      <h1 className='tw-flex tw-w-auto tw-flex-col tw-items-center md:tw-items-start tw-justify-center tw-text-center tw-space-y-4'>
        <div className='tw-text-[26px] lg:tw-text-[40px] xl:tw-text-[52px] tw-font-extralight tw-leading-none'>
          <span className='tw-text-gray-800'>Your journey to lasting</span>
        </div>
        <div className='tw-text-[26px] lg:tw-text-[40px] xl:tw-text-[52px] tw-font-extralight tw-leading-none'>
          <span className='tw-text-[#FCB545] tw-font-bold'>
            weight care <span className='tw-text-gray-800 tw-font-extralight'>starts</span>
          </span>
        </div>
        <div className='tw-text-[26px] lg:tw-text-[40px] xl:tw-text-[52px] tw-font-extralight tw-leading-none tw-flex tw-flex-row tw-items-center tw-gap-2 sm:tw-gap-4'>
          <div className='tw-flex tw-items-center tw-gap-2 sm:tw-gap-4'>
            <span className='tw-text-gray-800'>right here</span>
            <Image src={Arrow} alt='Arrow' className='tw-w-10 lg:tw-w-16 xl:tw-w-24 tw-object-contain' />
          </div>
          <button
            type='button'
            onClick={() => {
              setIsLoading(true);
              router.push(`${ROUTES.PATIENT_INTAKE}`);
            }}
            disabled={isLoading}
            className='tw-bg-black tw-text-white tw-px-4 tw-py-2 md:tw-px-2 md:tw-py-1 lg:tw-px-5 xl:tw-px-7 lg:tw-py-1.5 xl:tw-py-2 tw-rounded-full tw-font-medium tw-text-xs md:tw-text-sm lg:tw-text-sm xl:tw-text-lg hover:tw-bg-gray-800 tw-transition-colors tw-inline-flex tw-items-center tw-justify-center tw-gap-2 disabled:tw-opacity-60 disabled:tw-cursor-not-allowed'
          >
            {isLoading && <Spinner className='border-2' size='sm' />}
            <span>Get Started</span>
          </button>
        </div>
      </h1>

      {/* Right Section - Social Proof */}
      <div className='tw-flex tw-w-auto tw-flex-col tw-items-center tw-justify-center tw-text-center tw-space-y-4 md:tw-pl-2 lg:tw-pl-6'>
        <div className='tw-mb-0'>
          <Image
            src={Profiles}
            alt='Customer Profiles'
            className='tw-max-w-[120px] lg:tw-max-w-[150px] xl:tw-max-w-[200px] tw-h-auto tw-object-contain'
          />
        </div>
        <p className='tw-text-[30px] lg:tw-text-[40px] xl:tw-text-[54px] tw-font-medium tw-text-[#FCB545] !tw-mt-0'>
          10000+
        </p>
        <p className='tw-text-[12px] lg:tw-text-[16px] xl:tw-text-[18px] tw-font-normal tw-text-[#9F9F9F] !tw-mt-0'>
          Satisfied Customers
        </p>
      </div>
    </section>
  );
}
