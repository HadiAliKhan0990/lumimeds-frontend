'use client';

import Testimonials from '@/components/Home/Testimonials';
import styles from './TestimonialsRun.module.scss';

export default function TestimonialsRun() {
  return (
    <div className={styles.testimonialsSection}>
      <Testimonials />
    </div>
  );
}
