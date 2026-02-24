'use client';

import TrustpilotReviews from '@/components/Home/TrustpilotReviews';
import styles from './TestimonialsSustained.module.scss';

export default function TestimonialsSustained() {
  return (
    <section className={styles.testimonialsSection}>
      <p className={styles.testimonialTitle}>
        Customer <span className={styles.reviewsText}>Reviews</span>
      </p>
      <TrustpilotReviews theme='transparent' />
    </section>
  );
}
