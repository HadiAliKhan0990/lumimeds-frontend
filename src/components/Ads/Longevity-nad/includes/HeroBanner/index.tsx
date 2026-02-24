import Image from 'next/image';
import HeroImage from '@/assets/ads/longevity-microdosages/hero-banner.png';
import Review from '@/components/shared/Review';
import Link from 'next/link';
import { ROUTES } from '@/constants';

export default function Hero() {
  return (
    <section className='tw-max-w-[1233px] tw-w-full tw-mx-auto tw-px-5 md:tw-mb-0 tw-mb-5'>
      <div className='tw-flex tw-flex-col-reverse md:tw-flex-row tw-items-center tw-justify-center tw-gap-8'>
        <div className='tw-flex tw-flex-col'>
          <h1 className='tw-text-5xl tw-font-lumitype tw-tracking-[-0.48px] md:tw-leading-[110%] tw-mb-0'>
            Helps You <span className='tw-text-blue-46'>Fight Fatigue</span> and (Maybe) Find Your Keys
          </h1>
          <h6 className='tw-text-2xl tw-font-lato tw-text-black-22 tw-leading-[134%] tw-my-6'>
            Introducing LumiMeds NAD+ Injections
          </h6>
          <div className='tw-flex tw-flex-col tw-gap-2'>
            <Link
              href={ROUTES.LONGEVITY_PATIENT_INTAKE}
              className='tw-flex tw-items-center tw-justify-center tw-no-underline tw-w-full lg:tw-h-16 md:tw-h-16 tw-h-auto tw-bg-blue-46 tw-font-bold tw-text-white md:tw-text-xl tw-text-2xl tw-font-lumitype tw-rounded-full tw-transition-all tw-duration-300 hover:tw-bg-blue-600 hover:tw-shadow-lg'
            >
              Check Your Eligibility
            </Link>
            <div className='tw-text-[13px] tw-text-[#797979] tw-font-lato tw-tracking-[-0.13px] tw-text-sm tw-w-full tw-text-center md:tw-mt-0 tw-mt-3'>
              Prescription Required
            </div>
          </div>
          <div className='tw-w-full tw-h-full tw-flex tw-flex-col tw-justify-center tw-items-center tw-mt-9'>
            <Review />
          </div>
        </div>
        <div className='tw-max-w-[540px] tw-w-full'>
          <Image src={HeroImage} alt='Longevity NAD' className='tw-w-full tw-h-full tw-object-cover' />
        </div>
      </div>
    </section>
  );
}
