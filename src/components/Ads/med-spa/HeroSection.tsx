import Image from 'next/image';
import Syringe from '@/assets/med-spa/Syringe.png';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { useState } from 'react';
import { Spinner } from 'react-bootstrap';

export default function HeroSection() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  return (
    <section className='tw-bg-white tw-text-black tw-p-0'>
      <div className='tw-mx-auto tw-max-w-screen-2xl'>
        <div className='tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-8 tw-items-center'>
          {/* Image */}
          <div className='tw-order-2 lg:tw-order-1 tw-flex tw-justify-center lg:tw-justify-start'>
            <div className='tw-w-full tw-max-w-[680px] xl:tw-max-w-[760px]'>
              <Image src={Syringe} alt='Syringe' className='tw-w-full tw-h-auto tw-object-contain' priority />
            </div>
          </div>

          {/* Content */}
          <div className='tw-order-1 lg:tw-order-2 tw-space-y-6  tw-pr-4 md:tw-pr-6 lg:tw-pr-20 tw-py-10 lg:tw-py-16 tw-text-center lg:tw-text-left tw-px-6 lg:tw-px-0'>
            <div className='tw-font-secondary tw-text-black tw-leading-[1.05]'>
              <h1 className='tw-font-bold tw-text-[28px] sm:tw-text-[44px] md:tw-text-[44px] xl:tw-text-[77px]'>
                Avoid the med spa markups!
              </h1>
              <p className='tw-font-normal tw-text-[20px] sm:tw-text-[36px] md:tw-text-[36px] xl:tw-text-[67px] tw-mt-2'>
                At LumiMeds, we mark it right!
              </p>
            </div>

            <div className='tw-font-primary tw-text-black tw-space-y-2'>
              <p className='tw-text-[14px] sm:tw-text-[18px] md:tw-text-[18px] xl:tw-text-[27px] tw-font-normal'>
                Get safe and effective weight care Prescribed by doctors, shipped directly to your door without the med
                spa markup.
              </p>
            </div>

            <div className='tw-flex tw-justify-center lg:tw-justify-start'>
              <button
                type='button'
                onClick={() => {
                  setIsLoading(true);
                  router.push(ROUTES.PATIENT_INTAKE);
                }}
                disabled={isLoading}
                className='tw-bg-white tw-font-secondary tw-font-bold tw-text-[14px] sm:tw-text-[18px] md:tw-text-[18px] xl:tw-text-[27px] tw-border-2 tw-border-solid tw-border-black tw-text-black tw-rounded-md tw-px-6 md:tw-px-8 tw-py-3 md:tw-py-3.5 tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-transition-colors disabled:tw-opacity-60 disabled:tw-cursor-not-allowed hover:tw-bg-black hover:tw-text-white'
              >
                {isLoading && <Spinner className='border-2' size='sm' />}
                <span>Choose Your Plan Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
