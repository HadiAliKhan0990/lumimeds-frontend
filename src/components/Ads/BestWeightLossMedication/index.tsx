'use client';

import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import BestWeightLossHero from './includes/BestWeightLossHero';
import GirlEating from './includes/GirlEating';
import CardSection from './includes/CardSection';
import TestimonialsSection from './includes/TestimonialsSection';
import FAQCard from './includes/FAQCard';
import { useTheme } from '@/contexts/ThemeContext';
import { useEffect } from 'react';

interface Props {
  data: ProductTypesResponseData;
}

export default function BestWeightLossMedication({ data }: Readonly<Props>) {
  const { setTheme } = useTheme();

  useEffect(() => {
    // Do not override theme here so global footer keeps original styling
    return () => setTheme('default');
  }, [setTheme]);

  return (
    <main className='pt-6-custom'>
      <BestWeightLossHero />
      <GirlEating />
      <CardSection data={data} />
      <TestimonialsSection backgroundColor='#3060FE' />
      <FAQCard />
    </main>
  );
}
