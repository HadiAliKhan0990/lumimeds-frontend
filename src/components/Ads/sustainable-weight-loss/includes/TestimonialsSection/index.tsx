'use client';

import React from 'react';
import TrustpilotReviews from '@/components/Home/TrustpilotReviews';
import styles from './styles.module.scss';

interface TestimonialsSectionProps {
  backgroundColor?: string;
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ backgroundColor = '#f8f9fa' }) => {
  return (
    <section className={styles.testimonialsSection} style={{ backgroundColor }}>
      <div className='container-fluid'>
        <div className={styles.testimonialsContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>What Our Customers Say</h2>
            <p className={styles.sectionDescription}>
              Real stories from real people who have transformed their lives with our weight loss programs.
            </p>
          </div>

          <div className={styles.trustpilotWrapper}>
            <TrustpilotReviews className={styles.trustpilotTestimonials} theme='light' />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
