'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import InjectionLargeIcon from '@/components/Icon/InjectionLargeIcon';
import 'swiper/css';
import './styles.css';

export default function FeaturedSlider() {
  return (
    <div className='bg-pastel-blue py-5'>
      <Swiper className='featured_medications_banner py-2' {...options}>
        {[...Array(6)].map((_, i) => (
          <SwiperSlide key={i}>
            <div className='d-flex align-items-center gap-3'>
              <InjectionLargeIcon color='#000' width={62} height={59} />
              <p className='m-0 text-white text-nowrap'>
                Featured <span className='font-instrument-serif fst-italic text-primary'>Medications</span>
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

const options = {
  modules: [Autoplay, FreeMode],
  slidesPerView: 2,
  loop: true,
  freeMode: {
    enabled: true,
    momentum: false,
    sticky: false,
  },
  autoplay: {
    delay: 0,
    disableOnInteraction: false,
    pauseOnMouseEnter: false,
  },
  speed: 4000,
  watchSlidesProgress: true,
  slideToClickedSlide: true,
  effect: 'slide',
  breakpoints: {
    0: { slidesPerView: 0.8 },
    450: { slidesPerView: 1.5 },
    1280: { slidesPerView: 2 },
  },
};
