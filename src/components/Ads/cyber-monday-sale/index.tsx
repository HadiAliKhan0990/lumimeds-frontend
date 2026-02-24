'use client';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import Hero from '../black-friday-sale/Hero';
import Review from '../black-friday-sale/Review';
import Plans from '../black-friday-sale/Plan';
import OurPromise from '../black-friday-sale/OurPromise';
import WhyUs from '../black-friday-sale/WhyUs';
import Questions from '../black-friday-sale/Questions';
import TestimonialsSection from '@/components/Ads/TestimonialsSection';
import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { TrustpilotData } from '@/services/trustpilot';
interface Props {
  data: ProductTypesResponseData;
  trustpilotData: TrustpilotData;
}

// const isBannerExpired = (): boolean => {
//   const targetDate = new Date('2025-12-12T23:59:59').getTime();
//   const now = new Date().getTime();
//   return now >= targetDate;
// };

export default function CyberMondaySale({ data, trustpilotData }: Readonly<Props>) {
  const { setTheme } = useTheme();
  useEffect(() => {
    setTheme('black-friday-sale');
    return () => setTheme('default');
  }, [setTheme]);

  return (
    <div className='tw-bg-[#FCFAF7]'>
      <Hero title='CYBER MONDAY SALE' />
      <Review />
      <Plans data={data} />
      <OurPromise trustpilotData={trustpilotData} />
      <WhyUs />
      <TestimonialsSection
        backgroundColor='tw-bg-white'
        showTitle={false}
        titleTextClassName='tw-text-[28px] md:tw-text-[28px] lg:tw-text-[32px] xl:tw-text-[37px] tw-font-bold tw-leading-[133%] tw-text-black tw-mt-4 tw-font-poppins tw-text-center'
        className='pt-4 pb-0'
      />
      <Questions />
    </div>
  );
}
