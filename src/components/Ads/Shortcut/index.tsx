'use client';

import { ShortcutHero } from '@/components/Ads/Shortcut/includes/ShortcutHero';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import ProductListShortcut from './includes/ProductCards/ProductListShortcut';
import TestimonialsShortcut from './includes/TestimonialsShortcut';
import styles from './responsive.module.scss';

interface Props {
  data: ProductTypesResponseData;
}

export default function ShortcutAd({ data }: Readonly<Props>) {
  return (
    <div className={styles.shortcutPageContainer}>
      <ShortcutHero />
      <ProductListShortcut productsData={data} />
      <TestimonialsShortcut />
    </div>
  );
}
