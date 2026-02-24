'use client';

import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import ProductCard from './ProductCard';
import { CardHeading } from './CardHeading';
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

        <p className={styles.disclaimerText}>
          Prescription medication is available only after an online evaluation with a healthcare provider. Physicians
          can prescribe compounded medications to meet patient needs or address drug shortages. The FDA does not review
          or approve compounded medications for safety or effectiveness. Results may vary. Actual product packaging may
          differ from what is shown.
        </p>
      </div>
    </div>
  );
}
