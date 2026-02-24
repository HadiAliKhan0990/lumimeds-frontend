'use client';

import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import SustainableWeightLossHero from './includes/SustainableWeightLossHero';
import ProductListSustainable from './includes/PlanSection/ProductListSustainable';
import PaymentFlexibility from './includes/PaymentFlexibility';
import TestimonialsSection from './includes/TestimonialsSection';

interface Props {
  data: ProductTypesResponseData;
}

export default function SustainableWeightLoss({ data }: Readonly<Props>) {
  return (
    <div>
      <SustainableWeightLossHero />
      <ProductListSustainable productsData={data} />
      <PaymentFlexibility />
      <TestimonialsSection />
    </div>
  );
}
