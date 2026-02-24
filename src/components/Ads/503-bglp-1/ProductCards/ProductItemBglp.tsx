'use client';

import { useTransition } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import { Spinner } from 'react-bootstrap';
import { ProductType } from '@/store/slices/productTypeSlice';
import Image from 'next/image';
import styles from './styles.module.scss';

interface Props {
  product: ProductType;
}

export default function ProductItemBglp({ product }: Readonly<Props>) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const checkout = useSelector((state: RootState) => state.checkout);
  const { isSurveyCompleted, checkoutUser } = checkout || {};

  const handleGetStarted = async (p: ProductType) => {
    await handleVerifyRedirectToCheckout({
      selectedProduct: p,
      product: p,
      dispatch,
      startTransition,
      router,
      isSurveyCompleted,
      checkoutUser,
    });
  };

  const renderProductImage = () => {
    if (product.image) {
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
    if (product.dividedAmount) {
      return (
        <div className={styles.twoVialsContainer}>
          <Image
            src={product.image || '/vial_olympia.png'}
            alt={`${product.name} Vial 1`}
            width={100}
            height={250}
            className={`${styles.vialImage} ${styles.vialLeft}`}
          />
          <Image
            src={product.image || '/vial_olympia.png'}
            alt={`${product.name} Vial 2`}
            width={100}
            height={250}
            className={`${styles.vialImage} ${styles.vialRight}`}
          />
        </div>
      );
    }
  };

  const isMultiMonth = () => Boolean(product.dividedAmount);

  const getSubscriptionType = () => product.durationText || '1-Month Supply';
  const getOneTimeLabel = () => 'One-Time Purchase';

  const getPriceDisplay = (): number => {
    if (isMultiMonth()) {
      return product.dividedAmount || 0;
    }
    return product.prices?.[0]?.amount || 0;
  };

  const getSupplyText = () =>
    product.durationText === '1-Month Supply'
      ? 'for a full month supply'
      : product.durationText === '2-Month Supply'
      ? 'for a full two months supply'
      : 'for a full three months supply';
  const getFooterNote = () =>
    product.durationText === '1-Month Supply'
      ? 'See and feel the difference in one month.'
      : 'Set Yourself Up For Success';

  return (
    <div className={`card h-100 ${styles.productCard} ${styles.cardBglp}`}>
      <div className={styles.cardHeader}>
        <div className={`${styles.subscriptionTag} ${styles.tagFilled}`}>{getSubscriptionType()}</div>
        <div className={`${styles.subscriptionTag} ${styles.tagOutline}`}>{getOneTimeLabel()}</div>
      </div>

      <div className={styles.imagePanel}>
        <div className={styles.productImageSection}>{renderProductImage()}</div>
      </div>

      <div className={styles.pricingSection}>
        <div className={styles.priceLine}>
          <div className={styles.priceDisplay}>
            <span className={styles.dollarSign}>$</span>
            <span className={styles.priceAmount}>{getPriceDisplay()}</span>
            <span className={styles.pricePeriod}>/mo</span>
          </div>
          <div className={styles.supplyText}>{getSupplyText()}</div>
        </div>
      </div>

      <div className={styles.featuresSection}>
        <ul className={styles.featuresList}>
          {product.bulletDescription.map((feature: string, index: number) => (
            <li key={index} className={`${styles.featureItem} ${styles.featureMuted}`}>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.footerRow}>
        <div className={styles.cardNote}>{getFooterNote()}</div>
        <button
          className={`btn ${styles.ctaButtonMuted}`}
          onClick={() => handleGetStarted(product)}
          disabled={isPending}
          data-tracking-id={`product-card-503b-bglp-${product.id || product.name?.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {isPending && <Spinner className='border-2 me-2' size='sm' />}
          Get Started
        </button>
      </div>
    </div>
  );
}
