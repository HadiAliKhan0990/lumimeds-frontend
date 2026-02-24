'use client';

import * as Sentry from '@sentry/nextjs';
import videoVisistsAllowedStates from '@/data/videoVisitsAllowedStates.json';
import CheckoutInput, { CheckoutFormInput, CheckoutReactSelect } from '@/components/elements/CheckoutInput';
import Link from 'next/link';
import toast from 'react-hot-toast';
import CvcIcon from '@/components/Icon/CvcIcon';
import TrustpilotWidget from '@/components/Home/Hero/TrustpilotWidget';
import {
  formatToUSD,
  valueChangeVerifyHandler,
  formatUSPhoneWithoutPlusOne,
  getFriendlyPaymentErrorMessage,
} from '@/lib/helper';
import { useEffect, useMemo, useState, useTransition, useRef } from 'react';
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  ElementsForm,
  FieldName,
} from '@getopenpay/openpay-js-react';
import { CheckoutFormSkeleton } from './CheckoutFormSkeleton';
import { useMounted } from '@/hooks/usemounted';
import { Controller, useForm } from 'react-hook-form';
import { CheckoutvalidationSchema, checkoutvalidationSchema } from '@/lib/schema/checkout';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearCheckout,
  setCheckout,
  setCheckoutUser,
  setCouponData,
  setIntakeAmount,
  setSubmissionId,
} from '@/store/slices/checkoutSlice';
import { useRouter } from 'next/navigation';
import { Collapse, Spinner } from 'react-bootstrap';
import { Error, OptionValue, PaymentMethod } from '@/lib/types';
import { setAnswers } from '@/store/slices/answersSlice';
import { CheckoutItem, trackPurchase } from '@/lib/tracking';
import { getProductCategory } from '@/lib/trackingHelpers';
import { RootState } from '@/store';
import { STORAGE_STEP_KEY } from '@/constants/intakeSurvey';
import {
  CouponResponse,
  useAddPatientAddressMutation,
  useApplyCouponMutation,
  useUpdateIntakeSurveySubmissionMutation,
  useCreateCheckoutSessionMutation,
} from '@/store/slices/checkoutApiSlice';
import {  GOOGLE_MERCHANT_SOURCE, ROUTES } from '@/constants';
import { useStates } from '@/hooks/useStates';
import { TrustpilotData } from '@/services/trustpilot';
import { GetCheckoutData } from '@/services/checkout/types';
import { CheckoutProduct } from './CheckoutProduct';
import { setProductType } from '@/store/slices/productTypeSlice';
import { isAxiosError } from 'axios';
import { trackSurveyAnalytics } from '@/helpers/surveyTracking';
import { ProductSummaryItems } from './ProductSummaryItems';
import { ExpressCheckoutWidget } from './ExpressCheckoutWidget';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { PaymentMethodDivider } from './PaymentMethodDivider';
import { trackCheckoutInitiated } from '@/helpers/hotjarTracking';
import { SiKlarna } from 'react-icons/si';
import { custonmPhoneInputOnChange, custonmPhoneInputOnKeyChange } from '@/components/elements/Inputs/CustomPhoneInput';
import { FiArrowLeft } from 'react-icons/fi';
import { usePromoCoupons } from '@/hooks/usePromoCoupons';
interface CardErrorMessage {
  cardCvc?: string;
  cardNumber?: string;
  cardExpiry?: string;
}

// Extract proper types from Sentry's span
type SentrySpan = ReturnType<typeof Sentry.startInactiveSpan>;
type SpanAttributes = Parameters<typeof Sentry.startInactiveSpan>[0]['attributes'];
// SpanStatus type from Sentry (not directly exported, so we use type assertion)
type SpanStatus = Parameters<NonNullable<SentrySpan>['setStatus']>[0];

interface SentryTransactionRef {
  startChild: (options: { op: string; description: string; data?: Record<string, unknown> }) => SentrySpan | undefined;
  finish: () => void;
}

interface Props {
  token: string;
  priceId?: string;
  trustpilotData: TrustpilotData;
  checkoutData?: GetCheckoutData;
  flow?: string;
  source?: string;
  couponCode?: string;
  overrideTime?: boolean;
}

/**
 * Masks a sensitive token for logging purposes
 * Shows only first 4 and last 4 characters: "abcd...xyz1"
 */
function maskToken(token: string): string {
  if (!token || token.length <= 8) {
    return '***';
  }
  return `${token.substring(0, 4)}...${token.substring(token.length - 4)}`;
}

export default function CheckoutForm({
  token,
  priceId,
  trustpilotData,
  checkoutData,
  flow,
  source,
  couponCode,
  overrideTime,
}: Readonly<Props>) {
  const { stateOptions } = useStates();
  const dispatch = useDispatch();
  const router = useRouter();
  const { mounted } = useMounted();

  const [isPending, startTransition] = useTransition();

  const submissionId = useSelector((state: RootState) => state.checkout.submissionId || '');
  const selectedproduct = useSelector((state: RootState) => state.productType);
  const checkoutUser = useSelector((state: RootState) => state.checkout.checkoutUser);

  const [cardErrorMessages, setCardErrorMessages] = useState<CardErrorMessage | null>(null);
  const [amount, setAmount] = useState(0);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [couponDetails, setCouponDetails] = useState<CouponResponse['data']>();
  const [appliedCouponCode, setAppliedCouponCode] = useState<string>('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Card');
  const [currentToken, setCurrentToken] = useState(token);
  const [isFormLoaded, setIsFormLoaded] = useState(false);

  const [isDiscountClicked, setIsDiscountClicked] = useState(false);

  // Ref to track the latest active token - used to ignore callbacks from old sessions
  const activeTokenRef = useRef(token);

  // Sentry transaction ref for performance monitoring
  const sentryTransactionRef = useRef<SentryTransactionRef | null>(null);

  const [addPatientAddress] = useAddPatientAddressMutation();
  const [mutateAsync, { isLoading }] = useApplyCouponMutation();
  const [updateIntakeSurveySubmission, { isLoading: isUpdatingSurvey }] = useUpdateIntakeSurveySubmissionMutation();
  const [createCheckoutSession, { isLoading: isCreatingSession }] = useCreateCheckoutSessionMutation();

  // Get sale_type from URL params for auto-apply coupon logic
  const saleTypeFromUrl = useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    return new URLSearchParams(window.location.search).get('sale_type') || undefined;
  }, []);

  // Auto-apply coupon hook for new patients (matches patientType: 'all' or 'new')
  const { findCouponForPriceId } = usePromoCoupons(saleTypeFromUrl, 'new', overrideTime);

  const {
    register,
    setValue,
    control,
    getValues,
    trigger,
    setError,
    watch,
    formState: { errors },
  } = useForm<CheckoutvalidationSchema>({
    mode: 'onChange',
    resolver: yupResolver(checkoutvalidationSchema),
  });

  const coupon = watch('coupon');

  const isSameAsShippingAddress = getValues('sameAsShippingAddress');

  const setisSameAsShippingAddress = (v: boolean) => setValue('sameAsShippingAddress', v);

  const handlesameAsShippingAddress = async () => {
    if (!isSameAsShippingAddress) {
      setisSameAsShippingAddress(true);

      // Add breadcrumb for toggling same-as-shipping on
      Sentry.addBreadcrumb({
        category: 'checkout',
        message: 'User enabled "same as shipping address"',
        level: 'info',
      });

      const shouldValidate = !(await handleValidateBillingValues());

      setValue('firstName', getValues('shipping_firstName') ?? '', { shouldValidate });
      setValue('lastName', getValues('shipping_lastName') ?? '', { shouldValidate });
      setValue('billing_address', getValues('shipping_address') ?? '', { shouldValidate });
      setValue('billing_address2', getValues('shipping_address2') ?? '', { shouldValidate });
      setValue('billing_city', getValues('shipping_city') ?? '', { shouldValidate });
      setValue('zipCode', getValues('shipping_zipCode') ?? '', { shouldValidate });
      setValue('billing_state', getValues('shipping_state') ?? '', { shouldValidate });
    } else {
      setisSameAsShippingAddress(false);

      // Add breadcrumb for toggling same-as-shipping off
      Sentry.addBreadcrumb({
        category: 'checkout',
        message: 'User disabled "same as shipping address"',
        level: 'info',
      });

      setValue('firstName', checkoutData?.patient?.firstName ?? '');
      setValue('lastName', checkoutData?.patient?.lastName ?? '');
      setValue('billing_address', '');
      setValue('billing_address2', '');
      setValue('billing_city', '');
      setValue('zipCode', '');
      setValue('billing_state', '');
    }
  };

  const handleSaveShipping = async (submit?: () => void) => {
    const email = getValues('email');

    const firstName = getValues('firstName') ?? '';

    const lastName = getValues('lastName') ?? '';

    const phoneNumber = getValues('phone') ?? '';

    const shippingAddress = {
      firstName: getValues('shipping_firstName') ?? '',
      lastName: getValues('shipping_lastName') ?? '',
      city: getValues('shipping_city') ?? '',
      region: 'United States',
      street: getValues('shipping_address') ?? '',
      street2: getValues('shipping_address2') ?? '',
      zip: getValues('shipping_zipCode') ?? '',
      state: getValues('shipping_state') ?? '',
    };

    const billingAddress = isSameAsShippingAddress
      ? shippingAddress
      : {
        firstName: checkoutData?.patient?.firstName ?? firstName,
        lastName: checkoutData?.patient?.firstName ?? lastName,
        city: getValues('billing_city') ?? '',
        region: 'United States',
        street: getValues('billing_address') ?? '',
        street2: getValues('billing_address2') ?? '',
        zip: getValues('zipCode') ?? '',
        state: getValues('billing_state') ?? '',
      };

    const payload = {
      email: checkoutData?.patient?.email ?? email,
      address: { billingAddress, shippingAddress },
      ...(!valueChangeVerifyHandler({ updatedValue: checkoutData?.patient?.email ?? '', value: email })
        ? {
          newEmailAddress: email,
        }
        : {}),
      ...(!valueChangeVerifyHandler({ updatedValue: phoneNumber, value: checkoutData?.patient?.phone ?? '' })
        ? {
          phoneNumber,
        }
        : {}),
      ...(!valueChangeVerifyHandler({ updatedValue: firstName, value: checkoutData?.patient?.firstName ?? '' })
        ? {
          firstName,
        }
        : {}),
      ...(!valueChangeVerifyHandler({ updatedValue: lastName, value: checkoutData?.patient?.lastName ?? '' })
        ? {
          lastName,
        }
        : {}),
    };

    // Start performance span for address save
    const span = sentryTransactionRef.current?.startChild({
      op: 'api.mutation',
      description: 'Save patient address',
    });

    try {
      setCheckoutLoading(true);

      // Add breadcrumb for address save attempt
      Sentry.addBreadcrumb({
        category: 'checkout',
        message: 'Saving patient address',
        level: 'info',
        data: {
          has_shipping_address: !!shippingAddress.street,
          has_billing_address: !!billingAddress.street,
          same_as_shipping: isSameAsShippingAddress,
          shipping_state: shippingAddress.state,
        },
      });

      const { success, message } = await addPatientAddress(payload).unwrap();

      // Set span status based on result
      // Type assertion needed because Sentry's SpanStatus type is not directly accessible
      span?.setStatus((success ? 'ok' : 'unknown_error') as unknown as SpanStatus);

      if (success && submit) {
        // Log successful address save
        Sentry.addBreadcrumb({
          category: 'checkout',
          message: 'Patient address saved successfully',
          level: 'info',
        });

        // Capture success event to send breadcrumbs
        const userEmail = getValues('email') || checkoutData?.patient?.email || checkoutUser?.email || '';
        Sentry.captureMessage('Patient address saved successfully', {
          level: 'info',
          tags: {
            checkout_action: 'save_address',
            flow_type: flow || 'standard',
            userEmail,
          },
          contexts: {
            checkout: {
              has_shipping_address: !!shippingAddress.street,
              has_billing_address: !!billingAddress.street,
              same_as_shipping: isSameAsShippingAddress,
              shipping_state: shippingAddress.state,
            },
          },
        });

        await submit();
        if (couponDetails) {
          dispatch(setCouponData(couponDetails));
        }
      } else {
        // Log address save failure
        Sentry.addBreadcrumb({
          category: 'checkout',
          message: 'Address save failed',
          level: 'error',
          data: {
            error_message: message || 'Unable to Save address!',
          },
        });

        // Capture error event to send breadcrumbs
        const userEmail = getValues('email') || checkoutData?.patient?.email || checkoutUser?.email || '';
        Sentry.captureMessage('Address save failed', {
          level: 'error',
          tags: {
            checkout_action: 'save_address',
            flow_type: flow || 'standard',
            userEmail,
          },
          contexts: {
            checkout: {
              has_shipping_address: !!shippingAddress.street,
              has_billing_address: !!billingAddress.street,
              same_as_shipping: isSameAsShippingAddress,
              shipping_state: shippingAddress.state,
              error_message: message || 'Unable to Save address!',
            },
          },
        });

        toast.error(message || 'Unable to Save address!');
        setCheckoutLoading(false);
      }
    } catch (e) {
      const message = isAxiosError(e)
        ? e.response?.data.message
        : (e as Error).data?.message || 'Unable to Save address';
      // Set span status to error
      // Type assertion needed because Sentry's SpanStatus type is not directly accessible
      span?.setStatus(message as unknown as SpanStatus);

      // Capture address save error in Sentry
      const userEmail = getValues('email') || checkoutData?.patient?.email || checkoutUser?.email || '';
      Sentry.captureException(e, {
        tags: {
          checkout_action: 'save_address',
          flow_type: flow || 'standard',
          userEmail,
        },
        contexts: {
          checkout: {
            has_shipping_address: !!shippingAddress.street,
            has_billing_address: !!billingAddress.street,
            same_as_shipping: isSameAsShippingAddress,
            shipping_state: shippingAddress.state,
          },
        },
      });

      toast.error(message);
      setCheckoutLoading(false);
    } finally {
      // Always end the span to prevent memory leaks
      span?.end();
    }
  };

  const product = useMemo(() => {
    return checkoutData?.product || selectedproduct;
  }, [checkoutData?.product, selectedproduct]);

  const handleValidateBillingValues = async () => {
    const keys = [
      'firstName',
      'lastName',
      'billing_address',
      'billing_address2',
      'billing_city',
      'billing_state',
      'zipCode',
    ];
    const isValid = await Promise.all(
      keys.map(async (key) => {
        return await trigger(key as keyof CheckoutvalidationSchema);
      })
    ).then((arr) => arr.every(Boolean));

    // Add breadcrumb for billing validation result
    if (!isValid) {
      const errorFields = keys.filter((key) => errors[key as keyof typeof errors]);
      Sentry.addBreadcrumb({
        category: 'checkout',
        message: 'Billing address validation failed',
        level: 'warning',
        data: {
          error_fields: errorFields,
          error_count: errorFields.length,
        },
      });
    }

    return isValid;
  };

  const handleValidate = async () => {
    // Start performance span for form validation
    const span = sentryTransactionRef.current?.startChild({
      op: 'form.validation',
      description: 'Validate checkout form',
    });

    try {
      // Add breadcrumb for validation attempt
      Sentry.addBreadcrumb({
        category: 'checkout',
        message: 'Form validation started',
        level: 'info',
      });

      const keys = Object.keys(checkoutvalidationSchema.fields);

      const isValid = await Promise.all(
        keys.map(async (key) => {
          return await trigger(key as keyof CheckoutvalidationSchema);
        })
      ).then((arr) => arr.every(Boolean));

      const shipping_state = getValues('billing_state') ?? '';

      const BLOCKED_STATES_503B = ['Mississippi', 'Alabama', 'California'];

      const is503bProduct = product?.name?.toLowerCase().includes('503b');

      if (is503bProduct) {
        if (BLOCKED_STATES_503B.includes(shipping_state)) {
          // Log 503B state blocking
          Sentry.addBreadcrumb({
            category: 'checkout',
            message: '503B product blocked for state',
            level: 'warning',
            data: {
              product_name: product?.name || '',
              blocked_state: shipping_state,
              product_type: '503b',
            },
          });
          toast.error(`${product?.name} is not available in ${shipping_state}`);

          // Set span status before returning
          // Type assertion needed because Sentry's SpanStatus type is not directly accessible
          span?.setStatus('invalid_argument' as unknown as SpanStatus);
          return false;
        }
      }

      // Log validation result
      if (!isValid) {
        const errorFields = Object.keys(errors);
        Sentry.addBreadcrumb({
          category: 'checkout',
          message: 'Form validation failed',
          level: 'warning',
          data: {
            error_fields: errorFields,
            error_count: errorFields.length,
          },
        });
      } else {
        Sentry.addBreadcrumb({
          category: 'checkout',
          message: 'Form validation successful',
          level: 'info',
        });
      }

      // Set span status based on validation result
      // Type assertion needed because Sentry's SpanStatus type is not directly accessible
      span?.setStatus((isValid ? 'ok' : 'invalid_argument') as unknown as SpanStatus);

      return isValid;
    } catch (error) {
      // Set span status to error
      // Type assertion needed because Sentry's SpanStatus type is not directly accessible
      span?.setStatus('internal_error' as unknown as SpanStatus);
      throw error;
    } finally {
      // Always end the span to prevent memory leaks
      span?.end();
    }
  };

  const handleSubmit = async (submit?: () => void) => {
    let isValid = false;

    isValid = await handleValidate();

    if (isValid) handleSaveShipping(submit);
    else setPaymentMethod('Card');
  };

  async function handleApplyCoupon() {
    // Start performance span for coupon application
    const span = sentryTransactionRef.current?.startChild({
      op: 'api.mutation',
      description: 'Apply coupon code',
    });

    try {
      const price_id = priceId || product?.prices?.[0].priceId;
      const couponCode = getValues('coupon') ?? '';
      const email = getValues('email') || checkoutData?.patient?.email || checkoutUser?.email || '';

      // Add breadcrumb for coupon application attempt
      Sentry.addBreadcrumb({
        category: 'checkout',
        message: 'Applying coupon code',
        level: 'info',
        data: {
          coupon_code: couponCode,
          price_id: price_id ?? '',
          product_id: product?.id ?? '',
        },
      });

      const { data, error } = await mutateAsync({
        couponCode,
        priceId: price_id ?? '',
        ...(overrideTime && { overrideTime }),
      });

      if (error) {
        // Log coupon application error
        Sentry.addBreadcrumb({
          category: 'checkout',
          message: 'Coupon application failed',
          level: 'error',
          data: {
            coupon_code: couponCode,
            error_message: (error as Error).data?.message || 'Error Applying Coupon!',
          },
        });

        // Capture error event to send breadcrumbs
        const userEmail = getValues('email') || checkoutData?.patient?.email || checkoutUser?.email || '';
        Sentry.captureMessage('Coupon application failed', {
          level: 'error',
          tags: {
            checkout_action: 'apply_coupon',
            flow_type: flow || 'standard',
            userEmail,
          },
          contexts: {
            checkout: {
              coupon_code: couponCode,
              product_id: product?.id ?? '',
              price_id: priceId || product?.prices?.[0].priceId || '',
              error_message: (error as Error).data?.message || 'Error Applying Coupon!',
            },
          },
        });

        toast.error((error as Error).data?.message || 'Error Applying Coupon!');

        // Set span status to error
        span?.setStatus('unknown_error' as unknown as SpanStatus);
      } else {
        setCouponDetails(data?.data);
        setAppliedCouponCode(couponCode);

        // Log successful coupon validation
        Sentry.addBreadcrumb({
          category: 'checkout',
          message: 'Coupon validated successfully',
          level: 'info',
          data: {
            coupon_code: couponCode,
            discount_type: data?.data?.discountType,
            discount_amount: data?.data?.discountAmount,
            amount_after_discount: data?.data?.amountAfterDiscount,
          },
        });

        // Create a new checkout session with the coupon code
        const sessionResponse = await createCheckoutSession({
          priceId: price_id ?? '',
          currency: 'usd',
          email,
          mode: product?.prices?.[0]?.checkoutType || 'subscription',
          productId: product?.id ?? null,
          surveyId: product?.surveyId || checkoutData?.submissionId || submissionId || '',
          couponCode: couponCode,
          ...(overrideTime && { overrideTime }),
        }).unwrap();

        if (sessionResponse.success && sessionResponse.data?.secure_token) {
          setCurrentToken(sessionResponse.data.secure_token);

          // Log successful checkout session recreation with coupon
          Sentry.addBreadcrumb({
            category: 'checkout',
            message: 'Checkout session recreated with coupon',
            level: 'info',
            data: {
              coupon_code: couponCode,
              new_token_received: !!sessionResponse.data?.secure_token,
            },
          });

          // Capture success event to send breadcrumbs
          const userEmail = getValues('email') || checkoutData?.patient?.email || checkoutUser?.email || '';
          Sentry.captureMessage('Coupon applied successfully', {
            level: 'info',
            tags: {
              checkout_action: 'apply_coupon',
              flow_type: flow || 'standard',
              userEmail,
            },
            contexts: {
              checkout: {
                coupon_code: couponCode,
                product_id: product?.id ?? '',
                price_id: priceId || product?.prices?.[0].priceId || '',
                discount_type: data?.data?.discountType,
                discount_amount: data?.data?.discountAmount,
                amount_after_discount: data?.data?.amountAfterDiscount,
              },
            },
          });

          toast.success('Coupon Applied Successfully!');
        } else {
          // Log session recreation failure
          Sentry.addBreadcrumb({
            category: 'checkout',
            message: 'Failed to recreate checkout session with coupon',
            level: 'error',
            data: {
              coupon_code: couponCode,
              error_message: sessionResponse.message || 'Failed to apply coupon',
            },
          });

          // Capture error event to send breadcrumbs
          const userEmail = getValues('email') || checkoutData?.patient?.email || checkoutUser?.email || '';
          Sentry.captureMessage('Failed to recreate checkout session with coupon', {
            level: 'error',
            tags: {
              checkout_action: 'apply_coupon',
              flow_type: flow || 'standard',
              userEmail,
            },
            contexts: {
              checkout: {
                coupon_code: couponCode,
                product_id: product?.id ?? '',
                price_id: priceId || product?.prices?.[0].priceId || '',
                error_message: sessionResponse.message || 'Failed to apply coupon',
              },
            },
          });

          toast.error('Failed to apply coupon. Please try again.');

          // Revert coupon state since session creation failed - user would pay full price with old token
          setCouponDetails(undefined);
          setAppliedCouponCode('');
          setValue('coupon', '');
        }

        setIsApplyingCoupon(false);

        // Set span status based on session response
        // Type assertion needed because Sentry's SpanStatus type is not directly accessible
        span?.setStatus((sessionResponse.success ? 'ok' : 'unknown_error') as unknown as SpanStatus);
      }
    } catch (error) {
      // Set span status to error
      // Type assertion needed because Sentry's SpanStatus type is not directly accessible
      span?.setStatus('internal_error' as unknown as SpanStatus);

      // Capture coupon application error in Sentry
      const couponCode = getValues('coupon') ?? '';
      const userEmail = getValues('email') || checkoutData?.patient?.email || checkoutUser?.email || '';
      Sentry.captureException(error, {
        tags: {
          checkout_action: 'apply_coupon',
          flow_type: flow || 'standard',
          userEmail,
        },
        contexts: {
          checkout: {
            coupon_code: couponCode,
            product_id: product?.id ?? '',
            price_id: priceId || product?.prices?.[0].priceId || '',
          },
        },
      });

      toast.error(
        isAxiosError(error) ? error.response?.data.message : (error as Error).data?.message || 'Error Applying Coupon!'
      );

      // Revert coupon state in case error happened after coupon was validated but before session was created
      setCouponDetails(undefined);
      setAppliedCouponCode('');
      setValue('coupon', '');
      setIsApplyingCoupon(false);
    } finally {
      // Always end the span to prevent memory leaks
      span?.end();
    }
  }

  async function handleRemoveCoupon() {
    try {
      const price_id = priceId || product?.prices?.[0].priceId;
      const email = getValues('email') || checkoutData?.patient?.email || checkoutUser?.email || '';

      // Add breadcrumb for coupon removal attempt
      Sentry.addBreadcrumb({
        category: 'checkout',
        message: 'Removing coupon code',
        level: 'info',
        data: {
          removed_coupon_code: appliedCouponCode,
          price_id: price_id ?? '',
        },
      });

      // Create a new checkout session without the coupon code
      const sessionResponse = await createCheckoutSession({
        priceId: price_id ?? '',
        currency: 'usd',
        email,
        mode: product?.prices?.[0]?.checkoutType || 'subscription',
        productId: product?.id ?? null,
        surveyId: product?.surveyId || '',
      }).unwrap();

      if (sessionResponse.success && sessionResponse.data?.secure_token) {
        setCurrentToken(sessionResponse.data.secure_token);
        setCouponDetails(undefined);
        setAppliedCouponCode('');
        setValue('coupon', '');
        setIsApplyingCoupon(false);

        // Log successful coupon removal
        Sentry.addBreadcrumb({
          category: 'checkout',
          message: 'Coupon removed successfully',
          level: 'info',
          data: {
            new_token_received: !!sessionResponse.data?.secure_token,
          },
        });

        // Capture success event to send breadcrumbs
        const userEmail = getValues('email') || checkoutData?.patient?.email || checkoutUser?.email || '';
        Sentry.captureMessage('Coupon removed successfully', {
          level: 'info',
          tags: {
            checkout_action: 'remove_coupon',
            flow_type: flow || 'standard',
            userEmail,
          },
          contexts: {
            checkout: {
              removed_coupon_code: appliedCouponCode,
              product_id: product?.id ?? '',
            },
          },
        });

        toast.success('Coupon removed');
      } else {
        // Log coupon removal failure
        Sentry.addBreadcrumb({
          category: 'checkout',
          message: 'Failed to remove coupon',
          level: 'error',
          data: {
            error_message: sessionResponse.message || 'Failed to remove coupon',
          },
        });

        // Capture error event to send breadcrumbs
        const userEmail = getValues('email') || checkoutData?.patient?.email || checkoutUser?.email || '';
        Sentry.captureMessage('Failed to remove coupon', {
          level: 'error',
          tags: {
            checkout_action: 'remove_coupon',
            flow_type: flow || 'standard',
            userEmail,
          },
          contexts: {
            checkout: {
              removed_coupon_code: appliedCouponCode,
              product_id: product?.id ?? '',
              error_message: sessionResponse.message || 'Failed to remove coupon',
            },
          },
        });

        toast.error(sessionResponse.message || 'Failed to remove coupon. Please try again.');
      }
    } catch (error) {
      // Capture coupon removal error in Sentry
      const userEmail = getValues('email') || checkoutData?.patient?.email || checkoutUser?.email || '';
      Sentry.captureException(error, {
        tags: {
          checkout_action: 'remove_coupon',
          flow_type: flow || 'standard',
          userEmail,
        },
        contexts: {
          checkout: {
            removed_coupon_code: appliedCouponCode,
            product_id: product?.id ?? '',
          },
        },
      });

      toast.error(
        isAxiosError(error) ? error.response?.data.message : (error as Error).data?.message || 'Error Removing Coupon!'
      );
    }
  }

  function handleLoadCheckoutData() {
    // Add breadcrumb for checkout data loading
    Sentry.addBreadcrumb({
      category: 'checkout',
      message: 'Loading checkout form data',
      level: 'info',
      data: {
        has_checkout_data: !!checkoutData,
        has_checkout_user: !!checkoutUser,
        product_id: checkoutData?.product?.id || selectedproduct?.id || '',
      },
    });

    if (checkoutData) {
      setValue('firstName', checkoutData.patient.firstName);
      setValue('lastName', checkoutData.patient.lastName);

      setValue('shipping_firstName', checkoutData?.patient?.firstName ?? '');

      setValue('shipping_lastName', checkoutData?.patient?.lastName ?? '');

      setValue('email', checkoutData.patient.email);
      setValue('phone', formatUSPhoneWithoutPlusOne(checkoutData.patient.phone));
    } else {
      setValue('email', checkoutUser?.email || '');
      setValue('phone', checkoutUser?.phone ? formatUSPhoneWithoutPlusOne(checkoutUser?.phone) : '');
    }
  }

  async function handleCheckoutSuccess(invoiceUrls: string[], subscriptionIds: string[], customerId: string) {
    try {
      await trackSurveyAnalytics({
        event: 'checkout_completed',
        payload: {
          invoice_id: invoiceUrls[0].split('/#').pop() ?? '',
          product_id: product?.id ?? '',
          product_name: product?.name ?? '',
        },
      });

      const price_id = priceId || product?.prices?.[0].priceId;
      const { success, data, message } = await updateIntakeSurveySubmission({
        id: checkoutData?.submissionId || submissionId,
        priceId: price_id || '',
      }).unwrap();
      if (success) {
        // --- Purchase Tracking ---
        const transactionId = invoiceUrls[0].split('/#').pop() ?? '';
        let productPrice: number;
        //COUPON DETAILS AMOUNT ARE IN DOLLARS
        // AMOUNT IS IN CENTS
        if (couponDetails && couponDetails?.amountAfterDiscount) {
          productPrice = Number(couponDetails?.amountAfterDiscount) * 100;
        } else {
          productPrice = Number(amount);
        }

        console.log('PRODUCT PRICE IN CHECKOUT FORM ===>', productPrice);

        // Log successful checkout completion to Sentry
        Sentry.addBreadcrumb({
          category: 'checkout',
          message: 'Checkout completed successfully',
          level: 'info',
          data: {
            transaction_id: transactionId,
            invoice_urls: invoiceUrls,
            subscription_ids: subscriptionIds,
            customer_id: customerId,
            product_id: product?.id ?? '',
            product_name: product?.name ?? '',
            final_amount: productPrice,
            payment_method: paymentMethod,
            coupon_applied: !!couponDetails,
            coupon_code: appliedCouponCode || undefined,
            discount_amount: couponDetails?.discountAmount,
          },
        });

        // Capture success event for analytics
        const userEmail = getValues('email') || checkoutData?.patient?.email || checkoutUser?.email || '';
        Sentry.captureMessage('Checkout completed successfully', {
          level: 'info',
          tags: {
            checkout_action: 'checkout_complete',
            flow_type: flow || 'standard',
            payment_method: paymentMethod,
            userEmail,
          },
          contexts: {
            transaction: {
              id: transactionId,
              value: productPrice,
              currency: 'USD',
              product_id: product?.id ?? '',
              has_coupon: !!couponDetails,
            },
          },
        });

        if (product && transactionId) {
          const item: CheckoutItem = {
            id: product.id ?? '',
            name: 'displayName' in product ? product.displayName || product.name || '' : product.name || '',
            price: productPrice,
            quantity: 1,
          };

          // Get product and survey categories
          const productCategory = getProductCategory(product);
          console.log('PRICE SENT IN TRACK PURCHASE FUNCTION IN CHECKOUT FORM ===>', productPrice);
          // at this point the prices are in cents
          trackPurchase({
            transactionId: transactionId,
            value: productPrice,
            currency: 'USD',
            items: [item],
            productCategory,
          });

          // Microsoft UET Purchase tracking moved to checkout success page to prevent duplicates
        } else {
          console.warn('Product or transaction ID not available for Purchase tracking');
        }
        const showVideoConsultation =
          !!videoVisistsAllowedStates?.[getValues('shipping_state') as keyof typeof videoVisistsAllowedStates];

        dispatch(
          setCheckout({
            medicalFormUrl: data?.medicalFormUrl || 'https://lumimeds.telepath.clinic/signup',
            telepathInstructionsUrl: data?.telepathInstructionsUrl || ROUTES.CARE_PORTAL,
            intakeAmount: amount,
            product: checkoutData?.product || product,
            invoiceId: transactionId,
            customerId,
            subscriptionIds,
            showVideoConsultation,
            paymentMethod,
            userEmail,
            ...(couponDetails && { ...couponDetails }),
          })
        );
        dispatch(setAnswers([]));
        dispatch(clearCheckout());
        localStorage.setItem(STORAGE_STEP_KEY, '1');
        // Preserve URL params (priceId, mode, source, flow) when redirecting to success page
        const currentParams = new URLSearchParams();
        if (priceId) currentParams.set('priceId', priceId);
        if (flow) currentParams.set('flow', flow);
        if (source) currentParams.set('source', source);
        // Get mode from URL if available
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const mode = urlParams.get('mode');
          if (mode) currentParams.set('mode', mode);
        }
        const paramsString = currentParams.toString();
        startTransition(() => router.replace(ROUTES.CHECKOUT_SUCCESS + (paramsString ? '?' + paramsString : '')));
      } else {
        // Log submission update failure but checkout still succeeded
        Sentry.addBreadcrumb({
          category: 'checkout',
          message: 'Intake submission failed',
          level: 'warning',
          data: {
            error_message: message || 'Error Updating Submission',
          },
        });

        // Capture warning event - checkout succeeded but submission update failed
        const userEmail = getValues('email') || checkoutData?.patient?.email || checkoutUser?.email || '';
        Sentry.captureMessage(' Checkout completed with Intake submission failed', {
          level: 'warning',
          tags: {
            checkout_action: 'checkout_success_Intake_submission_failure',
            flow_type: flow || 'standard',
            payment_method: paymentMethod,
            userEmail,
          },
          contexts: {
            checkout: {
              product_id: product?.id ?? '',
              submission_id: checkoutData?.submissionId || submissionId,
              has_coupon: !!couponDetails,
              payment_method: paymentMethod,
            },
          },
        });

        toast.error(message || 'Error Updating Submission');
      }
    } catch (err) {
      // Capture error that occurred after payment succeeded
      const userEmail = getValues('email') || checkoutData?.patient?.email || checkoutUser?.email || '';
      Sentry.captureException(err, {
        tags: {
          checkout_action: 'checkout_success',
          flow_type: flow || 'standard',
          userEmail,
        },
        contexts: {
          checkout: {
            product_id: product?.id ?? '',
            submission_id: checkoutData?.submissionId || submissionId,
            has_coupon: !!couponDetails,
            payment_method: paymentMethod,
          },
        },
      });

      toast.error((err as Error).data?.message || 'Unable to Save address');
    } finally {
      setCheckoutLoading(false);
    }
  }

  const totalAmount = useMemo(() => {
    const baseAmount = amount || product?.prices?.[0]?.amount || 0;

    if (couponDetails) {
      const convertedAmount = Number(couponDetails?.amountAfterDiscount ?? 0).toFixed(2);

      return `$${convertedAmount}`;
    }

    return amount ? formatToUSD(amount) : `$${baseAmount}.00`;
  }, [amount, couponDetails, product?.prices]);

  const backUrl = useMemo(() => {
    // Read params from current URL
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const sourceParam = source || urlParams?.get('source');
    const saleTypeParam = urlParams?.get('sale_type');
    const overrideTimeParam = urlParams?.get('overrideTime');

    if (flow === 'pfa') {
      const params = new URLSearchParams();
      if (flow) params.set('flow', flow);
      if (sourceParam) params.set('source', sourceParam);
      if (saleTypeParam) params.set('sale_type', saleTypeParam);
      if (overrideTimeParam) params.set('overrideTime', overrideTimeParam);
      return params.toString() ? `${ROUTES.PATIENT_INTAKE}?${params.toString()}` : ROUTES.PATIENT_INTAKE;
    } else {
      const baseUrl =
        sourceParam === 'google-merchant' ? ROUTES.PRODUCT_SUMMARY_GOOGLE_MERCHANT : ROUTES.PRODUCT_SUMMARY;
      const params = new URLSearchParams();
      if (sourceParam === 'google-merchant') params.set('source', 'google-merchant');
      if (saleTypeParam) params.set('sale_type', saleTypeParam);
      if (overrideTimeParam) params.set('overrideTime', overrideTimeParam);
      return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
    }
  }, [flow, source]);

  const onChangeWrapper = ({
    key,
    value,
    billingkey,
  }: {
    key: keyof CheckoutvalidationSchema;
    value: string;
    billingkey: keyof CheckoutvalidationSchema;
  }) => {
    if (isSameAsShippingAddress) setValue(billingkey, value);

    setValue(key, value, { shouldValidate: true });
  };

  useEffect(() => {
    if (checkoutData) {
      if (checkoutData?.product) {
        dispatch(setProductType(checkoutData?.product));
      }

      dispatch(setCheckoutUser({ ...checkoutData?.patient, patientId: '' }));
      dispatch(setSubmissionId(checkoutData?.submissionId));
    }
  }, [checkoutData, dispatch]);

  useEffect(() => {
    setIsApplyingCoupon(!!coupon);
  }, [coupon]);

  // Preserve URL params in the URL bar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentParams = new URLSearchParams(window.location.search);
      let paramsChanged = false;

      // Add priceId if provided as prop and missing from URL
      if (priceId && currentParams.get('priceId') !== priceId) {
        currentParams.set('priceId', priceId);
        paramsChanged = true;
      }

      // Add flow if provided as prop and missing from URL
      if (flow && currentParams.get('flow') !== flow) {
        currentParams.set('flow', flow);
        paramsChanged = true;
      }

      // Add source if provided as prop and missing from URL
      // Also check if source exists in URL but not as prop (fallback)
      const sourceToUse = source || currentParams.get('source');
      if (sourceToUse && currentParams.get('source') !== sourceToUse) {
        currentParams.set('source', sourceToUse);
        paramsChanged = true;
      }

      // Preserve all existing params (mode, etc.) - don't remove them
      // The currentParams already contains them from window.location.search

      if (paramsChanged) {
        const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
        router.replace(newUrl, { scroll: false });
      }
    }
  }, [priceId, flow, source, router]);

  // Keep activeTokenRef in sync with currentToken to track the latest session
  useEffect(() => {
    activeTokenRef.current = currentToken;
  }, [currentToken]);

  useEffect(() => {
    handleLoadCheckoutData();
  }, [checkoutUser, router, checkoutData, dispatch, selectedproduct]);

  // Initialize Sentry context and transaction - only when product data changes
  useEffect(() => {
    const productData = checkoutData?.product || selectedproduct;

    if (productData) {
      // Set user context for Sentry
      Sentry.setUser({
        email: checkoutData?.patient?.email || checkoutUser?.email || undefined,
        id: checkoutUser?.patientId || undefined,
      });

      // Set custom context
      Sentry.setContext('checkout', {
        flow_type: flow || 'standard',
        source: source || 'unknown',
        product_id: productData.id || '',
        product_name: productData.name || '',
        product_price: productData.prices?.[0]?.amount || 0,
        price_id: priceId || productData.prices?.[0]?.priceId || '',
        submission_id: submissionId || checkoutData?.submissionId || '',
      });

      // Start Sentry transaction for performance monitoring
      // Using startInactiveSpan for manual control of span lifecycle
      const span = Sentry.startInactiveSpan({
        name: 'Checkout Flow',
        op: 'checkout.flow',
        attributes: {
          'checkout.flow': flow || 'standard',
          'product.name': productData.name || '',
          'product.id': productData.id || '',
        },
      });

      sentryTransactionRef.current = {
        startChild: (options) => {
          return Sentry.startInactiveSpan({
            name: options.description || options.op,
            op: options.op,
            attributes: (options.data || {}) as SpanAttributes,
          });
        },
        finish: () => {
          span?.end();
        },
      };

      // Add breadcrumb for checkout initiation
      Sentry.addBreadcrumb({
        category: 'checkout',
        message: 'Checkout initiated',
        level: 'info',
        data: {
          product_id: productData.id || '',
          product_name: productData.name || '',
          price: productData.prices?.[0]?.amount || 0,
          flow: flow || 'standard',
          source: source || 'unknown',
        },
      });

      // Track checkout initiation in Hotjar
      trackCheckoutInitiated([productData.id || ''], productData.prices?.[0]?.amount || 0, {
        productName: productData.name || '',
        flow: flow,
      });
    }

    // Cleanup: finish transaction on unmount
    return () => {
      if (sentryTransactionRef.current) {
        sentryTransactionRef.current.finish();
        sentryTransactionRef.current = null;
      }
    };
  }, [
    checkoutData?.product?.id,
    selectedproduct?.id,
    flow,
    source,
    priceId,
    checkoutData?.patient?.email,
    checkoutUser?.email,
    checkoutUser?.patientId,
    submissionId,
    checkoutData?.submissionId,
  ]);

  useEffect(() => {
    setisSameAsShippingAddress(true);
  }, []);

  // Auto-apply coupon code from URL or from coupons.json
  const couponAutoAppliedRef = useRef(false);
  useEffect(() => {
    // Wait for product to be ready before auto-applying coupon
    if (couponAutoAppliedRef.current || appliedCouponCode || !product?.prices?.[0]?.priceId) return;
    if (!isFormLoaded) return; //wait for the form to be loaded before applying the coupon
    // If couponCode is passed from URL, use that
    if (couponCode) {
      couponAutoAppliedRef.current = true;
      // Set the coupon code in the form
      setValue('coupon', couponCode);
      // Open the discount section
      setIsDiscountClicked(true);
      // Use requestAnimationFrame for better timing, then apply coupon
      requestAnimationFrame(() => {
        setTimeout(() => {
          handleApplyCoupon();
        }, 100);
      });
      return;
    }

    // Otherwise, check coupons.json for auto-apply coupons
    const priceId = product?.prices?.[0]?.priceId;
    const couponInfo = findCouponForPriceId(priceId);
    if (couponInfo) {
      couponAutoAppliedRef.current = true;
      // Set the coupon code in the form
      setValue('coupon', couponInfo.couponCode);
      // Open the discount section
      setIsDiscountClicked(true);
      // Use requestAnimationFrame for better timing, then apply coupon
      requestAnimationFrame(() => {
        setTimeout(() => {
          handleApplyCoupon();
        }, 100);
      });
    }
  }, [couponCode, appliedCouponCode, setValue, product?.prices, findCouponForPriceId, isFormLoaded]);

  const isStaging = process.env.NEXT_PUBLIC_ENV === 'staging';

  // Show skeleton loader while component is not mounted (during SSR)
  if (!mounted) {
    return (
      <main className='tw-container tw-px-4 tw-mx-auto tw-mt-0 lg:tw-mt-12 checkout-page'>
        <Link
          href={backUrl}
          className='tw-text-primary tw-inline-flex tw-items-center tw-gap-2 tw-no-underline tw-disabled:tw-pointer-events-none'
        >
          <FiArrowLeft size={20} />
          Back
        </Link>

        <div className='tw-block lg:tw-hidden tw-mt-8 tw-mb-4'>
          <p className={'tw-text-2xl tw-text-start tw-mb-8'}>Your Program Summary</p>
          <CheckoutProduct product={product} source={source} />
          <ProductSummaryItems />
        </div>
        <CheckoutFormSkeleton />
      </main>
    );
  }

  return (
    <main className='tw-container tw-px-4 tw-mx-auto tw-mt-0 lg:tw-mt-12 checkout-page'>
      <Link
        href={backUrl}
        className='tw-text-primary tw-inline-flex tw-items-center tw-gap-2 tw-no-underline tw-disabled:tw-pointer-events-none'
      >
        <FiArrowLeft size={20} />
        Back
      </Link>

      <div className='tw-block lg:tw-hidden tw-mt-8 tw-mb-4'>
        <p className={'tw-text-2xl tw-text-start tw-mb-8'}>Your Program Summary</p>
        <CheckoutProduct product={product} />
        <ProductSummaryItems />
      </div>
      <ElementsForm
        key={currentToken}
        checkoutSecureToken={currentToken}
        className='tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-4 sm:tw-gap-8 lg:tw-gap-36 tw-pb-16 tw-mt-10'
        baseUrl={isStaging ? 'https://cde.openpaystaging.com' : undefined}
        onLoadError={() => {
          // Ignore iframe load errors from stale / replaced sessions
          if (currentToken !== activeTokenRef.current) {
            Sentry.addBreadcrumb({
              category: 'checkout',
              message: 'Openpay load error ignored (stale session)',
              level: 'info',
              data: {
                expired_token: maskToken(currentToken),
                active_token: maskToken(activeTokenRef.current),
              },
            });
            return;
          }

          /**
           * IMPORTANT:
           * onLoadError is NOT a fatal state.
           * Openpay may retry internally and still succeed.
           * This callback is for diagnostics only.
           */

          Sentry.addBreadcrumb({
            category: 'checkout',
            message: 'Openpay secure form load error (non-fatal)',
            level: 'warning',
            data: {
              token: maskToken(currentToken),
              product_id: product?.id ?? '',
              flow_type: flow ?? 'standard',
              is_staging: isStaging,
            },
          });

          // No redirect
          // No toast
          // No state changes
        }}
        onChange={() => setCardErrorMessages(null)}
        onLoad={(amount) => {
          // Add breadcrumb for successful payment form load
          console.log('AMOUNT GOT FROM OPENPAY FORM LOAD ===>', amount);
          Sentry.addBreadcrumb({
            category: 'checkout',
            message: 'Payment form loaded successfully',
            level: 'info',
            data: {
              amount: amount ?? 0,
              token: maskToken(currentToken),
              product_id: product?.id ?? '',
            },
          });

          setAmount(amount ?? 0);
          dispatch(setIntakeAmount(amount));
          setIsFormLoaded(true);
        }}
        onCheckoutSuccess={handleCheckoutSuccess}
        onCheckoutStarted={() => {
          // Add breadcrumb for checkout start
          const userEmail = getValues('email') || checkoutData?.patient?.email || checkoutUser?.email || '';
          Sentry.addBreadcrumb({
            category: 'checkout',
            message: 'Checkout process started',
            level: 'info',
            data: {
              payment_method: paymentMethod,
              has_coupon: !!couponDetails,
              coupon_code: appliedCouponCode || undefined,
              product_id: product?.id ?? '',
              amount,
              user_email: userEmail,
            },
          });

          setCheckoutLoading(true);
        }}
        onCheckoutError={(message) => {
          // Get email from form or checkout data
          const userEmail = getValues('email') || checkoutData?.patient?.email || checkoutUser?.email || '';
          // Capture payment error in Sentry
          Sentry.captureMessage(`Checkout payment failure: ${userEmail}`, {
            level: 'error',
            tags: {
              checkout_action: 'payment_failure',
              flow_type: flow || 'standard',
              payment_method: paymentMethod,
              userEmail,
            },
            contexts: {
              checkout: {
                error_message: message,
                product_name: product?.name ?? '',
                has_coupon: !!couponDetails,
                checkout_data: checkoutData,
              },
            },
          });

          toast.error(getFriendlyPaymentErrorMessage(message), { duration: 8000 });
          setCheckoutLoading(false);
        }}
        onValidationError={(field: FieldName, errors: string[]) => {
          // Capture validation error in Sentry
          const userEmail = getValues('email') || checkoutData?.patient?.email || checkoutUser?.email || '';
          Sentry.captureMessage(`Card validation error on field: ${field}`, {
            level: 'warning',
            tags: {
              checkout_action: 'card_validation_error',
              flow_type: flow || 'standard',
              validation_field: field,
              userEmail,
            },
            contexts: {
              checkout: {
                field: field,
                errors: errors,
                payment_method: paymentMethod,
              },
            },
          });

          setError(field as keyof CheckoutvalidationSchema, { message: errors.join(', ') });

          if (['cardExpiry', 'cardCvc', 'cardNumber'].includes(field)) {
            if (errors.length > 0) {
              setCardErrorMessages({
                ...cardErrorMessages,
                [field]: errors.join(''),
              });
            } else {
              setCardErrorMessages((prev) => {
                if (!prev) return null;
                const newErrs = { ...prev };
                const cardField = field as unknown as keyof CardErrorMessage;
                if (cardField in newErrs) delete newErrs[cardField];
                return Object.keys(newErrs).length > 0 ? newErrs : null;
              });
            }
          }

          setCheckoutLoading(false);
        }}
      >
        {({ klarna, submit, applePay, googlePay }) => (
          <>
            <div className='tw-flex-grow tw-flex tw-flex-col tw-gap-y-6'>
              <div className='tw-flex tw-flex-col tw-gap-y-6'>
                <div className='tw-flex tw-flex-col tw-gap-y-3'>
                  <div className='tw-flex tw-justify-between tw-items-end tw-flex-wrap'>
                    <p className='m-0 tw-text-3xl'>Contact Information</p>
                    <div className='tw-flex tw-items-center tw-gap-3'>
                      <span>Already Have an Account?</span>
                      <Link href={ROUTES.PATIENT_LOGIN} className='tw-text-primary'>
                        Login
                      </Link>
                    </div>
                  </div>

                  <div>
                    <CheckoutFormInput
                      label='Email'
                      type='email'
                      {...register('email')}
                      openPayId={FieldName.EMAIL}
                      required
                    />
                    {!!errors.email && <span className='tw-text-red-500 tw-text-sm'>{errors.email.message}</span>}
                    <div className='text-sm mt-1 text-muted'>
                      If you do not have an account, we will create one for you.
                    </div>
                  </div>
                  <Controller
                    name='phone'
                    control={control}
                    render={({ field }) => (
                      <CheckoutFormInput
                        label='Phone Number'
                        type='tel'
                        required
                        data-opid={FieldName.PHONE}
                        {...field}
                        value={formatUSPhoneWithoutPlusOne(field.value ?? '')}
                        onChange={(e) => {
                          const phone = custonmPhoneInputOnChange(e);
                          setValue('phone', phone, { shouldValidate: true });
                        }}
                        onKeyDown={custonmPhoneInputOnKeyChange}
                      />
                    )}
                  />
                  {!!errors.phone && <span className='tw-text-red-500 tw-text-sm'>{errors.phone.message}</span>}
                </div>
                <div className='tw-flex tw-flex-col tw-gap-y-3'>
                  <div className=''>
                    <div className='d-flex justify-content-between checkout-shipping-header'>
                      <p className='m-0 tw-text-3xl flex-shrink-0'>Shipping Address</p>
                    </div>
                  </div>

                  <div className='row g-3'>
                    <div className='col-md-6'>
                      <CheckoutFormInput
                        required
                        label='First Name'
                        {...register('shipping_firstName')}
                        onChange={(e) =>
                          onChangeWrapper({
                            key: 'shipping_firstName',
                            value: e.target.value,
                            billingkey: 'firstName',
                          })
                        }
                      />
                      {!!errors.shipping_firstName && (
                        <span className='tw-text-red-500 tw-text-sm'>{errors.shipping_firstName.message}</span>
                      )}
                    </div>
                    <div className='col-md-6'>
                      <CheckoutFormInput
                        label='Last Name'
                        required
                        {...register('shipping_lastName')}
                        onChange={(e) =>
                          onChangeWrapper({ key: 'shipping_lastName', value: e.target.value, billingkey: 'lastName' })
                        }
                      />
                      {!!errors.shipping_lastName && (
                        <span className='tw-text-red-500 tw-text-sm'>{errors.shipping_lastName.message}</span>
                      )}
                    </div>
                    <div className='col-12'>
                      <CheckoutFormInput
                        label='Address'
                        required
                        {...register('shipping_address')}
                        onChange={(e) =>
                          onChangeWrapper({
                            key: 'shipping_address',
                            value: e.target.value,
                            billingkey: 'billing_address',
                          })
                        }
                        placeholder={'Street address, house number, or P.O. Box'}
                      />
                      {!!errors.shipping_address && (
                        <span className='tw-text-red-500 tw-text-sm'>{errors.shipping_address.message}</span>
                      )}
                    </div>
                    <div className='col-12'>
                      <CheckoutFormInput
                        label='Apartment, suite, etc. (optional)'
                        {...register('shipping_address2')}
                        onChange={(e) =>
                          onChangeWrapper({
                            key: 'shipping_address2',
                            value: e.target.value,
                            billingkey: 'billing_address2',
                          })
                        }
                        placeholder={'Apartment, suite, building, floor, or landmark'}
                      />
                    </div>
                    <div className='col-12 col-md-4'>
                      <CheckoutFormInput
                        label='City'
                        required
                        {...register('shipping_city')}
                        onChange={(e) =>
                          onChangeWrapper({ key: 'shipping_city', value: e.target.value, billingkey: 'billing_city' })
                        }
                      />
                      {!!errors.shipping_city && (
                        <span className='tw-text-red-500 tw-text-sm'>{errors.shipping_city.message}</span>
                      )}
                    </div>
                    <div className='col-12 col-md-4'>
                      <CheckoutReactSelect
                        placeholder={''}
                        label='State'
                        required
                        options={stateOptions}
                        value={
                          watch('shipping_state')
                            ? { value: watch('shipping_state'), label: watch('shipping_state') }
                            : null
                        }
                        onBlur={() => {
                          setValue('shipping_state', watch('shipping_state'));
                        }}
                        onChange={(option) => {
                          const { value } = option as OptionValue;
                          setValue('shipping_state', value as string, { shouldValidate: true });

                          if (isSameAsShippingAddress) setValue('billing_state', value as string);
                        }}
                        isSearchable
                        styles={{
                          control: (baseStyles) => ({
                            ...baseStyles,
                            width: '100%',
                            borderRadius: '6px',
                            borderColor: 'black',
                          }),
                          singleValue: (baseStyles) => ({
                            ...baseStyles,
                          }),
                          indicatorSeparator: () => ({
                            display: 'none',
                          }),
                        }}
                      />
                      {!!errors.shipping_state && (
                        <span className='tw-text-red-500 tw-text-sm'>{errors.shipping_state.message}</span>
                      )}
                    </div>
                    <div className='col-12 col-md-4'>
                      <CheckoutFormInput
                        label='Zip Code'
                        required
                        {...register('shipping_zipCode')}
                        onChange={(e) =>
                          onChangeWrapper({ key: 'shipping_zipCode', value: e.target.value, billingkey: 'zipCode' })
                        }
                      />
                      {!!errors.shipping_zipCode && (
                        <span className='tw-text-red-500 tw-text-sm'>{errors.shipping_zipCode.message}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className={`tw-flex tw-flex-col tw-gap-y-6 tw-relative`}>
                {isCreatingSession && (
                  <div className='tw-absolute tw-inset-0 tw-bg-white/80 tw-z-10 tw-flex tw-items-center tw-justify-center tw-rounded-lg'>
                    <div className='tw-flex tw-items-center tw-gap-2'>
                      <Spinner size='sm' />
                      <span className='tw-text-gray-600'>Loading Payment Options ...</span>
                    </div>
                  </div>
                )}
                <div className='tw-flex tw-flex-col  tw-gap-3'>
                  <p className='m-0 tw-text-3xl'>Payments</p>
                  {applePay?.isAvailable ||
                    googlePay?.isAvailable ||
                    (klarna?.isAvailable && <span className='tw-text-1xl  text-muted'></span>)}
                  <div className='tw-flex tw-gap-2 tw-flex-wrap'>
                    {product?.metadata?.isKlarnaEnabled && source !== GOOGLE_MERCHANT_SOURCE && (
                      <ExpressCheckoutWidget
                        selected={paymentMethod === 'Klarna'}
                        onClick={() => {
                          if (klarna?.startFlow) {
                            setPaymentMethod('Klarna');

                            // Add breadcrumb for Klarna payment method selection
                            Sentry.addBreadcrumb({
                              category: 'checkout',
                              message: 'Payment method selected',
                              level: 'info',
                              data: {
                                payment_method: 'Klarna',
                              },
                            });

                            handleSubmit(() => klarna.startFlow());
                          }
                        }}
                        className=' tw-bg-pink-400 tw-text-black tw-flex-grow'
                        icon={
                          <span className='d-flex align-items-center tw-gap-1'>
                            <SiKlarna /> <span className='fw-semibold'>Klarna</span>
                          </span>
                        }
                      />
                    )}
                    {applePay?.isAvailable && (
                      <ExpressCheckoutWidget
                        selected={paymentMethod === 'Apple Pay'}
                        onClick={() => {
                          if (applePay?.startFlow) {
                            // Add breadcrumb for Apple Pay payment method selection
                            Sentry.addBreadcrumb({
                              category: 'checkout',
                              message: 'Payment method selected',
                              level: 'info',
                              data: {
                                payment_method: 'Apple Pay',
                              },
                            });

                            handleSubmit(() => {
                              applePay.startFlow();

                              setPaymentMethod('Apple Pay');
                            });
                          }
                        }}
                        className=' bg-dark apple-pay-widget tw-flex-grow '
                        icon={
                          <span className='d-flex align-items-center tw-gap-1 tw-text-white '>
                            <FaApple /> <span className='fw-semibold'>Pay</span>
                          </span>
                        }
                      />
                    )}

                    {googlePay?.isAvailable && (
                      <ExpressCheckoutWidget
                        selected={paymentMethod === 'Google Pay'}
                        onClick={() => {
                          if (googlePay?.startFlow) {
                            setPaymentMethod('Google Pay');

                            // Add breadcrumb for Google Pay payment method selection
                            Sentry.addBreadcrumb({
                              category: 'checkout',
                              message: 'Payment method selected',
                              level: 'info',
                              data: {
                                payment_method: 'Google Pay',
                              },
                            });

                            handleSubmit(() => googlePay.startFlow());
                          }
                        }}
                        className=' bg-dark  tw-flex-grow '
                        icon={
                          <span className='d-flex align-items-center tw-gap-1 tw-text-white'>
                            <FcGoogle /> <span className='fw-semibold google-pay'>Pay</span>
                          </span>
                        }
                      />
                    )}
                  </div>
                </div>

                {applePay?.isAvailable || googlePay?.isAvailable || (product?.metadata?.isKlarnaEnabled && source !== GOOGLE_MERCHANT_SOURCE) ? (
                  <PaymentMethodDivider label='OR' />
                ) : (
                  <></>
                )}

                <div className='tw-flex tw-flex-col tw-gap-4'>
                  <div className='form-control checkout-input-wrapper'>
                    <label className=' text-sm  text-muted text-sm form-label mb-0 text-sm d-block text-muted'>
                      Card Number
                    </label>
                    <div className='mt-2'>
                      <CardNumberElement
                        styles={{
                          color: 'black',
                        }}
                      />
                    </div>
                  </div>
                  {!!cardErrorMessages?.cardNumber && (
                    <span className='tw-text-red-500 tw-text-sm'>{cardErrorMessages.cardNumber}</span>
                  )}

                  <div className='d-flex gap-3 flex-column flex-sm-row'>
                    <div className='tw-flex-grow'>
                      <div className='form-control checkout-input-wrapper'>
                        <label className='text-sm  text-muted text-sm form-label mb-0 text-sm d-block text-muted'>
                          Expiration Date(MM/YY)
                        </label>
                        <div className='mt-2'>
                          <CardExpiryElement
                            styles={{
                              color: 'black',
                            }}
                          />
                        </div>
                      </div>
                      {!!cardErrorMessages?.cardExpiry && (
                        <span className='tw-text-red-500 tw-text-sm'>{cardErrorMessages.cardExpiry}</span>
                      )}
                    </div>
                    <div className='tw-flex-grow'>
                      <div className='form-control checkout-input-wrapper'>
                        <label className='text-sm mb-2 text-muted text-sm form-label text-sm d-block text-muted'>
                          Security Code (CVV)
                        </label>

                        <div className='tw-flex tw-items-center tw-gap-2'>
                          <div className='tw-flex-grow'>
                            <CardCvcElement styles={{ color: 'black' }} />
                          </div>
                          <CvcIcon className='tw-pointer-events-none tw-flex-shrink-0' width={30} height={20} />
                        </div>
                      </div>

                      {!!cardErrorMessages?.cardCvc && (
                        <span className='tw-text-red-500 tw-text-sm'>{cardErrorMessages.cardCvc}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className='tw-flex tw-flex-col tw-gap-3'>
                <div className='d-flex justify-content-between align-items-center flex-wrap tw-gap-2 tw-md:gap-1'>
                  <p className='m-0 tw-text-1xl tw-font-semibold'>Billing Address</p>
                  <label htmlFor='same-address' className='d-flex align-items-center gap-2'>
                    <input
                      className={'c_checkbox'}
                      type='checkbox'
                      checked={isSameAsShippingAddress}
                      onChange={handlesameAsShippingAddress}
                      id='same-address'
                    />
                    <span className={'text-xs'}>Use shipping address as billing address</span>
                  </label>
                </div>
                <div
                  className={`${!isSameAsShippingAddress ? 'tw-visible tw-h-fit' : 'tw-invisible tw-h-0 tw-overflow-hidden'
                    }`}
                >
                  <div className='row g-3'>
                    <CheckoutInput hidden value={'US'} openPayId={FieldName.COUNTRY} />
                    <div className='col-md-6'>
                      <CheckoutFormInput
                        label='First Name'
                        required
                        {...register('firstName')}
                        openPayId={FieldName.FIRST_NAME}
                      />
                      {!!errors.firstName && (
                        <span className='tw-text-red-500 tw-text-sm'>{errors.firstName.message}</span>
                      )}
                    </div>
                    <div className='col-md-6'>
                      <CheckoutFormInput
                        label='Last Name'
                        required
                        {...register('lastName')}
                        openPayId={FieldName.LAST_NAME}
                      />
                      {!!errors.lastName && (
                        <span className='tw-text-red-500 tw-text-sm'>{errors.lastName.message}</span>
                      )}
                    </div>
                    <div className='col-12'>
                      <CheckoutFormInput
                        label='Address'
                        required
                        {...register('billing_address')}
                        openPayId={'line1'}
                        placeholder={'Street address, house number, or P.O. Box'}
                      />
                      {!!errors.billing_address && (
                        <span className='tw-text-red-500 tw-text-sm'>{errors.billing_address.message}</span>
                      )}
                    </div>
                    <div className='col-12'>
                      <CheckoutFormInput
                        required
                        label='Apartment, suite, etc. (optional)'
                        {...register('billing_address2')}
                        openPayId={'line2'}
                        placeholder={'Apartment, suite, building, floor, or landmark'}
                      />
                      {!!errors.billing_address2 && (
                        <span className='tw-text-red-500 tw-text-sm'>{errors.billing_address2.message}</span>
                      )}
                    </div>
                    <div className='col-12 col-md-4'>
                      <CheckoutFormInput
                        label='City'
                        required
                        {...register('billing_city')}
                        openPayId={FieldName.CITY}
                      />
                      {!!errors.billing_city && (
                        <span className='tw-text-red-500 tw-text-sm'>{errors.billing_city.message}</span>
                      )}
                    </div>
                    <div className='col-12 col-md-4'>
                      <CheckoutInput {...register('billing_state')} hidden openPayId={FieldName.STATE} />
                      <CheckoutReactSelect
                        onBlur={() => {
                          setValue('billing_state', watch('billing_state'));
                        }}
                        label='State'
                        placeholder={''}
                        required
                        options={stateOptions}
                        value={
                          watch('billing_state')
                            ? { value: watch('billing_state'), label: watch('billing_state') }
                            : undefined
                        }
                        onChange={(option) => {
                          const { value } = option as OptionValue;
                          setValue('billing_state', value as string, { shouldValidate: true });
                        }}
                        isSearchable
                        styles={{
                          control: (baseStyles) => ({
                            ...baseStyles,
                            width: '100%',
                            borderRadius: '6px',
                            borderColor: 'black',
                          }),
                          singleValue: (baseStyles) => ({
                            ...baseStyles,
                          }),
                          indicatorSeparator: () => ({
                            display: 'none',
                          }),
                        }}
                      />

                      {!!errors.billing_state && (
                        <span className='tw-text-red-500 tw-text-sm'>{errors.billing_state.message}</span>
                      )}
                    </div>
                    <div className='col-12 col-md-4'>
                      <CheckoutFormInput
                        required
                        label='ZIP Code'
                        {...register('zipCode')}
                        openPayId={FieldName.ZIP_CODE}
                        maxLength={5}
                        inputMode='numeric'
                        pattern='\d*'
                        onInput={(e) => {
                          const input = e.target as HTMLInputElement;
                          input.value = input.value.replace(/[^0-9]/g, '');
                        }}
                      />

                      {!!errors.zipCode && <span className='tw-text-red-500 tw-text-sm'>{errors.zipCode.message}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='tw-flex tw-flex-col tw-gap-y-4'>
              <p className={'m-0 tw-text-2xl sm:tw-text-4xl tw-text-start tw-hidden lg:tw-block'}>
                Your Program Summary
              </p>
              <div className='tw-hidden lg:tw-block'>
                <CheckoutProduct product={product} source={source} />
                <ProductSummaryItems />
              </div>
              <div>
                <button
                  type='button'
                  className='mb-2 text-sm btn btn-link p-0 text-muted'
                  onClick={() => setIsDiscountClicked((prev) => !prev)}
                >
                  Discount Code{isDiscountClicked ? '' : '?'}
                </button>
                {/* Coupon is now applied via new checkout session, no need to send to OpenPay */}
                <Collapse in={isDiscountClicked}>
                  <div>
                    {!couponDetails ? (
                      <div className='tw-flex tw-items-center tw-gap-3'>
                        <CheckoutFormInput {...register('coupon')} placeholder='Enter coupon code' />
                        <button
                          type='button'
                          onClick={handleApplyCoupon}
                          disabled={isLoading || isCreatingSession || !watch('coupon')}
                          className='btn btn-primary rounded-pill d-flex align-items-center justify-content-center gap-2 text-nowrap py-2 px-4'
                        >
                          {(isLoading || isCreatingSession) && <Spinner size='sm' />}
                          Apply
                        </button>
                      </div>
                    ) : (
                      <div className='tw-space-y-3'>
                        <div className='tw-flex tw-items-center tw-justify-between tw-p-3 tw-bg-green-50 tw-border tw-border-green-200 tw-rounded'>
                          <div className='tw-flex tw-items-center tw-gap-2'>
                            <svg
                              className='tw-w-5 tw-h-5 tw-text-green-600'
                              fill='none'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth='2'
                              viewBox='0 0 24 24'
                              stroke='currentColor'
                            >
                              <path d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'></path>
                            </svg>
                            <div>
                              <p className='m-0 tw-text-sm tw-font-semibold tw-text-green-800'>
                                Coupon &ldquo;{appliedCouponCode}&rdquo; applied
                              </p>
                              <p className='m-0 tw-text-xs tw-text-green-600'>
                                {couponDetails.discountType === 'percentage'
                                  ? couponDetails.originalAmount > 0
                                    ? `${Math.round(
                                      (Number(couponDetails.discountAmount) / Number(couponDetails.originalAmount)) *
                                      100
                                    )}% off`
                                    : 'Discount applied'
                                  : `$${Number(couponDetails.discountAmount).toFixed(2)} off`}
                              </p>
                            </div>
                          </div>
                          <button
                            type='button'
                            onClick={handleRemoveCoupon}
                            className='tw-text-green-700 hover:tw-text-green-900 tw-text-sm tw-font-medium tw-underline'
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </Collapse>
              </div>

              <div className='tw-flex tw-justify-between tw-items-center'>
                <p className='m-0 tw-text-2xl'>Total</p>
                <p className='m-0 tw-text-2xl tw-font-bold'>{totalAmount}</p>
              </div>

              <div>
                <button
                  className='btn btn-primary rounded-pill !tw-py-[11px] w-100 fw-bold d-flex align-items-center justify-content-center gap-2'
                  disabled={checkoutLoading || isApplyingCoupon || isUpdatingSurvey || isPending || isCreatingSession}
                  onClick={() => {
                    setPaymentMethod('Card');

                    // Add breadcrumb for Card payment method selection
                    Sentry.addBreadcrumb({
                      category: 'checkout',
                      message: 'Payment method selected',
                      level: 'info',
                      data: {
                        payment_method: 'Card',
                        has_coupon: !!couponDetails,
                      },
                    });

                    handleSubmit(() => submit());
                  }}
                >
                  {(checkoutLoading || isUpdatingSurvey || isPending) && paymentMethod === 'Card' && (
                    <Spinner size='sm' />
                  )}
                  {(checkoutLoading || isUpdatingSurvey || isPending) && paymentMethod === 'Card'
                    ? 'Checkout Processing...'
                    : 'Checkout'}
                </button>
              </div>

              {/* Trustpilot Widget */}
              <div className='mt-3'>
                <TrustpilotWidget className='w-100' trustpilotData={trustpilotData} />
              </div>

              <p className='m-0 tw-text-xs'>
                Payment will be collected at the time of checkout. If you are not approved for medication, a full refund
                will be issued. Please ensure that you complete the medical intake form following your purchase. A $100
                non-refundable cancellation fee applies to all orders canceled for reasons other than non-approval.
                Orders cannot be canceled once they have been submitted to the pharmacy.
              </p>

              <p className='m-0 tw-text-xs'>
                Your personal data will be used to process your order, support your experience throughout this website,
                and for other purposes described in our{' '}
                <Link target='_blank' href={'/privacypolicy'} className='tw-text-primary tw-underline'>
                  privacy policy
                </Link>
                .
              </p>
              <label className='tw-space-x-3 tw-leading-[1rem]'>
                <input className={'c_checkbox tw-translate-y-1'} required checked type='checkbox' />
                <span className='tw-text-xs '>
                  I acknowledge and consent to the{' '}
                  <Link target='_blank' href={'/termsofuse'} className='tw-text-primary tw-underline'>
                    Terms of Use
                  </Link>{' '}
                  and{' '}
                  <Link target='_blank' href={'/memberterms'} className='tw-text-primary tw-underline'>
                    Membership Terms and Conditions
                  </Link>
                  . I authorize Lumimeds to charge the payment method on file and understand that my subscription will
                  automatically renew each cycle until canceled.
                </span>
              </label>
              <label className='tw-space-x-3 tw-leading-[1rem]'>
                <input className={'c_checkbox tw-translate-y-1'} required checked type='checkbox' />
                <span className='tw-text-xs'>
                  I consent to receive marketing and SMS communications on offers from LumiMeds.{' '}
                  <span className='tw-text-red-600'>*</span>
                </span>
              </label>
              <p className='m-0 tw-text-xs'>*Message And Data Rates May Apply.</p>
            </div>
          </>
        )}
      </ElementsForm>
    </main>
  );
}
