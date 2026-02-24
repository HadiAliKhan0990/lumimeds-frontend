'use client';

import './TrustpilotStarRating.css';

interface TrustpilotStarRatingProps {
  rating: number;
  maxStars?: number;
  className?: string;
  starColor?: string;
  starBgColor?: string;
}

export default function TrustpilotStarRating({ rating, maxStars = 5, className = '', starColor = '#fff', starBgColor= '#00b67a' }: TrustpilotStarRatingProps) {
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <div
        key={i}
        className='trustpilot-star trustpilot-star--full'
        style={{
          '--star-color': starColor,
          '--star-bg-color': starBgColor,
        } as React.CSSProperties}
        >
          ★
        </div>
      );
    }

    // Half star (if needed)
    if (hasHalfStar) {
      stars.push(
        <div key='half' className='trustpilot-star trustpilot-star--half'>
          {/* Green left half */}
          <div
            className='trustpilot-star__half-fill'
            style={{ '--star-color': starColor, '--star-bg-color': starBgColor } as React.CSSProperties}
          />
          {/* White star */}
          <span
            className='trustpilot-star__character'
            style={{ '--star-color': starColor, '--star-bg-color': starBgColor } as React.CSSProperties}
          >★</span>
        </div>
      );
    }

    // Empty stars
    const emptyStars = maxStars - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      const isLast = i === emptyStars - 1;
      stars.push(
        <div
          key={`empty-${i}`}
          className={`trustpilot-star trustpilot-star--empty ${isLast ? 'trustpilot-star--last' : ''}`}
          style={{ '--star-color': starColor, '--star-bg-color': starBgColor } as React.CSSProperties}
        >
          ★
        </div>
      );
    }

    return stars;
  };

  return <div className={`trustpilot-star-rating ${className || ''}`}>{renderStars()}</div>;
}
