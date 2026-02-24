'use client';

import OlympiaFooter from '@/components/Ads/OlympiaFooter';
import OlympiaHero from '@/components/Ads/OlympiaAds/includes/OlympiaHero';
import SpecialOffer2 from '@/components/Home/SpecialOffer2';
import TrustpilotReviews from '@/components/Home/TrustpilotReviews';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import { TrustpilotData } from '@/services/trustpilot';
import '../styles.css';
import '@/components/Home/Testimonials/styles.css';

interface Props {
  data: ProductTypesResponseData;
  trustpilotData: TrustpilotData;
}

export default function OlympiaAds({ data }: Readonly<Props>) {
  return (
    <>
      <OlympiaHero />
      <SpecialOffer2 data={data} />
      <section id='testimonials' className='testimonials_sec'>
        <p className='testimonial_title'>
          Customer <span className='fw-normal font-instrument-serif fst-italic'>Reviews</span>
        </p>
        <TrustpilotReviews className='trustpilot-testimonials-dark' theme='dark' />
      </section>
      <OlympiaFooter />
    </>
  );
}
