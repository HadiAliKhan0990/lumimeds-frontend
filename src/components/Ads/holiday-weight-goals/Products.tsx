'use client';

import { useRef, useState, useCallback } from 'react';
import InjectionsTirzepatide from '../../../assets/ads/christmas/three-injection-bottle.png';
import InjectionsSemaglutide from '../../../assets/ads/christmas/three-injection-semaglutide.png';
import MonthlyPlanGLP1 from '../../../assets/ads/christmas/monthly-plan-glp-1.png';
import MonthlyPlanGLPGIP from '../../../assets/ads/christmas/monthly-plan-glp-gip.png';
import { SurveyGetStartedButton } from '@/components/SurveyGetStartedButton';
import Image from 'next/image';
import { ProductType } from '@/store/slices/productTypeSlice';
import {
  WEIGHT_LOSS_INJECTIONS_LABEL,
  GLP1_PRODUCT_NAME,
  GLP1_GIP_PRODUCT_NAME,
  GLP1_LABEL,
  GLP1_GIP_LABEL,
} from '@/constants/factory';
import { getRoundedPrice } from '@/helpers/products';

export type MedicationType = 'tirzepatide' | 'semaglutide';

interface Props {
  products: ProductType[];
  type: MedicationType;
}

const medicationNames: Record<MedicationType, string> = {
  tirzepatide: GLP1_GIP_PRODUCT_NAME,
  semaglutide: GLP1_PRODUCT_NAME,
};

const injectionTypes: Record<MedicationType, string> = {
  tirzepatide: `${GLP1_GIP_LABEL} injections`,
  semaglutide: `${GLP1_LABEL} injections`,
};

export default function Products({ products, type }: Readonly<Props>) {
  const medicationName = medicationNames[type];
  const injectionType = injectionTypes[type];
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Filter products that have active prices
  const activeProducts = products
    .filter((product) => product.prices?.some((price) => price.isActive))
    .sort((a, b) => {
      // Get plan tier (default to 'monthly' if empty)
      const getPlanTier = (product: ProductType) => {
        const planTier = (product.displayName || product.metadata?.planTier || '').toLowerCase().trim();
        return planTier === '' ? 'monthly' : planTier;
      };

      const tierA = getPlanTier(a);
      const tierB = getPlanTier(b);

      // Define sort order: starter -> value -> monthly
      const order: Record<string, number> = {
        starter: 1,
        value: 2,
        monthly: 3,
      };

      const orderA = order[tierA] || 999;
      const orderB = order[tierB] || 999;

      return orderA - orderB;
    });

  const getImageSrc = (product: ProductType) => {
    const isMonthlyPlan = product.metadata?.intervalCount === 1;
    if (isMonthlyPlan) {
      return type === 'tirzepatide' ? MonthlyPlanGLPGIP : MonthlyPlanGLP1;
    }
    return type === 'tirzepatide' ? InjectionsTirzepatide : InjectionsSemaglutide;
  };

  const getImageAlt = (product: ProductType) => {
    const isMonthlyPlan = product.metadata?.intervalCount === 1;
    if (isMonthlyPlan) {
      return type === 'tirzepatide' ? 'Tirzepatide Monthly Plan' : 'Semaglutide Monthly Plan';
    }
    return type === 'tirzepatide' ? 'Tirzepatide Injections' : 'Semaglutide Injections';
  };

  const getPlanName = (product: ProductType) => {
    // Hardcode plan tier text for Semaglutide GLP1 cards
    if (type === 'semaglutide') {
      const intervalCount = product.metadata?.intervalCount;
      if (intervalCount === 3) {
        return '3-Month Plan';
      }
      if (intervalCount === 1) {
        return 'Monthly Plan';
      }
    }

    // Default logic for other products
    const planTier = product.displayName || product.metadata?.planTier || '';
    let planName = planTier.trim() === '' ? 'Monthly' : planTier;

    // Remove "Plan" if it already exists to avoid duplication
    planName = planName.replace(/\s*plan\s*$/i, '').trim();

    // Capitalize first letter and add " Plan" suffix
    const capitalized = planName.charAt(0).toUpperCase() + planName.slice(1);
    return `${capitalized} Plan`;
  };

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.offsetWidth;
    const newIndex = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(newIndex, activeProducts.length - 1));
  }, [activeProducts.length]);

  return (
    <>
      {/* Mobile: Horizontal scroll with snap */}
      <div className='md:tw-hidden tw-col-span-full'>
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className='tw-flex tw-overflow-x-auto tw-snap-x tw-snap-mandatory tw-gap-4 md:tw-pb-4 tw-pb-0 tw-scrollbar-hide'
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {activeProducts.map((product) => (
            <div
              key={product.id}
              className='tw-bg-[#ADCEFB] tw-rounded-3xl tw-px-6 tw-py-8 tw-flex tw-flex-col tw-gap-6 tw-min-w-full tw-snap-center'
            >
              <div className='tw-flex tw-justify-center tw-flex-col tw-items-center tw-gap-3'>
                <h3 className='tw-font-inter tw-font-bold tw-text-2xl tw-leading-[120%] tw-text-[#232322] tw-mb-0 tw-text-center'>
                  {medicationName}
                </h3>
                <h3 className='tw-font-inter tw-font-bold tw-text-2xl tw-leading-[120%] tw-text-[#232322] tw-mb-0 tw-text-center'>
                  {injectionType}
                </h3>
                <div className='tw-flex tw-flex-wrap tw-justify-center tw-gap-2 tw-items-center'>
                  <div className='tw-bg-transparent tw-font-inter tw-text-[#232322]'>
                    {WEIGHT_LOSS_INJECTIONS_LABEL}
                  </div>
                  <div className='tw-bg-[#232322] tw-font-inter tw-text-white tw-text-[15px] tw-h-10 tw-px-3 tw-py-2 tw-rounded-md tw-font-bold'>
                    {getPlanName(product)}
                  </div>
                </div>
                <div className='tw-max-w-[230px]'>
                  <Image src={getImageSrc(product)} alt={getImageAlt(product)} className='tw-w-full' />
                </div>
                <div className='tw-font-[900] tw-text-[57px] tw-leading-[120%] tw-tracking-[-0.03em] tw-text-[#232322] md:tw-my-0 tw-my-6'>
                  <span className='tw-font-normal'>$</span>
                  {getRoundedPrice(product.dividedAmount)}/<span className='tw-font-normal'>mo</span>
                </div>
                <SurveyGetStartedButton
                  product={product}
                  className='!tw-bg-[#232322] !tw-text-[#FCFAF7] !tw-rounded-full !tw-font-bold !tw-text-2xl tw-h-[72px] tw-uppercase tw-leading-[100%] hover:tw-opacity-90 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed tw-w-full'
                >
                  GET STARTED
                </SurveyGetStartedButton>
              </div>
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        <div className='tw-flex tw-justify-center tw-gap-2 tw-my-8'>
          {activeProducts.map((product, index) => (
            <span
              key={product.id}
              className={`tw-h-4 tw-w-4 tw-rounded-full tw-transition-all tw-duration-300 ${
                activeIndex === index ? 'tw-bg-[#002C8C]' : 'tw-bg-[#002C8C]/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Desktop: Original grid layout */}
      {activeProducts.map((product) => (
        <div
          key={product.id}
          className='tw-hidden tw-flex-1 tw md:tw-flex tw-bg-[#ADCEFB] tw-rounded-3xl xl:tw-px-6 tw-px-4 xl:tw-py-8 tw-py-6 tw-flex-col tw-gap-6 tw-h-full'
        >
          <div className='tw-flex tw-justify-center tw-flex-col tw-items-center tw-gap-3'>
            <h3 className='tw-font-inter tw-font-bold xl:tw-text-2xl lg:tw-text-xl md:tw-text-base tw-text-2xl md:tw-leading-[120%] tw-leading-[120%] tw-text-[#232322] tw-mb-0 tw-text-center'>
              {medicationName}
            </h3>
            <h3 className='tw-font-inter tw-font-bold xl:tw-text-2xl lg:tw-text-xl md:tw-text-base tw-text-2xl md:tw-leading-[120%] tw-leading-[120%] tw-text-[#232322] tw-mb-0 tw-text-center'>
              {injectionType}
            </h3>
            <div className='tw-flex tw-flex-wrap tw-justify-center tw-gap-2 tw-items-center'>
              <div className='tw-bg-transparent lg:tw-text-base md:text-sm tw-font-inter tw-text-[#232322]'>
                {WEIGHT_LOSS_INJECTIONS_LABEL}
              </div>
              <div className='tw-bg-[#232322] tw-font-inter tw-text-white xl:tw-text-base lg:tw-text-xs md:tw-h-auto tw-text-[15px] tw-h-10 tw-px-3 tw-py-2 tw-rounded-md tw-font-bold'>
                {getPlanName(product)}
              </div>
            </div>
            <div className='xl:tw-max-w-[230px] lg:tw-max-w-44 md:tw-max-w-32 lg:tw-my-6 md:tw-my-0'>
              <Image src={getImageSrc(product)} alt={getImageAlt(product)} className='tw-w-full' />
            </div>
            <div className='tw-font-[900] xl:tw-text-[57px] lg:tw-text-[40px] md:tw-text-3xl tw-text-[28px] xl:tw-leading-[120%] tw-leading-[100%] tw-tracking-[-0.03em] tw-text-[#232322] lg:tw-mb-4 md:tw-mb-0'>
              <span className='tw-font-normal'>$</span>
              {getRoundedPrice(product.dividedAmount)}/<span className='tw-font-normal'>mo</span>
            </div>
            <SurveyGetStartedButton
              product={product}
              className='!tw-bg-[#232322] !tw-text-[#FCFAF7] !tw-rounded-full !tw-font-bold xl:!tw-text-2xl md:!tw-text-base !tw-text-2xl xl:tw-h-[72px] md:tw-h-12 tw-h-[72px] tw-uppercase tw-leading-[100%] hover:tw-opacity-90 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed tw-w-full'
            >
              GET STARTED
            </SurveyGetStartedButton>
          </div>
        </div>
      ))}
    </>
  );
}
