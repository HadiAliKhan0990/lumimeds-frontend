import Image from 'next/image';
import Banner from '@/assets/ads/longevity-microdosages/nad-banner.png';
import BannerMobile from '@/assets/ads/longevity-microdosages/nad-banner-mobile.png';

const nadBenefits = [
  'Appears to slow certain effects of aging',
  'Can improve mental clarity',
  'May boost your energy',
  'Possibly supports metabolic health',
];

export default function NadBanner() {
  return (
    <section className='tw-py-0 tw-w-full tw-flex tw-flex-col-reverse md:tw-flex-row tw-justify-between md:tw-gap-6 tw-bg-black-22 md:tw-pl-[4.792vw]'>
      <div className='tw-flex-1 md:tw-py-[7.361vw] tw-px-5 tw-py-10 tw-max-w-[600px] tw-w-full'>
        <h2 className='tw-text-[#F3FF53] tw-text-5xl tw-font-lumitype tw-font-bold tw-leading-[100%] tw-mb-7'>
          To B (Vitamins) Or Not
        </h2>
        <p className='tw-text-white tw-text-xl tw-font-lato md:tw-leading-[100%] tw-leading-normal tw-mb-0'>
          NAD (nicotinamide adenine dinucleotide) is a form of vitamin B that occurs naturally in your body, but as we
          age, levels significantly decline. NAD therapy can help keep levels optimal.
        </p>
        <p className='tw-text-white tw-text-xl tw-font-lato md:tw-leading-[100%] tw-leading-normal tw-my-7'>
          Keeping optimal levels of NAD:
        </p>
        <ul className='tw-m-0 tw-p-0 tw-list-disc tw-list-outside tw-marker:text-[#F3FF53] tw-marker:text-sm tw-pl-5'>
          {nadBenefits.map((benefit, index) => (
            <li
              key={index}
              className={`tw-text-[#F3FF53] tw-text-xl tw-font-lato md:tw-leading-[100%] tw-leading-normal ${
                index === nadBenefits.length - 1 ? 'tw-mb-0' : 'tw-mb-3'
              }`}
            >
              {benefit}
            </li>
          ))}
        </ul>
        <p className='tw-text-white tw-text-xl tw-font-lato md:tw-leading-[100%] tw-leading-normal tw-mb-0 tw-mt-7'>
          All of these potential benefits of NAD therapy promote overall wellness.
        </p>
      </div>
      <div className='tw-max-w-[670px] tw-flex-1 tw-w-full'>
        <Image src={Banner} alt='NAD Banner' className='tw-w-full tw-h-full tw-object-cover tw-hidden md:tw-block' />
        <Image
          src={BannerMobile}
          alt='NAD Banner Large'
          className='tw-w-full tw-h-full tw-object-cover tw-block md:tw-hidden'
        />
      </div>
    </section>
  );
}
