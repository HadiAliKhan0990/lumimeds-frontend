'use client';

import Image from 'next/image';
import toast from 'react-hot-toast';
import { FaTimes } from 'react-icons/fa';
import { trackAddToCart } from '@/lib/tracking';
import { microsoftTrackAddToCart } from '@/helpers/uetTracking';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useMemo, useState, useTransition } from 'react';
import { ROUTES, GOOGLE_MERCHANT_SOURCE } from '@/constants';
import { getRoundedPrice } from '@/helpers/products';
import { Error } from '@/lib/types';
import { isAxiosError } from 'axios';
import { Spinner } from 'react-bootstrap';
import { ProductType } from '@/store/slices/productTypeSlice';
import { useCreateCheckoutSessionMutation } from '@/store/slices/checkoutApiSlice';
import { getCachedAuth } from '@/lib/baseQuery';
import { trackSurveyAnalytics } from '@/helpers/surveyTracking';
import { trackButtonClick } from '@/helpers/hotjarTracking';
import { getAnswer } from '@/lib/helper';
import { getProductCategory } from '@/lib/trackingHelpers';
import { DiscountInfo } from '@/hooks/usePromoCoupons';
import ProductImage from '@/assets/ads/google-shopping/product.svg';

interface Props {
  onClose: () => void;
  displayName: string;
  product: ProductType;
  flow?: string;
  source?: string;
  discount?: DiscountInfo;
  overrideTime?: boolean;
  saleType?: string;
}

export const BottomPopup = ({ onClose, displayName, product, flow, source, discount, overrideTime, saleType }: Readonly<Props>) => {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const [isLoading, setIsLoading] = useState(false);

  const submissionId = useSelector((state: RootState) => state.checkout.submissionId);
  const selectedProduct = useSelector((state: RootState) => state.productType);
  const checkout = useSelector((state: RootState) => state.checkout);
  const { checkoutUser } = checkout || {};
  const surveyAnswers = useSelector((state: RootState) => state.answers);
  const surveyQuestions = useSelector((state: RootState) => state.surveyQuestions);

  const [createCheckoutSession] = useCreateCheckoutSessionMutation();

  const targetProduct = useMemo(() => {
    return product?.id === selectedProduct?.id ? selectedProduct : product;
  }, [product, selectedProduct]);

  const price = targetProduct?.prices[0];
  const isGoogleMerchant = source === GOOGLE_MERCHANT_SOURCE;
  const hasDiscount = !!discount;

  // Calculate discounted amounts
  const discountedAmount = hasDiscount ? discount.amountAfterDiscount : price?.amount || 0;
  const discountedDividedAmount = useMemo(() => {
    if (!hasDiscount || !targetProduct || !discount.originalAmount) return targetProduct?.dividedAmount || 0;
    // Apply the discount ratio to the original divided (per-month) amount
    const discountRatio = discount.amountAfterDiscount / discount.originalAmount;
    return (targetProduct.dividedAmount || 0) * discountRatio;
  }, [hasDiscount, discount, targetProduct]);

  const checkoutEmail = useMemo(() => {
    const trimmedCheckoutEmail = checkoutUser?.email?.trim();
    if (trimmedCheckoutEmail) {
      return trimmedCheckoutEmail;
    }

    const storedEmail = getAnswer('email', surveyAnswers, surveyQuestions);
    if (typeof storedEmail === 'string') {
      return storedEmail.trim();
    }

    return '';
  }, [checkoutUser?.email, surveyAnswers, surveyQuestions]);

  const paymentDetails = useMemo(() => {
    if (!price) {
      return '';
    }

    const displayAmount = hasDiscount ? discountedAmount : price.amount;

    // For Google Merchant, show "One payment of $X" on a new line
    if (isGoogleMerchant) {
      return `One payment of $${getRoundedPrice(displayAmount)}`;
    }
    if (price.checkoutType === 'subscription') {
      if ((price.billingIntervalCount || 1) > 1) {
        return `$${displayAmount} every ${price.billingIntervalCount} months`;
      } else {
        return `$${displayAmount} every month`;
      }
    } else {
      return `One payment of $${displayAmount}`;
    }
  }, [price, isGoogleMerchant, hasDiscount, discountedAmount]);

  if (!price) {
    return null; // Guard against missing price
  }

  async function handleRedirectToLogin(statusCode: number) {
    if (statusCode === 403) {
      const { accessToken } = await getCachedAuth();

      if (accessToken) {
        startTransition(() => router?.push(ROUTES.PATIENT_PAYMENTS_SUBSCRIPTIONS));
      } else {
        startTransition(() =>
          router?.push(
            `${ROUTES.PATIENT_LOGIN}?redirect=${encodeURIComponent(ROUTES.PATIENT_PAYMENTS_SUBSCRIPTIONS)}${checkoutUser?.email && `&email=${encodeURIComponent(checkoutUser?.email || '')}`
            }`
          )
        );
      }
    }
  }

  async function handleRedirectToCheckout(product: ProductType, email: string) {
    if (!email) {
      toast.error('We could not find your email. Please complete the survey to continue.');
      startTransition(() => router.push(`${ROUTES.PATIENT_INTAKE}${flow ? '?flow=' + flow : ''}`));
      return;
    }

    try {
      setIsLoading(true);

      const { priceId = '', checkoutType: mode } = product.prices?.[0] || {};

      const { data, success, message, statusCode } = await createCheckoutSession({
        priceId,
        currency: 'usd',
        email,
        productId: product.id,
        surveyId: product.surveyId || '',
        mode,
        couponCode: discount?.couponCode,
        ...(overrideTime && { overrideTime }),
      }).unwrap();

      if (success) {
        const { mode, secure_token, line_items } = data || {};
        await trackSurveyAnalytics({
          event: 'product_summary_checkout_initiated',
          payload: {
            email,
            currency: 'USD',
            product_id: product.id ?? '',
            product_name: product.name ?? '',
            amount: product.prices?.[0]?.amount || 0,
          },
        });
        // Get source from prop or URL
        const sourceParam = source || (typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('source')
          : null);
        const searchParams = new URLSearchParams({
          priceId: line_items?.[0]?.price_id ?? '',
          mode: mode ?? '',
         });
       if (flow) {
         searchParams.append('flow', flow);
       }
       if (overrideTime) {
         searchParams.append('overrideTime', 'true');
       }
       if (saleType) {
         searchParams.append('sale_type', saleType);
       }
       if (sourceParam) {
         searchParams.append('source', sourceParam);
       }
       startTransition(() => 
         router.push(`${ROUTES.CHECKOUT}/${secure_token}?${searchParams.toString()}`));
      } else {
        toast.error(message);
        handleRedirectToLogin(statusCode);
      }
    } catch (error) {
      toast.error(
        isAxiosError(error) ? error.response?.data.message : (error as Error).data?.message || 'Internal Server Error'
      );

      const statusCode = isAxiosError(error) ? error.response?.status : (error as Error).data.statusCode;

      handleRedirectToLogin(statusCode || 500);
    } finally {
      setIsLoading(false);
    }
  }

  const handleCheckout = async (product: ProductType) => {
    if (!product.prices?.[0]?.priceId || isPending || isLoading) return;

    // Get product category from product
    const productCategory: 'longevity' | 'weight_loss' = getProductCategory(product);

    // Track button click in Hotjar (non-blocking)
    try {
      trackButtonClick({
        buttonId: submissionId ? 'product-summary-checkout' : 'product-summary-continue-survey',
        buttonText: submissionId ? 'Checkout' : 'Continue',
        destination: submissionId ? ROUTES.CHECKOUT : ROUTES.PATIENT_INTAKE,
        productId: product.id,
        productName: displayName ?? product.name,
        productPrice: product.prices?.[0]?.amount,
        hasSurvey: !!submissionId,
        flow: flow,
      });
    } catch (error) {
      // Silently fail - don't disrupt checkout flow
      console.error('Hotjar tracking error (non-critical):', error);
    }

    trackAddToCart({
      itemId: product?.id ?? '',
      itemName: displayName ?? product?.name ?? '',
      value: product.prices?.[0]?.amount ?? 0,
      currency: 'USD',
      productCategory,
    });

    // Microsoft UET AddToCart tracking
    microsoftTrackAddToCart(
      product?.id ?? '',
      displayName ?? product?.name ?? '',
      product.prices?.[0]?.amount ?? 0
    );

    if (submissionId) {
      await handleRedirectToCheckout(product, checkoutEmail);
    } else {
      const { medicineName } = product || {};
      await trackSurveyAnalytics({
        event: 'product_summary_checkout_initiated',
        payload: {
          currency: 'USD',
          product_id: product.id ?? '',
          product_name: product.name ?? '',
          amount: product.prices?.[0]?.amount ?? 0,
          medicineName,
        },
      });

      const sourceParam =
        source || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('source') : null);

      // Choose route based on product medicineName
      let baseRoute = ROUTES.PATIENT_INTAKE;
      if (medicineName?.toLowerCase() === 'longevity') {
        baseRoute = ROUTES.LONGEVITY_PATIENT_INTAKE;
      }

      const intakeUrl = `${baseRoute}${flow ? '?flow=' + flow : ''}${sourceParam ? (flow ? '&' : '?') + 'source=' + sourceParam : ''
        }`;
      startTransition(() => router.push(intakeUrl));
    }
  };

  return (
    <>
      {/* Mobile Bottom Bar */}
      <div className='d-lg-none position-fixed end-0 start-0 bottom-0 container-fluid mb-4 tw-z-10'>
        <button
          onClick={() => handleCheckout(product)}
          className='d-flex align-items-center justify-content-between border border-2 border-black rounded-pill px-4 py-3 btn btn-light w-100'
          disabled={isPending || isLoading}
        >
          {(isLoading || isPending) && <Spinner className='border-2 me-2' size='sm' />}
          <span className='fw-medium text-start text-lg flex-grow-1'>Continue</span>
          <div className='flex flex-col items-end'>
            {hasDiscount ? (
              <>
                <span className='tw-text-gray-400 tw-line-through tw-text-sm'>
                  ${getRoundedPrice(targetProduct?.dividedAmount)} / mo.
                </span>
                <span className='font-medium text-lg tw-text-green-600'>
                  ${getRoundedPrice(discountedDividedAmount)} / mo.
                </span>
              </>
            ) : (
              <span className='font-medium text-lg'>
                {isGoogleMerchant
                  ? `$${getRoundedPrice(price?.amount || 0)}`
                  : `$${getRoundedPrice(targetProduct?.dividedAmount)} / mo.`}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Desktop Bottom Bar */}
      <div className='product-bottom-popup position-fixed bottom-0 end-0 start-0 border-top border-bottom border-black bg-white d-lg-block d-none tw-z-10'>
        {/* Close Icon */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className='product-bottom-popup-close'
          aria-label='Close'
          type='button'
        >
          <FaTimes />
        </button>
        <div className='d-flex align-items-center justify-content-between py-4 container'>
          <div className='d-flex align-items-center product-bottom-popup-gap'>
            {isGoogleMerchant && !product?.category?.toLowerCase()?.includes('nad') ? (
              <Image
                src={ProductImage}
                alt='Month Product'
                width={80}
                height={140}
                className='md:max-w-[80px] md:max-h-[140px] object-fit-contain'
              />
            ) : (
              <Image
                alt={targetProduct?.name ?? 'Product'}
                id={displayName}
                width={80}
                height={140}
                key={targetProduct?.name}
                src={targetProduct?.image || ''}
                className='product-bottom-popup-img object-fit-contain'
                unoptimized
              />
            )}

            <div>
              <div className='product-bottom-popup-title'>
              {displayName.replace(/\s*Injections?/gi, '')}
              </div>
              <div className='product-bottom-popup-desc text-capitalize'>
                {isGoogleMerchant
                  ? '12-Dose Starter Pack'
                  : `${targetProduct?.metadata?.planTier || ''} ${targetProduct?.durationText}`
                }
              </div>
            </div>
          </div>
          <div className='d-flex align-items-center justify-content-between'>
            <div className='d-flex align-items-center justify-content-end text-end'>
              <div className='border-end border-black me-2 pe-2'>
                <div className='d-flex flex-column align-items-end'>
                  {hasDiscount ? (
                    <>
                      <div className='tw-text-gray-400 tw-line-through tw-text-sm'>
                        ${getRoundedPrice(targetProduct?.dividedAmount)} / mo.
                      </div>
                      <div className='product-bottom-popup-price tw-text-green-600'>
                        ${getRoundedPrice(discountedDividedAmount)} / mo.
                      </div>
                    </>
                  ) : (
                    <div className='product-bottom-popup-price'>
                      {isGoogleMerchant
                        ? `$${price?.amount || 0}`
                        : `$${getRoundedPrice(targetProduct?.dividedAmount)} / mo.`}
                    </div>
                  )}
                  <div className='product-bottom-popup-payment'>{paymentDetails}</div>
                </div>
              </div>
            </div>
            <button
              disabled={isPending || isLoading}
              className='btn btn-primary rounded-pill fw-medium px-3 py-2 text-nowrap product-bottom-popup-btn d-flex align-items-center justify-content-center gap-2'
              onClick={() => handleCheckout(product)}
            >
              {(isLoading || isPending) && <Spinner className='border-2' size='sm' />}
              Checkout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
