'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { SwiperOptions } from 'swiper/types';

const Banner = () => {
  const daysRef = useRef<HTMLParagraphElement>(null);
  const hoursRef = useRef<HTMLParagraphElement>(null);
  const minsRef = useRef<HTMLParagraphElement>(null);
  const secsRef = useRef<HTMLParagraphElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function updateTimer() {
      const now = new Date().getTime();
      const endDate = new Date('January 31, 2025').getTime();
      const timeLeft = endDate - now;

      if (timeLeft <= 0) {
        bannerRef?.current?.remove();
        clearInterval(timerId);
        return;
      }

      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((timeLeft % (1000 * 60)) / 1000);

      if (daysRef?.current && hoursRef?.current && minsRef?.current && secsRef?.current) {
        daysRef.current.innerHTML = days.toString().length === 1 ? `0${days}` : days.toString();
        hoursRef.current.innerHTML = hours.toString().length === 1 ? `0${hours}` : hours.toString();
        minsRef.current.innerHTML = mins.toString().length === 1 ? `0${mins}` : mins.toString();
        secsRef.current.innerHTML = secs.toString().length === 1 ? `0${secs}` : secs.toString();
      }
    }
    const timerId = setInterval(updateTimer, 1000);
    updateTimer();
  }, []);

  const options: SwiperOptions = {
    slidesPerView: 1, // This allows for variable widths; adjust if needed
    spaceBetween: 24, // Gap between slides
    loop: true, // Enable looping
    autoplay: {
      delay: 0,
      disableOnInteraction: false,
    },
    speed: 7000,
    loopAdditionalSlides: 3,
    // centeredSlides: true, // Center the active slide
    slideToClickedSlide: true,
    effect: 'slide',
    // navigation: {
    //     nextEl: '.swiper-button-next-nav-product-accordion',
    //     prevEl: '.swiper-button-previous-nav-product-accordion',
    // },
  };
  return (
    <div
      className={'position-relative mb-3 mb-xl-0'}
      style={{ background: '#3060FE', width: '100%', marginTop: '-10px' }}
    >
      <div
        className='container nav-header-container banner d-flex justify-content-between align-items-center m-0'
        id='banner'
        ref={bannerRef}
        style={{ fontWeight: 'bold' }}
      >
        <Swiper
          {...options}
          modules={[Autoplay]}
          className='banner_swiper swiper-container banner-text slider-custom-text black-move swiper-container-initialized swiper-container-horizontal'
        >
          <SwiperSlide
            className='swiper-slide'
            data-swiper-slide-index='0'
            style={{
              width: '850px',
              marginRight: '24px',
              textAlign: 'center',
            }}
          >
            <span
              className='m-0'
              style={{
                textDecoration: 'none',
                color: 'white',
                fontWeight: 'bold',
                borderBottom: '2px solid #d8fcec',
              }}
            >
              Take $40 off your first month with code NY2025! 🎉 Exclusively for new patients—start your journey with us
              today! - <Link href='/intake'>GET STARTED</Link>
            </span>
          </SwiperSlide>
          <SwiperSlide
            className='swiper-slide'
            data-swiper-slide-index='0'
            style={{
              width: '850px',
              marginRight: '24px',
              textAlign: 'center',
            }}
          >
            <span
              className='m-0'
              style={{
                textDecoration: 'none',
                color: 'white',
                fontWeight: 'bold',
                borderBottom: '2px solid #d8fcec',
              }}
            >
              Take $40 off your first month with code NY2025! 🎉 Exclusively for new patients—start your journey with us
              today! - <Link href='/intake'>GET STARTED</Link>
            </span>
          </SwiperSlide>
          <SwiperSlide
            className='swiper-slide'
            data-swiper-slide-index='0'
            style={{
              width: '850px',
              marginRight: '24px',
              textAlign: 'center',
            }}
          >
            <span
              className='m-0'
              style={{
                textDecoration: 'none',
                color: 'white',
                fontWeight: 'bold',
                borderBottom: '2px solid #d8fcec',
              }}
            >
              Take $40 off your first month with code NY2025! 🎉 Exclusively for new patients—start your journey with us
              today! - <Link href='/intake'>GET STARTED</Link>
            </span>
          </SwiperSlide>
        </Swiper>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            columnGap: '24px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <p className='mb-0' ref={daysRef} id='days' style={{ fontSize: '16px' }}>
              00
            </p>
            <p className='m-0' style={{ fontSize: '12px', transform: 'translateY(-5px)' }}>
              DAYS
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className='mb-0' ref={hoursRef} id='hours' style={{ fontSize: '16px' }}>
              00
            </p>
            <p className='m-0' style={{ fontSize: '12px', transform: 'translateY(-5px)' }}>
              HOURS
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className='mb-0' ref={minsRef} id='mins' style={{ fontSize: '16px' }}>
              00
            </p>
            <p className='m-0' style={{ fontSize: '12px', transform: 'translateY(-5px)' }}>
              MINS
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className='mb-0' ref={secsRef} id='secs' style={{ fontSize: '16px' }}>
              00
            </p>
            <p className='m-0' style={{ fontSize: '12px', transform: 'translateY(-5px)' }}>
              SECS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
