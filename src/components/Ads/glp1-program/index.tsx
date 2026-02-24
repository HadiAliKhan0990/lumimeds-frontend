'use client';

import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import HeroSection from './includes/HeroSection/HeroSection';
import ProductListWeightLoss from './includes/PlanSection/ProductListWeightLoss';
import ProductListSustainable from './includes/PlanSection2/ProductListSustainable';
import TestimonialsSection from './includes/TestimonialSection';
import AdvertisementSection from './includes/AdvertisementSection/AdvertisementSection';

interface Props {
  data: ProductTypesResponseData;
}

export default function Glp1ProgramPage({ data }: Readonly<Props>) {
  return (
    <div className='pt-6-custom'>
      <HeroSection />
      <ProductListWeightLoss productsData={data} />
      <ProductListSustainable productsData={data} />
      <AdvertisementSection />
      <TestimonialsSection />
    </div>
  );
}
