'use client';

import { useRouter } from 'next/navigation';
import styles from './styles.module.scss';

export default function FAQCard() {
  const router = useRouter();

  const handleFAQClick = () => {
    router.push('/faqs');
  };

  return (
    <div className={styles.faqCardContainer}>
      <div className={styles.faqCard}>
        <h2 className={styles.faqTitle}>Still Have Questions?</h2>
        <button 
          className={styles.faqButton}
          onClick={handleFAQClick}
        >
          View FAQ →
        </button>
      </div>
    </div>
  );
}
