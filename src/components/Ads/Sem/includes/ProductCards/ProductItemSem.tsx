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
import { GLP1_PRODUCT_NAME, GLP1_LABEL } from '@/constants/factory';

interface Props {
  product: ProductType;
}

export default function ProductItemSem({ product }: Readonly<Props>) {
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
    // If it's a 3-month plan, show multiple vials using the same product image
    if (
      product.durationText?.toLowerCase().includes('3-month') ||
      product.durationText?.toLowerCase().includes('3 month')
    ) {
      // Show 3 vials for 3-month subscription - all using the same product image
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
      // Show single vial for monthly subscription using Next.js Image component
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

  const getSubscriptionType = () => {
    if (
      product.durationText?.toLowerCase().includes('3-month') ||
      product.durationText?.toLowerCase().includes('3 month')
    ) {
      return '3-Month Subscription';
    }
    return 'Monthly Subscription';
  };

  const getSubscriptionDescription = () => {
    if (
      product.durationText?.toLowerCase().includes('3-month') ||
      product.durationText?.toLowerCase().includes('3 month')
    ) {
      return 'More Time = Greater Progress';
    }
    return 'Weight management simplified for your needs.';
  };

  const getPriceDisplay = (): number => {
    if (
      product.durationText?.toLowerCase().includes('3-month') ||
      product.durationText?.toLowerCase().includes('3 month')
    ) {
      return product.dividedAmount || 0;
    }
    return product.prices?.[0]?.amount || 0;
  };

  const shouldShowMonthlySuffix = (): boolean => {
    return true; // Always show /mo for all products
  };

  const getTotalPrice = () => {
    if (
      product.durationText?.toLowerCase().includes('3-month') ||
      product.durationText?.toLowerCase().includes('3 month')
    ) {
      const monthlyPrice = getPriceDisplay();
      return `$${(monthlyPrice * 3).toFixed(0)} every 3 months`;
    }
    return null;
  };

  return (
    <div className={`card ${styles.productCard}`}>
      {/* Header Section */}
      <div className={styles.cardHeader}>
        <div className={styles.subscriptionTag}>{getSubscriptionType()}</div>
        <div className={styles.subscriptionDescription}>{getSubscriptionDescription()}</div>
      </div>

      {/* GLP-1 Header */}
      <div className={styles.glpHeader}>
        <h2 className={styles.glpTitle}>
          {GLP1_PRODUCT_NAME} {GLP1_LABEL} Injections
        </h2>
      </div>

      {/* Product Image Section */}
      <div className={styles.productImageSection}>{renderProductImage()}</div>

      {/* Pricing Section */}
      <div className={styles.pricingSection}>
        <div className={styles.priceDisplay}>
          <span className={styles.dollarSign}>$</span>
          <span className={styles.priceAmount}>{getPriceDisplay()}</span>
          {shouldShowMonthlySuffix() && <span className={styles.pricePeriod}>/mo</span>}
          {product.durationText?.toLowerCase().includes('3-month') && (
            <span className={styles.popularTag}>Most popular!</span>
          )}
        </div>
        {getTotalPrice() && <div className={styles.totalPrice}>{getTotalPrice()}</div>}
      </div>

      {/* Features Section */}
      <div className={styles.featuresSection}>
        <ul className={styles.featuresList}>
          {product.bulletDescription.map((feature: string, index: number) => (
            <li key={index} className={styles.featureItem}>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Button */}
      <div className={styles.ctaSection}>
        <button
          className={`btn ${styles.ctaButton}`}
          onClick={() => handleGetStarted(product)}
          disabled={isPending}
          data-tracking-id={`product-card-sem-${product.id || product.name?.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {isPending && <Spinner className='border-2 me-2' size='sm' />}
          Get Started
        </button>
      </div>
    </div>
  );
}
