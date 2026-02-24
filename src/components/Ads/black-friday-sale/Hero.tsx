import HeroImage from '../../../assets/ads/black-friday-sale/Hero_Desktop.png';
import HeroImageMobile from '../../../assets/ads/black-friday-sale/hero-mobile.png';
import ExtendedBadge from '../../../assets/ads/black-friday-sale/extended-badge.svg';
import { FaArrowRight } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { useState } from 'react';
import { Spinner } from 'react-bootstrap';
import Image from 'next/image';

interface Props {
  title?: string;
}

export default function Hero({ title }: Readonly<Props>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = () => {
    setIsLoading(true);
    router.push(ROUTES.PATIENT_INTAKE);
  };

  return (
    <div className=' tw-w-full tw-h-full'>
        {/* Hero Desktop */}
        <div className='tw-relative tw-w-full xl:tw-h-[40vw] tw-h-[60vw] tw-hidden md:tw-block'>
          <div
            className='tw-w-full tw-h-full tw-bg-cover tw-bg-center tw-relative tw-z-10'
            style={{ backgroundImage: `url(${HeroImage.src})` }}
          >
            <div className='tw-flex tw-justify-center tw-flex-col tw-items-center tw-w-full tw-text-[#002C8C] tw-text-[3.125vw] tw-font-bold xl:tw-pt-[6.5vw] tw-pt-[12vw]'>
              <Image src={ExtendedBadge} alt='Extended Badge' className='' />
              {title && <h1 className='tw-m-0 tw-text-[#002C8C] tw-text-[3.125vw] tw-font-bold'>{title}</h1>}
            </div>
          </div>
          <div className="tw-absolute tw-inset-0 tw-after:content-[''] tw-after:tw-absolute tw-after:tw-bottom-0 tw-after:tw-w-full tw-after:tw-h-1/2 tw-after:tw-bg-gradient-to-t tw-after:tw-from-[#6E9FE3] tw-after:tw-to-transparent tw-bg-gradient-to-b tw-from-[#6E9FE3] tw-to-[#B8D6FF] md:tw-h-3/4 tw-h-[250px]"></div>
        </div>

        {/* Hero Mobile */}
        <div className='tw-relative tw-w-full xl:tw-h-[40vw] tw-h-[88.372vw] tw-block md:tw-hidden'>
          <div
            className='tw-w-full tw-h-full tw-bg-contain tw-bg-no-repeat tw-bg-[0_80px] tw-relative tw-z-10'
            style={{ backgroundImage: `url(${HeroImageMobile.src})` }}
          >
            <div className='tw-w-full tw-text-[#002C8C] tw-text-2xl tw-font-bold tw-flex tw-justify-center tw-flex-col tw-items-center tw-pt-[23vw]'>
              <Image src={ExtendedBadge} alt='Extended Badge' className='' />
              {title && <h1 className='tw-m-0 tw-text-[#002C8C] tw-text-2xl tw-font-bold'>{title}</h1>}
            </div>
          </div>
          <div className="tw-absolute tw-inset-0 tw-after:content-[''] tw-after:tw-absolute tw-after:tw-bottom-0 tw-after:tw-w-full tw-after:tw-h-1/2 tw-after:tw-bg-gradient-to-t tw-after:tw-from-[#6E9FE3] tw-after:tw-to-transparent tw-bg-gradient-to-b tw-from-[#6E9FE3] tw-to-[#B8D6FF] tw-h-[calc(100%-25.581vw)]"></div>
        </div>

        <div className='tw-flex md:tw-flex-row tw-flex-col tw-gap-4 tw-items-start tw-justify-between tw-px-5 xl:tw-pt-4 tw-pt-0 tw-max-w-[1640px] tw-mx-auto tw-w-full'>
          <h3 className='tw-hidden md:tw-block xl:tw-w-[40vw] tw-w-2/3 tw-font-[400] xl:tw-text-[2.083vw] tw-text-2xl tw-tracking-[-0.05em] tw-leading-[100%] tw-text-[#002C8C] tw-mb-0'>
            Secure 3 months of GLP-1 and GLP-1/GIP weight loss injections with LumiMeds.
            <div className='tw-font-playfairDisplay tw-italic'> Offer expires Dec 12, 2025</div>
          </h3>
          {/* For Mobile */}
          <h3 className='tw-block md:tw-hidden tw-w-full tw-font-[400] tw-text-base text-center tw-tracking-[-0.05em] tw-leading-[100%] tw-text-[#002C8C]'>
            Secure 3 months of GLP-1 and GLP-1/GIP weight loss injections with LumiMeds. Offer expires Dec 12, 2025
          </h3>
          <div className='tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-2 md:tw-w-auto tw-w-full'>
            <button
              type='button'
              onClick={handleGetStarted}
              disabled={isLoading}
              className='w-flex tw-flex tw-justify-center tw-items-center tw-gap-3 tw-h-[68px] tw-px-[1.875vw] tw-max-w-[370px] md:tw-min-w-[370px] tw-w-full md:tw-mr-0 tw-mx-auto tw-bg-[#002C8C] tw-rounded-full
            hover:tw-bg-[#001f6b] hover:tw-scale-105 tw-transition tw-duration-300 tw-ease-in-out'
            >
              {isLoading && <Spinner className='border-2 text-white' size='sm' />}
              <p className='tw-text-white tw-font-bold tw-text-center tw-text-2xl tw-leading-[100%] tw-uppercase tw-tracking-[-0.5px] lg:tw-tracking-[-0.8px] xl:tw-tracking-[-1px] 2xl:tw-tracking-[-1.2px] tw-mb-0'>
                Get Your Plan
              </p>
              <FaArrowRight className='tw-text-white tw-text-2xl' />
            </button>
            <div className='tw-bg-[##737D97] tw-text-sm tw-w-full tw-text-center'>Prescription Required</div>
          </div>
        </div>
      </div>
  );
}
