'use client';

import FreeHero from '@/components/Ads/Free/includes/FreeHero';
import FreePlansSection from '@/components/Ads/FreePlansSection';
import FreeProductCard from '@/components/Ads/Free/includes/FreeProductCard';
import TrustpilotReviews from '@/components/Home/TrustpilotReviews';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import '../styles.css';

interface Props {
  data: ProductTypesResponseData;
}

export default function FreeAds({ data }: Readonly<Props>) {
  return (
    <main className='free-page-gradient pt-6-custom'>
      <FreeHero />
      <FreePlansSection />
      <FreeProductCard productsData={data} />
      <section className='testimonials-section bg-transparent container'>
        <h2 className='text-center display-5 tw-font-poppins tw-font-semibold'>Customer Reviews</h2>
        <TrustpilotReviews className='trustpilot-testimonials-dark' theme='light' />
      </section>
    </main>
  );
}
