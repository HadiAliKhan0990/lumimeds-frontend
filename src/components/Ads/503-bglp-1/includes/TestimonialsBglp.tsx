'use client';

import TrustpilotReviews from '@/components/Home/TrustpilotReviews';
import styles from '@/components/Ads/503-bglp-1/includes/TestimonialsBglp.module.scss';

export const TestimonialsBglp = () => {
  return (
    <section className={styles.testimonialsSection}>
      <p className={styles.testimonialTitle}>
        Customer <span className={styles.reviewsText}>Reviews</span>
      </p>
      <TrustpilotReviews className={styles.trustpilotWidget} theme='light' />
    </section>
  );
};


