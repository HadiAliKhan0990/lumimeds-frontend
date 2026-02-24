import { SwiperOptions } from 'swiper/types';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import ProductDetailsAccordion from '@/components/Products/Single/ProductDetailsAccordion';
import { GLP1_ACCORDION, GLP1_GIP_ACCORDION } from '@/components/Products/Single/constants';
import { NAD_ACCORDION } from '@/components/Products/Single/ConstantsSingle';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';

export const ProductsFaqSlider = () => {
  const options: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true, // Enable infinite scroll
    effect: 'slide',
    navigation: {
      nextEl: '.swiper-button-next-nav-product-accordion',
      prevEl: '.swiper-button-previous-nav-product-accordion',
    },
  };

  return (
    <section className='container pt-0 pb-4 mt-5'>
      <Swiper
        {...options}
        observer={true}
        observeParents={true}
        watchSlidesProgress={true}
        initialSlide={0}
        modules={[Navigation]}
        className='position-relative slider-custom-text black-move'
      >
        <button
          className='swiper-button-previous-nav-product-accordion p-2 border-0 btn btn-light rounded-circle'
          aria-label='Previous slide'
          type='button'
        >
          <FaArrowLeft size={24} />
        </button>
        <SwiperSlide className='h-auto' data-swiper-slide-index={0}>
          <div className='h-100 w-100'>
            <p className='accordion_header text-center'>
              What You Need To Know About <br />
              <span className='font-instrument-serif fw-400'>GLP-1 Injections</span>
            </p>
            <ProductDetailsAccordion data={GLP1_ACCORDION} />
          </div>
        </SwiperSlide>
        <SwiperSlide className='h-auto' data-swiper-slide-index={1}>
          <div className='h-100 w-100'>
            <p className='accordion_header text-center'>
              What You Need To Know About <br />
              <span className='font-instrument-serif fw-400'>GLP-1/GIP Injections</span>
            </p>
            <ProductDetailsAccordion data={GLP1_GIP_ACCORDION} />
          </div>
        </SwiperSlide>
        {process.env.NEXT_PUBLIC_NAD_ENABLED === 'true' && (
          <SwiperSlide className='h-auto' data-swiper-slide-index={2}>
            <div className='h-100 w-100'>
              <p className='accordion_header text-center'>
                What You Need To Know About <br />
                <span className='font-instrument-serif fw-400'>NAD+ Injections</span>
              </p>
              <ProductDetailsAccordion data={NAD_ACCORDION} />
            </div>
          </SwiperSlide>
        )}
        <button
          className='swiper-button-next-nav-product-accordion p-2 border-0 btn btn-light rounded-circle'
          aria-label='Next slide'
          type='button'
        >
          <FaArrowRight size={24} />
        </button>
      </Swiper>
    </section>
  );
};
