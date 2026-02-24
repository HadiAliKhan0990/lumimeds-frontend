'use client';

import { getRoundedPrice } from '@/helpers/products';
import { ProductType } from '@/store/slices/productTypeSlice';
import { useMemo } from 'react';
import { DiscountInfo } from '@/hooks/usePromoCoupons';
import { useGoogleMerchantConfig } from '@/hooks/useGoogleMerchantConfig';
import { usePathname } from 'next/navigation';

interface Props {
  product: ProductType;
  isSelected: boolean;
  onSelect: (prod: ProductType) => void;
  source?: string;
  discount?: DiscountInfo;
}

export const PriceCard = ({ product, isSelected, onSelect, discount }: Props) => {
  const { isGoogleMerchant } = useGoogleMerchantConfig();
  const price = product.prices[0];
  const hasDiscount = !!discount;

  const isAddPage = usePathname().includes('/ad');

  // Calculate discounted monthly amount
  // Use the same ratio as the discount to the original price
  const discountedDividedAmount = useMemo(() => {
    if (!hasDiscount || !discount.originalAmount) return product.dividedAmount;
    // Apply the discount ratio to the original divided (per-month) amount
    const discountRatio = discount.amountAfterDiscount / discount.originalAmount;
    return product.dividedAmount * discountRatio;
  }, [hasDiscount, discount, product.dividedAmount]);

  // Plain text for when no coupon is applied
  const paymentDetailsPlainText = useMemo(() => {
    if (!price) return '';
    const amount = price.amount;

    if (isGoogleMerchant) {
      return ``;
    }
    if (price.checkoutType === 'subscription') {
      if ((price.billingIntervalCount || 1) > 1) {
        return `$${amount} every ${price.billingIntervalCount} months`;
      } else {
        return `$${amount} every month`;
      }
    } else {
      return `One payment of $${amount}`;
    }
  }, [price, isGoogleMerchant]);

  const renderPaymentDetails = () => {
    if (!price) return null;

    // When coupon is applied successfully, show: previousprice newprice upfront payment
    if (hasDiscount && discount.originalAmount !== discount.amountAfterDiscount) {
      const originalAmount = discount.originalAmount;
      const discountedAmount = discount.amountAfterDiscount;

      return (
        <span
          className={`tw-text-sm tw-font-bold ${
            bestValuePlan ? 'tw-text-white' : 'tw-text-[#002089]'
          } tw-whitespace-nowrap`}
        >
          <span className='tw-line-through tw-mr-1'>${originalAmount}</span>
          <span>${discountedAmount}</span>
          {' upfront payment'}
        </span>
      );
    }

    // No coupon - show plain text like before
    if (bestValuePlan) {
      return (
        <span className='tw-text-sm tw-font-bold tw-text-white tw-whitespace-nowrap tw-text-right'>
          {paymentDetailsPlainText}
        </span>
      );
    }
    return (
      <span className='tw-text-sm tw-font-bold tw-text-[#002089] tw-whitespace-nowrap tw-text-right'>
        {paymentDetailsPlainText}
      </span>
    );
  };

  const bestValuePlan = product.featureText === 'Best Value for Ongoing Treatment';

  const isMonthlySubscription =
    product.durationText === '1-Month Subscription' || product.durationText === 'Monthly Subscription';

  const cardBackground = bestValuePlan ? '#000000' : 'linear-gradient(120deg, #04208B 0%, #0577FE 100%), #002089';

  return (
    <div
      className={`tw-rounded-xl tw-p-[3px] tw-mb-[30px] ${
        bestValuePlan ? 'tw-shadow-[0_0_21.7px_0_#3060FE] tw-p-[6px]' : ''
      }`}
      style={{ background: cardBackground }}
    >
      <div className='tw-text-center tw-text-white md:tw-text-2xl tw-text-base tw-font-bold tw-px-3 tw-pb-1'>
        {`⭐ ${product.featureText}`}
      </div>
      <div
        className={`tw-rounded-xl md:tw-pt-11 tw-pt-8 tw-pb-4 ${bestValuePlan ? 'tw-text-white' : 'tw-bg-white'}`}
        style={bestValuePlan ? { background: 'linear-gradient(120deg, #04208B 0%, #0577FE 100%), #002089' } : {}}
      >
        <div className='md:tw-px-9 tw-px-3'>
          <div className='tw-flex md:tw-items-center  md:tw-justify-between tw-justify-center'>
            <div className='tw-flex tw-items-center tw-w-full'>
              <div className='flex-grow-1'>
                <div className='d-flex tw-items-center tw-gap-1'>
                  <input
                    id={product.id || ''}
                    type='radio'
                    checked={isSelected}
                    onChange={() => onSelect(product)}
                    className='plan-radio-custom'
                    name='product-plan-radio'
                  />
                  <label
                    htmlFor={product.id || ''}
                    className={`!tw-font-bold tw-leading-[115%] md:tw-text-[32px] tw-text-[4.651vw] tw-capitalize md:tw-mb-0 tw-mb-2 ${
                      bestValuePlan ? 'tw-text-white' : 'tw-text-[#002089]'
                    }`}
                  >
                    {isAddPage && isGoogleMerchant
                      ? (
                        <>
                          <p className='tw-m-0'>12-Dose</p>
                          <p className='tw-m-0'>Starter Pack</p>
                        </>
                      )
                      : `${bestValuePlan ? 'Value' : product.metadata?.planTier || ''} ${product.durationText}`.trim()}
                  </label>
                </div>

                <div className='plan-price-group d-sm-none align-items-start align-items-sm-center '>
                  <div
                    className={`tw-font-bold tw-relative ${
                      hasDiscount ? 'tw-text-2xl' : 'md:tw-text-xl tw-text-[38px]'
                    } ${
                      bestValuePlan && hasDiscount
                        ? 'tw-text-white'
                        : bestValuePlan
                        ? 'tw-text-white'
                        : hasDiscount
                        ? 'tw-text-[#526397]'
                        : 'tw-text-[#0A206A]'
                    }`}
                  >
                    {isGoogleMerchant
                      ? `$${getRoundedPrice(hasDiscount ? discount?.originalAmount || 0 : price?.amount || 0)}`
                      : `$${getRoundedPrice(product.dividedAmount)} / mo.`}
                    {hasDiscount && (
                      <div className='tw-absolute tw-top-1/2 tw-left-0 tw-right-0 tw--translate-y-1/2'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          width='100%'
                          height='14'
                          fill='none'
                          preserveAspectRatio='none'
                        >
                          <path stroke='#FE3030' strokeWidth='3' d='m0 12 100 -10' />
                        </svg>
                      </div>
                    )}
                  </div>
                  {hasDiscount && (
                    <div
                      className={`md:tw-text-xl tw-text-[38px] tw-font-bold tw-font-dm-sans ${
                        bestValuePlan ? 'tw-text-white' : 'tw-text-[#0A206A]'
                      }`}
                    >
                      {isGoogleMerchant
                        ? `$${getRoundedPrice(discount?.amountAfterDiscount || 0)}`
                        : `$${getRoundedPrice(discountedDividedAmount)} / mo.`}
                    </div>
                  )}
                  {renderPaymentDetails()}
                </div>
              </div>
              <div className='plan-price-group d-none d-sm-flex align-items-center tw-relative md:tw-ml-3 tw-ml-0'>
                <span
                  className={`product-summary-price tw-whitespace-nowrap plan-price-custom !tw-mb-0 tw-leading-normal ${
                    bestValuePlan ? 'tw-text-white' : 'tw-text-[#002089]'
                  }`}
                >
                  {isGoogleMerchant
                    ? `$${getRoundedPrice(hasDiscount ? discount?.originalAmount || 0 : price?.amount || 0)}`
                    : `$${getRoundedPrice(product.dividedAmount)} / mo.`}
                </span>
                {hasDiscount && (
                  <>
                    <div className='tw-absolute tw-top-4 tw-right-0'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width={isGoogleMerchant ? '90' : '160'}
                        height='14'
                        fill='none'
                      >
                        <path
                          stroke='#FE3030'
                          strokeWidth='3'
                          d={isGoogleMerchant ? 'm.1 12.096 89.8-10.6' : 'm.1 12.096 159.802-10.6'}
                        />
                      </svg>
                    </div>
                    <div
                      className={`tw-text-[32px] tw-font-bold ${
                        bestValuePlan ? 'tw-text-white' : 'tw-text-[#002089]'
                      } tw-font-dm-sans tw-leading-normal`}
                    >
                      {isGoogleMerchant
                        ? `$${getRoundedPrice(discount?.amountAfterDiscount || 0)}`
                        : `$${getRoundedPrice(discountedDividedAmount)} / mo.`}
                    </div>
                  </>
                )}
                {renderPaymentDetails()}
              </div>
            </div>
          </div>

          {product.bulletDescription.length > 0 && (
            <ul className={`tw-mt-9 md:tw-pl-5 tw-pl-0 ${isMonthlySubscription ? 'tw-mb-8' : 'tw-mb-0'}`}>
              {product.bulletDescription.map((title) => (
                <li
                  className={`md:tw-mr-2 tw-mr-0 md:tw-pl-2 tw-pl-0 d-flex align-items-start ${
                    bestValuePlan ? 'tw-text-white' : 'tw-text-[#002089]'
                  }`}
                  key={title}
                >
                  <span style={{ fontSize: '1.2em', marginRight: '8px', marginTop: '0px', flexShrink: 0 }}>•</span>
                  <span style={{ flex: 1 }}>{title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {hasDiscount && (
          <div
            className={`tw-text-base tw-text-center tw-font-bold tw-px-4 tw-py-1 tw-mt-4 ${
              bestValuePlan ? 'tw-bg-white tw-text-[#001B55]' : 'tw-text-white'
            }`}
            style={bestValuePlan ? {} : { background: 'linear-gradient(116deg, #04208B 0%, #0577FE 100%), #002089' }}
          >
            {discount?.appliesTo === 'all' ? 'Offer Valid For Your First Purchase' : 'New Customers Only'}
          </div>
        )}
      </div>
    </div>
  );
};
