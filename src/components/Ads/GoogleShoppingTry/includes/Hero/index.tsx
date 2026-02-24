'use client';
import HeroImage from '@/assets/ads/google-shopping/hero-banner.png';
import HeroImageMobile from '@/assets/ads/google-shopping/mobile-hero.png';
import PhoneIcon from '@/assets/ads/google-shopping/faPhone.svg';
import EmailIcon from '@/assets/ads/google-shopping/faemail.svg';
import HippaIcon from '@/assets/ads/google-shopping/hippa-icon.svg';
import LicensedIcon from '@/assets/ads/google-shopping/licensed-icon.svg';
import Image from 'next/image';
import type { ProductType } from '@/store/slices/productTypeSlice';
import { Spinner } from 'react-bootstrap';

interface HeroProps {
  product?: ProductType;
  handleSeeIfYouQualify: () => void;
  isPending: boolean;
}

export default function Hero({ product, handleSeeIfYouQualify, isPending }: HeroProps) {
  
  const contactLinks = [
    {
      href: 'tel:+14159680890',
      icon: PhoneIcon,
      alt: 'Phone',
      label: '(415) 968-0890',
      iconClasses: 'md:tw-w-[1.111vw] tw-w-[12px]',
    },
    {
      href: 'mailto:help@lumimeds.com',
      icon: EmailIcon,
      alt: 'Email',
      label: 'help@lumimeds.com',
      iconClasses: 'tw-mt-1 md:tw-w-[1.25vw] tw-w-[12px]',
    },
  ];

  const badges = [
    { icon: HippaIcon, alt: 'HIPAA' },
    { icon: LicensedIcon, alt: 'Licensed' },
  ];

  const tirzepatideHeading = 'Your First 90 Days of Clinically Guided GLP-1/GIP Care';

  return (
    <div className='tw-flex md:tw-flex-row tw-flex-col lg:tw-gap-[6.25vw] tw-gap-6 tw-justify-end'>
      <div className='tw-flex tw-flex-col tw-justify-center tw-flex-1 lg:tw-pl-[6.25vw] md:tw-pl-5 md:tw-pr-0 tw-px-4 tw-mt-[100px]'>
        <h1 className='tw-font-lumitype tw-font-[700] md:tw-text-[3.611vw] tw-text-[32px] tw-leading-[100%] tw-text-center tw-tracking-[-0.05em] tw-text-[#222A3F] md:tw-px-5 tw-px-3 tw-mb-6'>
          {tirzepatideHeading}
        </h1>
        <div className='lg:tw-max-w-[37.708vw] tw-w-full'>
          <p className='tw-font-lato tw-text-[#737D97] md:tw-text-base tw-text-xs tw-leading-[120%] tw-text-center md:tw-m-0 tw-mb-6 md:tw-max-w-full tw-max-w-[372px] tw-mx-auto'>
            Clinically-guided starter doses 12 Compounded Tirzepatide (GLP-1/GIP) Injections for those beginning treatment.
          </p>
        </div>
        <div className='tw-block md:tw-hidden ld:tw-max-w-[408px] tw-h-[280px] tw-overflow-hidden tw-rounded-2xl'>
          <div
            className='tw-w-full tw-h-full tw-bg-cover tw-bg-center tw-relative tw-z-10'
            style={{ backgroundImage: `url(${HeroImageMobile.src})` }}
          ></div>
        </div>
        <div className='tw-max-[35.417vw] md:tw-mt-[3.472vw] tw-mt-10 md:tw-mb-3 tw-mb-6'>
          <button
            type='button'
            onClick={handleSeeIfYouQualify}
            disabled={isPending || !product}
            className='tw-flex tw-items-center tw-justify-center tw-gap-2 tw-w-full md:tw-text-[1.389vw] tw-text-[3.636vw] md:tw-h-[3.333vw] tw-h-[35px] tw-bg-[#222A3F] tw-text-white tw-font-lato md:tw-font-semibold tw-font-normal tw-rounded-full tw-transition-all tw-duration-300 hover:tw-bg-[#1a2133] hover:tw-shadow-lg hover:tw-scale-[1.02] disabled:tw-opacity-60 disabled:tw-cursor-not-allowed disabled:hover:tw-scale-100'
          >
            {isPending && <Spinner className='border-2' size='sm' />}
            <span>{'See If You Qualify'}</span>
          </button>
          <div className='tw-mt-3 tw-flex tw-gap-3'>
            {contactLinks.map(({ href, icon, alt, label, iconClasses }) => (
              <a
                key={href}
                href={href}
                className='tw-flex tw-items-center tw-justify-center md:tw-gap-3 tw-gap-1 tw-group tw-w-full md:tw-text-[1.389vw] md:tw-h-[3.542vw] tw-text-[3.636vw] tw-h-[35px] tw-bg-transparent tw-border tw-border-solid tw-border-[#222A3F] tw-text-[#222A3F] tw-font-lato tw-font-normal tw-rounded-full tw-transition-all tw-duration-300 hover:tw-bg-[#222A3F] hover:tw-text-white hover:tw-shadow-lg tw-no-underline'
              >
                <div
                  className={`${iconClasses} tw-transition-all tw-duration-300 group-hover:tw-brightness-0 group-hover:tw-invert`}
                >
                  <Image src={icon} alt={alt} className='tw-w-full' />
                </div>
                <span>{label}</span>
              </a>
            ))}
          </div>
        </div>
        <p className='tw-font-lumitype md:tw-max-w-full tw-max-w-[340px] tw-mx-auto tw-text-xs tw-text-[#737D97] tw-text-center tw-tracking-[-5%]'>
          Prescription required. Compounded medications are not FDA-approved for safety, effectiveness, or quality.
        </p>
        <div className='tw-flex tw-items-center tw-justify-evenly lg:tw-gap-[0.833vw] tw-gap-6 tw-mx-1.389vw lg:tw-mt-[4.167vw] md:tw-my-5 tw-mt-6 tw-mb-12'>
          {badges.map(({ icon, alt }) => (
            <div 
              key={alt} 
              className='xl:tw-w-auto'
            >
              <Image src={icon} alt={alt} />
            </div>
          ))}
        </div>
      </div>
      <div className='tw-hidden md:tw-block md:tw-w-[50.139vw] md:tw-min-h-[48.125vw]'>
        <div
          className='tw-w-full tw-h-full tw-bg-cover tw-bg-center tw-relative tw-z-10'
          style={{ backgroundImage: `url(${HeroImage.src})` }}
        ></div>
      </div>
    </div>
  );
}
