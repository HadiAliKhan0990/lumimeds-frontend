'use client';

import { TrustpilotData } from '@/services/trustpilot';
import styles from '../styles.module.scss';

interface Props {
  trustpilotData: TrustpilotData;
}

export default function CustomTrustpilotWidget({ trustpilotData }: Readonly<Props>) {
  if (!trustpilotData) return null;

  const { businessUnit } = trustpilotData;

  const handleTrustpilotClick = () => {
    // Open Trustpilot in a new tab
    window.open('https://www.trustpilot.com/review/lumimeds.com', '_blank', 'noopener,noreferrer');
  };

  // Use the same dynamic logic as checkout form
  if (!businessUnit) {
    return (
      <div
        className={styles.customTrustpilotWidget}
        onClick={handleTrustpilotClick}
        style={{ cursor: 'pointer' }}
        role='button'
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTrustpilotClick();
          }
        }}
      >
        <div className={styles.trustpilotBranding}>
          <div className={styles.trustpilotStar}>★</div>
          <span className={styles.trustpilotText}>Trustpilot</span>
        </div>
        <div className={styles.starRating}>
          {[...Array(5)].map((_, index) => (
            <div key={index} className={styles.starContainer}>
              <div className={styles.starBackground}>
                <div className={styles.starIcon}>★</div>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.reviewCount}>
          Over <strong>+0</strong> Reviews
        </div>
      </div>
    );
  }

  // Use trustScore (the actual Trustpilot rating) instead of averageRating

  const numberOfReviews = businessUnit.numberOfReviews;

  return (
    <div
      className={styles.customTrustpilotWidget}
      onClick={handleTrustpilotClick}
      style={{ cursor: 'pointer' }}
      role='button'
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleTrustpilotClick();
        }
      }}
    >
      {/* Trustpilot Branding */}
      <div className={styles.trustpilotBranding}>
        <div className={styles.trustpilotStar}>★</div>
        <span className={styles.trustpilotText}>Trustpilot</span>
      </div>

      {/* Star Rating */}
      <div className={styles.starRating}>
        {[...Array(5)].map((_, index) => (
          <div key={index} className={styles.starContainer}>
            <div className={styles.starBackground}>
              <div className={styles.starIcon}>★</div>
            </div>
          </div>
        ))}
      </div>

      {/* Review Count */}
      <div className={styles.reviewCount}>
        Over <strong>+{numberOfReviews.toLocaleString()}</strong> Reviews
      </div>
    </div>
  );
}
