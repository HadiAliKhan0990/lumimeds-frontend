'use client';

import Hero from '@/components/Ads/GoogleShopping/includes/Hero';
import TrustBadges from '@/components/Ads/GoogleShopping/includes/TrustBadges';
import MonthProduct from '@/components/Ads/GoogleShopping/includes/MonthProduct';
import HowItWorks from '@/components/Ads/GoogleShopping/includes/HowItWorks';
import WhyLumimeds from '@/components/Ads/GoogleShopping/includes/WhyLumimeds';
import TestimonialsSection from '@/components/Ads/TestimonialsSection';
import FAQ from '@/components/Ads/GoogleShopping/includes/FAQ';
import type { ProductType } from '@/store/slices/productTypeSlice';

interface GoogleShoppingPageProps {
  totalPrice?: number;
  product?: ProductType;
}

export default function GoogleShoppingPage({ totalPrice, product }: GoogleShoppingPageProps) {
  return (
    <div className='tw-bg-white lg:tw-pt-[72px] tw-pt-[100px]'>
      <Hero product={product} />
      <TrustBadges />
      <MonthProduct totalPrice={totalPrice} product={product} />
      <HowItWorks />
      <WhyLumimeds />
      <TestimonialsSection
        backgroundColor='tw-bg-white'
        showTitle={false}
        titleTextClassName='tw-text-[28px] md:tw-text-[28px] lg:tw-text-[32px] xl:tw-text-[37px] tw-font-bold tw-leading-[133%] tw-text-black tw-mt-4 tw-font-poppins tw-text-center'
        className='pt-4 pb-0'
      />
      <div className='tw-text-center tw-text-base tw-text-[#222A3F] tw-opacity-60'>Individual results vary</div>
      <FAQ />
    </div>
  );
}
