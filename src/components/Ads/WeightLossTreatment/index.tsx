'use client';

import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import { TrustpilotData } from '@/services/trustpilot';
import '@/components/Ads/otp/style.scss';
import HeroSection from './includes/HeroSection';
import PlansSection from './includes/PlansSection';
import ProductCards from './includes/ProductCards';
import LoseWeightSection from './includes/LoseWeightSection';
import PricingSection from './includes/PricingSection';
import WhatMakesUsBest from './includes/WhatMakesUsBest';
import ContactSection from './includes/ContactSection';
import TrustpilotReviews from '@/components/Home/TrustpilotReviews';
import styles from './styles.module.scss';

interface Props {
  data: ProductTypesResponseData;
  trustpilotData: TrustpilotData;
}

export default function WeightLossTreatment({ data, trustpilotData }: Readonly<Props>) {
  // Check if GLP-1/GIP products are available for PlansSection
  const hasGlp1GipProducts = data.glp_1_gip_plans?.products && data.glp_1_gip_plans.products.length > 0;

  return (
    <div className={`${styles.weightLossTreatmentPage} pt-6-custom`}>
      <HeroSection trustpilotData={trustpilotData} />
      {hasGlp1GipProducts && <PlansSection data={data.glp_1_gip_plans?.products ?? []} />}
      <LoseWeightSection />
      <ProductCards data={data} />
      <PricingSection />
      <WhatMakesUsBest />
      <section className={styles.testimonialsSection}>
        <div className={styles.container}>
          <h2 className={styles.testimonialsHeading}>What our customers say about us</h2>
          <TrustpilotReviews className='trustpilot-testimonials' />
        </div>
      </section>
      <ContactSection />
    </div>
  );
}
