'use client';

import { RunHero } from '@/components/Ads/Run/includes/RunHero';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import { CardHeader } from './includes/CardHeader';
import ProductListRun from './includes/ProductCards/ProductListRun';
import TestimonialsRun from './includes/ReviewSection/TestimonialsRun';
import styles from './responsive.module.scss';

interface Props {
  data: ProductTypesResponseData;
}

export default function RunAd({ data }: Readonly<Props>) {
  return (
    <div className={styles.runPageContainer}>
      <RunHero />
      <CardHeader />
      <ProductListRun productsData={data} />
      <TestimonialsRun />
    </div>
  );
}
