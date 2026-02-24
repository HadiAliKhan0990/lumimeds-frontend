import HeroSectionImage from '../../../assets/ads/weight-loss-thanksgiving/Hero.png';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { useState } from 'react';
import { Spinner } from 'react-bootstrap';

export default function HeroSection() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div
      className='tw-relative tw-w-full tw-flex tw-flex-col tw-items-start tw-justify-center tw-bg-cover tw-bg-center tw-pl-6 tw-pr-10 sm:tw-pr-52 md:tw-pl-10 md:tw-pr-44 lg:tw-pl-12 lg:tw-pr-72 xl:tw-pl-20 xl:tw-pr-96 tw-pt-[240px] md:tw-pt-[360px] lg:tw-pt-[420px] xl:tw-pt-[480px] tw-pb-[80px] md:tw-pb-[120px] lg:tw-pb-[140px] xl:tw-pb-[160px]'
      style={{ backgroundImage: `url(${HeroSectionImage.src})` }}
    >
      <h1 className='text-white tw-font-bold tw-text-[18px] sm:tw-text-[28px] md:tw-text-[42px] lg:tw-text-[52px] xl:tw-text-[67px] tw-leading-tight lg:tw-leading-[60px] xl:lg:tw-leading-[72px] tw-max-w-[867px] tw-font-poppins tw-mb-2 md:tw-mb-4 lg:tw-mb-6 xl:tw-mb-9'>
        Gratitude Feels Better <br /> When You Feel Your Best
      </h1>
      <p className='text-white tw-font-normal tw-text-[9px] sm:tw-text-[14px] md:tw-text-[19px] lg:tw-text-[24px] xl:tw-text-[27px] tw-leading-[160%] tw-max-w-[260px] sm:tw-max-w-[400px] md:tw-max-w-[550px] lg:tw-max-w-[690px] xl:tw-max-w-[775px] tw-font-poppins tw-mb-4 md:tw-mb-6 lg:tw-mb-6 xl:tw-mb-9'>
        A healthy you is the best gift you&apos;ll carry into the holidays. <br /> Start your journey with
        LumiMeds&apos; prescription weight-loss injections.
      </p>
      <button
        type='button'
        className='tw-bg-white tw-rounded-[10px] md:tw-rounded-[16px] lg:tw-rounded-[19px] xl:tw-rounded-[23px] tw-text-black tw-font-bold tw-text-[11px] md:tw-text-[22px] lg:tw-text-[28px] xl:tw-text-[33px] tw-leading-[160%] tw-px-8 md:tw-px-16 lg:tw-px-20 xl:tw-px-24 tw-py-2 md:tw-py-3 lg:tw-py-4 xl:tw-py-5 tw-text-center tw-font-poppins tw-inline-flex tw-items-center tw-justify-center tw-gap-4 tw-transition-colors hover:tw-bg-black hover:tw-text-white disabled:tw-opacity-60 disabled:tw-cursor-not-allowed'
        onClick={() => {
          setIsLoading(true);
          router.push(ROUTES.PATIENT_INTAKE);
        }}
        disabled={isLoading}
      >
        {isLoading && <Spinner className='border-2' size='sm' />}
        <span>Get Started</span>
      </button>
    </div>
  );
}
