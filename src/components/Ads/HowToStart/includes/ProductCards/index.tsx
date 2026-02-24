'use client';

import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import ProductCard from './ProductCard';
import { CardHeading } from '../CardHeading/index';
import styles from './styles.module.scss';

interface Props {
  data: ProductTypesResponseData;
}

export default function ProductCards({ data }: Readonly<Props>) {
  return (
    <div className={styles.productCardsSection}>
      <CardHeading />
      <div className='container'>
        <div className={styles.cardsContainer}>
          {data.glp_1_plans && (
            <div className={styles.cardWrapper}>
              <ProductCard product={data.glp_1_plans?.products?.[0]} />
            </div>
          )}
          {data.glp_1_gip_plans && (
            <div className={styles.cardWrapper}>
              <ProductCard product={data.glp_1_gip_plans?.products?.[0]} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
