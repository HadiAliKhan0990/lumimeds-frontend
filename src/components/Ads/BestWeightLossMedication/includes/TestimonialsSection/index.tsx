'use client';

import TrustpilotReviews from '@/components/Home/TrustpilotReviews';
import { useTranslations } from 'next-intl';
import styles from './styles.module.scss';

interface TestimonialsSectionProps {
  backgroundColor?: string;
  paddingTop?: number;
  showTitle?: boolean;
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  backgroundColor = '#3060FE',
  paddingTop,
  showTitle = true,
}) => {
  const t = useTranslations('testimonials');

  return (
    <section
      className={`${styles.testimonialsSection} testimonials-section`}
      style={{ backgroundColor, paddingTop, paddingBottom: paddingTop }}
    >
      <div className='container-fluid'>
        <div className={`${styles.testimonialsContainer} testimonials-container mx-auto`}>
          {showTitle && <h2 className='text-center mb-4'>{t('title')}</h2>}
          <TrustpilotReviews className='trustpilot-testimonials-dark' theme='dark' />
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
