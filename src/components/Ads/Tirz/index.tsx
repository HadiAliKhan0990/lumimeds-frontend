'use client';

import { TirzHero } from '@/components/Ads/Tirz/includes/TirzHero';
import { CardHeader } from '@/components/Ads/Tirz/includes/CardHeader';
import ProductListTirz from '@/components/Ads/Tirz/includes/ProductCards/ProductListTirz';
import { TestimonialsTirz } from '@/components/Ads/Tirz/includes/TestimonialsTirz';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import styles from './responsive.module.scss';

interface Props {
  data: ProductTypesResponseData;
}

export default function TirzAd({ data }: Readonly<Props>) {
  return (
    <div className={styles.tirzPageContainer}>
      <TirzHero />
      <div className={styles.gradientSection}>
        <CardHeader />
        <ProductListTirz productsData={data} />
        <TestimonialsTirz />
      </div>
    </div>
  );
}
