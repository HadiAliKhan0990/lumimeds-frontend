'use client';

import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import HeroSection2 from './includes/HeroSection2';
import Personalized from './includes/Personalized';
import FeaturedMedications from './includes/FeaturedMedications';
import PromotionalSection from './includes/PromotionalSection';
import Reviews from './includes/Reviews';
import { TrustpilotData } from '@/services/trustpilot';
import './styles.css';

interface Props {
  data: ProductTypesResponseData;
  trustpilotData?: TrustpilotData;
}

export default function GlowUp({ data, trustpilotData }: Readonly<Props>) {
  return (
    <main className='pt-6-custom'>
      {/* <HeroSection /> */}
      <HeroSection2 />
      <Personalized />
      <FeaturedMedications data={data} />
      <Reviews trustpilotData={trustpilotData} />
      <PromotionalSection />
    </main>
  );
}
