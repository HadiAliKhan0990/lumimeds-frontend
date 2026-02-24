'use client';

import TrustpilotReviews from '@/components/Home/TrustpilotReviews';
import styles from './TestimonialsGlpGip.module.scss';

export default function TestimonialsGlpGip() {
  return (
    <section className={styles.testimonialsSection}>
      <p className={styles.testimonialTitle}>
        Customer <span className={styles.reviewsText}>Reviews</span>
      </p>
      <TrustpilotReviews theme='transparent' />
    </section>
  );
}
