'use client';

import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import WeightLossHero from './includes/WeightLossHero';
import ProductListWeightLoss from './includes/PlanSection/ProductListWeightLoss';
import PaymentFlexibility from './includes/PaymentFlexibility';
import TestimonialsSection from './includes/TestimonialsSection';

interface Props {
  data: ProductTypesResponseData;
}

export default function WeightLoss({ data }: Readonly<Props>) {
  return (
    <div>
      <WeightLossHero />
      <ProductListWeightLoss productsData={data} />
      <TestimonialsSection />
      <PaymentFlexibility />
    </div>
  );
}
