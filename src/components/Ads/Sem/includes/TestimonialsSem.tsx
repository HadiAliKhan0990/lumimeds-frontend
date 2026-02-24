'use client';

import TrustpilotReviews from '@/components/Home/TrustpilotReviews';
import styles from './TestimonialsSem.module.scss';

export const TestimonialsSem = () => {
  return (
    <section className={styles.testimonialsSection}>
      <p className={styles.testimonialTitle}>
        Customer <span className={styles.reviewsText}>Reviews</span>
      </p>
      <TrustpilotReviews className={styles.trustpilotWidget} theme='dark' />
    </section>
  );
};
