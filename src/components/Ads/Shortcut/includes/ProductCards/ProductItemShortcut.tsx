'use client';

import Image from 'next/image';
import GroupImage3 from '@/assets/503Bontrack/503B-Gorup-3.png';
import { useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { trackAddToCart } from '@/lib/tracking';
import { ProductType } from '@/store/slices/productTypeSlice';
import { handleVerifyRedirectToCheckout, getRoundedPrice } from '@/helpers/products';
import { Spinner } from 'react-bootstrap';
import styles from './styles.module.scss';

interface Props {
  product: ProductType;
}

export default function ProductItemShortcut({ product }: Readonly<Props>) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [isPending, startTransition] = useTransition();

  const selectedProduct = useSelector((state: RootState) => state.productType);
  const checkout = useSelector((state: RootState) => state.checkout);
  const { isSurveyCompleted, checkoutUser } = checkout || {};

  async function handleGetStarted(product: ProductType) {
    trackAddToCart({
      itemId: product.id ?? '',
      itemName: product.name ?? '',
      value: product.prices?.[0].amount ?? 0,
    });

    await handleVerifyRedirectToCheckout({
      selectedProduct,
      product,
      dispatch,
      startTransition,
      router,
      isSurveyCompleted,
      checkoutUser,
    });
  }

  const renderProductImage = () => {
    // If supply text includes 3-Month, show static image
    if (product.metadata.intervalCount === 3) {
      return (
        <Image
          src={GroupImage3}
          alt='GLP-1 (503B) Weight Loss Injection Vials'
          width={200}
          height={120}
          className={styles.productVialImage}
        />
      );
    } else if (product.image) {
      // Use provided image URL if available
      return (
        <Image
          src={product.image}
          alt='GLP-1 (503B) Weight Loss Injection Vial'
          width={80}
          height={120}
          className={styles.productVialImage}
        />
      );
    }
  };

  const benefit = useMemo(() => {
    if (product.metadata.intervalCount === 1) {
      return 'See and feel the difference in one month.';
    } else if (product.metadata.intervalCount === 2) {
      return 'Set Yourself Up For Success.';
    } else if (product.metadata.intervalCount === 3) {
      return 'More Time = Greater Progress';
    }
    return 'See and feel the difference in one month.';
  }, [product]);

  return (
    <div className={styles.productItem}>
      {/* Top-left Supply Banner */}
      <div className={styles.supplyBanner}>
        <h3 className={styles.supplyText}>{product.durationText}</h3>
      </div>

      {/* Main Content */}
      <div className={styles.productContent}>
        <div className={styles.productLayout}>
          {/* Left Section - Pricing */}
          <div className={styles.pricingSection}>
            <p className={styles.pricingIntro}>Level up your weight care at</p>
            <div className={styles.priceDisplay}>
              <span className={styles.priceAmount}>
                $
                {product.metadata.intervalCount === 1
                  ? getRoundedPrice(product.prices?.[0]?.amount)
                  : getRoundedPrice(product.dividedAmount) || getRoundedPrice(product.prices?.[0]?.amount)}
              </span>
              <span className={styles.pricePeriod}>/mo</span>
            </div>
            <p className={styles.purchaseType}>
              {product.metadata.intervalCount === 1
                ? 'One-Time Purchase'
                : `One-Time Payment of $${getRoundedPrice(product.prices?.[0]?.amount)}`}
            </p>
            <button
              disabled={isPending}
              className={`rounded-pill ${styles.productCtaButton}`}
              onClick={() => handleGetStarted(product)}
              data-tracking-id={`product-card-shortcut-${
                product.id || product.name?.toLowerCase().replace(/\s+/g, '-')
              }`}
            >
              {isPending && <Spinner className='border-2 me-2' size='sm' />}
              Get Started
            </button>
          </div>

          {/* Center - Product Image */}
          <div className={styles.productImageSection}>
            <div className={styles.productImagesContainer}>{renderProductImage()}</div>
          </div>

          {/* Right Section - Product Info */}
          <div className={styles.productInfoSection}>
            <p className={styles.productBenefit}>{benefit}</p>
            <ul className={`text-start ${styles.productFeatures} d-flex flex-column gap-2`}>
              {product.bulletDescription.map((feature) => (
                <li key={feature} className={styles.featureText}>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
