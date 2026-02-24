import Howworks from '../../../assets/ads/christmas/how-works.png';
import Holiday from '../../../assets/ads/christmas/holiday-shipping.svg';
import Certificate from '../../../assets/ads/christmas/certificate.svg';
import ProviderCertificate from '../../../assets/ads/christmas/provider-certificate.svg';
import Image from 'next/image';

const features = [
  { icon: Holiday, alt: 'Holiday-Shipping', text: 'Fast, discreet holiday shipping' },
  {
    icon: Certificate,
    alt: 'Certificate',
    text: (
      <>
        LegitScript <br /> Certified
      </>
    ),
  },
  {
    icon: ProviderCertificate,
    alt: 'Provider-Certificate',
    text: (
      <>
        U.S.-Licensed <br /> Providers
      </>
    ),
  },
];

export default function HowItWorks() {
  return (
    <div
      className='tw-flex tw-flex-col tw-items-center tw-justify-center xl:tw-min-h-[428px] md:tw-min-h-full xl:tw-py-0 md:tw-py-11 tw-py-[17px] xl:tw-mt-[104px] md:tw-mt-20 tw-mt-6 xl:tw-mb-20 md:tw-mb-16 tw-mb-4 tw-bg-contain'
      style={{ backgroundImage: `url(${Howworks.src})` }}
    >
      <div className='xl:tw-max-w-[1640px] tw-max-w-full tw-px-5 tw-mx-auto tw-w-full'>
        <div className='tw-grid tw-grid-cols-3 md:tw-gap-4 tw-gap-1'>
          {features.map((feature) => (
            <div
              key={feature.alt}
              className='tw-flex tw-flex-col tw-items-center tw-justify-center md:tw-gap-7 tw-gap-4'
            >
              <div className='tw-bg-[#001B55] tw-border tw-border-[#FCFAF7] tw-rounded-full xl:tw-w-40 xl:tw-h-40 md:tw-w-32 md:tw-h-32 tw-w-14 tw-h-14 tw-flex tw-items-center tw-justify-center'>
                <Image
                  src={feature.icon}
                  alt={feature.alt}
                  aria-hidden='true'
                  className='xl:tw-w-[73px] md:tw-w-12 tw-w-6'
                />
              </div>
              <div className='tw-max-w-60 tw-w-full'>
                <p className='tw-mb-0 md:tw-text-[23px] tw-text-[13px] tw-text-[#001B55] tw-font-medium md:tw-leading-[133%] tw-leading-[110%] tw-text-center'>
                  {feature.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
