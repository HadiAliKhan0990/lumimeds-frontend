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

export default function ProductItemRun({ product }: Readonly<Props>) {
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
      return 'See and feel the difference in one month';
    } else if (product.metadata.intervalCount === 2) {
      return 'Set Yourself Up For Success';
    } else if (product.metadata.intervalCount === 3) {
      return 'More Time = Greater Progress';
    }
    return 'See and feel the difference in one month';
  }, [product]);
  return (
    <div className={styles.productItem}>
      {/* Header Section - Dark Green */}
      <div className={styles.supplyBanner}>
        <div className={styles.headerContent}>
          <h3 className={styles.supplyText}>
            {product.durationText}
            <p className={styles.purchaseTypeHeader}>One-Time Purchase</p>
          </h3>
          <p className={styles.benefitHeader}>{benefit}</p>
        </div>
      </div>

      {/* Main Content - Light Green */}
      <div className={styles.productContent}>
        <div className={styles.productLayout}>
          {/* Left Section - Product Images */}
          <div className={styles.productImageSection}>
            <div className={styles.productImagesContainer}>{renderProductImage()}</div>
            <h2 className={styles.productTitle}>GLP-1 (503B) Weight Loss Injections</h2>
          </div>

          {/* Right Section - Pricing and Info */}
          <div className={styles.productInfoSection}>
            <div className={styles.pricingSection}>
              <div className={styles.priceDisplay}>
                <span className={styles.dollarSign}>$</span>
                <span className={styles.priceAmount}>
                  {product.metadata.intervalCount === 1
                    ? getRoundedPrice(product.prices?.[0]?.amount)
                    : getRoundedPrice(product.dividedAmount) || getRoundedPrice(product.prices?.[0]?.amount)}
                </span>
                <span className={styles.pricePeriod}>/mo</span>
              </div>
            </div>

            <ul className={`text-start ${styles.productFeatures} d-flex flex-column`}>
              {product.bulletDescription.map((feature) => (
                <li key={feature} className={styles.featureText}>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              disabled={isPending}
              className={styles.productCtaButton}
              onClick={() => handleGetStarted(product)}
              data-tracking-id={`product-card-run-${product.id || product.name?.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {isPending && <Spinner className='border-2 me-2' size='sm' />}
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
