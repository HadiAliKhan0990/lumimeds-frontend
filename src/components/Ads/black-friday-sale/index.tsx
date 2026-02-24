'use client';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import { TrustpilotData } from '@/services/trustpilot';
import Hero from './Hero';
import Review from './Review';
import Plans from './Plan';
import WhyUs from './WhyUs';
import OurPromise from './OurPromise';
import Questions from './Questions';
import TestimonialsSection from '@/components/Ads/TestimonialsSection';
import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
interface Props {
  data: ProductTypesResponseData;
  trustpilotData: TrustpilotData;
}

export default function BlackFridaySale({ data, trustpilotData }: Readonly<Props>) {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme('black-friday-sale');
    return () => setTheme('default');
  }, [setTheme]);

  return (
    <div className='tw-bg-[#FCFAF7]'>
      <Hero title='BLACK FRIDAY SALE' />
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
