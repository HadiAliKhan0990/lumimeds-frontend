'use client';

import Hero from '@/components/Ads/GoogleShoppingTry/includes/Hero';
import TrustBadges from '@/components/Ads/GoogleShoppingTry/includes/TrustBadges';
import MonthProduct from '@/components/Ads/GoogleShoppingTry/includes/MonthProduct';
import HowItWorks from '@/components/Ads/GoogleShoppingTry/includes/HowItWorks';
import WhyLumimeds from '@/components/Ads/GoogleShoppingTry/includes/WhyLumimeds';
import TestimonialsSection from '@/components/Ads/TestimonialsSection';
import FAQ from '@/components/Ads/GoogleShoppingTry/includes/FAQ';
import type { ProductType } from '@/store/slices/productTypeSlice';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { AppDispatch, RootState } from '@/store';

interface GoogleShoppingPageProps {
  totalPrice?: number;
  product?: ProductType;
}

export default function GoogleShoppingPage({ totalPrice, product }: GoogleShoppingPageProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isPending, startTransition] = useTransition();
  const checkout = useSelector((state: RootState) => state.checkout);
  const { isSurveyCompleted, checkoutUser } = checkout || {};

  const handleSeeIfYouQualify = async () => {
    if (product) {
      await handleVerifyRedirectToCheckout({
        selectedProduct: product,
        product: product,
        dispatch,
        startTransition,
        router,
        isSurveyCompleted,
        checkoutUser,
      });
    }
  };


  return (
    <div>
      <Hero
        product={product}
        handleSeeIfYouQualify={handleSeeIfYouQualify}
        isPending={isPending}
      />
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
      <FAQ product={product} handleSeeIfYouQualify={handleSeeIfYouQualify} isPending={isPending} />
    </div>
  );
}
