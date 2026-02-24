'use client';

import { ProductType } from '@/store/slices/productTypeSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { handleVerifyRedirectToCheckout, getRoundedPrice } from '@/helpers/products';
import { Spinner } from 'react-bootstrap';
import Image from 'next/image';
import styles from './styles.module.scss';
import { GLP1_GIP_PRODUCT_NAME, GLP1_GIP_LABEL } from '@/constants/factory';

interface Props {
  product: ProductType;
}

export default function ProductItemTirz({ product }: Readonly<Props>) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const selectedProduct = useSelector((state: RootState) => state.productType);
  const checkout = useSelector((state: RootState) => state.checkout);
  const { isSurveyCompleted, checkoutUser } = checkout || {};

  const handleGetStarted = async () => {
    await handleVerifyRedirectToCheckout({
      selectedProduct,
      product,
      dispatch,
      startTransition,
      router,
      isSurveyCompleted,
      checkoutUser,
    });
  };

  const getPriceDisplay = () => {
    // Use dividedAmount for monthly price display
    return getRoundedPrice(product.dividedAmount) || 0;
  };

  const getUpfrontPrice = () => {
    // Use the actual price from prices array
    return getRoundedPrice(product.prices?.[0]?.amount) || 0;
  };

  const getSupplyBadgeText = () => {
    // Use the durationText from the product data directly
    return product.durationText || 'Supply';
  };

  const isMostPopular = () => {
    // Check if it's the value plan (3-Month Subscription) or starter plan
    return product.metadata?.planTier === 'value' || product.metadata?.planTier === 'starter';
  };

  const getPopularBadgeText = () => {
    if (product.metadata?.planTier === 'value') {
      return (
        <>
          Best Value for
          <br />
          ongoing treatment
        </>
      );
    }
    return 'Most popular!';
  };

  const getMotivationalText = () => {
    if (product.durationText === 'Monthly Subscription') {
      return 'Maximum flexibility with minimum commitment.';
    } else if (product.durationText === '3-Month Subscription') {
      return 'Ensure consistent progress and lasting impact on overall wellness.';
    } else {
      return 'Kickstart your weight care journey with purpose.';
    }
  };

  return (
    <div className={styles.productCard}>
      {/* Header Badges */}
      <div className={styles.cardHeader}>
        <div className={styles.supplyBadge}>{getSupplyBadgeText()}</div>
        {isMostPopular() && <div className={styles.popularBadge}>{getPopularBadgeText()}</div>}
      </div>

      {/* Product Image */}
      <div className={styles.productImageSection}>
        <Image
          src={product.image || '/assets/placeholder-vial.png'}
          alt={`${GLP1_GIP_PRODUCT_NAME} ${GLP1_GIP_LABEL} Weight Loss Injections Vials`}
          width={120}
          height={72}
          className={styles.productImage}
        />
      </div>

      {/* Pricing Section */}
      <div className='tw-flex xl:tw-flex-row tw-flex-col tw-gap-4 tw-items-center tw-justify-center tw-mb-6'>
        <div className={styles.monthlyPrice}>
          <span className={styles.dollarSign}>$</span>
          <span className={styles.priceAmount}>{getPriceDisplay()}</span>
          <span className={styles.pricePeriod}>/mo</span>
        </div>
        <div className='tw-flex xl:tw-flex-col tw-flew-row xl:tw-gap-0 tw-gap-4 tw-items-end md:tw-items-center'>
          {product.durationText !== 'Monthly Subscription' && (
            <div className={styles.upfrontFirstLine}>
              <span className={styles.upfrontAmount}>${getUpfrontPrice()}</span>
              <span className={styles.upfrontText}>upfront</span>
            </div>
          )}
          {product.planType === 'one_time' && <span className={styles.purchaseType}>One-Time Purchase</span>}
        </div>
      </div>

      {/* Features Section */}
      <div className={styles.featuresSection}>
        <ul className={styles.featuresList}>
          {product.bulletDescription?.map((feature, index) => (
            <li key={index} className={styles.featureItem}>
              {feature}
            </li>
          ))}
        </ul>
        <div className={styles.motivationalText}>{getMotivationalText()}</div>
      </div>

      {/* CTA Button */}
      <div className={styles.ctaSection}>
        <button
          className={styles.ctaButton}
          onClick={handleGetStarted}
          disabled={isPending}
          data-tracking-id={`product-card-tirz-${product.id || product.name?.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {isPending && <Spinner className='border-2 me-2' size='sm' />}
          Get Started
        </button>
      </div>
    </div>
  );
}
