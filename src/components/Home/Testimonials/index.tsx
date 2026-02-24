'use client';

import TrustpilotReviews from '@/components/Home/TrustpilotReviews';
// import { SwiperOptions } from 'swiper/types';
// import { Swiper, SwiperSlide } from 'swiper/react';
// import { TESTIMONIALS } from '@/components/Home/Testimonials/includes/constants';
// import TestimonialCard from '@/components/Home/Testimonials/includes/TestimonialCard';
import './styles.css';

export default function Testimonials() {
  return (
    <section id='testimonials' className='testimonials_sec py-5'>
      <p className='testimonial_title'>
        Customer <span className='fw-normal font-instrument-serif fst-italic'>Reviews</span>
      </p>

      {/* Replaced static testimonials with Trustpilot dark theme widget */}
      <TrustpilotReviews className='trustpilot-testimonials-dark' theme='dark' />

      {/* Commented out static testimonials carousel */}
      {/*
      <Swiper
        {...options}
        className='testimonials swiper-container slider-custom-text black-move swiper-container-initialized swiper-container-horizontal'
      >
        {TESTIMONIALS.map((testimonial, i) => {
          return (
            <SwiperSlide key={i} className='swiper-slide' data-swiper-slide-index={i}>
              <TestimonialCard {...testimonial} />
            </SwiperSlide>
          );
        })}
      </Swiper>
      */}
    </section>
  );
}

// Commented out Swiper options - now using Trustpilot widget
/*
const options: SwiperOptions = {
  slidesPerView: 1.2,
  spaceBetween: 24,
  loop: true,
  slideToClickedSlide: true,
  effect: 'slide',
  grabCursor: true,
  navigation: {
    nextEl: '.swiper-button-next-nav-testimonial',
    prevEl: '.swiper-button-previous-nav-testimonial',
  },
  coverflowEffect: {
    depth: 100,
    rotate: 0,
    slideShadows: false,
  },
  breakpoints: {
    768: {
      slidesPerView: 1.5,
      spaceBetween: 64,
      coverflowEffect: {
        depth: 160,
        rotate: 0,
        slideShadows: false,
      },
    },
    1280: {
      slidesPerView: 2.3,
      spaceBetween: 64,
      coverflowEffect: {
        depth: 150,
        rotate: 0,
        slideShadows: false,
      },
    },
  },
};
*/
