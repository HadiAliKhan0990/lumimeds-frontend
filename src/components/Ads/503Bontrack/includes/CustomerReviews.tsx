'use client';

import React from 'react';
import TrustpilotDarkTheme from '@/components/Home/TrustpilotReviews/DarkTheme';
// import { useState } from 'react';

// Commented out static customer reviews - now using Trustpilot widget
/*
interface Review {
  id: number;
  name: string;
  initials: string;
  avatarColor: string;
  initialsColor: string;
  date: string;
  rating: number;
  review: string;
  showMore: boolean;
}

const CustomerReviews = () => {
  const reviews = [
    {
      id: 1,
      name: 'Olivia Clawson',
      initials: 'DC',
      avatarColor: '#FFB6C1',
      initialsColor: '#C71585',
      date: '6 days ago',
      rating: 5,
      review:
        "This individual was very helpful, respectful and professional. I appreciate his patience and kindness in working with me to make sure I've done everything I need to get started. Thank you very much, Olivia",
      showMore: false,
    },
    {
      id: 2,
      name: 'Carmen Perez-Padron',
      initials: 'C',
      avatarColor: '#696969',
      initialsColor: '#FFFFFF',
      date: 'Jul 28, 2025',
      rating: 5,
      review:
        "I had an excellent experience with Lumi's customer service! I was having trouble logging into my payment portal due to recent changes. After submitting my telepath order and refill request, I reached out through Lumi Help email and Jay went above and beyond to assist me. The response time was incredibly fast, and thanks to Jay's support, I was able to place my order without any delays. Jay was professional, patient, and extremely helpful throughout the process. Truly top-notch service—thank you!",
      showMore: true,
    },
    {
      id: 3,
      name: 'Mateo',
      initials: 'MA',
      avatarColor: '#90EE90',
      initialsColor: '#006400',
      date: 'Jul 25, 2025',
      rating: 5,
      review: `I experienced what many have recently with their website overhaul. Not getting communication or response from chat sessions. I then reached out over email and was immediately helped by Jay. They were amazing, walked me through everything I needed to do. We got everything squared away this evening. Excellent customer service, couldn't be happier. Lumimeds certainly earned their excellent reputation today.`,
      showMore: true,
    },
  ];

  const [expandedReviews, setExpandedReviews] = useState<{ [key: number]: boolean }>({});

  const handleSeeMoreClick = (reviewId: number) => {
    setExpandedReviews((prev) => ({ ...prev, [reviewId]: true }));
  };

  const handleSeeLessClick = (reviewId: number) => {
    setExpandedReviews((prev) => ({ ...prev, [reviewId]: false }));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={`star ${index < rating ? 'filled' : ''}`}>
        ★
      </span>
    ));
  };

  const renderReviewText = (review: Review) => {
    const isExpanded = expandedReviews[review.id];
    const shouldShowMore = review.showMore && review.review.length > 150;

    if (shouldShowMore) {
      return (
        <>
          {isExpanded ? (
            <>
              {review.review}{' '}
              <span className='see-more' onClick={() => handleSeeLessClick(review.id)}>
                See less
              </span>
            </>
          ) : (
            <>
              {review.review.substring(0, 150)}...{' '}
              <span className='see-more' onClick={() => handleSeeMoreClick(review.id)}>
                See more
              </span>
            </>
          )}
        </>
      );
    }

    return review.review;
  };
*/

const CustomerReviews = () => {
  return (
    <section className='customer-reviews-section'>
      <div className='container'>
        <h2 className='reviews-title'>Customer Reviews</h2>
        {/* Replaced static customer reviews with Trustpilot dark theme widget */}
        <TrustpilotDarkTheme className='trustpilot-customer-reviews' />

        {/* Commented out static customer reviews rendering */}
        {/*
        <div className='reviews-container'>
          {reviews.map((review) => (
            <div key={review.id} className='review-card'>
              <div className='review-header'>
                <div className='avatar' style={{ backgroundColor: review.avatarColor }}>
                  <span style={{ color: review.initialsColor }}>{review.initials}</span>
                </div>
                <div className='reviewer-info'>
                  <h3 className='reviewer-name'>{review.name}</h3>
                  <p className='review-date'>{review.date}</p>
                </div>
              </div>
              <div className='rating'>{renderStars(review.rating)}</div>
              <p className='review-text'>{renderReviewText(review)}</p>
            </div>
          ))}
        </div>
        */}
      </div>
    </section>
  );
};

export default CustomerReviews;
