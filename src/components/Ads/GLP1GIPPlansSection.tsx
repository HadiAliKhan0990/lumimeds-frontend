'use client';

import { TransitionStartFunction, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import GLP1GIPBottle from '@/assets/ads/journey/glp-1_gip.png';
import { PlanProduct } from '@/store/slices/productTypesApiSlice';
import { ProductType } from '@/store/slices/productTypeSlice';
import { trackAddToCart } from '@/lib/tracking';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { handleVerifyRedirectToCheckout, getRoundedPrice } from '@/helpers/products';
import { GLP1_GIP_PRODUCT_NAME, GLP1_GIP_LABEL } from '@/constants/factory';
import { Spinner } from 'react-bootstrap';

interface GLP1GIPPlansSectionProps {
  productsData?: PlanProduct;
}

const GLP1GIPPlansSection: React.FC<GLP1GIPPlansSectionProps> = ({ productsData }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [isMonthlyButtonDisabled, setIsMonthlyButtonDisabled] = useTransition();
  const [isStarterButtonDisabled, setIsStarterButtonDisabled] = useTransition();
  const [isThreeMonthButtonDisabled, setIsThreeMonthButtonDisabled] = useTransition();

  const selectedProduct = useSelector((state: RootState) => state.productType);
  const checkout = useSelector((state: RootState) => state.checkout);
  const { isSurveyCompleted, checkoutUser } = checkout || {};

  const handleGetStarted = async (product: ProductType, startTransition: TransitionStartFunction) => {
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
  };

  // Find products by type (only those with active prices)
  // Based on the API response structure:
  // 1. Monthly: planType='recurring', billingInterval='month', intervalCount=1
  // 2. Starter: planType='one_time' (one-time purchase)
  // 3. 3-Month: planType='recurring', billingInterval='month', intervalCount=3
  const monthlyProduct = productsData?.products.find(
    (product) =>
      product.planType === 'recurring' &&
      product.metadata?.billingInterval === 'month' &&
      product.metadata?.intervalCount === 1 &&
      product.prices.some((price) => price.isActive === true)
  );
  const starterProduct = productsData?.products.find(
    (product) => product.planType === 'one_time' && product.prices.some((price) => price.isActive === true)
  );
  const threeMonthProduct = productsData?.products.find(
    (product) =>
      product.planType === 'recurring' &&
      product.metadata?.billingInterval === 'month' &&
      product.metadata?.intervalCount === 3 &&
      product.prices.some((price) => price.isActive === true)
  );

  // Use fallback image if no product image is available
  const productImage = productsData?.image || GLP1GIPBottle;

  return (
    <section className='glp1-plans-section'>
      <div className='glp1-plans-card2'>
        <div className='glp1-plans-header'>
          <h2 className='glp1-plans-title font-weight-400 mb-0'>
            {GLP1_GIP_PRODUCT_NAME} {GLP1_GIP_LABEL}
          </h2>
          <h2 className='glp1-plans-title'>Weight Loss Injection Plans</h2>
          <p className='glp1-plans-subtitle'>Leverage dual-action treatment for a stronger impact.</p>
        </div>

        <div className='glp1-plans-content'>
          {/* Monthly Subscription Plan */}
          {monthlyProduct && (
            <div className='glp1-gip-plan-row monthly-plan'>
              <div className='row align-items-center g-1'>
                <div className='col-md-6'>
                  <div className='glp1-gip-plan-left'>
                    <div className='glp1-gip-plan-image'>
                      <Image
                        src={monthlyProduct.image || productImage}
                        alt={monthlyProduct.name || `${GLP1_GIP_PRODUCT_NAME} Compounded Medication`}
                        width={149}
                        height={384}
                        className='glp1-gip-bottle-image'
                      />
                    </div>
                    <h3 className='glp1-gip-plan-title'>{monthlyProduct.durationText}</h3>
                  </div>
                </div>

                <div className='col-md-6'>
                  <div className='glp1-gip-plan-right'>
                    <div className='glp1-gip-plan-pricing'>
                      <div className='glp1-gip-price-row'>
                        <span className='glp1-gip-price'>
                          ${getRoundedPrice(monthlyProduct.prices[0]?.amount)}
                          <span className='glp1-gip-price-period'>/mo</span>
                        </span>
                      </div>
                    </div>

                    <div className='glp1-gip-plan-benefits'>
                      <h4 className='glp1-gip-benefits-title'>Easy & Flexible</h4>
                      <p className='glp1-gip-benefits-subtitle'>Small steps. Big changes.</p>
                      <ul className='glp1-gip-benefits-list'>
                        {monthlyProduct.bulletDescription.map((benefit) => (
                          <li key={benefit}>{benefit}</li>
                        ))}
                      </ul>
                    </div>

                    <button
                      className='tw-flex tw-items-center tw-justify-center tw-gap-2 tw-bg-[#677fdb] tw-text-white tw-rounded-full tw-px-6 lg:tw-px-8 tw-py-3 lg:tw-text-2xl tw-font-semibold hover:tw-bg-[#0056b3] tw-transition-all tw-mt-4 disabled:tw-opacity-60 disabled:tw-cursor-not-allowed'
                      onClick={() => handleGetStarted(monthlyProduct, setIsMonthlyButtonDisabled)}
                      disabled={isMonthlyButtonDisabled}
                      data-tracking-id='product-card-glp1-gip-plans-monthly'
                    >
                      {isMonthlyButtonDisabled && <Spinner className='border-2' size='sm' />}
                      <span>Get Started</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Starter 3-Month Supply Plan */}
          {starterProduct && (
            <div className='glp1-gip-plan-row starter-plan'>
              <div className='row align-items-center g-1'>
                <div className='col-md-6'>
                  <div className='glp1-gip-plan-left'>
                    <div className='glp1-gip-plan-image'>
                      <div className='glp1-gip-multiple-bottles'>
                        <Image
                          src={starterProduct.image || productImage}
                          alt={starterProduct.name || `${GLP1_GIP_PRODUCT_NAME} Compounded Medication`}
                          width={143}
                          height={366}
                          className='glp1-gip-bottle-image bottle-1'
                        />
                        <Image
                          src={starterProduct.image || productImage}
                          alt={starterProduct.name || `${GLP1_GIP_PRODUCT_NAME} Compounded Medication`}
                          width={148}
                          height={381}
                          className='glp1-gip-bottle-image bottle-2'
                        />
                        <Image
                          src={starterProduct.image || productImage}
                          alt={starterProduct.name || `${GLP1_GIP_PRODUCT_NAME} Compounded Medication`}
                          width={143}
                          height={366}
                          className='glp1-gip-bottle-image bottle-3'
                        />
                      </div>
                    </div>
                    <h3 className='glp1-gip-plan-title'>{starterProduct.durationText}</h3>
                  </div>
                </div>

                <div className='col-md-6'>
                  <div className='glp1-gip-plan-right'>
                    <div className='glp1-gip-plan-pricing'>
                      <div className='glp1-gip-price-row align-items-center'>
                        <span className='glp1-gip-price'>${getRoundedPrice(starterProduct.prices[0]?.amount)}</span>
                        <div className='glp1-gip-value-badge'>
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
                          <div>
                            <p className='glp1-value-text'>
                              Most popular
                              <br />
                            </p>
                            <p className='glp1-value-text2'>One-Time Purchase</p>
                          </div>
                        </div>
                      </div>
                      <p className='glp1-gip-price-breakdown'>
                        ${getRoundedPrice(starterProduct.prices[0]?.amount)} upfront ($
                        {getRoundedPrice(starterProduct.dividedAmount)}
                        /mo equivalent)
                      </p>
                    </div>

                    <div className='glp1-gip-plan-benefits'>
                      <h4 className='glp1-gip-benefits-subtitle'>The perfect launch to your weight loss journey.</h4>
                      <ul className='glp1-gip-benefits-list'>
                        {starterProduct.bulletDescription.map((benefit) => (
                          <li key={benefit}>{benefit}</li>
                        ))}
                      </ul>
                    </div>

                    <button
                      className='tw-flex tw-items-center tw-justify-center tw-gap-2 tw-bg-[#677fdb] tw-text-white tw-rounded-full tw-px-6 lg:tw-px-8 tw-py-3 lg:tw-text-2xl tw-font-semibold hover:tw-bg-[#0056b3] tw-transition-all tw-mt-4 disabled:tw-opacity-60 disabled:tw-cursor-not-allowed'
                      onClick={() => handleGetStarted(starterProduct, setIsStarterButtonDisabled)}
                      disabled={isStarterButtonDisabled}
                      data-tracking-id='product-card-glp1-gip-plans-starter'
                    >
                      {isStarterButtonDisabled && <Spinner className='border-2' size='sm' />}
                      <span>Get Started</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3-Month Subscription Plan */}
          {threeMonthProduct && (
            <div className='glp1-gip-plan-row three-month-plan'>
              <div className='row align-items-center g-1'>
                <div className='col-md-6'>
                  <div className='glp1-gip-plan-left'>
                    <div className='glp1-gip-plan-image'>
                      <div className='glp1-gip-multiple-bottles'>
                        <Image
                          src={threeMonthProduct.image || productImage}
                          alt={threeMonthProduct.name || `${GLP1_GIP_PRODUCT_NAME} Compounded Medication`}
                          width={143}
                          height={366}
                          className='glp1-gip-bottle-image bottle-1'
                        />
                        <Image
                          src={threeMonthProduct.image || productImage}
                          alt={threeMonthProduct.name || `${GLP1_GIP_PRODUCT_NAME} Compounded Medication`}
                          width={148}
                          height={381}
                          className='glp1-gip-bottle-image bottle-2'
                        />
                        <Image
                          src={threeMonthProduct.image || productImage}
                          alt={threeMonthProduct.name || `${GLP1_GIP_PRODUCT_NAME} Compounded Medication`}
                          width={143}
                          height={366}
                          className='glp1-gip-bottle-image bottle-3'
                        />
                      </div>
                    </div>
                    <h3 className='glp1-gip-plan-title'>{threeMonthProduct.durationText}</h3>
                  </div>
                </div>

                <div className='col-md-6'>
                  <div className='glp1-gip-plan-right'>
                    <div className='glp1-gip-plan-pricing'>
                      <div className='glp1-gip-price-row align-items-center'>
                        <span className='glp1-gip-price'>${getRoundedPrice(threeMonthProduct.prices[0]?.amount)}</span>
                        <div className='glp1-gip-value-badge'>
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
                      <p className='glp1-gip-price-breakdown'>
                        ${getRoundedPrice(threeMonthProduct.prices[0]?.amount)} upfront ($
                        {getRoundedPrice(threeMonthProduct.dividedAmount)}/mo equivalent)
                      </p>
                    </div>

                    <div className='glp1-gip-plan-benefits'>
                      <h4 className='glp1-gip-benefits-subtitle'>
                        For those ready to take their transformation further.
                      </h4>
                      <ul className='glp1-gip-benefits-list'>
                        {threeMonthProduct.bulletDescription.map((benefit) => (
                          <li key={benefit}>{benefit}</li>
                        ))}
                      </ul>
                    </div>

                    <button
                      className='tw-flex tw-items-center tw-justify-center tw-gap-2 tw-bg-[#677fdb] tw-text-white tw-rounded-full tw-px-6 lg:tw-px-8 tw-py-3 lg:tw-text-2xl tw-font-semibold hover:tw-bg-[#0056b3] tw-transition-all tw-mt-4 disabled:tw-opacity-60 disabled:tw-cursor-not-allowed'
                      onClick={() => handleGetStarted(threeMonthProduct, setIsThreeMonthButtonDisabled)}
                      disabled={isThreeMonthButtonDisabled}
                      data-tracking-id='product-card-glp1-gip-plans-three-month'
                    >
                      {isThreeMonthButtonDisabled && <Spinner className='border-2' size='sm' />}
                      <span>Get Started</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default GLP1GIPPlansSection;
