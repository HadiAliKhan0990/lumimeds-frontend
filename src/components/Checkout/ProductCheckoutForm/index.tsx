'use client';

import * as Sentry from '@sentry/nextjs';
import toast from 'react-hot-toast';
import CheckoutInput, { CheckoutFormInput, CheckoutReactSelect } from '@/components/elements/CheckoutInput';
import CvcIcon from '@/components/Icon/CvcIcon';
import Link from 'next/link';
import TrustpilotWidget from '@/components/Home/Hero/TrustpilotWidget';
import videoVisistsAllowedStates from '@/data/videoVisitsAllowedStates.json';
import { CheckoutvalidationSchema, checkoutvalidationSchema } from '@/lib/schema/checkout';
import { CardErrorMessage, Error, OptionValue, PaymentMethod } from '@/lib/types';
import { GetCheckoutDataById } from '@/services/checkout/types';
import { fetchTrustpilotData, TrustpilotData } from '@/services/trustpilot';
import { AppDispatch } from '@/store';
import { setCheckout, setIntakeAmount } from '@/store/slices/checkoutSlice';
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  ElementsForm,
  FieldName,
} from '@getopenpay/openpay-js-react';
import { ErrorMessage, Form, Formik, FormikProps } from 'formik';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useDispatch } from 'react-redux';
import { formatToUSD, formatUSPhoneWithoutPlusOne, getFriendlyPaymentErrorMessage } from '@/lib/helper';
import { CheckoutProduct } from '@/components/Checkout/CheckoutProduct';
import { Collapse, Spinner } from 'react-bootstrap';
import {
  CouponDataType,
  useApplyCouponMutation,
  useCancelSubscriptionMutation,
  useCreateOrUpdatePatientMutation,
  useCreateCheckoutSessionMutation,
} from '@/store/slices/checkoutApiSlice';
import { isAxiosError } from 'axios';
import { CheckoutItem, trackPurchase } from '@/lib/tracking';
import { getProductCategory } from '@/lib/trackingHelpers';
import { trackSurveyAnalytics } from '@/helpers/surveyTracking';
import { ROUTES } from '@/constants';
import { useStates } from '@/hooks/useStates';
import { ProductSummaryItems } from '../ProductSummaryItems';
import { ExpressCheckoutWidget } from '../ExpressCheckoutWidget';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { SiKlarna } from 'react-icons/si';
import { PaymentMethodDivider } from '../PaymentMethodDivider';
import { custonmPhoneInputOnChange, custonmPhoneInputOnKeyChange } from '@/components/elements/Inputs/CustomPhoneInput';

// Extract proper types from Sentry's span
type SentrySpan = ReturnType<typeof Sentry.startInactiveSpan>;
// SpanStatus type from Sentry (not directly exported, so we use type assertion)
type SpanStatus = Parameters<NonNullable<SentrySpan>['setStatus']>[0];

interface SentryTransactionRef {
  startChild: (options: {
    op: string;
    description: string;
    data?: Record<string, unknown>;
  }) => SentrySpan | undefined;
  finish: () => void;
}

interface Props {
  checkoutData: GetCheckoutDataById;
}

export default function ProductCheckoutForm({ checkoutData }: Readonly<Props>) {
  const { stateOptions } = useStates();
  const router = useRouter();
  const searchParams = useSearchParams();
  const overrideTime = searchParams.get('overrideTime') === 'true';
  const dispatch = useDispatch<AppDispatch>();
  const formikRef = useRef<FormikProps<CheckoutvalidationSchema>>(null);
  const submitRef = useRef<(() => void) | null>(null);

  // Sentry transaction ref for performance monitoring
  const sentryTransactionRef = useRef<SentryTransactionRef | null>(null);

  const [amount, setAmount] = useState(0);
  const [cardErrorMessages, setCardErrorMessages] = useState<CardErrorMessage | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Card');
  const [couponDetails, setCouponDetails] = useState<CouponDataType>();
  const [appliedCouponCode, setAppliedCouponCode] = useState<string>('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [existingSubscriptionId, setExistingSubscriptionId] = useState<string | null>(null);
  const [trustPilotData, setTrustPilotData] = useState<TrustpilotData | null>(null);

  const [isDiscountClicked, setIsDiscountClicked] = useState(false);

  const [isPending, startTransition] = useTransition();

  const [mutateAsync, { isLoading: isLoadingApplyCoupon }] = useApplyCouponMutation();
  const [createPatient, { isLoading: isCreatingPatient }] = useCreateOrUpdatePatientMutation();
  const [cancelSubscription, { isLoading: isCancellingSubscription }] = useCancelSubscriptionMutation();
  const [createCheckoutSession, { isLoading: isCreatingSession }] = useCreateCheckoutSessionMutation();

  const [currentToken, setCurrentToken] = useState(checkoutData.token);

  const { product } = checkoutData || {};

  const initialValues: CheckoutvalidationSchema = {
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    billing_address: '',
    billing_address2: '',
    billing_city: '',
    billing_state: '',
    zipCode: '',
    shipping_firstName: '',
    shipping_lastName: '',
    shipping_address: '',
    shipping_address2: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zipCode: '',
    sameAsShippingAddress: true,
  };

  const setIsSameBillingAddress = (v: boolean) => formikRef?.current?.setFieldValue('sameAsShippingAddress', v);

  const handleApplyCoupon = useCallback(async () => {
    // Start performance span for coupon application
    const span = sentryTransactionRef.current?.startChild({
      op: 'api.mutation',
      description: 'Apply coupon code',
    });

    try {
      const price_id = product?.prices?.[0].priceId;
      const couponCode = formikRef.current?.values.coupon?.trim();
      const email = formikRef.current?.values.email || '';

      if (!couponCode) {
        // Log missing coupon code
        Sentry.addBreadcrumb({
          category: 'checkout',
          message: 'Coupon application attempted without code',
          level: 'warning',
        });
        toast.error('Please enter a coupon code');

        // Set span status before returning
        // Type assertion needed because Sentry's SpanStatus type is not directly accessible
        span?.setStatus('invalid_argument' as unknown as SpanStatus);
        return;
      }

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
      });

      if (error) {
        // Log coupon application error
        Sentry.addBreadcrumb({
          category: 'checkout',
          message: 'Coupon application failed',
          level: 'error',
          data: {
            coupon_code: couponCode,
            error_message: (error as Error).data?.message || 'Error applying coupon',
          },
        });

        // Capture error event to send breadcrumbs
        const userEmail = formikRef.current?.values.email || checkoutData?.patient?.email || '';
        Sentry.captureMessage('Coupon application failed', {
          level: 'error',
          tags: {
            checkout_action: 'apply_coupon',
            flow_type: 'product_checkout_link',
            userEmail,
          },
          contexts: {
            checkout: {
              coupon_code: couponCode,
              product_id: product?.id ?? '',
              price_id: product?.prices?.[0]?.priceId || '',
              error_message: (error as Error).data?.message || 'Error applying coupon',
            },
          },
        });

        toast.error((error as Error).data?.message || 'Error applying coupon. Please check the code and try again.');

        // Set span status to error
        // Type assertion needed because Sentry's SpanStatus type is not directly accessible
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
          surveyId: product?.surveyId || '',
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
          const userEmail = formikRef.current?.values.email || checkoutData?.patient?.email || '';
          Sentry.captureMessage('Coupon applied successfully', {
            level: 'info',
            tags: {
              checkout_action: 'apply_coupon',
              flow_type: 'product_checkout_link',
              userEmail,
            },
            contexts: {
              checkout: {
                coupon_code: couponCode,
                product_id: product?.id ?? '',
                price_id: product?.prices?.[0]?.priceId || '',
                discount_type: data?.data?.discountType,
                discount_amount: data?.data?.discountAmount,
                amount_after_discount: data?.data?.amountAfterDiscount,
              },
            },
          });

          toast.success('Coupon applied successfully!');
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
          const userEmail = formikRef.current?.values.email || checkoutData?.patient?.email || '';
          Sentry.captureMessage('Failed to recreate checkout session with coupon', {
            level: 'error',
            tags: {
              checkout_action: 'apply_coupon',
              flow_type: 'product_checkout_link',
              userEmail,
            },
            contexts: {
              checkout: {
                coupon_code: couponCode,
                product_id: product?.id ?? '',
                price_id: product?.prices?.[0]?.priceId || '',
                error_message: sessionResponse.message || 'Failed to apply coupon',
              },
            },
          });

          toast.error('Failed to apply coupon. Please try again.');
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
      const couponCode = formikRef.current?.values.coupon?.trim();
      const userEmail = formikRef.current?.values.email || checkoutData?.patient?.email || '';
      Sentry.captureException(error, {
        tags: {
          checkout_action: 'apply_coupon',
          flow_type: 'product_checkout_link',
          userEmail,
        },
        contexts: {
          checkout: {
            coupon_code: couponCode || '',
            product_id: product?.id ?? '',
            price_id: product?.prices?.[0]?.priceId || '',
          },
        },
      });

      toast.error('Failed to apply coupon. Please try again.');
    } finally {
      // Always end the span to prevent memory leaks
      span?.end();
    }
  }, [mutateAsync, createCheckoutSession, product?.prices, product?.id, product?.surveyId]);

  const handleRemoveCoupon = useCallback(async () => {
    try {
      const price_id = product?.prices?.[0].priceId;
      const email = formikRef.current?.values.email || '';

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
        setIsApplyingCoupon(false);
        formikRef.current?.setFieldValue('coupon', '');

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
        const userEmail = formikRef.current?.values.email || checkoutData?.patient?.email || '';
        Sentry.captureMessage('Coupon removed successfully', {
          level: 'info',
          tags: {
            checkout_action: 'remove_coupon',
            flow_type: 'product_checkout_link',
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
        const userEmail = formikRef.current?.values.email || checkoutData?.patient?.email || '';
        Sentry.captureMessage('Failed to remove coupon', {
          level: 'error',
          tags: {
            checkout_action: 'remove_coupon',
            flow_type: 'product_checkout_link',
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
      const userEmail = formikRef.current?.values.email || checkoutData?.patient?.email || '';
      Sentry.captureException(error, {
        tags: {
          checkout_action: 'remove_coupon',
          flow_type: 'product_checkout_link',
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
  }, [createCheckoutSession, product?.prices, product?.id, product?.surveyId, appliedCouponCode]);

  const handlesameAsShippingAddress = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const formik = formikRef.current;

    if (!formik) return;

    const { values, setTouched } = formik;

    const billingFileds = {
      firstName: values.shipping_firstName,
      lastName: values.shipping_lastName,
      billing_address: values.shipping_address,
      billing_address2: values.shipping_address2,
      billing_city: values.shipping_city,
      zipCode: values.shipping_zipCode,
      billing_state: values.shipping_state,
    };

    if (isChecked) {
      // Copy billing address to shipping address

      // Add breadcrumb for toggling same-as-shipping on
      Sentry.addBreadcrumb({
        category: 'checkout',
        message: 'User enabled "same as shipping address"',
        level: 'info',
      });

      Object.entries(billingFileds).forEach(([field, value]) => {
        formik.setFieldValue(field, value);
      });
    } else {
      // Add breadcrumb for toggling same-as-shipping off
      Sentry.addBreadcrumb({
        category: 'checkout',
        message: 'User disabled "same as shipping address"',
        level: 'info',
      });

      Object.keys(billingFileds).forEach((field) => {
        formik.setFieldValue(field as keyof CheckoutvalidationSchema, '');
      });
    }

    await setTouched({});
    setIsSameBillingAddress(isChecked);
  }, []);

  const handleSubmit = useCallback(
    async (values: CheckoutvalidationSchema) => {
      // Start performance span for form submission
      const span = sentryTransactionRef.current?.startChild({
        op: 'form.submit',
        description: 'Submit checkout form and create patient',
      });

      try {
        setCheckoutLoading(true);

        // Add breadcrumb for form submission
        Sentry.addBreadcrumb({
          category: 'checkout',
          message: 'Form submission started',
          level: 'info',
        });

        // Validate required fields
        const requiredFields = [
          'email',
          'phone',
          'firstName',
          'lastName',
          'billing_address',
          'billing_city',
          'billing_state',
          'zipCode',
        ];
        const missingFields = requiredFields.filter((field) => !values[field as keyof CheckoutvalidationSchema]);

        if (missingFields.length > 0) {
          // Log missing required fields
          Sentry.addBreadcrumb({
            category: 'checkout',
            message: 'Form validation failed - missing required fields',
            level: 'warning',
            data: {
              missing_fields: missingFields,
              missing_count: missingFields.length,
            },
          });
          toast.error('Please fill in all required fields');
          setCheckoutLoading(false);

          // Set span status before returning
          // Type assertion needed because Sentry's SpanStatus type is not directly accessible
          span?.setStatus('invalid_argument' as unknown as SpanStatus);
          return;
        }

        const addresses = {
          billingAddress: {
            firstName: values.firstName?.trim() || '',
            lastName: values.lastName?.trim() || '',
            city: values.billing_city?.trim() || '',
            region: 'United States',
            street: values.billing_address?.trim() || '',
            street2: values.billing_address2?.trim() || '',
            state: values.billing_state?.trim() || '',
            zip: values.zipCode?.trim() || '',
          },
          shippingAddress: {
            firstName: values.shipping_firstName?.trim() || '',
            lastName: values.shipping_lastName.trim(),
            city: values.shipping_city.trim(),
            region: 'United States',
            street: values.shipping_address.trim(),
            street2: values.shipping_address2?.trim() || '',
            state: values.shipping_state,
            zip: values.shipping_zipCode.trim(),
          },
        };

        const { shippingAddress, billingAddress } = addresses;

        const payload = {
          email: values.email.trim(),
          phoneNumber: values.phone.trim(),
          firstName: values.firstName?.trim() || '',
          lastName: values.lastName?.trim() || '',
          address: {
            shippingAddress,
            ...(values?.sameAsShippingAddress ? { billingAddress: shippingAddress } : { billingAddress }),
          },
        };

        // Add breadcrumb for patient creation attempt
        Sentry.addBreadcrumb({
          category: 'checkout',
          message: 'Creating/updating patient',
          level: 'info',
          data: {
            has_email: !!values.email,
            has_phone: !!values.phone,
            same_as_shipping: values.sameAsShippingAddress,
            shipping_state: values.shipping_state,
          },
        });

        const { data, success, message } = await createPatient(payload).unwrap();

        if (success) {
          // Log successful patient creation
          Sentry.addBreadcrumb({
            category: 'checkout',
            message: 'Patient created/updated successfully',
            level: 'info',
            data: {
              has_existing_subscription: !!data?.existingSubscriptionId,
            },
          });

          // Capture success event to send breadcrumbs
          const userEmail = values.email || checkoutData?.patient?.email || '';
          Sentry.captureMessage('Patient created/updated successfully', {
            level: 'info',
            tags: {
              checkout_action: 'create_patient',
              flow_type: 'product_checkout_link',
              userEmail,
            },
            contexts: {
              checkout: {
                has_email: !!values.email,
                has_phone: !!values.phone,
                same_as_shipping: values.sameAsShippingAddress,
                shipping_state: values.shipping_state,
                product_id: product?.id ?? '',
                has_existing_subscription: !!data?.existingSubscriptionId,
              },
            },
          });

          if (data?.existingSubscriptionId) {
            setExistingSubscriptionId(data?.existingSubscriptionId);
          }
          submitRef.current?.();

          // Set span status to success
          // Type assertion needed because Sentry's SpanStatus type is not directly accessible
          span?.setStatus('ok' as unknown as SpanStatus);
        } else {
          // Log patient creation failure
          Sentry.addBreadcrumb({
            category: 'checkout',
            message: 'Patient creation/update failed',
            level: 'error',
            data: {
              error_message: message || 'Unable to process your information',
            },
          });

          // Capture error event to send breadcrumbs
          const userEmail = values.email || checkoutData?.patient?.email || '';
          Sentry.captureMessage('Patient creation/update failed', {
            level: 'error',
            tags: {
              checkout_action: 'create_patient',
              flow_type: 'product_checkout_link',
              userEmail,
            },
            contexts: {
              checkout: {
                has_email: !!values.email,
                has_phone: !!values.phone,
                same_as_shipping: values.sameAsShippingAddress,
                shipping_state: values.shipping_state,
                product_id: product?.id ?? '',
                error_message: message || 'Unable to process your information',
              },
            },
          });

          toast.error(message || 'Unable to process your information. Please try again.');
          setCheckoutLoading(false);

          // Set span status to error
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          span?.setStatus('unknown_error' as any);
        }
      } catch (e) {
        console.error('Checkout submission error:', e);

        // Set span status to error
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        span?.setStatus('internal_error' as any);

        // Capture patient creation error in Sentry
        const userEmail = values.email || checkoutData?.patient?.email || '';
        Sentry.captureException(e, {
          tags: {
            checkout_action: 'create_patient',
            flow_type: 'product_checkout_link',
            userEmail,
          },
          contexts: {
            checkout: {
              has_email: !!values.email,
              has_phone: !!values.phone,
              same_as_shipping: values.sameAsShippingAddress,
              shipping_state: values.shipping_state,
              product_id: product?.id ?? '',
            },
          },
        });

        const errorMessage = isAxiosError(e)
          ? e.response?.data?.message || 'Network error. Please check your connection and try again.'
          : (e as Error).data?.message || 'An unexpected error occurred. Please try again.';

        toast.error(errorMessage);
        setCheckoutLoading(false);
      } finally {
        // Always end the span to prevent memory leaks
        span?.end();
      }
    },
    [createPatient, product?.id]
  );

  const handleCheckoutSuccess = useCallback(
    async (invoiceUrls: string[], subscriptionIds: string[], customerId: string) => {
      try {
        // Track checkout completion
        await trackSurveyAnalytics({
          event: 'checkout_completed',
          payload: {
            invoice_id: invoiceUrls?.[0]?.split('/#').pop() ?? '',
            product_id: product?.id ?? '',
            product_name: product?.name ?? '',
          },
        });

        const transactionId = invoiceUrls?.[0]?.split('/#').pop() ?? '';

        // Handle existing subscription cancellation if needed
        if (existingSubscriptionId) {
          const { success } = await cancelSubscription({
            subscriptionId: existingSubscriptionId,
            checkoutType: product.prices?.[0]?.checkoutType,
          }).unwrap();

          if (success) {
            // Purchase tracking
            const productPrice = couponDetails?.amountAfterDiscount ?? amount;

            // Log successful checkout completion to Sentry
            Sentry.addBreadcrumb({
              category: 'checkout',
              message: 'Product checkout completed successfully',
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
                existing_subscription_cancelled: !!existingSubscriptionId,
              },
            });

            // Capture success event for analytics
            const userEmail = formikRef.current?.values.email || checkoutData?.patient?.email || '';
            Sentry.captureMessage('Product checkout completed successfully', {
              level: 'info',
              tags: {
                checkout_action: 'checkout_complete',
                flow_type: 'product_checkout_link',
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
                  has_existing_subscription: !!existingSubscriptionId,
                },
              },
            });

            if (product && transactionId) {
              const item: CheckoutItem = {
                id: product.id ?? '',
                name: 'displayName' in product ? product.displayName || product.name || '' : product.name || '',
                price: productPrice, // Already in USD
                quantity: 1,
              };

              // Get product category
              const productCategory = getProductCategory(product);

              trackPurchase({
                transactionId,
                value: productPrice, // Already in USD
                currency: 'USD',
                items: [item],
                productCategory,
              });
            } else {
              console.warn('Product or transaction ID not available for purchase tracking');
            }
          }
        } else {
          // No existing subscription - checkout completed successfully
          const productPrice = couponDetails?.amountAfterDiscount ?? amount;

          // Log successful checkout completion to Sentry
          Sentry.addBreadcrumb({
            category: 'checkout',
            message: 'Product checkout completed successfully',
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
          const userEmail = formikRef.current?.values.email || checkoutData?.patient?.email || '';
          Sentry.captureMessage('Product checkout completed successfully', {
            level: 'info',
            tags: {
              checkout_action: 'checkout_complete',
              flow_type: 'product_checkout_link',
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
        }

        // Update checkout state

        const showVideoConsultation =
          !!videoVisistsAllowedStates?.[
          formikRef.current?.values.shipping_state as keyof typeof videoVisistsAllowedStates
          ];

        dispatch(
          setCheckout({
            medicalFormUrl: 'https://lumimeds.telepath.clinic/signup',
            telepathInstructionsUrl: ROUTES.CARE_PORTAL,
            intakeAmount: amount,
            product,
            invoiceId: transactionId,
            customerId,
            subscriptionIds,
            showVideoConsultation,
            paymentMethod,
            ...(couponDetails && { ...couponDetails }),
            userEmail: formikRef.current?.values.email.trim(),
          })
        );

        // Navigate to success page
        startTransition(() => router.replace(ROUTES.CHECKOUT_SUCCESS));
      } catch (err) {
        // Capture error that occurred after payment succeeded
        const userEmail = formikRef.current?.values.email || checkoutData?.patient?.email || '';
        Sentry.captureException(err, {
          tags: {
            checkout_action: 'checkout_success',
            flow_type: 'product_checkout_link',
            userEmail,
          },
          contexts: {
            checkout: {
              product_id: product?.id ?? '',
              has_existing_subscription: !!existingSubscriptionId,
              has_coupon: !!couponDetails,
              payment_method: paymentMethod,
            },
          },
        });

        toast.error(
          isAxiosError(err) ? err.response?.data.message : (err as Error).data?.message || 'Error checking out!'
        );
      } finally {
        setCheckoutLoading(false);
      }
    },
    [
      existingSubscriptionId,
      cancelSubscription,
      product,
      amount,
      couponDetails,
      paymentMethod,
      dispatch,
      router,
      startTransition,
      appliedCouponCode,
    ]
  );

  const totalAmount = useMemo(() => {
    const baseAmount = amount || product?.prices?.[0]?.amount || 0;

    if (couponDetails) {
      const convertedAmount = Number(couponDetails?.amountAfterDiscount ?? 0).toFixed(2);

      return `$${convertedAmount}`;
    }

    return amount ? formatToUSD(amount) : `$${baseAmount}.00`;
  }, [amount, couponDetails, product?.prices]);

  const isLoading = useMemo(() => {
    return (
      isCreatingPatient ||
      isCancellingSubscription ||
      isLoadingApplyCoupon ||
      isCreatingSession ||
      isPending ||
      checkoutLoading ||
      isApplyingCoupon
    );
  }, [
    isCreatingPatient,
    isCancellingSubscription,
    isLoadingApplyCoupon,
    isCreatingSession,
    isPending,
    checkoutLoading,
    isApplyingCoupon,
  ]);

  // Auto-detect coupon input changes
  useEffect(() => {
    const couponValue = formikRef.current?.values.coupon;
    setIsApplyingCoupon(!!(couponValue && couponValue.trim() && !couponDetails));
  }, [formikRef.current?.values.coupon, couponDetails]);

  useEffect(() => {
    fetchTrustpilotData().then((data) => {
      setTrustPilotData(data);
    });
  }, []);

  // Initialize Sentry context and transaction
  useEffect(() => {
    if (checkoutData && product) {
      // Set user context for Sentry
      Sentry.setUser({
        email: checkoutData.patient?.email || undefined,
        id: checkoutData.patient?.id || undefined,
      });

      // Set custom context
      Sentry.setContext('checkout', {
        flow_type: 'product_checkout_link',
        product_id: product.id || '',
        product_name: product.name || '',
        product_price: product.prices?.[0]?.amount || 0,
        price_id: product.prices?.[0]?.priceId || '',
        checkout_link_id: checkoutData.id || '',
      });

      // Start Sentry transaction for performance monitoring
      const span = Sentry.startInactiveSpan({
        name: 'Product Checkout Flow',
        op: 'checkout.product_link',
        attributes: {
          'checkout.flow': 'product_link',
          'product.name': product.name || '',
          'product.id': product.id || '',
        },
      });

      sentryTransactionRef.current = {
        startChild: (options: {
          op: string;
          description: string;
          data?: Record<string, unknown>;
        }) => {
          return Sentry.startInactiveSpan({
            name: options.description || options.op,
            op: options.op,
            attributes: (options.data || {}) as Parameters<typeof Sentry.startInactiveSpan>[0]['attributes'],
          });
        },
        finish: () => {
          span?.end();
        },
      };

      // Add breadcrumb for checkout initiation
      Sentry.addBreadcrumb({
        category: 'checkout',
        message: 'Product checkout initiated',
        level: 'info',
        data: {
          product_id: product.id || '',
          product_name: product.name || '',
          price: product.prices?.[0]?.amount || 0,
          flow: 'product_checkout_link',
        },
      });
    }

    // Cleanup: finish transaction on unmount
    return () => {
      if (sentryTransactionRef.current) {
        sentryTransactionRef.current.finish();
      }
    };
  }, [checkoutData, product]);

  // Environment configuration
  const isStaging = useMemo(() => process.env.NEXT_PUBLIC_ENV === 'staging', []);

  const onChangeWrapper = ({
    key,
    value,
    billingkey,
    isSameBillingAddress,
  }: {
    key: keyof CheckoutvalidationSchema;
    value: string;
    billingkey: keyof CheckoutvalidationSchema;
    isSameBillingAddress: boolean;
  }) => {
    if (isSameBillingAddress) formikRef.current?.setFieldValue(billingkey, value);

    formikRef.current?.setFieldValue(key, value);
  };

  return (
    <main className='tw-container tw-px-4 tw-mx-auto tw-mt-16 checkout-page'>
      {/* Progress Indicator */}

      <ElementsForm
        // key={currentToken}
        checkoutSecureToken={currentToken}
        baseUrl={isStaging ? 'https://cde.openpaystaging.com' : undefined}
        // onLoadError={() => router.push('/')}
        onChange={() => setCardErrorMessages(null)}
        onLoad={(amount) => {
          setAmount(amount ?? 0);
          dispatch(setIntakeAmount(amount));
        }}
        onCheckoutSuccess={handleCheckoutSuccess}
        onCheckoutStarted={() => setCheckoutLoading(true)}
        onCheckoutError={(message) => {
          // Get email from form or checkout data
          const userEmail = formikRef.current?.values.email || checkoutData?.patient?.email || '';

          // Capture payment error in Sentry
          Sentry.captureMessage(`Checkout payment failure: ${userEmail}`, {
            level: 'error',
            tags: {
              checkout_action: 'payment_failure',
              flow_type: 'product_checkout_link',
              payment_method: paymentMethod,
              userEmail,
            },
            contexts: {
              checkout: {
                error_message: message,
                friendly_message: getFriendlyPaymentErrorMessage(message),
                product_name: product?.name ?? '',
                has_coupon: !!couponDetails,
                checkout_data: checkoutData
              },
            },
          });

          toast.error(getFriendlyPaymentErrorMessage(message), { duration: 8000 });
          setCheckoutLoading(false);
        }}
        onValidationError={(field: FieldName, errors: string[]) => {
          // Capture validation error in Sentry
          const userEmail = formikRef.current?.values.email || checkoutData?.patient?.email || '';
          Sentry.captureMessage(`Card validation error on field: ${field}`, {
            level: 'warning',
            tags: {
              checkout_action: 'card_validation_error',
              flow_type: 'product_checkout_link',
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

          formikRef.current?.setFieldError(field, errors.join(', '));

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
        {({ klarna, submit, applePay, googlePay }) => {
          // Store submit function in ref for reliable access
          submitRef.current = submit;

          return (
            <Formik
              innerRef={formikRef}
              validationSchema={checkoutvalidationSchema}
              initialValues={initialValues}
              onSubmit={handleSubmit}
              validateOnChange
              validateOnBlur={false}
            >
              {({ values, handleChange, handleBlur, setFieldValue, submitForm }) => (
                <Form className='tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-4 sm:tw-gap-8 lg:tw-gap-36 tw-pb-16 tw-mt-10'>
                  <div className='tw-flex-grow tw-flex tw-flex-col tw-gap-y-6'>
                    <div className='tw-space-y-4'>
                      <p className='m-0 tw-text-3xl'>Contact Information</p>
                      <div>
                        <CheckoutFormInput
                          label='Email Address'
                          id='email'
                          type='email'
                          name='email'
                          value={values.email}
                          openPayId={FieldName.EMAIL}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder='Enter your email address'
                          autoComplete='email'
                          aria-describedby='email-help email-error'
                          aria-invalid={!!formikRef.current?.errors?.email}
                        />
                        <ErrorMessage component='div' name='email' className='tw-text-red-500 tw-text-sm tw-mt-0.5' />
                        <div id='email-help' className='text-sm mt-1 text-muted'>
                          If you don&apos;t have an account, we&apos;ll create one for you.
                        </div>
                      </div>
                      <CheckoutFormInput
                        id='phone'
                        label='Phone Number'
                        name='phone'
                        openPayId={FieldName.PHONE}
                        onChange={(e) => {
                          const phone = custonmPhoneInputOnChange(e);

                          setFieldValue('phone', phone);
                        }}
                        onKeyDown={custonmPhoneInputOnKeyChange}
                        onBlur={handleBlur}
                        value={values.phone ? formatUSPhoneWithoutPlusOne(values.phone) : ''}
                        placeholder='(555) 123-4567'
                        autoComplete='tel'
                        aria-describedby='phone-error'
                        aria-invalid={!!formikRef.current?.errors?.phone}
                      />
                      <ErrorMessage component='div' name='phone' className='tw-text-red-500 tw-text-sm tw-mt-0.5' />
                    </div>

                    <div className='tw-space-y-4'>
                      <div className='row g-3'>
                        <div className='d-flex justify-content-between checkout-shipping-header'>
                          <p className='m-0 tw-text-3xl flex-shrink-0'>Shipping Address</p>
                        </div>
                        <div className='col-md-6'>
                          <CheckoutFormInput
                            id='shipping_firstName'
                            label='First Name'
                            name='shipping_firstName'
                            value={values.shipping_firstName}
                            onChange={(e) => {
                              onChangeWrapper({
                                key: 'shipping_firstName',
                                value: e.target.value,
                                billingkey: 'firstName',
                                isSameBillingAddress: values.sameAsShippingAddress,
                              });
                              handleChange(e);
                            }}
                            onBlur={handleBlur}
                            placeholder='Enter first name'
                            autoComplete='given-name'
                          />
                          <ErrorMessage
                            component='div'
                            name='shipping_firstName'
                            className='tw-text-red-500 tw-text-sm tw-mt-0.5'
                          />
                        </div>
                        <div className='col-md-6'>
                          <CheckoutFormInput
                            id='shipping_lastName'
                            label='Last Name'
                            name='shipping_lastName'
                            value={values.shipping_lastName}
                            onChange={(e) => {
                              onChangeWrapper({
                                key: 'shipping_lastName',
                                value: e.target.value,
                                billingkey: 'lastName',
                                isSameBillingAddress: values.sameAsShippingAddress,
                              });
                              handleChange(e);
                            }}
                            onBlur={handleBlur}
                            placeholder='Enter last name'
                            autoComplete='family-name'
                          />
                          <ErrorMessage
                            component='div'
                            name='shipping_lastName'
                            className='tw-text-red-500 tw-text-sm tw-mt-0.5'
                          />
                        </div>
                        <div className='col-12'>
                          <CheckoutFormInput
                            id='shipping_address'
                            label='Address'
                            name='shipping_address'
                            value={values.shipping_address}
                            onChange={(e) => {
                              onChangeWrapper({
                                key: 'shipping_address',
                                value: e.target.value,
                                billingkey: 'billing_address',
                                isSameBillingAddress: values.sameAsShippingAddress,
                              });
                              handleChange(e);
                            }}
                            onBlur={handleBlur}
                            placeholder={'Street address, house number, or P.O. Box'}
                            autoComplete='address-line1'
                          />
                          <ErrorMessage
                            component='div'
                            name='shipping_address'
                            className='tw-text-red-500 tw-text-sm tw-mt-0.5'
                          />
                        </div>
                        <div className='col-12'>
                          <CheckoutFormInput
                            id='shipping_address2'
                            label='Apartment, suite, etc. (optional)'
                            name='shipping_address2'
                            value={values.shipping_address2}
                            onChange={(e) => {
                              onChangeWrapper({
                                key: 'shipping_address2',
                                value: e.target.value,
                                billingkey: 'billing_address2',
                                isSameBillingAddress: values.sameAsShippingAddress,
                              });
                              handleChange(e);
                            }}
                            onBlur={handleBlur}
                            placeholder={'Apartment, suite, building, floor, or landmark'}
                            autoComplete='address-line2'
                          />
                          <ErrorMessage
                            component='div'
                            name='shipping_address2'
                            className='tw-text-red-500 tw-text-sm tw-mt-0.5'
                          />
                        </div>
                        <div className='col-md-12'>
                          <CheckoutFormInput
                            id='shipping_city'
                            label='City'
                            name='shipping_city'
                            value={values.shipping_city}
                            onChange={(e) => {
                              onChangeWrapper({
                                key: 'shipping_city',
                                value: e.target.value,
                                billingkey: 'billing_city',
                                isSameBillingAddress: values.sameAsShippingAddress,
                              });
                              handleChange(e);
                            }}
                            onBlur={handleBlur}
                            autoComplete='address-level2'
                          />
                          <ErrorMessage
                            component='div'
                            name='shipping_city'
                            className='tw-text-red-500 tw-text-sm tw-mt-0.5'
                          />
                        </div>
                        <div className='col-md-6'>
                          <CheckoutReactSelect
                            label='State'
                            placeholder={''}
                            inputId='shipping_state_select'
                            options={stateOptions}
                            value={
                              values.shipping_state
                                ? { value: values.shipping_state, label: values.shipping_state }
                                : undefined
                            }
                            onChange={(option) => {
                              const { value } = option as OptionValue;
                              handleChange({ target: { name: 'shipping_state', value: value as string } });

                              if (values.sameAsShippingAddress) {
                                onChangeWrapper({
                                  key: 'billing_state',
                                  value: value as string,
                                  billingkey: 'billing_state',
                                  isSameBillingAddress: values.sameAsShippingAddress,
                                });
                              }
                            }}
                            onBlur={handleBlur}
                            isSearchable
                            name='shipping_state'
                            classNames={{
                              control: () => 'w-100 rounded',
                              indicatorSeparator: () => 'd-none',
                            }}
                            isia-label='Select shipping state'
                          />
                          <ErrorMessage
                            component='div'
                            name='shipping_state'
                            className='tw-text-red-500 tw-text-sm tw-mt-0.5'
                          />
                        </div>
                        <div className='col-md-6'>
                          <CheckoutFormInput
                            id='shipping_zipCode'
                            label='Zip Code'
                            name='shipping_zipCode'
                            value={values.shipping_zipCode}
                            onChange={(e) => {
                              onChangeWrapper({
                                key: 'shipping_zipCode',
                                value: e.target.value,
                                billingkey: 'zipCode',
                                isSameBillingAddress: values.sameAsShippingAddress,
                              });
                              handleChange(e);
                            }}
                            onBlur={handleBlur}
                            maxLength={5}
                            inputMode='numeric'
                            autoComplete='postal-code'
                          />
                          <ErrorMessage
                            component='div'
                            name='shipping_zipCode'
                            className='tw-text-red-500 tw-text-sm tw-mt-0.5'
                          />
                        </div>
                      </div>
                    </div>
                    <div className='tw-space-y-4 tw-relative'>
                      {isCreatingSession && (
                        <div className='tw-absolute tw-inset-0 tw-bg-white/80 tw-z-10 tw-flex tw-items-center tw-justify-center tw-rounded-lg'>
                          <div className='tw-flex tw-items-center tw-gap-2'>
                            <Spinner size='sm' aria-hidden='true' />
                            <span className='tw-text-gray-600'>Loading Payment Options ...</span>
                          </div>
                        </div>
                      )}
                      <p className='m-0 tw-text-3xl'>Payment</p>

                      <div className='tw-flex tw-gap-2 tw-flex-wrap'>
                        {product?.metadata?.isKlarnaEnabled && (
                          <ExpressCheckoutWidget
                            type='button'
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

                                handleSubmit({ ...values, submit: () => klarna.startFlow() });
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
                            type='button'
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

                                handleSubmit({
                                  ...values,
                                  submit: () => {
                                    applePay.startFlow();

                                    setPaymentMethod('Apple Pay');
                                  },
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
                            type='button'
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

                                handleSubmit({ ...values, submit: () => googlePay.startFlow() });
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

                      {applePay?.isAvailable || googlePay?.isAvailable || product?.metadata?.isKlarnaEnabled ? (
                        <PaymentMethodDivider label='OR' />
                      ) : (
                        <></>
                      )}
                      <div>
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
                          <div className='tw-text-red-500 tw-text-sm tw-mt-0.5' role='alert'>
                            {cardErrorMessages.cardNumber}
                          </div>
                        )}
                      </div>

                      <div className='d-flex gap-3 flex-column flex-sm-row'>
                        <div className='tw-flex-grow'>
                          <div className='form-control checkout-input-wrapper'>
                            <label className=' text-sm  text-muted text-sm form-label mb-0 text-sm d-block text-muted'>
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
                            <div className='tw-text-red-500 tw-text-sm tw-mt-0.5' role='alert'>
                              {cardErrorMessages.cardExpiry}
                            </div>
                          )}
                        </div>
                        <div className='tw-flex-grow'>
                          <div className='form-control checkout-input-wrapper'>
                            <label className='text-sm text-muted text-sm form-label mb-2 text-sm d-block text-muted'>
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
                            <div className='tw-text-red-500 tw-text-sm tw-mt-0.5' role='alert'>
                              {cardErrorMessages.cardCvc}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* {product.metadata.isKlarnaEnabled && (
                      <div className='tw-mt-4'>
                        <div className='tw-flex tw-items-center tw-gap-3 tw-my-2'>
                          <div className='tw-h-px tw-bg-[#EAEAEA] tw-flex-1' />
                          <span className='tw-text-[#666] fw-semibold'>OR</span>
                          <div className='tw-h-px tw-bg-[#EAEAEA] tw-flex-1' />
                        </div>
                        <button
                          type='button'
                          className='btn btn-outline-primary rounded-pill w-100 fw-bold py-12 d-flex align-items-center justify-content-center gap-2 tw-mb-3 tw-transition-all tw-duration-200 hover:tw-bg-gray-100 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed'
                          disabled={
                            isLoading ||
                            isCouponActive ||
                            klarna?.isLoading ||
                            !klarna?.isAvailable ||
                            !klarna?.startFlow
                          }
                          onClick={() => {
                            if (isCouponActive) {
                              toast.error(
                                'Klarna is not available when a discount code is applied. Remove the code to use Klarna.'
                              );
                              return;
                            }
                            setPaymentMethod('Klarna');
                            if (klarna?.startFlow) {
                              setFieldValue('submit', () => klarna.startFlow({ useRedirectFlow: true }));
                              submitForm();
                            } else {
                              console.warn('Klarna flow not available');
                              toast.error('Klarna payment is temporarily unavailable. Please use card payment.');
                            }
                          }}
                        >
                          {(isLoading || klarna?.isLoading) && paymentMethod === 'Klarna' && (
                            <Spinner size='sm' aria-hidden='true' />
                          )}
                          Pay with Klarna
                        </button>
                        {isCouponActive && (
                          <div id='klarna-help' className='tw-text-xs tw-text-center tw-mt-2'>
                            <span className='tw-text-red-600' role='alert'>
                              Klarna cannot be used with discount codes. Please remove the code to proceed with Klarna.
                            </span>
                          </div>
                        )}
                      </div>
                    )} */}
                    </div>

                    <div className='tw-flex tw-flex-col tw-gap-3'>
                      <div className='d-flex justify-content-between align-items-center flex-wrap tw-gap-2 tw-md:gap-1'>
                        <p className='m-0 tw-text-1xl tw-font-semibold'>Billing Address</p>
                        <label htmlFor='same-address' className='d-flex align-items-center gap-2 tw-cursor-pointer'>
                          <input
                            className={'c_checkbox'}
                            type='checkbox'
                            checked={values.sameAsShippingAddress}
                            onChange={handlesameAsShippingAddress}
                            id='same-address'
                            aria-describedby='same-address-help'
                          />
                          <span className={'text-xs'}>Use shipping address as billing address</span>
                        </label>
                      </div>

                      <div
                        className={`row g-3 ${values.sameAsShippingAddress
                          ? 'tw-invisible tw-h-0 tw-overflow-hidden'
                          : 'tw-visible tw-h-fit'
                          }`}
                      >
                        <div className='col-md-6'>
                          <CheckoutFormInput
                            id='firstName'
                            name='firstName'
                            label='First Name'
                            onChange={handleChange}
                            onBlur={handleBlur}
                            openPayId={FieldName.FIRST_NAME}
                            value={values.firstName}
                            placeholder='Enter your first name'
                            autoComplete='given-name'
                            aria-describedby='firstName-error'
                            aria-invalid={!!formikRef.current?.errors?.firstName}
                          />
                          <ErrorMessage
                            component='div'
                            name='firstName'
                            className='tw-text-red-500 tw-text-sm tw-mt-0.5'
                          />
                        </div>
                        <div className='col-md-6'>
                          <CheckoutFormInput
                            id='lastName'
                            name='lastName'
                            label='Last Name'
                            onChange={handleChange}
                            onBlur={handleBlur}
                            openPayId={FieldName.LAST_NAME}
                            value={values.lastName}
                            placeholder='Enter your last name'
                            autoComplete='family-name'
                            aria-describedby='lastName-error'
                            aria-invalid={!!formikRef.current?.errors?.lastName}
                          />
                          <ErrorMessage
                            component='div'
                            name='lastName'
                            className='tw-text-red-500 tw-text-sm tw-mt-0.5'
                          />
                        </div>
                        <div className='col-12'>
                          <CheckoutFormInput
                            id='billing_address'
                            name='billing_address'
                            label='Address'
                            onChange={handleChange}
                            onBlur={handleBlur}
                            openPayId={'line1'}
                            placeholder={'Street address, house number, or P.O. Box'}
                            autoComplete='address-line1'
                            aria-describedby='billing_address-error'
                            aria-invalid={!!formikRef.current?.errors?.billing_address}
                          />
                          <ErrorMessage
                            component='div'
                            name='billing_address'
                            className='tw-text-red-500 tw-text-sm tw-mt-0.5'
                          />
                        </div>
                        <div className='col-12'>
                          <CheckoutFormInput
                            id='billing_address2'
                            name='billing_address2'
                            label='Apartment, suite, etc. (optional)'
                            onChange={handleChange}
                            onBlur={handleBlur}
                            openPayId={'line2'}
                            placeholder={'Apartment, suite, building, floor, or landmark'}
                            autoComplete='Apartment, suite, etc. (optional)'
                          />
                          <ErrorMessage
                            component='div'
                            name='billing_address2'
                            className='tw-text-red-500 tw-text-sm tw-mt-0.5'
                          />
                        </div>
                        <div className='col-md-12'>
                          <CheckoutFormInput
                            id='billing_city'
                            label='City'
                            name='billing_city'
                            onChange={handleChange}
                            onBlur={handleBlur}
                            openPayId={FieldName.CITY}
                            autoComplete='address-level2'
                          />
                          <ErrorMessage
                            component='div'
                            name='billing_city'
                            className='tw-text-red-500 tw-text-sm tw-mt-0.5'
                          />
                        </div>
                        <div className='col-md-6'>
                          <CheckoutInput
                            name='billing_state'
                            onChange={handleChange}
                            onBlur={handleBlur}
                            hidden
                            openPayId={FieldName.STATE}
                          />

                          <CheckoutReactSelect
                            label='State'
                            placeholder={''}
                            inputId='billing_state_select'
                            options={stateOptions}
                            value={
                              values.billing_state
                                ? { value: values.billing_state, label: values.billing_state }
                                : undefined
                            }
                            onChange={(option) => {
                              const { value } = option as OptionValue;
                              handleChange({ target: { name: 'billing_state', value: value as string } });
                            }}
                            isSearchable
                            classNames={{
                              control: () => 'w-100 rounded',
                              indicatorSeparator: () => 'd-none',
                            }}
                            aria-label='Select billing state'
                          />
                          <ErrorMessage
                            component='div'
                            name='billing_state'
                            className='tw-text-red-500 tw-text-sm tw-mt-0.5'
                          />
                        </div>
                        <div className='col-md-6'>
                          <CheckoutFormInput
                            label='ZIP Code'
                            id='zipCode'
                            name='zipCode'
                            onChange={handleChange}
                            onBlur={handleBlur}
                            openPayId={FieldName.ZIP_CODE}
                            maxLength={5}
                            inputMode='numeric'
                            value={values.zipCode}
                            autoComplete='postal-code'
                          />

                          <ErrorMessage
                            component='div'
                            name='zipCode'
                            className='tw-text-red-500 tw-text-sm tw-mt-0.5'
                          />
                        </div>
                        <div className='col-md-12'>
                          <CheckoutInput hidden value={'US'} openPayId={FieldName.COUNTRY} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='tw-flex tw-flex-col tw-gap-y-6'>
                    <p className={'m-0 tw-text-2xl sm:tw-text-4xl text-center text-md-start'}>Your Program Summary</p>
                    <CheckoutProduct product={product} />
                    <ProductSummaryItems />
                    <div>
                      <button
                        type='button'
                        className='mb-2 text-sm text-decoration-underline text-muted p-0'
                        onClick={() => setIsDiscountClicked((prev) => !prev)}
                      >
                        Discount Code{isDiscountClicked ? `` : '?'}
                      </button>
                      {/* Coupon is now applied via new checkout session, no need to send to OpenPay */}
                      <Collapse in={isDiscountClicked}>
                        <div>
                          {!couponDetails ? (
                            <div className='tw-flex tw-items-center tw-gap-3'>
                              <CheckoutFormInput
                                id='coupon'
                                name='coupon'
                                value={formikRef.current?.values.coupon}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder='Enter discount code'
                                aria-describedby='coupon-status'
                                autoComplete='off'
                              />
                              <button
                                type='button'
                                onClick={handleApplyCoupon}
                                disabled={
                                  isLoadingApplyCoupon || isCreatingSession || !formikRef.current?.values.coupon?.trim()
                                }
                                className='btn btn-dark rounded-pill d-flex align-items-center justify-content-center gap-2 text-nowrap py-2 px-4'
                                aria-describedby='coupon-status'
                              >
                                {(isLoadingApplyCoupon || isCreatingSession) && (
                                  <Spinner size='sm' aria-hidden='true' />
                                )}
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
                                            (Number(couponDetails.discountAmount) /
                                              Number(couponDetails.originalAmount)) *
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
                    <button
                      type='submit'
                      className='btn btn-primary rounded-pill !tw-py-[11px] w-100 fw-bold d-flex align-items-center justify-content-center gap-2 tw-transition-all tw-duration-200 hover:tw-bg-gray-800 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed'
                      disabled={isLoading}
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

                        submitForm();
                      }}
                      aria-describedby='checkout-button-status'
                    >
                      {isLoading && paymentMethod === 'Card' && (
                        <Spinner className='border-2' size='sm' aria-hidden='true' />
                      )}
                      Checkout
                    </button>
                    {isLoading && paymentMethod === 'Card' && (
                      <output className='tw-text-center tw-text-sm tw-text-gray-600 tw-mt-2 tw-block'>
                        Please wait while we process your payment...
                      </output>
                    )}

                    {trustPilotData && (
                      <div className='mt-3'>
                        <TrustpilotWidget className='w-100' trustpilotData={trustPilotData} />
                      </div>
                    )}

                    <p className='m-0 tw-text-xs'>
                      Payment will be collected at the time of checkout. If you are not approved for medication, a full
                      refund will be issued. Please ensure that you complete the medical intake form following your
                      purchase. A $100 non-refundable cancellation fee applies to all orders canceled for reasons other
                      than non-approval. Orders cannot be canceled once they have been submitted to the pharmacy.
                    </p>

                    <p className='m-0 tw-text-xs'>
                      Your personal data will be used to process your order, support your experience throughout this
                      website, and for other purposes described in our{' '}
                      <Link href={'/privacypolicy'} className='tw-text-primary tw-underline'>
                        privacy policy
                      </Link>
                      .
                    </p>
                    <label className='tw-inline tw-space-x-3 tw-cursor-pointer'>
                      <input
                        className={'c_checkbox tw-translate-y-1'}
                        required
                        checked
                        type='checkbox'
                        id='terms-consent'
                        aria-describedby='terms-description'
                      />
                      <span className='tw-text-xs' id='terms-description'>
                        I acknowledge and consent to the{' '}
                        <Link
                          href={'/termsofuse'}
                          className='tw-text-primary tw-underline hover:tw-text-blue-700'
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          Terms of Use
                        </Link>{' '}
                        and{' '}
                        <Link
                          href={'/memberterms'}
                          className='tw-text-primary tw-underline hover:tw-text-blue-700'
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          Membership Terms and Conditions
                        </Link>
                        . I authorize Lumimeds to charge the payment method on file and understand that my subscription
                        will automatically renew each cycle until canceled.
                      </span>
                    </label>
                    <label className='tw-inline tw-space-x-3 tw-cursor-pointer'>
                      <input
                        className={'c_checkbox tw-translate-y-1'}
                        required
                        checked
                        type='checkbox'
                        id='marketing-consent'
                        aria-describedby='marketing-description'
                      />
                      <span className='tw-text-xs' id='marketing-description'>
                        I consent to receive marketing and SMS communications on offers from LumiMeds.{' '}
                        <span className='tw-text-red-600' aria-label='required'>
                          *
                        </span>
                      </span>
                    </label>
                    <p className='m-0 tw-text-xs tw-text-gray-600'>*Message and data rates may apply.</p>

                    {/* Security Notice */}
                    <div className='tw-flex tw-items-center tw-gap-2 tw-text-xs tw-text-gray-600 tw-p-3 tw-bg-gray-50 tw-rounded'>
                      <svg
                        className='tw-w-4 tw-h-4 tw-text-green-600'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                        aria-hidden='true'
                      >
                        <path
                          fillRule='evenodd'
                          d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
                          clipRule='evenodd'
                        />
                      </svg>
                      <span>Your payment information is encrypted and secure</span>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          );
        }}
      </ElementsForm>
    </main>
  );
}
