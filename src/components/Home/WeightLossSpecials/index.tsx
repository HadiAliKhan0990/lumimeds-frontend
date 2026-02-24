'use client';

import { OneTimePurchaseCard } from '@/components/Cards/OneTimePurchaseCard';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import '@/styles/landing/landing.scss';

interface Props {
  data: ProductTypesResponseData;
}

export const WeightLossSpecials = ({ data }: Readonly<Props>) => {
  const oneTimePurchasePlans = data?.olympiaPlans?.products ?? [];

  // Don't render the entire component if there are no plans
  if (oneTimePurchasePlans.length === 0) {
    return null;
  }

  return (
    <section className='container py-5 mb-4'>
      <div className='text-center'>
        <h2 className='font-playfair'>
          <span className='text-rose-brown weight-sec-title'>503B GLP-1 Weight Loss</span>
          <br />
          <span className='display-2'>Injection Specials</span>
        </h2>
        <p className='text-lg my-5 title-description-for-cards'>
          Discover a more advanced approach to weight care.
          <br />
          Our exclusive GLP-1 plan - compounded in a highly regarded <br />
          503B facility and fulfilled by Olympia&apos;s trusted 503A pharmacy
        </p>
      </div>
      <h3 className='text-5xl my-4 fw-normal title-header-for-cards'>503B Plans</h3>
      <div className='row g-4 justify-content-center'>
        {oneTimePurchasePlans.map((p) => (
          <div key={p.id} className='col-sm-10 col-md-6 col-lg-4'>
            <OneTimePurchaseCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
};
