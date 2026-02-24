'use client';

import styles from './styles.module.scss';
import { Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import Image from 'next/image';
import glp1 from '@/assets/ads/how-to-start/glp1.png';
import poolGirl from '@/assets/ads/how-to-start/pool_girl.png';
import glp1Gip from '@/assets/ads/how-to-start/glp1_gip.png';
import gymMan from '@/assets/ads/how-to-start/gym_man.png';
import { GLP1_PRODUCT_NAME, GLP1_LABEL, GLP1_GIP_PRODUCT_NAME, GLP1_GIP_LABEL } from '@/constants/factory';

export const HowToStartHero = () => {
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
    <section className={`${styles.heroSection} py-5`}>
      <div className={'container ' + styles.heroContainer}>
        <div className={styles.imagesRow}>
          <div className={styles.imageContainer}>
            <Image
              src={glp1.src}
              alt={`${GLP1_PRODUCT_NAME} ${GLP1_LABEL} Vial`}
              width={200}
              height={200}
              className={styles.productImage}
            />
          </div>
          <div className={styles.imageContainer}>
            <Image
              src={poolGirl.src}
              alt='Woman with smoothie'
              width={200}
              height={200}
              className={styles.productImage}
            />
          </div>
          <div className={styles.imageContainer}>
            <Image
              src={glp1Gip.src}
              alt={`${GLP1_GIP_PRODUCT_NAME} ${GLP1_GIP_LABEL} Vial`}
              width={200}
              height={200}
              className={styles.productImage}
            />
          </div>
          <div className={styles.imageContainer}>
            <Image src={gymMan.src} alt='Man at gym' width={200} height={200} className={styles.productImage} />
          </div>
        </div>
        <div className={styles.containerTextContent}>
          <h1 className={`text-white fw-bold mb-4 ${styles.heroTitle}`}>
            Your Weight Loss Journey,
            <br />
            <span className={styles.titleAccent}>Redefined</span>
          </h1>
          <p className={`text-white ${styles.heroDescription}`}>
            More than weight loss—it&apos;s about finding balance, building confidence, and creating a healthier version
            of you.
          </p>
          <div>
            <button
              className={styles.heroButton}
              onClick={handleGetStarted}
              disabled={isPending}
              data-tracking-id='get-started-hero-how-to-start'
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
