'use client';

import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import ProductListWeightLoss from '@/components/Ads/glp1-program/includes/PlanSection/ProductListWeightLoss';
import ProductListSustainable from '@/components/Ads/glp1-program/includes/PlanSection2/ProductListSustainable';
import TestimonialsSection from '@/components/Ads/glp1-program/includes/TestimonialSection';
import AdvertisementSection from '@/components/Ads/glp1-program/includes/AdvertisementSection/AdvertisementSection';
import MedSpaLeftShape from '@/assets/med-spa/LmObject.png';
import MedSpaRightShape from '@/assets/med-spa/Black.png';
import HeroSection from './HeroSection';

interface Props {
  data: ProductTypesResponseData;
}

export default function MedSpaPage({ data }: Readonly<Props>) {
  return (
    <div className='pt-6-custom'>
      <HeroSection />
      <ProductListWeightLoss
        productsData={data}
        backgroundColor='#FFFFFF'
        withBorders
        borderColor='#000000'
        borderWidth={2}
        cardBackgroundColor='#000000'
        getStartedButtonStyle={{
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
          hoverBackgroundColor: '#FFFFF2',
        }}
        badgeStyle={{
          background: '#FFFFFF',
          textColor: '#000000',
        }}
      />
      <AdvertisementSection
        leftShapeImage={MedSpaLeftShape}
        rightShapeImage={MedSpaRightShape}
        buttonTextColor='#FFFFFF'
      />
      <ProductListSustainable
        productsData={data}
        backgroundColor='#000000'
        cardBackgroundColor='#FFFFFF'
        sectionHeadingColor='#FFFFFF'
        headingColor='#000000'
        subHeadingColor='#000000'
        priceColor='#000000'
        popularTagColor='#000000'
        buttonStyle={{
          backgroundColor: '#000000',
          textColor: '#FFFFFF',
          hoverBackgroundColor: '#333333',
        }}
      />
      <TestimonialsSection />
    </div>
  );
}
