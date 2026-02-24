'use client';

import styles from './styles.module.scss';
import { GLP1_PRODUCT_NAME, GLP1_LABEL } from '@/constants/factory';

export const CardHeader = () => {
  return (
    <section className={styles.cardHeaderSection}>
      <div className='container'>
        <div className={styles.cardHeaderContainer}>
          <h2 className={styles.cardHeaderTitle}>
            {GLP1_PRODUCT_NAME} {GLP1_LABEL} Weight Loss Injection Plans
          </h2>
          <p className={styles.cardHeaderDescription}>Tailored to your needs and goals.</p>
        </div>
      </div>
    </section>
  );
};
