'use client';

import GLP1Bottle from '@/assets/ads/journey/glp-1.png';
import Image from 'next/image';
import { TransitionStartFunction, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PlanProduct } from '@/store/slices/productTypesApiSlice';
import { ProductType } from '@/store/slices/productTypeSlice';
import { trackAddToCart } from '@/lib/tracking';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { handleVerifyRedirectToCheckout, getRoundedPrice } from '@/helpers/products';
import { GLP1_PRODUCT_NAME, GLP1_LABEL } from '@/constants/factory';
import { Spinner } from 'react-bootstrap';

interface GLP1PlansSectionProps {
  productsData?: PlanProduct;
}

const GLP1PlansSection: React.FC<GLP1PlansSectionProps> = ({ productsData }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [isMonthlyButtonDisabled, setIsMonthlyButtonDisabled] = useTransition();
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

  // Find monthly and 3-month subscription products (only those with active prices)
  const monthlyProduct = productsData?.products.find(
    (product) =>
      product.metadata?.billingInterval === 'month' &&
      product.metadata?.intervalCount === 1 &&
      product.prices.some((price) => price.isActive === true)
  );
  const threeMonthProduct = productsData?.products.find(
    (product) =>
      product.metadata?.billingInterval === 'month' &&
      product.metadata?.intervalCount === 3 &&
      product.prices.some((price) => price.isActive === true)
  );

  // Use fallback image if no product image is available
  const productImage = productsData?.image || GLP1Bottle;

  return (
    <section className='glp1-plans-section'>
      <div className='glp1-plans-card'>
        <div className='glp1-plans-header'>
          <h2 className='glp1-plans-title font-weight-400 mb-0'>
            {GLP1_PRODUCT_NAME} {GLP1_LABEL}
          </h2>
          <h2 className='glp1-plans-title'>Weight Loss Injection Plans</h2>
          <p className='glp1-plans-subtitle'>A trusted option for weight loss management.</p>
        </div>

        <div className='glp1-plans-content'>
          {/* Monthly Subscription Plan */}
          {monthlyProduct && (
            <div className='glp1-plan-row monthly-plan'>
              <div className='row align-items-center g-1'>
                <div className='col-md-6'>
                  <div className='glp1-plan-left'>
                    <div className='glp1-plan-image'>
                      <Image
                        src={monthlyProduct.image || productImage}
                        alt={monthlyProduct.name || `${GLP1_PRODUCT_NAME} Compounded Medication`}
                        width={149}
                        height={384}
                        className='glp1-bottle-image'
                      />
                    </div>
                    <h3 className='glp1-plan-title'>{monthlyProduct.durationText}</h3>
                  </div>
                </div>

                <div className='col-md-6'>
                  <div className='glp1-plan-right'>
                    <div className='glp1-plan-pricing'>
                      <div className='glp1-price-row'>
                        <span className='glp1-price'>
                          ${getRoundedPrice(monthlyProduct.prices[0]?.amount)}
                          <span className='glp1-price-period'>/mo</span>
                        </span>
                      </div>
                    </div>

                    <div className='glp1-plan-benefits'>
                      <h4 className='glp1-benefits-title'>See and feel the difference in one month.</h4>
                      <ul className='glp1-benefits-list'>
                        {monthlyProduct.bulletDescription.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </div>

                    <button
                      className='tw-flex tw-items-center tw-justify-center tw-gap-2 tw-bg-black tw-text-white tw-rounded-full tw-px-6 lg:tw-px-8 tw-py-3 lg:tw-text-2xl tw-font-semibold hover:tw-bg-neutral-700 tw-transition-all tw-mt-4 disabled:tw-opacity-60 disabled:tw-cursor-not-allowed'
                      onClick={() => handleGetStarted(monthlyProduct, setIsMonthlyButtonDisabled)}
                      disabled={isMonthlyButtonDisabled}
                      data-tracking-id='product-card-glp1-plans-monthly'
                    >
                      {isMonthlyButtonDisabled && <Spinner className='border-2' size='sm' />}
                      <span>Get Started</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3-Month Subscription Plan */}
          {threeMonthProduct && (
            <div className='glp1-plan-row three-month-plan'>
              <div className='row align-items-center g-1'>
                <div className='col-md-6'>
                  <div className='glp1-plan-left'>
                    <div className='glp1-plan-image'>
                      <div className='glp1-multiple-bottles'>
                        <Image
                          src={threeMonthProduct.image || productImage}
                          alt={threeMonthProduct.name || `${GLP1_PRODUCT_NAME} Compounded Medication`}
                          width={144}
                          height={372}
                          className='glp1-bottle-image bottle-1'
                        />
                        <Image
                          src={threeMonthProduct.image || productImage}
                          alt={threeMonthProduct.name || `${GLP1_PRODUCT_NAME} Compounded Medication`}
                          width={149}
                          height={383}
                          className='glp1-bottle-image bottle-2'
                        />
                        <Image
                          src={threeMonthProduct.image || productImage}
                          alt={threeMonthProduct.name || `${GLP1_PRODUCT_NAME} Compounded Medication`}
                          width={144}
                          height={372}
                          className='glp1-bottle-image bottle-3'
                        />
                      </div>
                    </div>
                    <h3 className='glp1-plan-title'>{threeMonthProduct.durationText}</h3>
                  </div>
                </div>

                <div className='col-md-6'>
                  <div className='glp1-plan-right'>
                    <div className='glp1-plan-pricing'>
                      <div className='glp1-price-row'>
                        <span className='glp1-price'>${getRoundedPrice(threeMonthProduct.prices[0]?.amount)}</span>
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
                            Best Value for
                            <br />
                            Ongoing Treatment
                          </p>
                        </div>
                      </div>
                      <p className='glp1-price-breakdown'>
                        ${getRoundedPrice(threeMonthProduct.prices[0]?.amount)} upfront ($
                        {getRoundedPrice(threeMonthProduct.dividedAmount)}/mo equivalent)
                      </p>
                    </div>

                    <div className='glp1-plan-benefits'>
                      <h4 className='glp1-benefits-title'>More Time = Greater Progress</h4>
                      <ul className='glp1-benefits-list'>
                        {threeMonthProduct.bulletDescription.map((benefit) => (
                          <li key={benefit}>{benefit}</li>
                        ))}
                      </ul>
                    </div>

                    <button
                      className='tw-flex tw-items-center tw-justify-center tw-gap-2 tw-bg-black tw-text-white tw-rounded-full tw-px-6 lg:tw-px-8 tw-py-3 lg:tw-text-2xl tw-font-semibold hover:tw-bg-neutral-700 tw-transition-all tw-mt-4 disabled:tw-opacity-60 disabled:tw-cursor-not-allowed'
                      onClick={() => handleGetStarted(threeMonthProduct, setIsThreeMonthButtonDisabled)}
                      disabled={isThreeMonthButtonDisabled}
                      data-tracking-id='product-card-glp1-plans-three-month'
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

export default GLP1PlansSection;
