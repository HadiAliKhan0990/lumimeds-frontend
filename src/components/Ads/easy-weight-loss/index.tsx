'use client';

import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import HeroSection from './includes/HeroSection';
import SciencePlansSection from './includes/SciencePlansSection';
import Specialities from './includes/Specialities';
import ProductCards from './includes/ProductCards';
import PaymentAdvertisement from './includes/PaymentAdvertisement';
import ContactSection from './includes/ContactSection';
import TrustpilotReviews from '@/components/Home/TrustpilotReviews';
import './style.scss';

interface Props {
  data: ProductTypesResponseData;
}

export default function EasyWeightLoss({ data }: Readonly<Props>) {
  return (
    <div className='tw-bg-[#FCFAF7] pt-6-custom'>
      <HeroSection />
      <SciencePlansSection data={data.glp_1_gip_plans?.products ?? []} />
      <Specialities />
      <ProductCards data={data} />
      <PaymentAdvertisement />
      <section className='container testimonials-section tw-bg-transparent'>
        <h2 className='tw-text-[28px] md:tw-text-[32px] lg:tw-text-[36px] tw-font-medium tw-text-center tw-text-[#2D2D2D] tw-mt-4 font-playfair'>
          What our customer say about us
        </h2>
        <div className='container-fluid'>
          <div className='testimonials-container mx-auto'>
            <TrustpilotReviews className='trustpilot-testimonials' />
          </div>
        </div>
      </section>

      <ContactSection />
    </div>
  );
}
