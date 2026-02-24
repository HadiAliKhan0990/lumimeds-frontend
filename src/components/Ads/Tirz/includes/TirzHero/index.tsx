'use client';

import styles from './styles.module.scss';
import { Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import { GLP1_GIP_PRODUCT_NAME, GLP1_GIP_LABEL } from '@/constants/factory';

export const TirzHero = () => {
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
          <h1 className={`fw-bold mb-4 md:tw-w-[730px] lg:tw-w-auto ${styles.heroTitle}`}>
            {GLP1_GIP_PRODUCT_NAME} {GLP1_GIP_LABEL} Injections
          </h1>
          <p className={` ${styles.heroDescription}`}>
            Whether you&apos;re starting out or leveling up, our {GLP1_GIP_PRODUCT_NAME} plans are personalized to your
            goals and guided by licensed medical providers.
          </p>
          <div>
            <button
              className={styles.heroButton}
              onClick={handleGetStarted}
              disabled={isPending}
              data-tracking-id='get-started-hero-tirz'
            >
              {isPending && <Spinner className='border-2 me-2' size='sm' />}
              Get Started
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
