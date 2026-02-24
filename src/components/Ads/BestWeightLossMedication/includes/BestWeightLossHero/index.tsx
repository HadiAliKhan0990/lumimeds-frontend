'use client';

import { Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { AppDispatch, RootState } from '@/store';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import Image from 'next/image';
import LumimedsLogo from '@/assets/ads/best-weight-loss-medication/LumimedsLogo.svg';
import KlarnaLogo from '@/assets/ads/best-weight-loss-medication/Klarna.png';
import HeroImage from '@/assets/ads/best-weight-loss-medication/Rectangle 34624656.png';
import VialImage from '@/assets/ads/best-weight-loss-medication/vial gipglp 1.png';
import styles from './styles.module.scss';

export default function BestWeightLossHero() {
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
      <div className="row g-0" style={{ overflow: 'visible' }}>
        {/* Right side - Visual content (shows first on mobile) */}
        <div className={`col-12 col-md-4 col-lg-4 order-1 order-md-2 ${styles.rightSection}`}>
          <div className={styles.visualContainer}>
            <Image 
              src={HeroImage} 
              alt="Woman meditating" 
              className={styles.heroImage}
              width={500}
              height={600}
              priority
            />
            <Image 
              src={VialImage} 
              alt="Vial" 
              className={styles.vialImage}
              width={120}
              height={200}
            />
          </div>
        </div>

        {/* Left side - Text content (shows second on mobile) */}
        <div className={`col-12 col-md-8 col-lg-8 order-2 order-md-1 ${styles.leftSection}`}>
          <div className={styles.contentWrapper}>
            {/* Logos */}
            <div className={styles.logoSection}>
              <Image src={LumimedsLogo} alt="Lumimeds" className={styles.lumimedsLogo} />
              <span className={styles.plusSign}>+</span>
              <div className={styles.klarnaLogoWrapper}>
                <Image src={KlarnaLogo} alt="Klarna" className={styles.klarnaLogo} />
              </div>
            </div>

            {/* Headline */}
            <h1 className={styles.headline}>
              Flexibility Meets <br />
              Confidence
            </h1>

            {/* Body text */}
            <p className={styles.bodyText}>
              You can now use Klarna for 3-month plans from LumiMeds! Split your total into manageable payments while you focus on results.
            </p>

            {/* CTA Button */}
            <button
              className={`btn btn-pill py-2 px-5 ${styles.ctaButton}`}
              onClick={handleGetStarted}
              disabled={isPending}
              data-tracking-id="get-started-hero-best-weight-loss"
            >
              {isPending && <Spinner className="border-2 me-2" size="sm" />}
              Start Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
