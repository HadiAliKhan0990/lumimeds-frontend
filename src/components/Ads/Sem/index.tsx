'use client';

import { SemHero } from '@/components/Ads/Sem/includes/SemHero';
import { CardHeader } from '@/components/Ads/Sem/includes/CardHeader';
import { TestimonialsSem } from '@/components/Ads/Sem/includes/TestimonialsSem';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import ProductListSem from '@/components/Ads/Sem/includes/ProductCards/ProductListSem';
import styles from './responsive.module.scss';

interface Props {
  data: ProductTypesResponseData;
}

export default function SemAd({ data }: Readonly<Props>) {
  return (
    <div className={styles.semPageContainer}>
      <SemHero />
      <div className={styles.gradientSection}>
        <CardHeader />
        <ProductListSem productsData={data} />
        <TestimonialsSem />
      </div>
    </div>
  );
}
