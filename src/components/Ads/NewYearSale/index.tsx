'use client';

import Hero from './includes/Hero';
import Products from './includes/Products';
import SocialProof from '@/components/Ads/SocialProof';
import WhyLumimeds from '@/components/Ads/WhyLumimeds';
import TrustpilotReviews from '@/components/Home/TrustpilotReviews';
import { useBannerVisibility } from '@/hooks/useBannerVisibility';
import { useCallback } from 'react';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';

interface Props {
  productsData: ProductTypesResponseData;
}

export default function NewYearSalePage({ productsData }: Readonly<Props>) {
  const { isGeneralSaleActive } = useBannerVisibility();

  const handleGetStarted = useCallback(() => {
    const el = document.getElementById('new-year-sale-products');
    const isMobile = window.innerWidth <= 450;
    el?.scrollIntoView({ behavior: 'smooth', block: isMobile ? 'start' : 'center' });
  }, []);

  return (
    <div className={`${isGeneralSaleActive ? 'lg:tw-pt-[0px] tw-pt-[0]' : 'lg:tw-pt-[72px] tw-pt-[100px]'}`}>
      <Hero handleGetStarted={handleGetStarted} />
      <Products data={productsData} />
      <SocialProof />
      <WhyLumimeds
        title='Why Lumimeds for'
        titleHighlight='Weight-Loss?'
        titleHighlightColor='tw-text-blue-46'
        textColor='tw-text-black-22'
        padding='tw-pt-24 tw-pb-20'
        healthJourneys='20k+'
      />
      <div className='tw-max-w-[1200px] tw-w-full tw-mx-auto tw-px-5'>
        <TrustpilotReviews className='trustpilot-testimonials-light' theme='light' />
      </div>
      <div className='tw-text-center tw-text-base tw-font-lato tw-font-normal tw-text-black-22 tw-mt-20 tw-mb-36'>
        Individual Results May Vary
      </div>
    </div>
  );
}
