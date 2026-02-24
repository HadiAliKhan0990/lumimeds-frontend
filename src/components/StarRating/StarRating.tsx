'use client';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  showHalfStars?: boolean;
  className?: string;
}

export default function StarRating({
  rating,
  maxStars = 5,
  size = 'md',
  showHalfStars = true,
  className = '',
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = showHalfStars && rating % 1 !== 0;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className='star text-warning'>
          ★
        </span>
      );
    }

    // Half star (if needed)
    if (hasHalfStar) {
      stars.push(
        <span key='half' className='star text-warning opacity-50'>
          ★
        </span>
      );
    }

    // Empty stars
    const emptyStars = maxStars - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className='star text-muted'>
          ☆
        </span>
      );
    }

    return stars;
  };

  return <div className={`review-stars ${sizeClasses[size]} ${className}`}>{renderStars()}</div>;
}
