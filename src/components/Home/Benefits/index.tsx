'use client';

import { SwiperOptions } from 'swiper/types';
import { Swiper, SwiperSlide } from 'swiper/react';
import { BENEFITS } from './constants';
import BenefitCard from './BenefitCard';
import './styles.css';

interface Props {
  style?: React.CSSProperties;
}

export default function Benefits({ style }: Readonly<Props>) {
  const options: SwiperOptions = {
    slidesPerView: 1.07,
    spaceBetween: 24,
    loop: false,
    slideToClickedSlide: true,
    effect: 'slide',
    breakpoints: {
      576: {
        slidesPerView: 1.2,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 2.3,
        spaceBetween: 24,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 24,
      },
    },
  };
  return (
    <div style={{ background: '#CDDFFF', marginTop: '64px', ...style }}>
      <section className='container' style={{ paddingTop: '74px' }}>
        <p className='text-center benefit_title'>Benefits</p>
        <p className='text-center benefit_subtext'>
          Begin your journey to a healthier life, with personalized support and guidance. We are with you every step of
          the way.
        </p>
        <div className='row'>
          <div className='col-12 p-0'>
            <Swiper
              {...options}
              className='benefits_slider swiper-container slider-custom-text black-move swiper-container-initialized swiper-container-horizontal'
            >
              {BENEFITS.map((benefit, i) => {
                return (
                  <SwiperSlide key={i}>
                    <BenefitCard {...benefit} />
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </div>
      </section>
    </div>
  );
}
