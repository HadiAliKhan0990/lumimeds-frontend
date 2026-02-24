'use client';

import { Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { AppDispatch, RootState } from '@/store';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import styles from './styles.module.scss';

export default function SustainableWeightLossHero() {
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
    <section className={styles.heroSection}>
      <div className={'container ' + styles.heroContainer}>
        <div className={styles.containerTextContent}>
          <h1 className={`text-white fw-bold mb-4 ${styles.heroTitle}`}>
            Losing weight does not have to be a constant struggle.
          </h1>
          <p className={`text-white ${styles.heroDescription}`}>Start your personalized treatment today.</p>
          <div>
            <button
              className={styles.heroButton}
              onClick={handleGetStarted}
              disabled={isPending}
              data-tracking-id='get-started-hero-sustainable-weight-loss'
            >
              {isPending && <Spinner className='border-2 me-2' size='sm' />}
              Get Started
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
