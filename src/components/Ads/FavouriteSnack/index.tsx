'use client';

import FavoriteSnackHero from '@/components/Ads/FavouriteSnack/includes/FavoriteSnackHero';
import OvercomeLimitations from '@/components/Ads/OvercomeLimitations';
import ScienceBackedSolution from '@/components/Ads/ScienceBackedSolution';
import AboutUs from '@/components/Home/AboutUs';
import HowItWorks from '@/components/Home/HowItWorks';
import SpecialOffer2 from '@/components/Home/SpecialOffer2';
import WeightLossProgram from '@/components/Home/WeightLossProgram';
import TrustpilotReviews from '@/components/Home/TrustpilotReviews';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import { TrustpilotData } from '@/services/trustpilot';
import '../styles.css';
import '@/components/Home/Testimonials/styles.css';

interface Props {
  data: ProductTypesResponseData;
  trustpilotData: TrustpilotData;
}

export default function FavoriteSnackAdPage({ data }: Readonly<Props>) {
  return (
    <>
      <FavoriteSnackHero />
      <ScienceBackedSolution data={data} />
      <SpecialOffer2 data={data} />
      <section id='testimonials' className='testimonials_sec'>
        <p className='testimonial_title'>
          Customer <span className='fw-normal font-instrument-serif fst-italic'>Reviews</span>
        </p>
        <TrustpilotReviews className='trustpilot-testimonials-dark' theme='dark' />
      </section>
      <OvercomeLimitations />
      <HowItWorks />
      <WeightLossProgram data={data} />
      <AboutUs />
    </>
  );
}
