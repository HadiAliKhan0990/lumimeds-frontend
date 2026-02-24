'use client';

import { HowToStartHero } from '@/components/Ads/HowToStart/includes/HowToStartHero/index';
import { TestimonialsHowToStart } from '@/components/Ads/HowToStart/includes/TestimonialsHowToStart/index';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import ProductCards from '@/components/Ads/HowToStart/includes/ProductCards';
import styles from './responsive.module.scss';

interface Props {
  data: ProductTypesResponseData;
}

export default function HowToStartAd({ data }: Readonly<Props>) {
  return (
    <div className={`${styles.howToStartPageContainer} pt-6-custom`}>
      <HowToStartHero />
      <div className={styles.betweenProductsAndReviews}>
        <ProductCards data={data} />
      </div>
      <TestimonialsHowToStart />
    </div>
  );
}
