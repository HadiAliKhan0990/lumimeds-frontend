'use client';

import { useDispatch, useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { AppDispatch, RootState } from '@/store';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import { trackSurveyAnalytics } from '@/helpers/surveyTracking';
import Image from 'next/image';
import { GLP1_GIP_PRODUCT_NAME, GLP1_GIP_LABEL } from '@/constants/factory';
import VialImage from '@/assets/ads/best-weight-loss-medication/vial gipglp 1.png';
import KlarnaLogo from '@/assets/ads/best-weight-loss-medication/Klarna.png';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import { ProductType } from '@/store/slices/productTypeSlice';
import styles from './styles.module.scss';
import { ProductPrice } from '@/store/slices/productTypeSlice';
import { useState, useTransition } from 'react';
import { Spinner } from 'react-bootstrap';

interface Props {
  data: ProductTypesResponseData;
}

export default function GLP1_GIPCardSection({ data }: Readonly<Props>) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();

  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);

  const checkout = useSelector((state: RootState) => state.checkout);
  const { isSurveyCompleted, checkoutUser } = checkout || {};

  // Get GLP-1/GIP products from the data
  const glp1GipProducts = data?.glp_1_gip_plans?.products || [];

  // Filter products by plan tier
  const starterProduct = glp1GipProducts.find((product) => product.metadata?.planTier === 'starter');
  const valueProduct = glp1GipProducts.find((product) => product.metadata?.planTier === 'value');

  // If no value product found, use the first available product as value
  const displayValueProduct = valueProduct || (glp1GipProducts.length > 1 ? glp1GipProducts[1] : null);

  // Helper function to get price display (monthly equivalent)
  const getPriceDisplay = (product: ProductType) => {
    // Use the dividedAmount field directly
    return Math.round(product.dividedAmount || 0);
  };

  // Helper function to get total price
  const getTotalPrice = (product: ProductType) => {
    // For one-time purchases, use the single price
    if (product.planType === 'one_time') {
      return product.prices[0]?.amount || 0;
    }

    // For recurring plans, find 3-month total
    const totalPrice = product.prices.find(
      (price: ProductPrice) => price.billingInterval === 'month' && price.billingIntervalCount === 3
    );
    return totalPrice ? Math.round(totalPrice.amount) : 0;
  };

  const handleGetStarted = async (product: ProductType): Promise<void> => {
    try {
      setIsLoading(true);
      setLoadingProductId(product.id);

      await trackSurveyAnalytics({
        event: 'survey_get_started',
        payload: { url: pathname },
      });

      // Set the selected product in Redux
      dispatch({ type: 'productType/setProductType', payload: product });

      await handleVerifyRedirectToCheckout({
        selectedProduct: product,
        product: product,
        dispatch,
        startTransition,
        router,
        isSurveyCompleted,
        checkoutUser,
      });

      // Don't reset loading state on success - keep spinner visible until navigation completes
    } catch {
      // Only reset loading state if there's an error
      setIsLoading(false);
      setLoadingProductId(null);
    }
  };

  return (
    <div className={styles.glp1GipCardSection}>
      <div className={`${styles.cardContainer} row g-0`}>
        {/* Left side - All text content and buttons */}
        <div className={`col-12 col-lg-7 order-2 order-xl-1 ${styles.leftSide}`}>
          <div className={styles.frameGroup}>
            <div className={styles.frameContainer}>
              <div className={styles.compoundedTirzepatideGlp1Parent}>
                <b className={styles.compoundedTirzepatideGlp1Container}>
                  <p className={styles.compoundedTirzepatide}>{GLP1_GIP_PRODUCT_NAME}</p>
                  <p className={styles.compoundedTirzepatide}>{GLP1_GIP_LABEL} Injections</p>
                </b>
                <div className={styles.weightLossInjectionWrapper}>
                  <div className={styles.weightLossInjection}>Weight Loss Injection</div>
                </div>
              </div>
            </div>
            <div className={styles.renewableEvery3Container}>
              <ul className={styles.renewableEvery3MonthsIdeal}>
                <li>Renewable every 3 months</li>
                <li>Ideal for continuous treatment and steady progress with advanced dosing</li>
                <li>Transparent, all-inclusive pricing</li>
                <li>Free shipping</li>
              </ul>
            </div>
          </div>

          <div className={styles.frameDiv}>
            {/* Starter Plan */}
            {starterProduct && (
              <div className={styles.monthStarterSubscriptionForParent}>
                <div className={styles.monthStarterSubscriptionContainer}>
                  <span className={styles.monthStarterSubscriptionContainer2}>
                    <p className={styles.compoundedTirzepatide} style={{ lineHeight: '0rem' }}>
                      <span className={styles.month2}>
                        <b>
                          {starterProduct.metadata?.intervalCount}
                          {starterProduct.metadata?.billingInterval
                            ? `-${
                                starterProduct.metadata.billingInterval.charAt(0).toUpperCase() +
                                starterProduct.metadata.billingInterval.slice(1)
                              }`
                            : '-Month'}{' '}
                        </b>
                      </span>
                    </p>
                    <p className={styles.compoundedTirzepatide}>
                      <span className={styles.subscriptionTitle}>
                        {starterProduct.metadata?.planTier
                          ? starterProduct.metadata.planTier.charAt(0).toUpperCase() +
                            starterProduct.metadata.planTier.slice(1)
                          : 'Starter'}{' '}
                        Subscription
                      </span>
                    </p>
                    <p className={styles.forThoseStartingTreatmentO}>
                      <span className={styles.starterSubscription2}>
                        <span className={styles.forThoseStarting}>For those starting treatment only</span>
                      </span>
                    </p>
                  </span>
                </div>
                <div className={styles.frameParent2}>
                  <div className={styles.moWrapper}>
                    <b className={styles.weightLossInjection}>${getPriceDisplay(starterProduct)}/mo</b>
                  </div>
                  <div className={styles.frameWrapper2}>
                    <div className={styles.frameWrapper3}>
                      <div className={styles.onePaymentOf399OrPayWitParent}>
                        <div className={styles.onePaymentOf}>
                          One payment of ${getTotalPrice(starterProduct)} or pay with
                        </div>
                        <Image
                          className={styles.image2Icon}
                          src={KlarnaLogo}
                          width={33}
                          height={18.4}
                          sizes='100vw'
                          alt='Klarna'
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={`${styles.getStartedWrapper} tw-text-nowrap`}
                  onClick={() => !isLoading && !isPending && handleGetStarted(starterProduct)}
                  style={{
                    cursor: isLoading || isPending ? 'not-allowed' : 'pointer',
                    opacity: isLoading || isPending ? 0.6 : 1,
                  }}
                >
                  {(isLoading || isPending) && loadingProductId === starterProduct.id && (
                    <Spinner className='border-2' size='sm' style={{ marginRight: '8px' }} />
                  )}
                  <b className={styles.weightLossInjection}>Get Started</b>
                </div>
              </div>
            )}

            {/* Value Plan */}
            {displayValueProduct && (
              <div className={styles.monthValueSubscriptionForTParent}>
                <div className={styles.monthValueSubscriptionContainer}>
                  <span className={styles.monthStarterSubscriptionContainer2}>
                    <p className={styles.compoundedTirzepatide} style={{ lineHeight: '0rem' }}>
                      <span className={styles.month2}>
                        <b>
                          {displayValueProduct.metadata?.intervalCount}
                          {displayValueProduct.metadata?.billingInterval
                            ? `-${
                                displayValueProduct.metadata.billingInterval.charAt(0).toUpperCase() +
                                displayValueProduct.metadata.billingInterval.slice(1)
                              }`
                            : '-Month'}{' '}
                        </b>
                      </span>
                    </p>
                    <p className={styles.compoundedTirzepatide}>
                      <span className={styles.subscriptionTitle}>
                        {displayValueProduct.metadata?.planTier
                          ? displayValueProduct.metadata.planTier.charAt(0).toUpperCase() +
                            displayValueProduct.metadata.planTier.slice(1)
                          : 'Value'}{' '}
                        Subscription
                      </span>
                    </p>
                    <p className={styles.forThoseStartingTreatmentO}>
                      <span className={styles.starterSubscription2}>
                        <span className={styles.forThoseContinuing}>
                          For those continuing treatment at a higher dose
                        </span>
                      </span>
                    </p>
                  </span>
                </div>
                <div className={styles.frameParent3}>
                  <div className={styles.moWrapper}>
                    <b className={styles.weightLossInjection}>${getPriceDisplay(displayValueProduct)}/mo</b>
                  </div>
                  <div className={styles.frameWrapper2}>
                    <div className={styles.frameWrapper3}>
                      <div className={styles.onePaymentOf399OrPayWitParent}>
                        <div className={styles.onePaymentOf}>
                          One payment of ${getTotalPrice(displayValueProduct)} or pay with
                        </div>
                        <Image
                          className={styles.image2Icon}
                          src={KlarnaLogo}
                          width={33}
                          height={18.4}
                          sizes='100vw'
                          alt='Klarna'
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={styles.getStartedContainer}
                  onClick={() => !isLoading && !isPending && handleGetStarted(displayValueProduct)}
                  style={{
                    cursor: isLoading || isPending ? 'not-allowed' : 'pointer',
                    opacity: isLoading || isPending ? 0.6 : 1,
                  }}
                >
                  {(isLoading || isPending) && loadingProductId === displayValueProduct.id && (
                    <Spinner className='border-2' size='sm' style={{ marginRight: '8px' }} />
                  )}
                  <b className={styles.weightLossInjection}>Get Started</b>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Just the image */}
        <div className={`col-12 col-lg-5 order-1 order-xl-2 ${styles.rightSide}`}>
          <div className={styles.vialGipglp2}>
            <Image
              className={styles.vialGipglp1}
              src={starterProduct?.image || displayValueProduct?.image || VialImage}
              width={300}
              height={400}
              sizes='100vw'
              alt={`Lumimeds Compounded ${GLP1_GIP_PRODUCT_NAME} injection vial`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
