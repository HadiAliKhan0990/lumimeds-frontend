'use client';

import TrustpilotReviews from '@/components/Home/TrustpilotReviews';
import styles from './TestimonialsShortcut.module.scss';

export default function TestimonialsShortcut() {
  return (
    <div className={styles.testimonialsSection}>
      <section id='testimonials' className='testimonials_sec'>
        <p className='testimonial_title'>
          Customer <span className='fw-normal font-instrument-serif fst-italic'>Reviews</span>
        </p>
        <TrustpilotReviews className='trustpilot-testimonials-light' theme='light' />
      </section>
    </div>
  );
}
