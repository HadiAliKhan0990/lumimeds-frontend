'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import MedSpa3Hero from './includes/med-spa-3-hero';
import MedSpa3Success from './includes/med-spa-3-success';
import TestimonialsSection from '@/components/Ads/TestimonialsSection';
import MedSpa3ProgipList from './includes/med-spa-3-pro-gip/med-spa-3-pro-gip-list';
import { useTheme } from '@/contexts/ThemeContext';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';

interface MedSpa3Props {
  readonly data: ProductTypesResponseData;
}

export default function MedSpa3({ data }: Readonly<MedSpa3Props>) {
  const { setTheme } = useTheme();
  const t = useTranslations('medSpa3');
  const tAnalytics = useTranslations('medSpa3.analytics');

  useEffect(() => {
    setTheme('light');
    return () => setTheme('default');
  }, [setTheme]);

  return (
    <div className='pt-6-custom'>
      <MedSpa3Hero data={data} t={t} />
      <MedSpa3Success backgroundColor='linear-gradient(90deg, #3060FE, #90A4FF)' color='white' t={tAnalytics} />
      <TestimonialsSection backgroundColor='#F7F0D2' />
      <MedSpa3ProgipList data={data} t={t} />
    </div>
  );
}
