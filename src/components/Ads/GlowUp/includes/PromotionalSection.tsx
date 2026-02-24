'use client';

import React from 'react';

// SVG Components
const DollarIcon = () => (
  <svg width='31' height='49' viewBox='0 0 31 49' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <path
      d='M30.777 32.78C30.777 34.7967 30.2453 36.6667 29.182 38.39C28.1553 40.0767 26.6153 41.47 24.562 42.57C22.5453 43.6333 20.1436 44.22 17.357 44.33V48.785H13.837V44.275C9.95029 43.945 6.81529 42.79 4.43196 40.81C2.04862 38.7933 0.783624 36.0617 0.636957 32.615H10.647C10.867 34.815 11.9303 36.2267 13.837 36.85V28.16C10.977 27.4267 8.68529 26.7117 6.96196 26.015C5.27529 25.3183 3.79029 24.2 2.50696 22.66C1.22362 21.12 0.581957 19.0117 0.581957 16.335C0.581957 12.9983 1.81029 10.3217 4.26696 8.305C6.76029 6.28833 9.95029 5.15166 13.837 4.895V0.439997H17.357V4.895C21.207 5.18833 24.2503 6.30667 26.487 8.25C28.7236 10.1933 29.9703 12.8883 30.227 16.335H20.162C19.942 14.355 19.007 13.0717 17.357 12.485V21.01C20.4003 21.8533 22.747 22.605 24.397 23.265C26.047 23.925 27.5136 25.025 28.797 26.565C30.117 28.0683 30.777 30.14 30.777 32.78ZM10.537 15.895C10.537 16.8117 10.812 17.5817 11.362 18.205C11.9486 18.8283 12.7736 19.3783 13.837 19.855V12.21C12.8103 12.3933 12.0036 12.7967 11.417 13.42C10.8303 14.0067 10.537 14.8317 10.537 15.895ZM17.357 37.015C18.457 36.8317 19.3186 36.3917 19.942 35.695C20.602 34.9983 20.932 34.1367 20.932 33.11C20.932 32.1567 20.6203 31.3867 19.997 30.8C19.4103 30.1767 18.5303 29.645 17.357 29.205V37.015Z'
      fill='#577C4B'
    />
  </svg>
);

const StarIcon = () => (
  <svg width='34' height='32' viewBox='0 0 34 32' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <path
      d='M11.687 4.63693C13.4055 -0.41569 20.6052 -0.415689 22.3236 4.63693C23.0744 6.84435 25.1536 8.34752 27.4852 8.34752H27.9132C33.1169 8.34752 35.2165 15.0549 30.9416 18.022C28.9945 19.3735 28.1824 21.8627 28.9455 24.1067C30.6202 29.0305 25.0557 33.2827 20.7832 30.3172L20.2102 29.9196C18.283 28.5819 15.7276 28.5819 13.8004 29.9196L13.2275 30.3172C8.95494 33.2827 3.39042 29.0305 5.06508 24.1067C5.82828 21.8627 5.0161 19.3735 3.06898 18.022C-1.20591 15.0549 0.893724 8.34752 6.09744 8.34752H6.52541C8.857 8.34752 10.9362 6.84435 11.687 4.63693Z'
      fill='#577C4B'
    />
  </svg>
);

const PlusIcon = () => (
  <svg width='49' height='46' viewBox='0 0 49 46' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <rect x='30.9127' width='46' height='12.5611' rx='6.28056' transform='rotate(90 30.9127 0)' fill='#577C4B' />
    <rect x='48.7079' y='29' width='48.1509' height='12' rx='6' transform='rotate(-180 48.7079 29)' fill='#577C4B' />
  </svg>
);

const PromotionalSection = () => {
  return (
    <section className='promotional-section'>
      <div className='container'>
        <div className='promotional-card'>
          <div className='promotional-header'>
            <h1 className='main-title'>Confidently Reach Your Weight Goals with Lumimeds</h1>
            <p className='tagline font-instrument-serif '>Simple pricing. Expert care. Always online.</p>
          </div>

          <div className='benefits-grid'>
            <div className='benefit-column'>
              <div className='benefit-icon'>
                <DollarIcon />
              </div>
              <h3 className='benefit-title'>Straightforward Pricing —No Surprises</h3>
              <p className='benefit-description'>
                No hidden fees. Your monthly payment covers everything: provider consultations, medications (if
                prescribed), medical supplies, and delivery.
              </p>
            </div>

            <div className='benefit-column'>
              <div className='benefit-icon'>
                <StarIcon />
              </div>
              <h3 className='benefit-title'>Always-On Support, 100% Online</h3>
              <p className='benefit-description'>
                {`Your journey doesn't end at checkout. Enjoy regular check-ins, personalized adjustments, and provider
                access—all from the comfort of home.`}
              </p>
            </div>

            <div className='benefit-column'>
              <div className='benefit-icon'>
                <PlusIcon />
              </div>
              <h3 className='benefit-title'>Expert-Led Medical Care</h3>
              <p className='benefit-description'>
                Every plan is built by licensed professionals experienced in medical weight management. Get 1:1 support,
                tailored to your unique goals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromotionalSection;
