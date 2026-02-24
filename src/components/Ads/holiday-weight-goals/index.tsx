'use client';
import Hero from './Hero';
import HowItWorks from './HowItWorks';
import GetYourPlan from './GetYourPlan';
import Review from './Review';
import Plan from './Plan';
import CarePlan from './CarePlan';
import PrescribedPatients from './PrescribedPatients';
import BeforeChristmas from './BeforeChristmas';
import WhyUs from './WhyUs';
import Questions from './Questions';
import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import snowflake from '../../../assets/ads/christmas/snowflake-bg.png';
import TestimonialsSection from '@/components/Ads/TestimonialsSection';
interface Props {
  data: ProductTypesResponseData;
}

export default function Christmas({ data }: Readonly<Props>) {
  const { setTheme } = useTheme();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  useEffect(() => {
    setTheme('christmas');
    return () => setTheme('default');
  }, [setTheme]);

  return (
    <div className='tw-bg-[#F3E6D5] lg:tw-pt-[72px] md:tw-pt-[100px] tw-pt-[93px]'>
      <Hero />
      <HowItWorks />
      <div
        className='tw-w-full tw-h-full tw-bg-contain tw-bg-center tw-relative tw-z-10 tw-bg-no-repeat'
        style={isDesktop ? { backgroundImage: `url(${snowflake.src})` } : undefined}
      >
        <div className='md:tw-block tw-flex tw-flex-col-reverse md:flex-col'>
          <GetYourPlan />
          <Review />
        </div>
        <Plan data={data} />
        <CarePlan />
        <PrescribedPatients />
        <BeforeChristmas />
      </div>
      <WhyUs />
      <TestimonialsSection
        backgroundColor='tw-bg-white'
        showTitle={false}
        titleTextClassName='tw-text-[28px] md:tw-text-[28px] lg:tw-text-[32px] xl:tw-text-[37px] tw-font-bold tw-leading-[133%] tw-text-black tw-mt-4 tw-font-poppins tw-text-center'
        className='tw-pt-4 tw-pb-0'
      />
      <Questions />
    </div>
  );
}
