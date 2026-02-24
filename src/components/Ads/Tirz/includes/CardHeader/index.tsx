'use client';

import styles from './styles.module.scss';
import { GLP1_GIP_PRODUCT_NAME, GLP1_GIP_LABEL } from '@/constants/factory';

export const CardHeader = () => {
  return (
    <section className={styles.cardHeaderSection}>
      <div className='container'>
        <div className={styles.cardHeaderContainer}>
          <h2 className={styles.cardHeaderTitle}>
            {GLP1_GIP_PRODUCT_NAME} <br /> {GLP1_GIP_LABEL} Injection Plans
          </h2>
          <p className={styles.cardHeaderDescription}>A dual approach to weight care for enhanced transformation</p>
        </div>
      </div>
    </section>
  );
};
