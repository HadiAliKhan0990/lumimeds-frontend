'use client';

import GLP1GIPBottle from '@/assets/ads/stay-on-track/glp-1_gip.png';
import GLP1Bottle from '@/assets/ads/stay-on-track/glp-1.png';
import TrustpilotReviews from '@/components/Home/TrustpilotReviews';
import Image from 'next/image';
import { TransitionStartFunction, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import { ProductType, ProductPrice } from '@/store/slices/productTypeSlice';
import { handleVerifyRedirectToCheckout, getRoundedPrice } from '@/helpers/products';
import { trackAddToCart } from '@/lib/tracking';
import { microsoftTrackAddToCart } from '@/helpers/uetTracking';
import { getProductCategory } from '@/lib/trackingHelpers';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { GLP1_PRODUCT_NAME, GLP1_LABEL, GLP1_GIP_PRODUCT_NAME, GLP1_GIP_LABEL } from '@/constants/factory';
import { Spinner } from 'react-bootstrap';
import '../styles.css';

interface StayOnTrackHeroProps {
  productsData: ProductTypesResponseData;
}

export default function StayOnTrackHero({ productsData }: Readonly<StayOnTrackHeroProps>) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [isStarterButtonDisabled, setIsStarterButtonDisabled] = useTransition();
  const [isThreeMonthGIPButtonDisabled, setIsThreeMonthGIPButtonDisabled] = useTransition();
  const [isMonthlyGIPButtonDisabled, setIsMonthlyGIPButtonDisabled] = useTransition();
  const [isThreeMonthGLP1ButtonDisabled, setIsThreeMonthGLP1ButtonDisabled] = useTransition();
  const [isMonthlyGLP1ButtonDisabled, setIsMonthlyGLP1ButtonDisabled] = useTransition();

  const selectedProduct = useSelector((state: RootState) => state.productType);
  const checkout = useSelector((state: RootState) => state.checkout);
  const { isSurveyCompleted, checkoutUser } = checkout || {};
  const surveyCategory = useSelector((state: RootState) => state.checkout.surveyCategory);

  const handleGetStarted = async (product: ProductType, startTransition: TransitionStartFunction) => {
    // Get product and survey categories
    const productCategory = getProductCategory(product);
    const surveyCategoryValue = surveyCategory || undefined;

    trackAddToCart({
      itemId: product.id ?? '',
      itemName: product.displayName ?? product.name ?? '',
      value: product.prices?.[0].amount ?? 0,
      productCategory,
      surveyCategory: surveyCategoryValue,
    });

    // Microsoft UET AddToCart tracking
    microsoftTrackAddToCart(
      product.id ?? '',
      product.displayName ?? product.name ?? '',
      product.prices?.[0].amount ?? 0
    );

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

  // Find products by type (only those with active prices)
  // Based on the API response structure:
  // 1. Monthly GLP-1: planType='recurring', billingInterval='month', intervalCount=1
  // 2. 3-Month GLP-1: planType='recurring', billingInterval='month', intervalCount=3
  // 3. Starter GIP: planType='one_time' (one-time purchase)
  // 4. Monthly GIP: planType='recurring', billingInterval='month', intervalCount=1
  // 5. 3-Month GIP: planType='recurring', billingInterval='month', intervalCount=3

  const {
    monthlyGLP1Product,
    threeMonthGLP1Product,
    starterGIPProduct,
    monthlyGIPProduct,
    threeMonthGIPProduct,
    hasGLP1GIPProducts,
    hasGLP1Products,
  } = useMemo(() => {
    const monthlyGLP1Product = productsData?.glp_1_plans?.products?.find(
      (product: ProductType) =>
        product.planType === 'recurring' &&
        product.metadata?.billingInterval === 'month' &&
        product.metadata?.intervalCount === 1 &&
        product.prices.some((price: ProductPrice) => price.isActive === true)
    );
    const threeMonthGLP1Product = productsData?.glp_1_plans?.products?.find(
      (product: ProductType) =>
        product.planType === 'recurring' &&
        product.metadata?.billingInterval === 'month' &&
        product.metadata?.intervalCount === 3 &&
        product.prices.some((price: ProductPrice) => price.isActive === true)
    );
    const starterGIPProduct = productsData?.glp_1_gip_plans?.products?.find(
      (product: ProductType) =>
        product.planType === 'one_time' && product.prices.some((price: ProductPrice) => price.isActive === true)
    );
    const monthlyGIPProduct = productsData?.glp_1_gip_plans?.products?.find(
      (product: ProductType) =>
        product.planType === 'recurring' &&
        product.metadata?.billingInterval === 'month' &&
        product.metadata?.intervalCount === 1 &&
        product.prices.some((price: ProductPrice) => price.isActive === true)
    );
    const threeMonthGIPProduct = productsData?.glp_1_gip_plans?.products?.find(
      (product: ProductType) =>
        product.planType === 'recurring' &&
        product.metadata?.billingInterval === 'month' &&
        product.metadata?.intervalCount === 3 &&
        product.prices.some((price: ProductPrice) => price.isActive === true)
    );

    // Check if any products exist in each category
    const hasGLP1GIPProducts = !!(starterGIPProduct || monthlyGIPProduct || threeMonthGIPProduct);
    const hasGLP1Products = !!(monthlyGLP1Product || threeMonthGLP1Product);
    const hasAnyProducts = hasGLP1GIPProducts || hasGLP1Products;

    return {
      monthlyGLP1Product,
      threeMonthGLP1Product,
      starterGIPProduct,
      monthlyGIPProduct,
      threeMonthGIPProduct,
      hasGLP1GIPProducts,
      hasGLP1Products,
      hasAnyProducts,
    };
  }, [productsData]);

  // Use fallback images if no product images are available
  const gipProductImage = productsData?.glp_1_gip_plans?.image || GLP1GIPBottle;
  const glp1ProductImage = productsData?.glp_1_plans?.image || GLP1Bottle;

  return (
    <>
      <section className='stay-on-track-hero'>
        <div className='stay-on-track-content'>
          <div className='stay-on-track-text'>
            <div className='container'>
              <h1 className='stay-on-track-title-main xl:tw-max-w-4xl'>Get started. Stay on track.</h1>
              <h3 className='stay-on-track-title-sub'>Weight care has never been easier.</h3>
            </div>
          </div>
        </div>
      </section>

      <section className='program-options-section'>
        <div className='program-options-content'>
          <h2 className='program-options-title'>Our Program Options</h2>
          <p className='program-options-subtitle'>
            We make it simple to get started and to stay on track with your goals.
          </p>
        </div>
      </section>

      {hasGLP1GIPProducts && (
        <section className='stay-on-track-products-section'>
          <div className='tw-container tw-mx-auto'>
            <div className='stay-on-track-products-header'>
              <h2 className='stay-on-track-products-title font-weight-400 mb-0'>
                {GLP1_GIP_PRODUCT_NAME} {GLP1_GIP_LABEL}
              </h2>
              <h2 className='stay-on-track-products-title'>Weight Loss Injections Plans</h2>
            </div>

            <div className='stay-on-track-products-content'>
              {/* Starter 3-Month Supply Plan */}
              {starterGIPProduct && (
                <div className='stay-on-track-product-card tw-grid tw-grid-cols-1 lg:tw-grid-cols-12 tw-gap-8 lg:tw-gap-16'>
                  <div className='lg:tw-col-span-5 xl:tw-col-span-4'>
                    <div className='stay-on-track-product-left tw-pt-10 tw-pb-6 tw-h-full'>
                      <div className='stay-on-track-product-image'>
                        <div className='stay-on-track-multiple-bottles'>
                          <Image
                            src={starterGIPProduct.image || gipProductImage}
                            alt={starterGIPProduct.name || `${GLP1_GIP_PRODUCT_NAME} Compounded Medication`}
                            width={119}
                            height={307}
                            className='stay-on-track-bottle-image bottle-1'
                          />
                          <Image
                            src={starterGIPProduct.image || gipProductImage}
                            alt={starterGIPProduct.name || `${GLP1_GIP_PRODUCT_NAME} Compounded Medication`}
                            width={124}
                            height={319}
                            className='stay-on-track-bottle-image bottle-2'
                          />
                          <Image
                            src={starterGIPProduct.image || gipProductImage}
                            alt={starterGIPProduct.name || `${GLP1_GIP_PRODUCT_NAME} Compounded Medication`}
                            width={119}
                            height={307}
                            className='stay-on-track-bottle-image bottle-3'
                          />
                        </div>
                      </div>
                      <h3 className='stay-on-track-product-title'>{starterGIPProduct.durationText}</h3>
                    </div>
                  </div>
                  <div className='lg:tw-col-span-7 xl:tw-col-span-8'>
                    <div className='stay-on-track-product-right'>
                      <div className='stay-on-track-product-pricing'>
                        <div className='stay-on-track-price-row'>
                          <span className='stay-on-track-price'>
                            ${getRoundedPrice(starterGIPProduct.prices[0]?.amount)}
                          </span>

                          <div className='glp1-value-badge'>
                            <svg
                              width='27'
                              height='27'
                              viewBox='0 0 27 25'
                              fill='none'
                              xmlns='http://www.w3.org/2000/svg'
                              className='glp1-star'
                            >
                              <path
                                d='M13.5 0L16.5309 9.32827H26.3393L18.4042 15.0935L21.4351 24.4217L13.5 18.6565L5.5649 24.4217L8.59584 15.0935L0.660737 9.32827H10.4691L13.5 0Z'
                                fill='black'
                              />
                            </svg>
                            <p className='glp1-value-text'>
                              Most popular
                              <br />
                              One-Time Purchase
                            </p>
                          </div>
                        </div>
                        <p className='stay-on-track-price-breakdown'>
                          ${getRoundedPrice(starterGIPProduct.prices[0]?.amount)} upfront ($
                          {getRoundedPrice(starterGIPProduct.dividedAmount)}/mo equivalent)
                        </p>
                      </div>

                      <div className='stay-on-track-product-benefits tw-mt-4'>
                        <h4 className='stay-on-track-benefits-title'>
                          First steps to lasting wellness. Ideal for first-time users ready to make real, sustainable
                          progress and eager to achieve lasting results.
                        </h4>
                        <ul className='stay-on-track-benefits-list'>
                          {starterGIPProduct.bulletDescription.map((benefit, index) => (
                            <li key={index}>{benefit}</li>
                          ))}
                        </ul>
                      </div>

                      <button
                        className='tw-flex tw-items-center tw-justify-center tw-gap-2 tw-bg-black tw-text-white tw-rounded-full tw-px-6 lg:tw-px-8 tw-py-3 lg:tw-text-2xl tw-font-semibold hover:tw-bg-neutral-700 tw-transition-all tw-mt-4 disabled:tw-opacity-60 disabled:tw-cursor-not-allowed'
                        onClick={() => handleGetStarted(starterGIPProduct, setIsStarterButtonDisabled)}
                        disabled={isStarterButtonDisabled}
                      >
                        {isStarterButtonDisabled && <Spinner className='border-2' size='sm' />}
                        <span>Get Started</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 3-Month GIP Subscription Plan */}
              {threeMonthGIPProduct && (
                <div className='stay-on-track-product-card tw-grid tw-grid-cols-1 lg:tw-grid-cols-12 tw-gap-8 lg:tw-gap-16'>
                  <div className='lg:tw-col-span-5 xl:tw-col-span-4'>
                    <div className='stay-on-track-product-left tw-pt-10 tw-pb-6 tw-h-full'>
                      <div className='stay-on-track-product-image'>
                        <div className='stay-on-track-multiple-bottles'>
                          <Image
                            src={threeMonthGIPProduct.image || gipProductImage}
                            alt={threeMonthGIPProduct.name || `${GLP1_GIP_PRODUCT_NAME} Compounded Medication`}
                            width={119}
                            height={307}
                            className='stay-on-track-bottle-image bottle-1'
                          />
                          <Image
                            src={threeMonthGIPProduct.image || gipProductImage}
                            alt={threeMonthGIPProduct.name || `${GLP1_GIP_PRODUCT_NAME} Compounded Medication`}
                            width={124}
                            height={319}
                            className='stay-on-track-bottle-image bottle-2'
                          />
                          <Image
                            src={threeMonthGIPProduct.image || gipProductImage}
                            alt={threeMonthGIPProduct.name || `${GLP1_GIP_PRODUCT_NAME} Compounded Medication`}
                            width={119}
                            height={307}
                            className='stay-on-track-bottle-image bottle-3'
                          />
                        </div>
                      </div>
                      <h3 className='stay-on-track-product-title'>{threeMonthGIPProduct.durationText}</h3>
                    </div>
                  </div>

                  <div className='lg:tw-col-span-7 xl:tw-col-span-8'>
                    <div className='stay-on-track-product-right'>
                      <div className='stay-on-track-product-pricing'>
                        <div className='stay-on-track-price-row'>
                          <span className='stay-on-track-price'>
                            ${getRoundedPrice(threeMonthGIPProduct.prices[0]?.amount)}
                          </span>
                          <div className='glp1-value-badge'>
                            <svg
                              width='27'
                              height='27'
                              viewBox='0 0 27 25'
                              fill='none'
                              xmlns='http://www.w3.org/2000/svg'
                              className='glp1-star'
                            >
                              <path
                                d='M13.5 0L16.5309 9.32827H26.3393L18.4042 15.0935L21.4351 24.4217L13.5 18.6565L5.5649 24.4217L8.59584 15.0935L0.660737 9.32827H10.4691L13.5 0Z'
                                fill='black'
                              />
                            </svg>
                            <span className='glp1-gip-value-text'>
                              Best Value for
                              <br />
                              ongoing treatment
                            </span>
                          </div>
                        </div>
                        <p className='stay-on-track-price-breakdown'>
                          ${getRoundedPrice(threeMonthGIPProduct.prices[0]?.amount)} upfront ($
                          {getRoundedPrice(threeMonthGIPProduct.dividedAmount)}/mo equivalent)
                        </p>
                      </div>

                      <div className='stay-on-track-product-benefits tw-mt-4'>
                        <h4 className='stay-on-track-benefits-title'>
                          Optimal results for less. Achieve optimal, consistent progress while enjoying our lowest cost
                          per dose. Stay on top of your weight loss. Get closer to your wellness goals.
                        </h4>
                        <ul className='stay-on-track-benefits-list'>
                          {threeMonthGIPProduct.bulletDescription.map((benefit, index) => (
                            <li key={index}>{benefit}</li>
                          ))}
                        </ul>
                      </div>

                      <button
                        className='tw-flex tw-items-center tw-justify-center tw-gap-2 tw-bg-black tw-text-white tw-rounded-full tw-px-6 lg:tw-px-8 tw-py-3 lg:tw-text-2xl tw-font-semibold hover:tw-bg-neutral-700 tw-transition-all tw-mt-4 disabled:tw-opacity-60 disabled:tw-cursor-not-allowed'
                        onClick={() => handleGetStarted(threeMonthGIPProduct, setIsThreeMonthGIPButtonDisabled)}
                        disabled={isThreeMonthGIPButtonDisabled}
                      >
                        {isThreeMonthGIPButtonDisabled && <Spinner className='border-2' size='sm' />}
                        <span>Get Started</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Monthly GIP Subscription Plan */}
              {monthlyGIPProduct && (
                <div className='stay-on-track-product-card tw-grid tw-grid-cols-1 lg:tw-grid-cols-12 tw-gap-8 lg:tw-gap-16'>
                  <div className='lg:tw-col-span-5 xl:tw-col-span-4'>
                    <div className='stay-on-track-product-left tw-pt-10 tw-pb-6 tw-h-full'>
                      <div className='stay-on-track-product-image'>
                        <Image
                          src={monthlyGIPProduct.image || gipProductImage}
                          alt={monthlyGIPProduct.name || `${GLP1_GIP_PRODUCT_NAME} Compounded Medication`}
                          width={149}
                          height={384}
                          className='stay-on-track-bottle-image'
                        />
                      </div>
                      <h3 className='stay-on-track-product-title'>{monthlyGIPProduct.durationText}</h3>
                    </div>
                  </div>

                  <div className='lg:tw-col-span-7 xl:tw-col-span-8'>
                    <div className='stay-on-track-product-right'>
                      <div className='stay-on-track-product-pricing'>
                        <div className='stay-on-track-price-row'>
                          <span className='stay-on-track-price'>
                            ${getRoundedPrice(monthlyGIPProduct.prices[0]?.amount)}
                          </span>
                          <span className='stay-on-track-price-period'>Per Month</span>
                        </div>
                      </div>

                      <div className='stay-on-track-product-benefits tw-mt-4'>
                        <h4 className='stay-on-track-benefits-title'>
                          Make your first step count. Designed for maximum flexibility. Get started with our
                          science-backed program with no long-term commitment.
                        </h4>
                        <ul className='stay-on-track-benefits-list'>
                          {monthlyGIPProduct.bulletDescription.map((benefit, index) => (
                            <li key={index}>{benefit}</li>
                          ))}
                        </ul>
                      </div>

                      <button
                        className='tw-flex tw-items-center tw-justify-center tw-gap-2 tw-bg-black tw-text-white tw-rounded-full tw-px-6 lg:tw-px-8 tw-py-3 lg:tw-text-2xl tw-font-semibold hover:tw-bg-neutral-700 tw-transition-all tw-mt-4 disabled:tw-opacity-60 disabled:tw-cursor-not-allowed'
                        onClick={() => handleGetStarted(monthlyGIPProduct, setIsMonthlyGIPButtonDisabled)}
                        disabled={isMonthlyGIPButtonDisabled}
                      >
                        {isMonthlyGIPButtonDisabled && <Spinner className='border-2' size='sm' />}
                        <span>Get Started</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* GLP-1 Section */}
      {hasGLP1Products && (
        <section className='glp1-section-stay-on-track'>
          <div className='tw-container tw-mx-auto'>
            <div className='glp1-header-stay-on-track'>
              <h2 className='glp1-title-stay-on-track font-weight-400 mb-0'>
                {GLP1_PRODUCT_NAME} {GLP1_LABEL}
              </h2>
              <h2 className='glp1-title-stay-on-track'>Weight Loss Injections Plans</h2>
            </div>
            <div className='glp1-content-stay-on-track'>
              {/* 3-Month GLP-1 Subscription Plan */}
              {threeMonthGLP1Product && (
                <div className='glp1-card-stay-on-track tw-grid tw-grid-cols-1 lg:tw-grid-cols-12 tw-gap-8 lg:tw-gap-16'>
                  <div className='lg:tw-col-span-5 xl:tw-col-span-4'>
                    <div className='glp1-plan-left-stay-on-track tw-pt-10 tw-pb-6 tw-h-full'>
                      <div className='glp1-plan-image-stay-on-track'>
                        <div className='glp1-multiple-bottles-stay-on-track'>
                          <Image
                            src={threeMonthGLP1Product.image || glp1ProductImage}
                            alt={threeMonthGLP1Product.name || `${GLP1_PRODUCT_NAME} Compounded Medication`}
                            width={134}
                            height={344}
                            className='glp1-bottle-image-stay-on-track bottle-1'
                          />
                          <Image
                            src={threeMonthGLP1Product.image || glp1ProductImage}
                            alt={threeMonthGLP1Product.name || `${GLP1_PRODUCT_NAME} Compounded Medication`}
                            width={134}
                            height={344}
                            className='glp1-bottle-image-stay-on-track bottle-2'
                          />
                          <Image
                            src={threeMonthGLP1Product.image || glp1ProductImage}
                            alt={threeMonthGLP1Product.name || `${GLP1_PRODUCT_NAME} Compounded Medication`}
                            width={134}
                            height={344}
                            className='glp1-bottle-image-stay-on-track bottle-3'
                          />
                        </div>
                      </div>
                      <h3 className='glp1-plan-title-stay-on-track'>{threeMonthGLP1Product.durationText}</h3>
                    </div>
                  </div>

                  <div className='lg:tw-col-span-7 xl:tw-col-span-8'>
                    <div className='glp1-plan-right-stay-on-track'>
                      <div className='glp1-plan-pricing-stay-on-track'>
                        <div className='glp1-price-row-stay-on-track'>
                          <span className='glp1-price-stay-on-track'>
                            ${getRoundedPrice(threeMonthGLP1Product.prices[0]?.amount)}
                          </span>
                          <div className='glp1-value-badge-stay-on-track'>
                            <svg
                              width='27'
                              height='27'
                              viewBox='0 0 27 25'
                              fill='none'
                              xmlns='http://www.w3.org/2000/svg'
                              className='glp1-star'
                            >
                              <path
                                d='M13.5 0L16.5309 9.32827H26.3393L18.4042 15.0935L21.4351 24.4217L13.5 18.6565L5.5649 24.4217L8.59584 15.0935L0.660737 9.32827H10.4691L13.5 0Z'
                                fill='black'
                              />
                            </svg>
                            <div className='glp1-value-text'>
                              <p className='mb-0'>Best Value for Ongoing Treatment</p>
                              <span className='stay-on-track-price-period'>Per Month</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className='glp1-plan-benefits-stay-on-track'>
                        <h4 className='glp1-benefits-title-stay-on-track'>
                          Best value with maximum impact. Maximum supply for steady, ongoing results with our largest
                          vial format, providing the most cost-effective dosing.
                        </h4>
                        <ul className='glp1-benefits-list-stay-on-track'>
                          {threeMonthGLP1Product.bulletDescription.map((benefit, index) => (
                            <li key={index}>{benefit}</li>
                          ))}
                        </ul>
                      </div>

                      <button
                        className='tw-flex tw-items-center tw-justify-center tw-gap-2 tw-bg-black tw-text-white tw-rounded-full tw-px-6 lg:tw-px-8 tw-py-3 lg:tw-text-2xl tw-font-semibold hover:tw-bg-neutral-700 tw-transition-all tw-mt-4 disabled:tw-opacity-60 disabled:tw-cursor-not-allowed'
                        onClick={() => handleGetStarted(threeMonthGLP1Product, setIsThreeMonthGLP1ButtonDisabled)}
                        disabled={isThreeMonthGLP1ButtonDisabled}
                      >
                        {isThreeMonthGLP1ButtonDisabled && <Spinner className='border-2' size='sm' />}
                        <span>Get Started</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Monthly GLP-1 Subscription Plan */}
              {monthlyGLP1Product && (
                <div className='glp1-card-stay-on-track tw-grid tw-grid-cols-1 lg:tw-grid-cols-12 tw-gap-8 lg:tw-gap-16'>
                  <div className='lg:tw-col-span-5 xl:tw-col-span-4'>
                    <div className='glp1-plan-left-stay-on-track tw-pt-10 tw-pb-6 tw-h-full'>
                      <div className='glp1-plan-image-stay-on-track'>
                        <Image
                          src={monthlyGLP1Product.image || glp1ProductImage}
                          alt={monthlyGLP1Product.name || `${GLP1_PRODUCT_NAME} Compounded Medication`}
                          width={134}
                          height={344}
                          className='glp1-bottle-image-stay-on-track'
                        />
                      </div>
                      <h3 className='glp1-plan-title-stay-on-track'>{monthlyGLP1Product.durationText}</h3>
                    </div>
                  </div>

                  <div className='lg:tw-col-span-7 xl:tw-col-span-8'>
                    <div className='glp1-plan-right-stay-on-track'>
                      <div className='glp1-plan-pricing-stay-on-track'>
                        <div className='glp1-price-row-stay-on-track'>
                          <span className='glp1-price-stay-on-track'>
                            ${getRoundedPrice(monthlyGLP1Product.prices[0]?.amount)}
                            <span className='glp1-price-period-stay-on-track tw-ml-3'>Per Month</span>
                          </span>
                        </div>
                      </div>

                      <div className='glp1-plan-benefits-stay-on-track'>
                        <h4 className='glp1-benefits-title-stay-on-track'>
                          For a flexible and confident start. Designed for maximum flexibility. Get started with our
                          science-backed program with no long-term commitment.
                        </h4>
                        <ul className='glp1-benefits-list-stay-on-track'>
                          {monthlyGLP1Product.bulletDescription.map((benefit, index) => (
                            <li key={index}>{benefit}</li>
                          ))}
                        </ul>
                      </div>

                      <button
                        className='tw-flex tw-items-center tw-justify-center tw-gap-2 tw-bg-black tw-text-white tw-rounded-full tw-px-6 lg:tw-px-8 tw-py-3 lg:tw-text-2xl tw-font-semibold hover:tw-bg-neutral-700 tw-transition-all tw-mt-4 disabled:tw-opacity-60 disabled:tw-cursor-not-allowed'
                        onClick={() => handleGetStarted(monthlyGLP1Product, setIsMonthlyGLP1ButtonDisabled)}
                        disabled={isMonthlyGLP1ButtonDisabled}
                      >
                        {isMonthlyGLP1ButtonDisabled && <Spinner className='border-2' size='sm' />}
                        <span>Get Started</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <section className='container-fluid tw-bg-blue-soft'>
        <h2 className='tw-flex tw-justify-center tw-mb-10 tw-text-3xl lg:tw-text-4xl'>Customer Reviews</h2>
        <TrustpilotReviews className='trustpilot-testimonials-dark' theme='light' />
      </section>
    </>
  );
}
