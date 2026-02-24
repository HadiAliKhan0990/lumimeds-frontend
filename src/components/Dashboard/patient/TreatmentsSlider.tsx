'use client';

import React, { useEffect, useState } from 'react';
import 'swiper/css';
import { SwiperOptions } from 'swiper/types';
import { Swiper, SwiperSlide } from 'swiper/react';
import SLIDER_IMAGE from '@/assets/vial_tzpt.png';
import Image from 'next/image';

function TreatmentsSlider() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    handleResize();

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
    setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
  };

  const options: SwiperOptions = {
    slidesPerView: 1.2,
    spaceBetween: 24,
    loop: false,
    slideToClickedSlide: true,
    effect: 'slide',
    breakpoints: {
      480: {
        slidesPerView: 1.3,
      },
      640: {
        slidesPerView: 1.4,
      },
      768: {
        slidesPerView: 1.5,
      },
      1024: {
        slidesPerView: 2.5,
      },
      1280: {
        slidesPerView: 3,
      },
      1536: {
        slidesPerView: 3.2,
      },
    },
  };

  const slides = [
    { title: 'NAD+ Nasal Spray' },
    { title: 'NAD+ Nasal Spray' },
    { title: 'NAD+ Nasal Spray' },
    { title: 'NAD+ Nasal Spray' },
    { title: 'NAD+ Nasal Spray' },
    { title: 'NAD+ Nasal Spray' },
    { title: 'NAD+ Nasal Spray' },
    { title: 'NAD+ Nasal Spray' },
  ];

  return (
    <div>
      <Swiper {...options} spaceBetween={isMobile ? 20 : 40} className='treatments_slider swiper-container swiper-container-initialized swiper-container-horizontal'>
        {slides.map((slide, i) => (
          <SwiperSlide key={i}>
            <div className={'slider_card p-4'}>
              <div
                className={'p-2 d-flex flex-column align-items-center gap-4'}
                style={{
                  gap: isMobile ? '0.75rem' : '1.5rem',
                }}
              >
                <Image
                  className='card-image object-fit-contain'
                  src={SLIDER_IMAGE}
                  quality={100}
                  alt={slide.title || 'Treatment image'}
                  style={{
                    maxHeight: isMobile ? '100px' : isTablet ? '140px' : '180px',
                    width: 'auto',
                  }}
                />
                <div
                  className={'card-title text-white'}
                  style={{
                    fontSize: isMobile ? '0.9rem' : isTablet ? '1.1rem' : '1.25rem',
                  }}
                >
                  {slide.title}
                </div>
                <button
                  className={'btn btn-light learn-more-btn px-5 py-2'}
                  style={{
                    padding: isMobile ? '0.25rem 1rem' : '0.5rem 1.5rem',
                    fontSize: isMobile ? '0.85rem' : '1rem',
                  }}
                >
                  Learn More
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default TreatmentsSlider;
