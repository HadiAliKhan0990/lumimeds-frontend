'use client';

import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import HeroSection from './HeroSection';
import ProductsSection from './ProductsSection/ProductSection';
import TestimonialsSection from '@/components/Ads/TestimonialsSection';
import Advertisement from './Advertisement';
import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface Props {
  data: ProductTypesResponseData;
}

export default function WeightLossThanksgiving({ data }: Readonly<Props>) {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme('thanksgiving');
    return () => setTheme('default');
  }, [setTheme]);

  return (
    <div className='pt-6-custom tw-bg-[#BA785A]'>
      <HeroSection />
      <ProductsSection data={data} />
      <TestimonialsSection
        backgroundColor='tw-bg-[#BA785A]'
        showTitle={true}
        titleTextClassName='tw-text-[28px] md:tw-text-[28px] lg:tw-text-[32px] xl:tw-text-[37px] tw-font-bold tw-leading-[133%] tw-text-white tw-mt-4 tw-font-poppins tw-text-center'
        className='sm:tw-px-10 xl:tw-px-12'
      />
      <Advertisement />
    </div>
  );
}
