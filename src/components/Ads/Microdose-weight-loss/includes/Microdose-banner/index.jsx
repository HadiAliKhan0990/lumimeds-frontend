import Image from 'next/image';
import Banner from '@/assets/ads/longevity-microdosages/microdose-banner.png';
import BannerMobile from '@/assets/ads/longevity-microdosages/microdose-banner-mobile.png';

export default function MicrodoseBanner() {
  return (
    <section className='tw-py-0 tw-w-full tw-flex tw-flex-col md:tw-flex-row tw-justify-between xl:tw-gap-20 md:tw-gap-6 tw-bg-black-22 2xl:tw-pr-[10.792vw] xl:tw-pr-[4.792vw]'>
      <div className='tw-max-w-[670px] tw-flex-1 tw-w-full'>
        <Image src={Banner} alt='Microdose Banner' className='tw-w-full tw-h-full tw-object-cover tw-hidden md:tw-block' />
        <Image
          src={BannerMobile}
          alt='Microdose Banner'
          className='tw-w-full tw-h-full tw-object-cover tw-block md:tw-hidden'
        />
      </div>
      <div className='tw-flex-1 md:tw-py-[7.361vw] xl:tw-px-5 tw-px-4 tw-py-10 tw-max-w-[600px] tw-w-full'>
        <h2 className='tw-text-[#F3FF53] xl:tw-text-5xl tw-text-[40px] tw-font-lumitype tw-font-bold tw-leading-[100%] tw-mb-7'>
          Microdoses With
          <br />
          Macro Returns
        </h2>
        <p className='tw-text-white xl:tw-text-xl tw-font-lato tw-leading-normal tw-mb-0'>
          Microdoses of our Compounded Semaglutide (GLP-1) and Compounded Tirzepatide (GLP-1/GIP) are designed for <span className='tw-font-bold tw-text-[#F3FF53]'>steady and consistent progress</span> with more manageable side effects.
        </p>
        <p className='tw-text-white xl:tw-text-xl tw-font-lato tw-leading-normal xl:tw-my-7 tw-my-5'>
          Start with gentle doses to reduce side effects, and build tolerance with gradual increases for <span className='tw-font-bold tw-text-[#F3FF53]'>better comfort.</span>
        </p>
        <p className='tw-text-white xl:tw-text-xl tw-font-lato tw-leading-normal tw-mb-0 tw-mt-7'>
          Support both <span className='tw-font-bold tw-text-[#F3FF53]'>short- and long-term </span>weight-loss goals.
        </p>
      </div>
    </section>
  );
}
