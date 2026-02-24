'use client';

import { RefObject, useRef } from 'react';
import { SwiperOptions } from 'swiper/types';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';
import WeightBefore1 from '@/assets/weight-before-1.jpg';
import WeightAfter1 from '@/assets/weight-after-1.jpg';
import WeightBefore2 from '@/assets/weight-before-2.jpg';
import WeightAfter2 from '@/assets/weight-after-2.jpg';
import WeightBefore3 from '@/assets/weight-before-3.jpg';
import WeightAfter3 from '@/assets/weight-after-3.jpg';
import WeightBefore4 from '@/assets/weight-before-4.jpg';
import WeightAfter4 from '@/assets/weight-after-4.jpg';
import Image from 'next/image';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';

type NavProps = {
  swiperRef: RefObject<SwiperRef | null>;
};

const PreviousNav = ({ swiperRef }: NavProps) => {
  return (
    <button
      className='d-none d-lg-flex align-items-center justify-content-center p-2 swiper-button-previous-nav-weight btn btn-light rounded-circle'
      type='button'
      tabIndex={0}
      aria-label='Previous slide'
      onClick={() => swiperRef.current?.swiper.slidePrev()}
    >
      <FaArrowLeft size={24} />
    </button>
  );
};

const NextNav = ({ swiperRef }: NavProps) => {
  return (
    <button
      className='d-none d-lg-flex align-items-center justify-content-center p-2 swiper-button-next-nav-weight btn btn-light rounded-circle'
      type='button'
      tabIndex={0}
      aria-label='Next slide'
      onClick={() => swiperRef.current?.swiper.slideNext()}
    >
      <FaArrowRight size={24} />
    </button>
  );
};

const ImgComparisonSlider = () => {
  const swiperRef = useRef<SwiperRef>(null);

  const imagePairs = [
    { 
      before: WeightBefore1, 
      after: WeightAfter1,
      testimonial: "After struggling with weight loss for years, Sarah tried Lumimeds' GLP-1. Within just a few months, she lost 20 pounds and felt more energized and confident. The medication helped her control her appetite making it easier to eat smaller portions while still feeling satisfied. Now, Sarah is enjoying a healthier lifestyle, and Lumimeds' GLP-1 was the key to her success."
    },
    { 
      before: WeightBefore2, 
      after: WeightAfter2,
      testimonial: "Jennifer was skeptical about weight loss medications until she tried Lumimeds' GLP-1. The results were incredible - she lost 28 pounds and gained so much confidence. What she loved most was how the medication helped her feel full faster and reduced her cravings for unhealthy foods. Jennifer's energy levels improved dramatically, and she's never felt better."
    },
    { 
      before: WeightBefore3, 
      after: WeightAfter3,
      testimonial: "Michael had tried countless diets and exercise programs with little success. When he started Lumimeds' GLP-1 treatment, everything changed. He lost 35 pounds in 6 months and finally felt in control of his eating habits. The medication helped him break free from emotional eating and develop a healthier relationship with food. Michael now feels like his best self."
    },
    { 
      before: WeightBefore4, 
      after: WeightAfter4,
      testimonial: "David had been struggling with his weight for over a decade. Lumimeds' GLP-1 treatment was a game-changer for him. He lost 42 pounds and completely transformed his lifestyle. The medication helped him develop better eating habits and gave him the motivation to stay active. David is now the healthiest and happiest he's ever been."
    },
  ];

  const options: SwiperOptions = {
    slidesPerView: 1, // This allows for variable widths; adjust if needed
    spaceBetween: 24, // Gap between slides
    loop: true, // Enable looping
    centeredSlides: true, // Center the active slide
    slideToClickedSlide: false,
    effect: 'slide',
    // grabCursor: true,
    // noSwiping: true,
    // noSwipingClass: 'swiper-no-swiping',
    // keyboard: {
    //     enabled: true,
    //     onlyInViewport: true,
    // },
    // pagination: {
    // 	el: ".weight-swiper-pagination",
    // 	clickable: true,
    // 	type: "bullets",
    // },
    navigation: {
      nextEl: '.swiper-button-next-nav-weight',
      prevEl: '.swiper-button-previous-nav-weight',
    },
    // coverflowEffect: {
    //     depth: 100,
    //     rotate: 0,
    //     slideShadows: false,
    // },
    // breakpoints: {
    //     768: {
    //         slidesPerView: 2,
    //         spaceBetween: 64,
    //         coverflowEffect: {
    //             depth: 160,
    //             rotate: 0,
    //             slideShadows: false,
    //         },
    //     },
    //     1280: {
    //         slidesPerView: 2.3,
    //         spaceBetween: 64,
    //         coverflowEffect: {
    //             depth: 150,
    //             rotate: 0,
    //             slideShadows: false,
    //         }
    //     }
    // }
  };

  return (
    <div style={{ background: 'black' }}>
      <section className='container py-0' id='weight-comparison'>
        <div className='row'>
          <div
            className='col-12 d-flex align-items-center px-3 px-lg-0'
            style={{
              paddingTop: '64px',
              paddingBottom: '64px',
              columnGap: '32px',
            }}
          >
            <PreviousNav swiperRef={swiperRef} />
            <Swiper
              ref={swiperRef}
              {...options}
              className='weight-swiper pt-5 swiper-container d-flex justify-content-center slider-custom-text black-move swiper-container-initialized swiper-container-horizontal'
            >
              {imagePairs.map((pair, idx) => (
                <SwiperSlide
                  key={idx}
                  className='d-flex justify-content-center align-items-center flex-wrap'
                  style={{ columnGap: '24px' }}
                >
                  <p className='font-weight-500 d-lg-none' id='weight-comparison-title'>
                    Real People, Real Results
                  </p>
                  <div className='col-12 col-lg-5 d-flex align-items-center' style={{ columnGap: '8px' }}>
                    <div className='col-6 p-0'>
                      <Image
                        className='comparison-img'
                        src={pair.before}
                        alt='Before'
                        style={{ borderRadius: '12px' }}
                      />
                    </div>
                    <div className='col-6 p-0'>
                      <Image className='comparison-img' src={pair.after} alt='After' style={{ borderRadius: '12px' }} />
                    </div>
                  </div>
                  <div className='col-12 col-lg-5' id='weight-comparison-content'>
                    <p className='font-weight-500 d-none d-lg-block' id='weight-comparison-title'>
                      Real People, Real Results
                    </p>
                    <p id='weight-comparison-subtext'>Get inspired by hearing some of our clients’ success stories</p>
                    <p style={{ color: 'white', fontSize: '18px' }}>
                      {pair.testimonial}
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <NextNav swiperRef={swiperRef} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ImgComparisonSlider;
