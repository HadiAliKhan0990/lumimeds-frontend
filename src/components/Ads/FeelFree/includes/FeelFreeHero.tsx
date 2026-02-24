'use client';

import FeelFreeBg from '@/assets/feel-free-bg.jpg';
import { useTransition } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import { Spinner } from 'react-bootstrap';

export default function FeelFreeHero() {
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
    <section
      className='w-100 p-0 feel-free-bg feel-free-bg-responsive feel-free-hero'
      style={{
        backgroundImage: `url(${FeelFreeBg.src})`,
      }}
    >
      <div className='container d-flex flex-column align-items-center text-center text-white pt-5 feel-free-content'>
        <p className='display-1 fst-italic feel-free-title'>Feel Full, Feel Free</p>
        <p className='display-4 feel-free-subtitle'>
          &nbsp;With GLP-1, you&apos;ll feel satisfied with less and enjoy the freedom to focus on what truly
          matters.&nbsp;
        </p>
        <button
          onClick={handleGetStarted}
          disabled={isPending}
          className='btn btn-light feel-free-btn get-started-add d-inline-flex align-items-center justify-content-center gap-2'
          data-tracking-id='get-started-hero-feel-free'
        >
          {isPending && <Spinner className='border-2' size='sm' />}
          GET STARTED
        </button>
      </div>
    </section>
  );
}
