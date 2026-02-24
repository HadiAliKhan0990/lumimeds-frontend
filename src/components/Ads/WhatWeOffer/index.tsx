'use client';

import AverageReductionGrid from '@/components/Ads/WhatWeOffer/includes/AverageReductionGrid';
import Benefits2 from '@/components/Ads/Benefits2';
import OvercomeLimitations from '@/components/Ads/OvercomeLimitations';
import AboutUs from '@/components/Home/AboutUs';
import AllPlans from '@/components/Home/AllPlans';
import FeaturedSlider from '@/components/Home/FeaturedSlider';
import Hero from '@/components/Home/Hero';
import HowItWorks from '@/components/Home/HowItWorks';
import SpecialOffer2 from '@/components/Home/SpecialOffer2';
import Testimonials from '@/components/Home/Testimonials';
import WeightLossProgram from '@/components/Home/WeightLossProgram';
import { ProductsPlans } from '@/components/Home/ProductsPlans';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import { TrustpilotData } from '@/services/trustpilot';
import '@/components/Home/Testimonials/styles.css';

interface Props {
  data: ProductTypesResponseData;
  trustpilotData: TrustpilotData;
}

export default function WhatWeOffer({ data, trustpilotData }: Readonly<Props>) {
  return (
    <>
      <Hero trustpilotData={trustpilotData} />
      <FeaturedSlider />
      <ProductsPlans data={data} />
      <SpecialOffer2 data={data} />
      <Testimonials />
      <AllPlans />
      <AverageReductionGrid />
      <OvercomeLimitations />
      <HowItWorks className='mt-0' />
      <Benefits2 />
      <WeightLossProgram data={data} />
      <AboutUs />
    </>
  );
}
