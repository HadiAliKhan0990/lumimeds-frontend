import React from 'react';
import TrustpilotReviews from '@/components/Home/TrustpilotReviews';
// import StarRating from '@/appointments/StarRating/StarRating';

// Commented out static testimonials - now using Trustpilot widget
/*
interface ReviewCardProps {
  avatarInitials: string;
  avatarBgColor: string;
  avatarTextColor: string;
  userName: string;
  date: string;
  reviewText: string;
  rating: number;
  showSeeMore?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  avatarInitials,
  avatarBgColor,
  avatarTextColor,
  userName,
  date,
  reviewText,
  showSeeMore = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSeeMoreClick = () => {
    setIsExpanded(true);
  };

  const handleSeeLessClick = () => {
    setIsExpanded(false);
  };

  return (
    <div className='review-card'>
      <div className='review-header'>
        <div className='review-avatar' style={{ backgroundColor: avatarBgColor, color: avatarTextColor }}>
          {avatarInitials}
        </div>
        <div className='review-user-info'>
          <h4 className='review-user-name'>{userName}</h4>
          <p className='review-date'>{date}</p>
        </div>
      </div>

      <StarRating rating={5} />

      <div className='review-text'>
        {showSeeMore && reviewText.length > 200 ? (
          <>
            {isExpanded ? (
              <>
                {reviewText}{' '}
                <span className='see-more-link' onClick={handleSeeLessClick}>
                  See less
                </span>
              </>
            ) : (
              <>
                {reviewText.substring(0, 200)}...{' '}
                <span className='see-more-link' onClick={handleSeeMoreClick}>
                  See more
                </span>
              </>
            )}
          </>
        ) : (
          reviewText
        )}
      </div>
    </div>
  );
};
*/

interface TestimonialsSectionProps {
  backgroundColor?: string;
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = () => {
  // Commented out static reviews data - now using Trustpilot widget
  /*
  const reviews = [
    {
      avatarInitials: 'DC',
      avatarBgColor: '#FEE8E8',
      avatarTextColor: '#333333',
      userName: 'David Cann',
      date: '6 days ago',
      reviewText:
        "Kaye was incredibly helpful. I was having trouble placing my order for next month and she took over and got my order submitted. I couldn't have done it without her and she was incredibly friendly!",
      rating: 5,
      showSeeMore: false,
    },
    {
      avatarInitials: 'C',
      avatarBgColor: '#8B6F60',
      avatarTextColor: '#FFFFFF',
      userName: 'Carmen Perez-Padron',
      date: 'Jul 28, 2025',
      reviewText:
        "I had an excellent experience with Lumi's customer service! I was having trouble logging into my payment portal due to recent changes. After submitting my telepath order and refill request, I reached out through Lumi Help email and Jay went above and beyond to assist me. The response time was incredibly fast, and thanks to Jay's support, I was able to place my order without any delays. Jay was professional, patient, and extremely helpful throughout the process. Truly top-notch service—thank you!",
      rating: 5,
      showSeeMore: true,
    },
    {
      avatarInitials: 'MA',
      avatarBgColor: '#E0F7E0',
      avatarTextColor: '#333333',
      userName: 'Mateo',
      date: 'Jul 25, 2025',
      reviewText:
        "I experienced what many have recently with their website overhaul. Not getting communication or response from chat sessions. I then reached out over email and was immediately helped by Jay. They were amazing, walked me through everything I needed to do. We got everything squared away this evening. Excellent customer service, couldn't be happier. Lumimeds certainly earned their excellent reputation today.",
      rating: 5,
      showSeeMore: true,
    },
  ];
  */

  return (
    <section className='container testimonials-section tw-bg-transparent py-6'>
      <h2 className='tw-text-[28px] md:tw-text-[32px] lg:tw-text-[36px] tw-font-medium tw-text-[#2D2D2D] tw-mt-4 font-playfair tw-text-center'>
        What our customer say about us
      </h2>
      <div className='container-fluid'>
        <div className='testimonials-container mx-auto'>
          {/* Replaced static testimonials with Trustpilot widget */}
          <TrustpilotReviews className='trustpilot-testimonials' />

          {/* Commented out static testimonials rendering */}
          {/*
          <div className='row g-4'>
            {reviews.map((review, index) => (
              <div key={index} className='col-md-4'>
                <ReviewCard
                  avatarInitials={review.avatarInitials}
                  avatarBgColor={review.avatarBgColor}
                  avatarTextColor={review.avatarTextColor}
                  userName={review.userName}
                  date={review.date}
                  reviewText={review.reviewText}
                  rating={review.rating}
                  showSeeMore={review.showSeeMore}
                />
              </div>
            ))}
          </div>
          */}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
