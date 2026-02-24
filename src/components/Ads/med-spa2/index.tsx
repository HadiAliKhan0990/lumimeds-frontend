'use client';

import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import TestimonialsSection from '@/components/Ads/TestimonialsSection';
import HeroSection from './HeroSection';
import MedSpa3Success from '../med-spa-3/includes/med-spa-3-success';
import ProductListWeightLoss from '@/components/Ads/glp1-program/includes/PlanSection/ProductListWeightLoss';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/contexts/ThemeContext';
import { useEffect } from 'react';

interface Props {
  data: ProductTypesResponseData;
}

export default function MedSpa2Page({ data }: Readonly<Props>) {
  const { setTheme } = useTheme();
  const t = useTranslations('medSpa2');
  const tAnalytics = useTranslations('medSpa2.analytics');
  const tProductListWeightLoss = useTranslations('productListWeightLoss');

  useEffect(() => {
    setTheme('light');
    return () => setTheme('default');
  }, [setTheme]);

  return (
    <div className='pt-6-custom'>
      <HeroSection data={data} t={t} />
      <MedSpa3Success backgroundColor='#FFFFFF' color='#3060FE' t={tAnalytics} />
      <TestimonialsSection backgroundColor='#FFC300' className='tw-pt-10 tw-pb-5' />
      <ProductListWeightLoss
        showBottomSubheading={false}
        productsData={data}
        backgroundColor='#FFFFFF'
        cardBackgroundColor='#3060FE'
        headingColor='#FFFFFF'
        subHeadingColor='#FFFFFF'
        priceColor='#FFFFFF'
        popularTagColor='#000000'
        showHeading={false}
        showSubheading={false}
        excludeValueProducts={true}
        getStartedButtonStyle={{
          backgroundColor: '#FFC300',
          textColor: '#3060FE',
          hoverBackgroundColor: '#E6B000',
        }}
        badgeStyle={{
          background: 'linear-gradient(90deg, #CAD6FF 7.8%, #FFFFFF 100%)',
          textColor: '#3060FE',
        }}
        t={tProductListWeightLoss}
      />
    </div>
  );
}
