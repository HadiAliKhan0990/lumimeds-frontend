'use client';

import { TRUSTPILOT_CONFIG } from '@/constants/trustpilot';
import TrustpilotStarRating from '@/components/StarRating/TrustpilotStarRating';
import StarRating from '@/components/StarRating/StarRating';
import { TrustpilotData } from '@/services/trustpilot';

interface TrustpilotWidgetProps {
  showReviews?: boolean;
  maxReviews?: number;
  className?: string;
  trustpilotData: TrustpilotData;
}

export default function TrustpilotWidget({
  showReviews = false,
  className = 'mb-3',
  trustpilotData,
}: TrustpilotWidgetProps) {
  const { businessUnit, reviews } = trustpilotData;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // If no business unit data is available, show a minimal fallback or hide
  if (!businessUnit) {
    return (
      <div className={`trustpilot-custom-container ${className}`}>
        <div className='d-flex gap-3 justify-content-center align-items-center trustpilot-main-container'>
          {/* Fallback content when data is not available */}
          <div className='trustpilot-group-3'>
            <a
              href={TRUSTPILOT_CONFIG.REVIEW_URL}
              target='_blank'
              rel='noopener noreferrer'
              className='text-decoration-none'
            >
              <div className='mb-0 fw-bold d-flex align-items-baseline gap-1'>
                <span className='mb-0' style={{ color: '#00B67A', fontSize: '26px' }}>
                  ★
                </span>
                <span style={{ color: 'black' }} className='fs-5'>
                  Trustpilot
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Add safety checks for businessUnit properties
  // Use trustScore (the actual Trustpilot rating) instead of stars
  const stars = businessUnit.trustScore;
  const numberOfReviews = businessUnit.numberOfReviews;

  return (
    <div className={`trustpilot-custom-container ${className}`}>
      {/* Trustpilot Rating Display */}
      <div className='d-flex gap-2 justify-content-center align-items-center trustpilot-main-container'>
      
      

        {/* Group 3: Trustpilot Link */}
        <div className='trustpilot-group-3'>
          <a
            href={TRUSTPILOT_CONFIG.REVIEW_URL}
            target='_blank'
            rel='noopener noreferrer'
            className='text-decoration-none'
          >
            <div className='mb-0 fw-bold d-flex align-items-baseline gap-1'>
              <span className='mb-0' style={{ color: '#00B67A', fontSize: '26px' }}>
                ★
              </span>
              <span style={{ color: 'black' }} className='fs-5'>
                Trustpilot
              </span>
            </div>
          </a>
        </div>
          {/* Group 1: Excellent + Stars */}
          <div className='trustpilot-group-1 gap-3'>
        
          <TrustpilotStarRating rating={stars} />

          <span className='mb-0 fs-5'>Excellent</span>
        </div>

          {/* Group 2: Rating Text */}
          <div className='trustpilot-group-2 text-muted'>
          <span className='mb-0 fs-6'>{stars.toFixed(1)}</span>
          <span className='mb-0 fs-6'>out of 5 based on</span>
          <span className='mb-0 fs-6'>{numberOfReviews}</span>
          <span className='mb-0 fs-6'>reviews</span>
        </div>
      </div>

      {/* Reviews Section */}
      {showReviews && reviews.length > 0 && (
        <div className='mt-3'>
          <h6 className='mb-2'>Recent Reviews</h6>
          <div className='row g-2'>
            {reviews.map((review) => (
              <div key={review.id} className='col-12'>
                <div className='card border-0 bg-light'>
                  <div className='card-body p-3'>
                    <div className='d-flex justify-content-between align-items-start mb-2'>
                      <StarRating rating={review.stars} size='sm' />
                      <small className='text-muted'>{formatDate(review.createdAt)}</small>
                    </div>
                    <h6 className='card-title mb-1'>{review.title}</h6>
                    <p className='card-text small text-muted mb-1'>
                      {review.text.length > 150 ? `${review.text.substring(0, 150)}...` : review.text}
                    </p>
                    <small className='text-muted'>
                      <strong>{review.consumerName}</strong>
                      {review.isVerified && <span className='ms-1 text-success'>✓ Verified</span>}
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
