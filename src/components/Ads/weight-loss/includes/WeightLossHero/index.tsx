'use client';

import { Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { AppDispatch, RootState } from '@/store';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import styles from './styles.module.scss';

export default function WeightLossHero() {
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
          <h1 className={` mb-4 ${styles.heroTitle}`}>
            End your cycle of frustration if diets <br /> haven&apos;t worked for you.
          </h1>
          <p className={`${styles.heroDescription}`}>Begin your personalized weight management journey today! </p>
          <div>
            <button
              className={styles.heroButton}
              onClick={handleGetStarted}
              disabled={isPending}
              data-tracking-id='get-started-hero-weight-loss'
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
