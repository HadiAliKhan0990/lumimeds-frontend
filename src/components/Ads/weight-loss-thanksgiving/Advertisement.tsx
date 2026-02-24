import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { useState } from 'react';
import { Spinner } from 'react-bootstrap';

export default function Advertisement() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className='tw-bg-[#6C361D] tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-2 md:tw-gap-3 lg:tw-gap-4 xl:tw-gap-6 tw-py-12 md:tw-py-16 lg:tw-py-24 xl:tw-py-32'>
      <p className='tw-text-white tw-text-[16px] md:tw-text-[28px] lg:tw-text-[32px] xl:tw-text-[37px] tw-font-poppins tw-font-bold tw-text-center tw-leading-[133%] max-sm:tw-mb-2'>
        HSA/FSA Approved & Flexible Payments
      </p>
      <p className='tw-text-white tw-text-[9px] md:tw-text-[18px] lg:tw-text-[22px] xl:tw-text-[27px] tw-font-poppins tw-font-normal tw-text-center tw-leading-[133%] tw-max-w-[320px] md:tw-max-w-[645px] lg:tw-max-w-[800px] xl:tw-max-w-[960px]'>
        Take the stress out of treatment costs: LumiMeds accepts HSA/FSA funds, and you can spread payments using
        Klarna, Affirm or Afterpay for a more flexible, budget-friendly path to wellness. <br />
        <br />
        Why wait until the new year? Kickstart your weight-loss goals today and feel confident heading into the
        holidays.
      </p>
      <button
        type='button'
        className='tw-bg-white tw-rounded-[10px] md:tw-rounded-[16px] lg:tw-rounded-[19px] xl:tw-rounded-[23px] tw-text-[#6C361D] tw-font-bold tw-text-[17px] md:tw-text-[28px] lg:tw-text-[32px] xl:tw-text-[37px] tw-leading-[160%] tw-px-4 md:tw-px-8 lg:tw-px-10 xl:tw-px-14 tw-py-1 md:tw-py-1.5 lg:tw-py-2.5 xl:tw-py-3.5 tw-text-center tw-font-poppins tw-inline-flex tw-items-center tw-justify-center tw-gap-4 tw-transition-colors hover:tw-bg-black hover:tw-text-white disabled:tw-opacity-60 disabled:tw-cursor-not-allowed'
        onClick={() => {
          setIsLoading(true);
          router.push(ROUTES.PATIENT_INTAKE);
        }}
        disabled={isLoading}
      >
        {isLoading && <Spinner className='border-2' size='sm' />}
        <span>Start Your Journey Now</span>
      </button>
    </div>
  );
}
