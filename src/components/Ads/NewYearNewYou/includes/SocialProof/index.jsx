import FastShipping from '@/assets/ads/new-year-new-you/fast-shipping.svg';
import LegitScript from '@/assets/ads/new-year-new-you/Legitscript.svg';
import LicensedProviders from '@/assets/ads/new-year-new-you/licensed-provider.svg';
import Image from 'next/image';

const socialProofItems = [
  {
    image: FastShipping,
    alt: 'Fast Shipping',
    text: 'Fast, Discreet Shipping',
  },
  {
    image: LegitScript,
    alt: 'LegitScript Certified',
    text: 'LegitScript Certified',
  },
  {
    image: LicensedProviders,
    alt: 'U.S Licensed Providers',
    text: 'U.S.-Licensed Providers',
  },
];

export default function SocialProof() {
  return (
    <div>
      <section className='tw-px-5 tw-bg-[#EDF3FF] md:tw-py-[6.944vw] tw-py-16'>
        <div className='tw-flex tw-flex-col lg:tw-gap-16 md:tw-gap-8 tw-gap-16 md:tw-flex-row tw-items-center tw-justify-center tw-max-w-[890px] tw-w-full tw-mx-auto'>
          {socialProofItems.map((item, index) => (
            <div key={index} className='tw-flex-1'>
              <Image src={item.image} alt={item.alt} className='lg:tw-max-w-full lg:tw-h-full md:tw-w-40 tw-object-cover tw-mx-auto' />
              <p className='lg:tw-text-xl md:tw-text-base tw-text-xl tw-font-lumitype tw-font-normal tw-text-black-22 tw-leading-[100%] tw-mt-6 tw-mb-0 tw-text-center'>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
