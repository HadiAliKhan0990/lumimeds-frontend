'use client';
import { ROUTES } from '@/constants';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaArrowRight } from 'react-icons/fa6';
import { Spinner } from 'react-bootstrap';

export default function GetYourPlan() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = () => {
    setIsLoading(true);

    router.push(ROUTES.PATIENT_INTAKE);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className='lg:tw-max-w-[1640px] md:tw-max-w-full tw-px-5 tw-mx-auto tw-w-full'>
      <h2 className='tw-font-lumitype tw-font-bold tw-text-[#002C8C] xl:tw-text-[47px] md:tw-text-4xl tw-text-[23px] xl:tw-leading-[100%] md:tw-leading-[50px] tw-leading-[100%] tw-tracking-[-0.05em] tw-text-center tw-align-middle md:tw-mb-8 tw-mt-10 tw-mb-7'>
        Start today and feel confident heading into the New Year.
      </h2>
      <div className='tw-flex tw-flex-col tw-items-center tw-justify-center tw-w-full md:tw-gap-6 tw-gap-0 md:tw-mb-28 tw-mb-0'>
        <button
          type='button'
          onClick={handleGetStarted}
          disabled={isLoading}
          aria-busy={isLoading}
          aria-label={isLoading ? 'Loading, please wait' : 'Get Your Plan'}
          className='tw-flex tw-justify-center tw-items-center tw-gap-3 md:tw-h-[71px] tw-h-[52px] tw-px-5 xl:tw-max-w-[464px] md:tw-max-w-96 tw-w-full tw-mx-auto tw-bg-[#002C8C] tw-rounded-full
            hover:tw-bg-[#001f6b] hover:tw-scale-105 tw-transition tw-duration-300 tw-ease-in-out'
        >
          {isLoading && <Spinner className='border-2 text-white' size='sm' />}
          <p className='tw-text-white tw-font-bold tw-text-center md:tw-text-[27px] tw-text-[17px] tw-leading-[100%] tw-uppercase tw-tracking-[-0.5px] lg:tw-tracking-[-0.8px] xl:tw-tracking-[-1px] 2xl:tw-tracking-[-1.2px] tw-mb-0'>
            Get Your Plan
          </p>
          <FaArrowRight className='tw-text-white md:tw-text-2xl tw-text-lg' />
        </button>
        <div className='tw-text-[#737D97] tw-text-sm tw-w-full tw-text-center tw-mt-2'>Prescription Required</div>
      </div>
    </div>
  );
}
