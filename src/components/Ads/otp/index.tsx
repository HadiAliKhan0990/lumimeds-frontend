'use client';

import React from 'react';
import '@/components/Ads/otp/style.scss';
import HeroSection from '@/components/Ads/otp/includes/HeroSection';
import LoseWeightSection from '@/components/Ads/otp/includes/LoseWeightSection';
import PlansSection from '@/components/Ads/otp/includes/PlansSection';
import Testimonials from '@/components/Home/Testimonials';
import ContactSection from '@/components/Ads/otp/includes/ContactSection';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';

interface Props {
  data: ProductTypesResponseData;
}

export default function Otp({ data }: Readonly<Props>) {
  return (
    <div className='bg-white pt-6-custom'>
      <HeroSection />
      <LoseWeightSection />
      <PlansSection data={data} />
      <Testimonials />
      <ContactSection />
    </div>
  );
}
