'use client';
import ChristmasHeroImage from '../../../assets/ads/christmas/christmas-holiday.png';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { ROUTES } from '@/constants';

export default function Hero() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = () => {
    setIsLoading(true);
    router.push(ROUTES.PATIENT_INTAKE);
  };
  return (
    <div className='tw-flex md:tw-flex-row tw-flex-col lg:tw-gap-[5vw] tw-gap-6'>
      <div className='md:tw-w-[54.688vw] tw-h-80 md:tw-min-w-[54.688vw] tw-min-w-full md:tw-min-h-[40.156vw] tw-min-h-full'>
        <div
          className='tw-w-full tw-h-full tw-bg-cover tw-bg-center tw-relative tw-z-10'
          style={{ backgroundImage: `url(${ChristmasHeroImage.src})` }}
        ></div>
      </div>
      <div className='tw-flex tw-flex-col tw-justify-center tw-max-w-screen-md'>
        <div className='tw-flex tw-flex-col md:tw-gap-[2.083vw] tw-gap-3 md:tw-pr-[2vw] tw-px-4 md:tw-text-left tw-text-center'>
          <h1 className='tw-font-lumitype tw-font-bold lg:tw-text-[5vw] md:tw-text-4xl tw-text-3xl tw-leading-7 lg:tw-leading-[5vw] md:tw-leading-[110%] tracking-[-3%] tw-mb-0'>
            ’Tis the Season to Feel Good in Your Skin.
          </h1>
          <div className='tw-max-w-full'>
            <p className='tw-font-lato md:tw-text-[1.719vw] tw-text-[17px] tw-text-black-232 tw-font-normal md:tw-leading-[135%] tw-mb-0'>
              Give yourself the gift of confidence, control, and energy this holiday season with a clinician-guided
              program designed to support your wellness goals.
            </p>
          </div>
          <button
            type='button'
            onClick={handleGetStarted}
            disabled={isLoading}
            className='tw-relative tw-flex tw-justify-center tw-items-center tw-bg-[#CCDFFF] hover:tw-bg-[#b8d0ff] hover:tw-scale-[1.02] tw-transition tw-duration-200 tw-rounded-full xl:tw-text-[1.719vw] lg:tw-text-2xl md:tw-text-lg tw-text-[15px] md:tw-normal-case tw-uppercase tw-font-bold tw-font-lato md:tw-text-black-232 tw-text-[#002C8C] md:tw-px-9 tw-px-6 xl:tw-min-h-[4.635vw] tw-min-h-auto md:tw-h-auto tw-h-[46px] xl:tw-max-w-[32.135vw] tw-max-w-96 tw-w-full'
          >
            {isLoading && <Spinner className='border-2 tw-text-black-232 tw-mr-2' size='sm' />}
            <div className='tw-flex tw-flex-col tw-justify-center lg:tw-gap-2 md:tw-gap-0'>
              Start Your Online Evaluation
              <span className='md:tw-text-xs tw-text-[7px] md:tw-text-black-232 tw-text-[#002C8C] tw-leading-normal md:text-normal-case tw-uppercase'>
                Prescription required
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
