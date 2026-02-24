'use client';

import Image from 'next/image';
import GirlEatingImage from '@/assets/ads/best-weight-loss-medication/girl-eating.png';
import styles from './styles.module.scss';

export default function GirlEating() {
  return (
    <section className={styles.girlEatingSection}>
      <div className={styles.girlEatingCard}>
        <div className={styles.contentWrapper}>
          <div className={styles.textContent}>
            {/* Headline */}
            <h2 className={styles.headline}>
              The First Step Toward a Healthier You
            </h2>

            {/* Body text */}
            <p className={styles.bodyText}>
              Compounded medications that work with your body to help regulate appetite, improve fullness, and support long-term weight management.
            </p>
          </div>

          <div className={styles.imageContent}>
            <Image 
              src={GirlEatingImage} 
              alt="Woman eating healthy food" 
              className={styles.girlImage}
              width={600}
              height={700}
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
