'use client';

import { useTransition } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import { Spinner } from 'react-bootstrap';

export default function FemaleHero() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

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
    <section className='w-100 female-hero female-hero-bg'>
      <div className='container'>
        <div className='row'>
          <div className='col-lg-6 d-flex flex-column align-items-center align-items-lg-start justify-content-between py-5'>
            <h1 className='fw-bold text-white female-hero-title text-center text-lg-start'>
              Tired of Dieting, Cravings &amp; <br /> Stubborn Fat?
            </h1>
            <div className='d-flex flex-column align-items-center align-items-lg-start'>
              <p className='mb-5 display-1 text-white d-none d-lg-block female-hero-subtitle'>
                GLP-1 medications <br /> can fix that
              </p>
              <p className='mb-5 display-1 text-white text-center d-lg-none female-hero-subtitle'>
                GLP-1 medications <br /> can fix that
              </p>
              <button
                onClick={handleGetStarted}
                disabled={isPending}
                className='btn btn-light py-2 px-3 female-hero-btn d-inline-flex align-items-center justify-content-center gap-2'
                data-tracking-id='get-started-hero-female'
              >
                {isPending && <Spinner className='border-2' size='sm' />}
                GET STARTED
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
