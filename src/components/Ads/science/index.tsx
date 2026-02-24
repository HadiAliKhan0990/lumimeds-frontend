'use client';

import React from 'react';
import './style.scss';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import HeroSection from './includes/HeroSection';
import SciencePlansSection from './includes/SciencePlansSection';
import PlansIncludeSection from './includes/PlansIncludeSection';
import ConfidenceSection from './includes/ConfidenceSection';
import StatementSection from './includes/StatementSection';
import Testimonials from '@/components/Home/Testimonials';

interface Props {
  data: ProductTypesResponseData;
}

export default function ScienceAd({ data }: Readonly<Props>) {
  return (
    <main className='science-ad pt-6-custom'>
      <HeroSection data={data.glp_1_gip_plans?.products ?? []} />

      <SciencePlansSection data={data.glp_1_gip_plans?.products ?? []} />

      <PlansIncludeSection />

      <Testimonials />

      <ConfidenceSection />

      <StatementSection />
    </main>
  );
}
