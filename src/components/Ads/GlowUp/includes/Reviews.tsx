import React from 'react';
import TopImage from '@/assets/glow-up/Ellipse-top-review.png';
import BottomImage from '@/assets/glow-up/Ellipse-bottom-review.png';
import Image from 'next/image';
import TrustpilotReviews from '@/components/Home/TrustpilotReviews';
import { TrustpilotData } from '@/services/trustpilot';
// Commented out static reviews data - now using Trustpilot widget
/*
interface Review {
  id: number;
  initials: string;
  name: string;
  text: string;
  date: string;
}

const reviews: Review[] = [
  {
    id: 1,
    initials: 'DC',
    name: 'David Cann',
    text: "Kaye was incredibly helpful. I was having trouble placing my order for next month and she took over and got my order submitted. I couldn't have done it without her and she was incredibly friendly!",
    date: '22.03.2025',
  },
  {
    id: 2,
    initials: 'HG',
    name: 'Holly Gentry',
    text: 'I found the website easily navigable and when I had questions Jay was extremely responsive and helpful. They worked quickly and communicated what was going on with my order.',
    date: '22.03.2025',
  },
  {
    id: 3,
    initials: 'BD',
    name: 'Britta Deeds',
    text: "Jay and Ryan were really helpful. I will say LumiMeds website is not super user friendly. It's very confusing placing an order. I messed up but Jay very quickly helped me. Thanks again Jay!",
    date: '22.03.2025',
  },
  {
    id: 4,
    initials: 'SB',
    name: 'Shannon Biggs',
    text: 'Tim was very helpful in assisting me with my issue in a very timely manner. I really appreciated the call back letting me know that the Dr responded.',
    date: '22.03.2025',
  },
];
*/

interface ReviewsProps {
  trustpilotData?: TrustpilotData;
}

const Reviews: React.FC<ReviewsProps> = ({ trustpilotData }) => {
  // Get the review count from Trustpilot data only, subtract 1 to make "+" logical
  const reviewCount = trustpilotData?.businessUnit?.numberOfReviews;
  const displayCount = reviewCount ? `${reviewCount - 1}+` : null;
  return (
    <section className='reviews-section py-0 DM-Sans'>
      <Image
        src={TopImage}
        width={200}
        height={140}
        alt='Review section top image'
        className='object-fit-contain reviews-top-image tw-ml-auto'
      />
      <div className='container py-5 py-md-0'>
        <h2 className='reviews-title mx-auto'>Customer Reviews</h2>
        <div className='reviews-content'>
          {displayCount && (
            <div>
              <h2 className='reviews-title mx-auto'>
                Over <span className='highlight'>{displayCount}</span> reviews from our clients
              </h2>
            </div>
          )}

          {/* Replaced static reviews grid with Trustpilot widget */}
          <TrustpilotReviews className='trustpilot-glowup-reviews' theme='light' />

          {/* Commented out static reviews grid */}
          {/*
          <div className='reviews-grid'>
            {reviews.map((review) => (
              <div key={review.id} className='review-card'>
                <div className='review-header'>
                  <div className='client-badge'>{review.initials}</div>
                  <h3 className='client-name'>{review.name}</h3>
                </div>

                <p className='review-text'>{review.text}</p>

                <div className='review-date'>{review.date}</div>
              </div>
            ))}
          </div>
          */}
        </div>
      </div>
      <div className='reviews-bottom-image -tw-mb-3'>
        <Image src={BottomImage} alt='Review section top image' className='object-fit-contain' />
      </div>
    </section>
  );
};

export default Reviews;
