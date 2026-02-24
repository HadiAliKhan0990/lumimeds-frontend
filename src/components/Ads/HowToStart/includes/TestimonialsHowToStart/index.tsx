'use client';

import TrustpilotReviews from '@/components/Home/TrustpilotReviews';
import styles from './styles.module.scss';

export const TestimonialsHowToStart = () => {
  return (
    <section className={styles.testimonialsSection}>
      <p className={styles.testimonialTitle}>
        Customer <span className={styles.reviewsText}>Reviews</span>
      </p>
      <TrustpilotReviews className={styles.trustpilotWidget} theme='light' />
    </section>
  );
};
