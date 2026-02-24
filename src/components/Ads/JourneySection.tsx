'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import { Spinner } from 'react-bootstrap';
import { GLP1_PRODUCT_NAME, GLP1_GIP_PRODUCT_NAME } from '@/constants/factory';

export default function JourneySection() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const selectedProduct = useSelector((state: RootState) => state.productType);
  const checkout = useSelector((state: RootState) => state.checkout);

  const { isSurveyCompleted, checkoutUser } = checkout || {};

  const handleGetStarted = async () => {
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

  return (
    <section className='journey-section'>
      <div className='journey-content'>
        <h3 className='journey-title'>Choose Your Weight Care Journey</h3>
        <p className='journey-description'>
          Wherever you are in your weight care journey, we have a {GLP1_PRODUCT_NAME} or {GLP1_GIP_PRODUCT_NAME} plan
          that&apos;s right for you. Each of our programs is developed with medical oversight to deliver safe and
          effective results.
        </p>
        <button
          className='btn btn-outline-dark journey-button border-2 py-12 px-4 rounded-pill fw-medium d-flex align-items-center justify-content-center gap-2 hover:tw-bg-neutral-700 tw-transition-all tw-mt-4 disabled:tw-opacity-60 disabled:tw-cursor-not-allowed'
          onClick={handleGetStarted}
          disabled={isPending}
          data-tracking-id='get-started-journey-section'
        >
          {isPending && <Spinner className='border-2' size='sm' />}
          <span>Get Started</span>
        </button>
      </div>
    </section>
  );
}
