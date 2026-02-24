'use client';

import HeroImage from '@/components/Ads/503bChoice/includes/HeroImage';
import PlanList from '@/components/Ads/503bChoice/includes/PlanList';
import TestimonialsSection from '@/components/Ads/TestimonialsSection';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import './styles.css';

interface Props {
  data: ProductTypesResponseData;
}

export default function Olympia503bchoice({ data }: Readonly<Props>) {
  return (
    <>
      <HeroImage />
      <PlanList data={data} />
      <TestimonialsSection backgroundColor='#FFE4E5' showTitle />
    </>
  );
}
