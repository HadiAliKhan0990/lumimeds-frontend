'use client';

import RectangleBorder from '@/assets/ads/free/Rectangle.png';
import Image from 'next/image';
import GLP1GIPBottle from '@/assets/ads/journey/glp-1_gip.png';
import { TransitionStartFunction, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import { ProductType, ProductPrice } from '@/store/slices/productTypeSlice';
import { trackAddToCart } from '@/lib/tracking';
import { handleVerifyRedirectToCheckout, getRoundedPrice } from '@/helpers/products';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { GLP1_GIP_PRODUCT_NAME } from '@/constants/factory';
import { Spinner } from 'react-bootstrap';

interface FreeProductCardProps {
  productsData: ProductTypesResponseData;
}

export default function FreeProductCard({ productsData }: Readonly<FreeProductCardProps>) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [isButtonDisabled, setIsButtonDisabled] = useTransition();
  const [isSecondButtonDisabled, setIsSecondButtonDisabled] = useTransition();
  const [isThirdButtonDisabled, setIsThirdButtonDisabled] = useTransition();

  const selectedProduct = useSelector((state: RootState) => state.productType);
  const checkout = useSelector((state: RootState) => state.checkout);
  const { isSurveyCompleted, checkoutUser } = checkout || {};

  // Find products by type (only those with active prices)
  // Based on the API response structure:
  // 1. Monthly GIP: planType='recurring', billingInterval='month', intervalCount=1
  // 2. Starter GIP: planType='one_time' (one-time purchase)
  // 3. 3-Month GIP: planType='recurring', billingInterval='month', intervalCount=3
  const monthlyGIPProduct = productsData?.glp_1_gip_plans?.products?.find(
    (product: ProductType) =>
      product.planType === 'recurring' &&
      product.metadata?.billingInterval === 'month' &&
      product.metadata?.intervalCount === 1 &&
      product.prices.some((price: ProductPrice) => price.isActive === true)
  );
  const starterGIPProduct = productsData?.glp_1_gip_plans?.products?.find(
    (product: ProductType) =>
      product.planType === 'one_time' && product.prices.some((price: ProductPrice) => price.isActive === true)
  );
  const threeMonthGIPProduct = productsData?.glp_1_gip_plans?.products?.find(
    (product: ProductType) =>
      product.planType === 'recurring' &&
      product.metadata?.billingInterval === 'month' &&
      product.metadata?.intervalCount === 3 &&
      product.prices.some((price: ProductPrice) => price.isActive === true)
  );

  // Use fallback image if no product image is available
  const gipProductImage = productsData?.glp_1_gip_plans?.image || GLP1GIPBottle;

  // Function to extract billingIntervalCount from product description
  const extractBillingIntervalCount = (description: string | null): number => {
    if (!description) return 1;

    // Look for patterns like "3-Month Subscription", "1-Month Supply", etc.
    const monthMatch = description.match(/(\d+)-Month/i);
    if (monthMatch) {
      return parseInt(monthMatch[1], 10);
    }

    // Look for patterns like "Monthly Subscription" (no number = 1)
    if (description.toLowerCase().includes('monthly')) {
      return 1;
    }

    // Default to 1 if no pattern found
    return 1;
  };

  const formatPrice = (price: ProductPrice | null, productDescription?: string | null) => {
    if (!price) {
      // Fallback values if API doesn't return data
      return { amount: 0, period: '', breakdown: '', purchaseType: '' };
    }

    const amount = price.amount;
    const intervalCount = price.billingIntervalCount || extractBillingIntervalCount(productDescription || null);
    const checkoutType = price.checkoutType;

    if (checkoutType === 'subscription') {
      if (intervalCount === 1) {
        return {
          amount: amount,
          period: 'Per Month',
          breakdown: `$${getRoundedPrice(amount)}/mo`,
          purchaseType: 'Monthly Subscription',
        };
      } else {
        const monthlyEquivalent = Math.round(amount / intervalCount);
        return {
          amount: amount,
          period: '',
          breakdown: `$${getRoundedPrice(amount)} upfront ($${getRoundedPrice(monthlyEquivalent)}/mo equivalent)`,
          purchaseType: `${intervalCount}-Month Subscription`,
        };
      }
    } else if (checkoutType === 'payment') {
      // One-time purchase (payment type)
      const monthlyEquivalent = Math.round(amount / intervalCount);
      return {
        amount: amount,
        period: '',
        breakdown: `$${getRoundedPrice(amount)} upfront ($${getRoundedPrice(monthlyEquivalent)}/mo equivalent)`,
        purchaseType: 'One-Time Purchase',
      };
    } else {
      // Fallback for unknown checkout types
      return {
        amount: amount,
        period: '',
        breakdown: `$${getRoundedPrice(amount)}`,
        purchaseType: 'Purchase',
      };
    }
  };

  // Get product descriptions for each type
  const getProductDescription = (type: 'monthly' | 'starter' | 'subscription') => {
    if (type === 'monthly') {
      return monthlyGIPProduct?.description;
    } else if (type === 'starter') {
      return starterGIPProduct?.description;
    } else if (type === 'subscription') {
      return threeMonthGIPProduct?.description;
    }
    return null;
  };

  // Fallback values if no API data is available
  const monthlyPrice = formatPrice(monthlyGIPProduct?.prices?.[0] || null, getProductDescription('monthly')) || {
    amount: 279,
    period: 'Per Month',
    breakdown: '$279/mo',
    purchaseType: 'Monthly Subscription',
  };
  const starterPrice = formatPrice(starterGIPProduct?.prices?.[0] || null, getProductDescription('starter')) || {
    amount: 399,
    period: '',
    breakdown: '$399 upfront ($133/mo equivalent)',
    purchaseType: 'One-Time Purchase',
  };
  const subscriptionPrice = formatPrice(
    threeMonthGIPProduct?.prices?.[0] || null,
    getProductDescription('subscription')
  ) || {
    amount: 649,
    period: '',
    breakdown: '$649 upfront ($216/mo equivalent)',
    purchaseType: '3-Month Subscription',
  };

  // Check if each product has active prices
  const hasActiveMonthly = monthlyGIPProduct?.prices?.some((price: ProductPrice) => price.isActive === true) === true;
  const hasActiveStarter = starterGIPProduct?.prices?.some((price: ProductPrice) => price.isActive === true) === true;
  const hasActiveSubscription =
    threeMonthGIPProduct?.prices?.some((price: ProductPrice) => price.isActive === true) === true;

  async function handleGetStarted(product: ProductType, startTransition: TransitionStartFunction) {
    trackAddToCart({
      itemId: product.id ?? '',
      itemName: product.displayName ?? product.name ?? '',
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

  return (
    <div className='free-product-card-section'>
      <div className='container'>
        <div className='d-flex flex-column gap-5'>
          {/* First Card - Monthly Subscription */}
          {hasActiveMonthly && (
            <div className='free-product-card position-relative'>
              <div className='row align-items-center'>
                <div className='col-12 col-md-7'>
                  <div className='free-product-left'>
                    <h3 className='free-product-title'>{monthlyGIPProduct?.durationText || 'Monthly Subscription'}</h3>
                    <div className='free-product-pricing'>
                      <div className='free-product-price-row-single'>
                        <span className='free-product-price'>
                          ${getRoundedPrice(monthlyGIPProduct?.prices?.[0]?.amount || monthlyPrice.amount)}
                        </span>
                        <span className='free-product-price-period'>Per Month</span>
                      </div>
                    </div>
                    <p className='free-product-description'>
                      Make your first step count. Designed for maximum flexibility. Get started with our science-backed
                      program with no long-term commitment.
                    </p>
                    <ul className='free-product-benefits-list'>
                      {monthlyGIPProduct?.bulletDescription?.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      )) || [
                        <li key='1'>One-month supply, renewed monthly</li>,
                        <li key='2'>No long-term commitment required</li>,
                        <li key='3'>A simple way to get started</li>,
                        <li key='4'>Your treatment, organized and delivered monthly</li>,
                      ]}
                    </ul>
                    <button
                      className='free-product-button-mobile tw-flex tw-items-center tw-justify-center tw-gap-2'
                      onClick={() => handleGetStarted(monthlyGIPProduct, setIsButtonDisabled)}
                      disabled={isButtonDisabled}
                    >
                      {isButtonDisabled && <Spinner className='border-2' size='sm' />}
                      Get Started
                    </button>
                  </div>
                </div>

                <div className='col-12 col-md-5'>
                  <div className='free-product-right'>
                    <div className='free-product-image'>
                      <Image
                        src={gipProductImage}
                        alt={`${GLP1_GIP_PRODUCT_NAME} Compounded Medication`}
                        width={200}
                        height={400}
                        className='free-product-bottle-image'
                      />
                    </div>
                    <button
                      className='free-product-button-desktop tw-flex tw-items-center tw-justify-center tw-gap-2'
                      onClick={() => handleGetStarted(monthlyGIPProduct, setIsButtonDisabled)}
                      disabled={isButtonDisabled}
                    >
                      {isButtonDisabled && <Spinner className='border-2' size='sm' />}
                      Get Started
                    </button>
                  </div>
                </div>
              </div>
              <Image
                className='position-absolute top-0 end-0 start-0 bottom-0 w-100 h-100'
                src={RectangleBorder}
                alt='Rectangle Border'
                width={1959}
                height={823}
              />
            </div>
          )}

          {/* Second Card - Starter 3-Month Supply */}
          {hasActiveStarter && (
            <div className='free-product-card position-relative'>
              <div className='row align-items-center'>
                <div className='col-12 col-md-7'>
                  <div className='free-product-left'>
                    <div className='free-product-title-row'>
                      <h3 className='free-product-title'>
                        {starterGIPProduct?.durationText || 'Starter 3-Month Supply'}
                      </h3>
                      <span className='free-product-popular-tag'>Most popular!</span>
                    </div>
                    <div className='free-product-pricing'>
                      <div className='free-product-price-row'>
                        <span className='free-product-price'>
                          ${getRoundedPrice(starterGIPProduct?.prices?.[0]?.amount || starterPrice.amount)}
                        </span>
                        <div className='free-product-price-details'>
                          <p className='free-product-price-breakdown'>
                            ${getRoundedPrice(starterGIPProduct?.prices?.[0]?.amount || starterPrice.amount)} upfront ($
                            {getRoundedPrice(starterGIPProduct?.dividedAmount)}/mo equivalent)
                          </p>
                          <p className='free-product-purchase-type'>One-Time Purchase</p>
                        </div>
                      </div>
                    </div>
                    <p className='free-product-description'>
                      First steps to lasting wellness. Ideal for first-time users ready to make real, sustainable
                      progress and eager to achieve lasting results.
                    </p>
                    <ul className='free-product-benefits-list'>
                      {starterGIPProduct?.bulletDescription?.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      )) || [
                        <li key='1'>
                          Specially designed for new patients beginning {GLP1_GIP_PRODUCT_NAME} treatment
                        </li>,
                        <li key='2'>Includes your first 3 starter doses – everything you need to begin safely</li>,
                        <li key='3'>Kick start measurable results in your first 90 days</li>,
                      ]}
                    </ul>
                    <button
                      className='free-product-button-mobile tw-flex tw-items-center tw-justify-center tw-gap-2'
                      onClick={() => handleGetStarted(starterGIPProduct, setIsSecondButtonDisabled)}
                      disabled={isSecondButtonDisabled}
                    >
                      {isSecondButtonDisabled && <Spinner className='border-2' size='sm' />}
                      Get Started
                    </button>
                  </div>
                </div>

                <div className='col-12 col-md-5'>
                  <div className='free-product-right'>
                    <div className='free-product-image'>
                      <div className='free-product-multiple-bottles'>
                        <Image
                          src={gipProductImage}
                          alt={`${GLP1_GIP_PRODUCT_NAME} Compounded Medication`}
                          width={140}
                          height={280}
                          className='free-product-bottle-image bottle-1'
                        />
                        <Image
                          src={gipProductImage}
                          alt={`${GLP1_GIP_PRODUCT_NAME} Compounded Medication`}
                          width={140}
                          height={280}
                          className='free-product-bottle-image bottle-2'
                        />
                        <Image
                          src={gipProductImage}
                          alt={`${GLP1_GIP_PRODUCT_NAME} Compounded Medication`}
                          width={140}
                          height={280}
                          className='free-product-bottle-image bottle-3'
                        />
                      </div>
                    </div>
                    <button
                      className='free-product-button-desktop tw-flex tw-items-center tw-justify-center tw-gap-2'
                      onClick={() => handleGetStarted(starterGIPProduct, setIsSecondButtonDisabled)}
                      disabled={isSecondButtonDisabled}
                    >
                      {isSecondButtonDisabled && <Spinner className='border-2' size='sm' />}
                      Get Started
                    </button>
                  </div>
                </div>
              </div>{' '}
              <Image
                className='position-absolute top-0 end-0 start-0 bottom-0 w-100 h-100'
                src={RectangleBorder}
                alt='Rectangle Border'
                width={1959}
                height={823}
              />
            </div>
          )}

          {/* Third Card - 3-Month Subscription */}
          {hasActiveSubscription && (
            <div className='free-product-card position-relative'>
              <div className='row align-items-center'>
                <div className='col-12 col-md-7'>
                  <div className='free-product-left'>
                    <div className='free-product-title-row'>
                      <h3 className='free-product-title'>
                        {threeMonthGIPProduct?.durationText || '3-Month Subscription'}
                      </h3>
                      <span className='free-product-best-value-tag'>Best Value for ongoing treatment</span>
                    </div>
                    <div className='free-product-pricing'>
                      <div className='free-product-price-row'>
                        <span className='free-product-price'>
                          ${getRoundedPrice(threeMonthGIPProduct?.prices?.[0]?.amount || subscriptionPrice.amount)}
                        </span>
                        <div className='free-product-price-details'>
                          <p className='free-product-price-breakdown'>
                            ${getRoundedPrice(threeMonthGIPProduct?.prices?.[0]?.amount || subscriptionPrice.amount)} upfront ($
                            {getRoundedPrice(threeMonthGIPProduct?.dividedAmount)}/mo equivalent)
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className='free-product-description'>
                      Optimal results for less. Achieve optimal, consistent progress while enjoying our lowest cost per
                      dose. Stay on top of your weight loss. Get closer to your wellness goals.
                    </p>
                    <ul className='free-product-benefits-list'>
                      {threeMonthGIPProduct?.bulletDescription?.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      )) || [
                        <li key='1'>
                          For patients who&apos;ve already taken {GLP1_GIP_PRODUCT_NAME} and can continue at higher
                          doses
                        </li>,
                        <li key='2'>Covers your next 3 months of treatment in one simple payment</li>,
                        <li key='3'>Provides consistent access without monthly refills or interruptions</li>,
                        <li key='4'>Ideal for maintaining steady progress with advanced dosing</li>,
                      ]}
                    </ul>
                    <button
                      className='free-product-button-mobile tw-flex tw-items-center tw-justify-center tw-gap-2'
                      onClick={() => handleGetStarted(threeMonthGIPProduct, setIsThirdButtonDisabled)}
                      disabled={isThirdButtonDisabled}
                    >
                      {isThirdButtonDisabled && <Spinner className='border-2' size='sm' />}
                      Get Started
                    </button>
                  </div>
                </div>

                <div className='col-12 col-md-5'>
                  <div className='free-product-right'>
                    <div className='free-product-image'>
                      <div className='free-product-multiple-bottles'>
                        <Image
                          src={gipProductImage}
                          alt={`${GLP1_GIP_PRODUCT_NAME} Compounded Medication`}
                          width={140}
                          height={280}
                          className='free-product-bottle-image bottle-1'
                        />
                        <Image
                          src={gipProductImage}
                          alt={`${GLP1_GIP_PRODUCT_NAME} Compounded Medication`}
                          width={140}
                          height={280}
                          className='free-product-bottle-image bottle-2'
                        />
                        <Image
                          src={gipProductImage}
                          alt={`${GLP1_GIP_PRODUCT_NAME} Compounded Medication`}
                          width={140}
                          height={280}
                          className='free-product-bottle-image bottle-3'
                        />
                      </div>
                    </div>
                    <button
                      className='free-product-button-desktop tw-flex tw-items-center tw-justify-center tw-gap-2'
                      onClick={() => handleGetStarted(threeMonthGIPProduct, setIsThirdButtonDisabled)}
                      disabled={isThirdButtonDisabled}
                    >
                      {isThirdButtonDisabled && <Spinner className='border-2' size='sm' />}
                      Get Started
                    </button>
                  </div>
                </div>
              </div>
              <Image
                className='position-absolute top-0 end-0 start-0 bottom-0 w-100 h-100'
                src={RectangleBorder}
                alt='Rectangle Border'
                width={1959}
                height={823}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
