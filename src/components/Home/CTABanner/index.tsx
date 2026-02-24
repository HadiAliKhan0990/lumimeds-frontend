'use client';

import { useMemo } from 'react';
import { getRoundedPrice } from '@/helpers/products';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import '@/components/Home/CTABanner/styles.scss';

interface Props {
  data: ProductTypesResponseData;
}

export default function CTABanner({ data }: Readonly<Props>) {
  const lowestPrice = useMemo(() => {
    const allProducts = [
      ...(data.olympiaPlans?.products ?? []),
      ...(data.glp_1_gip_plans?.products ?? []),
      ...(data.glp_1_plans?.products ?? []),
    ];

    const sortedProducts = allProducts
      .filter((product) => typeof product?.dividedAmount === 'number')
      .sort((a, b) => {
        const aAmount = a.dividedAmount ?? 0;
        const bAmount = b.dividedAmount ?? 0;
        return aAmount - bAmount;
      });

    const rawLowestPrice = sortedProducts[0]?.dividedAmount ?? 0;

    return getRoundedPrice(rawLowestPrice);
  }, [data]);

  return (
    <div className='container'>
      <div className='cta-banner-container'>
        <div className='cta-banner-content'>
          <div className='cta-banner-text'>
            <h2 className='cta-banner-title'>
              Shed Pounds, <span className='cta-banner-title-normal'>Not Dollars</span>
            </h2>
            <div className='cta-banner-price'>
              Start at{' '}
              {lowestPrice !== Infinity && lowestPrice > 0 && (
                <span className='cta-banner-price-amount'>${lowestPrice}/mo.</span>
              )}
            </div>
            <p className='cta-banner-subtitle'>you can start your weight loss journey with us</p>
            <div className='cta-banner-features'>
              <div className='cta-banner-feature'>
                <div className='cta-banner-bullet'></div>
                <span className='cta-banner-feature-text'>Prescription & medication</span>
              </div>
              <div className='cta-banner-feature'>
                <div className='cta-banner-bullet'></div>
                <span className='cta-banner-feature-text'>No insurance required</span>
              </div>
            </div>

            <div className='cta-banner-delivery'>
              <span className='cta-banner-delivery-text'>Delivered to your doorstep nationwide.</span>
            </div>

            <div className='cta-banner-membership'>
              <span className='cta-banner-membership-text'>No membership required.</span>
            </div>

            <div className='cta-banner-disclaimer'>
              <span className='cta-banner-disclaimer-text'>
                Exclusions may apply based on the prescribed medication and state of residence. Check state eligibility
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
