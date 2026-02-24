'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { SwiperOptions } from 'swiper/types';
import { PLANS } from './constants';
import { Pagination } from 'swiper/modules';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import { useRouter, usePathname } from 'next/navigation';
import { Spinner } from 'react-bootstrap';
import PlanCard from './PlanCard';
import './styles.css';

export default function AllPlans() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();
  const titleRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [titleHeight, setTitleHeight] = useState<number | null>(null);

  const [isPending, startTransition] = useTransition();

  const selectedProduct = useSelector((state: RootState) => state.productType);
  const checkout = useSelector((state: RootState) => state.checkout);

  const { isSurveyCompleted, checkoutUser } = checkout || {};

  const handleGetStarted = async () => {
    // If user is on home route (/), route directly to /products
    if (pathname === '/') {
      startTransition(() => router.push('/products'));
      return;
    }

    // Otherwise, use existing complex routing logic
    await handleVerifyRedirectToCheckout({
      selectedProduct,
      product: selectedProduct,
      dispatch,
      startTransition,
      router,
      isSurveyCompleted,
      checkoutUser,
    });
  };

  useEffect(() => {
    if (titleRefs.current.length > 0) {
      const maxHeight = Math.max(...titleRefs.current.map((ref) => ref?.offsetHeight || 0));
      setTitleHeight(maxHeight);
    }
  }, []);

  return (
    <div className='all_plans_section pt-0 my-5'>
      <div className='container'>
        <p className='text-center all_plans_title mb-5'>
          All plans{' '}
          <span
            className='fw-normal font-instrument-serif'
            style={{
              textDecoration: 'underline',
              textDecorationStyle: 'wavy',
              textUnderlineOffset: '8px',
              textDecorationColor: '#3060FE',
            }}
          >
            include
          </span>
        </p>
        <Swiper
          {...options}
          className='all_plans swiper-container slider-custom-text black-move swiper-container-initialized swiper-container-horizontal'
        >
          {PLANS.map((plan, i) => (
            <SwiperSlide key={i}>
              <PlanCard {...plan} titleRef={(el) => (titleRefs.current[i] = el)} fixedTitleHeight={titleHeight} />
            </SwiperSlide>
          ))}
          <div className='swiper-pagination d-md-none' />
        </Swiper>
        <div className='d-flex justify-content-center mt-md-2'>
          <button
            onClick={handleGetStarted}
            disabled={isPending}
            className='btn btn-primary rounded-pill text-lg px-4 py-12 d-flex align-items-center justify-content-center gap-2'
          >
            {isPending && <Spinner className='border-2' size='sm' />}
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

const options: SwiperOptions = {
  slidesPerView: 1.3,
  spaceBetween: 24,
  loop: false,
  slideToClickedSlide: true,
  effect: 'slide',
  modules: [Pagination],
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
  breakpoints: {
    0: {
      slidesPerView: 1.07,
      spaceBetween: 16,
    },
    576: {
      slidesPerView: 1.2,
      spaceBetween: 20,
    },
    768: {
      slidesPerView: 2.5,
      spaceBetween: 24,
    },
    992: {
      slidesPerView: 3,
      spaceBetween: 24,
    },
  },
};
