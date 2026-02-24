'use client';

import { useTransition } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { handleVerifyRedirectToCheckout, getRoundedPrice } from '@/helpers/products';
import { Spinner } from 'react-bootstrap';
import Image from 'next/image';
import styles from '../../../styles.module.scss';
import cardStyles from './styles.module.scss';
import { ProductType } from '@/store/slices/productTypeSlice';
import { RootState, AppDispatch } from '@/store';

interface MedSpa3ProductsItemProps {
  readonly product: ProductType;
  readonly t: (key: string) => string;
}

export default function MedSpa3ProductsItem({ product, t }: Readonly<MedSpa3ProductsItemProps>) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const checkout = useSelector((state: RootState) => state.checkout);

  const { isSurveyCompleted, checkoutUser } = checkout || {};

  const handleGetStarted = async (product: ProductType) => {
    await handleVerifyRedirectToCheckout({
      selectedProduct: product,
      product: product,
      dispatch,
      startTransition,
      router,
      isSurveyCompleted,
      checkoutUser,
    });
  };

  const renderProductImage = () => {
    if (
      product.durationText?.toLowerCase().includes('3-month') ||
      product.durationText?.toLowerCase().includes('3 month')
    ) {
      return (
        <div className={styles.multipleVialsContainer}>
          <Image
            src={product.image || '/vial_olympia.png'}
            alt={`${product.name} Vial 1`}
            width={100}
            height={250}
            className={`${styles.vialImage} ${styles.vial1}`}
          />
          <Image
            src={product.image || '/vial_olympia.png'}
            alt={`${product.name} Vial 2`}
            width={100}
            height={250}
            className={`${styles.vialImage} ${styles.vial2}`}
          />
          <Image
            src={product.image || '/vial_olympia.png'}
            alt={`${product.name} Vial 3`}
            width={100}
            height={250}
            className={`${styles.vialImage} ${styles.vial3}`}
          />
        </div>
      );
    } else if (product.image) {
      return (
        <div className={styles.singleVialContainer}>
          <Image
            src={product.image}
            alt={`${product.name} Vial`}
            width={100}
            height={250}
            className={styles.vialImage}
          />
        </div>
      );
    }
  };

  const getPriceDisplay = (): number => {
    if (
      product.durationText?.toLowerCase().includes('3-month') ||
      product.durationText?.toLowerCase().includes('3 month')
    ) {
      return getRoundedPrice(product.dividedAmount) || 0;
    }
    return getRoundedPrice(product.prices?.[0]?.amount) || 0;
  };

  const shouldShowMonthlySuffix = (): boolean => {
    return true;
  };

  const getPlanType = (): { type: string; badge: string; badgeClass: string } => {
    const price = getPriceDisplay();
    const hasMultipleVials =
      product.durationText?.toLowerCase().includes('3-month') ||
      product.durationText?.toLowerCase().includes('3 month');

    // Based on the new pricing: Starter ($150), Best Value ($300), Monthly ($420)
    if (price <= 200) {
      return { type: 'starter', badge: t('badges.starter'), badgeClass: styles.planTag };
    } else if (price <= 350 && hasMultipleVials) {
      return { type: 'best-value', badge: t('badges.bestValue'), badgeClass: styles.bestValueBadge };
    } else {
      return { type: 'monthly', badge: t('badges.monthly'), badgeClass: styles.planTag };
    }
  };

  const planInfo = getPlanType();
  const isBestValue = planInfo.type === 'best-value';

  return (
    <div
      className={`tw-text-white tw-p-6 tw-rounded-2xl ${cardStyles.cardSimpleGlass} ${
        isBestValue ? styles.bestValueCard : ''
      }`}
    >
      <div className='m-auto tw-py-6 tw-w-full tw-text-center'>
        <span className={planInfo.badgeClass}>{planInfo.badge}</span>
      </div>

      <div>
        <h2 className='tw-text-xl sm:tw-text-xl md:tw-text-2xl'>
          {t('products.glp1Gip.title')} <br />
          (GLP-1/GIP) Injections
        </h2>
        <p className='tw-text-base'>{t('products.glp1Gip.subtitle')}</p>
      </div>

      <div className={styles.productImageSection}>{renderProductImage()}</div>
      <div className={styles.pricingSection}>
        <div className={styles.priceDisplay}>
          <span className={styles.priceAmount} style={{ fontSize: '3rem' }}>
            ${getPriceDisplay()}
          </span>
          {shouldShowMonthlySuffix() && <span className={styles.pricePeriod}>{t('priceMonthSuffix')}</span>}
        </div>
      </div>

      <div className={styles.ctaSection}>
        <button
          className={`btn ${styles.ctaButton}`}
          style={{ width: '80%', borderRadius: '100px', color: 'white', backgroundColor: '#3060FE' }}
          onClick={() => handleGetStarted(product)}
          disabled={isPending}
        >
          {isPending && <Spinner className='border-2 me-2' size='sm' />}
          {t('buttonText')}
        </button>
      </div>
    </div>
  );
}
