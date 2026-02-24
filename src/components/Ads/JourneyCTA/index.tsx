'use client';

import '../styles.css';
import Image from 'next/image';
import GLP1Bottle from '@/assets/ads/journey/glp-1.png';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import JourneySection from '@/components/Ads/JourneySection';
import GLP1PlansSection from '@/components/Ads/GLP1PlansSection';
import GLP1GIPPlansSection from '@/components/Ads/GLP1GIPPlansSection';
import { GLP1_PRODUCT_NAME } from '@/constants/factory';
import TrustpilotReviews from '@/components/Home/TrustpilotReviews';

interface JourneyCTAProps {
  productsData: ProductTypesResponseData;
}

export default function JourneyCTA({ productsData }: Readonly<JourneyCTAProps>) {
  return (
    <>
      <section className='journey-cta-hero d-flex align-items-center justify-content-center overflow-visible position-relative'>
        <div className='col-lg-9 col-xl-8'>
          <div className='journey-cta-text my-4 my-xl-0'>
            <h1 className='journey-cta-title-main display-1'>
              Your Journey to a <br /> Healthier You Starts Now.
            </h1>

            <h3 className='journey-cta-title-sub'>Personalized Weight Management, Delivered.</h3>
          </div>
        </div>

        <Image
          src={GLP1Bottle}
          alt={`${GLP1_PRODUCT_NAME} Compounded Medication`}
          width={1246}
          height={2649}
          className='object-fit-contain w-130px h-300px journey-cta-bottle-image'
        />
      </section>

      <section className='journey-cta-bottom-content mt-5'>
        <h2 className='journey-cta-bottom-title mt-5'>Welcome to the Next Level of Weight Management</h2>
        <p className='journey-cta-bottom-description'>
          We understand that every journey is unique, and each individual has unique needs. So we designed our range of
          weight loss plans to ensure you can find the perfect fit for your lifestyle and wellness goals.
        </p>
      </section>

      <JourneySection />

      {/* Only render plan sections if products data is available */}
      {productsData?.glp_1_plans && <GLP1PlansSection productsData={productsData.glp_1_plans} />}

      {productsData?.glp_1_gip_plans && <GLP1GIPPlansSection productsData={productsData.glp_1_gip_plans} />}

      <section className='testimonials-section'>
        <div className='container'>
          <h2 className='text-center display-5 tw-font-poppins tw-font-semibold'>Customer Reviews</h2>
          <TrustpilotReviews className='trustpilot-testimonials-dark' theme='light' />
        </div>
      </section>
    </>
  );
}
