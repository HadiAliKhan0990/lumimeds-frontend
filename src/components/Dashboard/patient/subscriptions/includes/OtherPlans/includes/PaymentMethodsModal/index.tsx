'use client';

import { Modal } from '@/components/elements';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import { useEffect, useState, useTransition, useRef } from 'react';
import { FaCreditCard, FaPlus, FaChevronRight, FaTag, FaCheck, FaTimes } from 'react-icons/fa';
import { PaymentMethod } from '@/store/slices/paymentMethodsSlice';
import { PaymentCard } from './includes/PaymentCard';
import { ROUTES } from '@/constants';
import { useLazyGetPaymentLinkTokenQuery } from '@/store/slices/paymentApiSlice';
import { useApplyCouponMutation } from '@/store/slices/checkoutApiSlice';
import { useRouter } from 'next/navigation';
import { CircularProgress } from '@/components/elements/CircularProgress';
import { usePromoCoupons } from '@/hooks/usePromoCoupons';

export interface CouponDiscountData {
  originalAmount: string;
  amountAfterDiscount: string;
  discountAmount: string;
  couponCode: string;
}

interface Props {
  open: boolean;
  handleClose: () => void;
  handleSubmit: (selectedPaymentMethod: PaymentMethod | null, appliedCouponCode?: string | null, discountData?: CouponDiscountData | null) => void;
  showAddPaymentButton?: boolean;
  priceId?: string;
  patientId?: string;
}

export const PaymentMethodsModal = ({
  open,
  handleClose,
  handleSubmit,
  showAddPaymentButton = false,
  priceId,
  patientId,
}: Readonly<Props>) => {
  const router = useRouter();

  const paymentMethods = useSelector((state: RootState) => state.paymentMethods);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [appliedDiscountData, setAppliedDiscountData] = useState<CouponDiscountData | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [isAutoApplyingCoupon, setIsAutoApplyingCoupon] = useState(false);

  const [isRouting, startTransition] = useTransition();

  const [triggerGetPaymentLinkToken, { isFetching }] = useLazyGetPaymentLinkTokenQuery();
  const [applyCouponMutation, { isLoading: isApplyingCoupon }] = useApplyCouponMutation();

  // Auto-apply coupon hook for existing patients (matches patientType: 'all' or 'existing')
  // Uses default saleType ('general_sale') and no time override
  const { findCouponForPriceId } = usePromoCoupons(undefined, 'existing');
  const autoAppliedRef = useRef(false);

  const handleConfirm = () => {
    handleSubmit(selectedPaymentMethod, appliedCoupon || undefined, appliedDiscountData || undefined);
  };

  const handlePaymentMethodSelect = (paymentMethod: PaymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    if (!priceId) {
      setCouponError('Unable to apply coupon - no product selected');
      return;
    }

    setCouponError(null);
    setCouponSuccess(null);

    try {
      const { data, error } = await applyCouponMutation({
        priceId,
        couponCode: couponCode.trim(),
        patientId,
      });

      if (error) {
        const apiError = error as { data?: { message?: string } };
        setCouponError(apiError?.data?.message || 'Failed to apply coupon');
        setAppliedCoupon(null);
        setAppliedDiscountData(null);
      } else if (data?.data) {
        // Success - coupon applied
        const trimmedCouponCode = couponCode.trim();
        setAppliedCoupon(trimmedCouponCode);
        setAppliedDiscountData({
          originalAmount: String(data.data.originalAmount),
          amountAfterDiscount: String(data.data.amountAfterDiscount),
          discountAmount: String(data.data.discountAmount),
          couponCode: trimmedCouponCode,
        });
        const discountAmount = parseFloat(String(data.data.discountAmount)) || 0;
        setCouponSuccess(`Coupon applied! You save $${discountAmount.toFixed(2)}`);
        setCouponError(null);
      } else {
        // No data returned
        setCouponError('Invalid coupon code');
        setAppliedCoupon(null);
        setAppliedDiscountData(null);
      }
    } catch (error) {
      console.error('Coupon error:', error);
      const apiError = error as { data?: { message?: string } };
      setCouponError(apiError?.data?.message || 'Failed to apply coupon');
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setAppliedDiscountData(null);
    setCouponCode('');
    setCouponSuccess(null);
    setCouponError(null);
  };

  async function handleGetPaymentLinkToken() {
    try {
      const { success, data } = await triggerGetPaymentLinkToken().unwrap();

      if (success && data?.token) {
        startTransition(() => {
          router.push(`${ROUTES.PATIENT_ACCOUNT}/${data?.token}`);
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  const renderCouponSection = () => (
    <div className='tw-mb-6'>
      <label className='tw-flex tw-items-center tw-gap-2 tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
        <FaTag className='tw-text-blue-600' />
        Have a coupon code?
      </label>
      {isAutoApplyingCoupon ? (
        <div className='tw-flex tw-items-center tw-gap-3 tw-p-3 tw-bg-blue-50 tw-border tw-border-blue-200 tw-rounded-lg'>
          <CircularProgress className='tw-size-5 tw-text-blue-600' />
          <div className='tw-flex-1'>
            <span className='tw-font-medium tw-text-blue-800'>Checking for available discounts...</span>
          </div>
        </div>
      ) : appliedCoupon ? (
        <div className='tw-flex tw-items-center tw-gap-3 tw-p-3 tw-bg-green-50 tw-border tw-border-green-200 tw-rounded-lg'>
          <FaCheck className='tw-text-green-600 tw-flex-shrink-0' />
          <div className='tw-flex-1'>
            <span className='tw-font-medium tw-text-green-800'>{appliedCoupon}</span>
            {couponSuccess && <p className='tw-text-sm tw-text-green-600 tw-m-0 tw-mt-1'>{couponSuccess}</p>}
          </div>
          <button
            type='button'
            onClick={handleRemoveCoupon}
            className='tw-p-2 tw-text-gray-500 hover:tw-text-red-600 tw-transition-colors'
            aria-label='Remove coupon'
          >
            <FaTimes />
          </button>
        </div>
      ) : (
        <div className='tw-flex tw-gap-2'>
          <input
            type='text'
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value);
              setCouponError(null);
            }}
            placeholder='Enter coupon code'
            className='tw-flex-1 tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-rounded-lg tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent'
            disabled={isApplyingCoupon}
          />
          <button
            type='button'
            onClick={handleApplyCoupon}
            disabled={isApplyingCoupon || !couponCode.trim()}
            className='tw-px-4 tw-py-2 tw-bg-blue-600 tw-text-white tw-rounded-lg tw-font-medium hover:tw-bg-blue-700 tw-transition-colors disabled:tw-opacity-50 disabled:tw-cursor-not-allowed tw-flex tw-items-center tw-gap-2'
          >
            {isApplyingCoupon ? <CircularProgress className='tw-size-4' /> : null}
            Apply
          </button>
        </div>
      )}
      {couponError && <p className='tw-text-sm tw-text-red-600 tw-mt-2 tw-m-0'>{couponError}</p>}
    </div>
  );

  const renderPaymentMethods = () => {
    if (!paymentMethods || paymentMethods.length === 0) {
      return (
        <div className='tw-text-center tw-py-8'>
          <div className='tw-mb-4'>
            <FaCreditCard size={48} className='tw-mx-auto tw-text-gray-400' />
          </div>
          <h6 className='tw-text-gray-500 tw-mb-2 tw-text-lg tw-font-medium'>No Payment Methods Available</h6>
          <p className='tw-text-gray-400 tw-text-sm tw-mb-6'>
            You need to add a payment method before switching plans.
          </p>
          <button
            type='button'
            disabled={isFetching || isRouting}
            className='tw-px-4 tw-py-2 sm:tw-py-3 disabled:tw-opacity-50 disabled:tw-pointer-events-none tw-inline-flex tw-items-center tw-justify-center tw-gap-3 tw-rounded-lg tw-font-medium tw-transition-all tw-duration-200 tw-bg-blue-600 tw-no-underline !tw-text-white hover:tw-bg-blue-700 focus:tw-ring-blue-500 hover:tw-shadow-md'
            onClick={handleGetPaymentLinkToken}
          >
            {isFetching || isRouting ? <CircularProgress className='tw-size-5' /> : <FaPlus />}
            Add Payment Method
          </button>
        </div>
      );
    }

    return (
      <div className='tw-space-y-3'>
        {paymentMethods.map((paymentMethod) => (
          <PaymentCard
            key={paymentMethod.id}
            paymentMethod={paymentMethod}
            isSelected={selectedPaymentMethod?.id === paymentMethod.id}
            handlePaymentMethodSelect={handlePaymentMethodSelect}
          />
        ))}
        {showAddPaymentButton && (
          <button
            type='button'
            disabled={isFetching || isRouting}
            className='tw-flex tw-items-center tw-gap-3 tw-group disabled:tw-opacity-50 disabled:tw-pointer-events-none tw-relative tw-p-4 tw-rounded-lg tw-border-2 tw-border-dashed tw-border-gray-300 tw-bg-gray-50 hover:tw-border-blue-500 hover:tw-bg-blue-50 tw-transition-all tw-w-full'
            onClick={handleGetPaymentLinkToken}
          >
            <div className='tw-flex-shrink-0 tw-w-12 tw-h-12 tw-rounded-full tw-bg-blue-100 group-hover:tw-bg-blue-200 tw-flex tw-items-center tw-justify-center tw-transition-colors tw-duration-200'>
              {isFetching || isRouting ? (
                <CircularProgress className='tw-size-5' />
              ) : (
                <FaPlus className='tw-text-blue-600 tw-text-lg' />
              )}
            </div>
            <div className='tw-flex-1 tw-text-left'>
              <h6 className='tw-text-gray-700 group-hover:tw-text-blue-700 tw-font-semibold tw-mb-1 tw-transition-colors tw-duration-200'>
                Add New Payment Method
              </h6>
              <p className='tw-text-gray-500 tw-text-sm tw-m-0'>Add a new card or payment option</p>
            </div>
            <div className='tw-flex-shrink-0'>
              <FaChevronRight className='tw-text-gray-400 group-hover:tw-text-blue-600 tw-transition-colors tw-duration-200' />
            </div>
          </button>
        )}
      </div>
    );
  };

  const isConfirmDisabled = !selectedPaymentMethod || paymentMethods?.length === 0 || isAutoApplyingCoupon || isApplyingCoupon;

  const footer = (
    <div className='tw-flex tw-justify-between tw-w-full tw-p-4 sm:tw-p-6 tw-mx-0 tw-mr-0'>
      <button
        className='tw-px-4 tw-py-2 sm:tw-py-3 tw-text-gray-700 tw-bg-neutral-200 tw-border tw-border-gray-200 tw-rounded-lg tw-font-medium hover:tw-bg-neutral-300 tw-transition-colors tw-duration-200 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-gray-500 focus:tw-ring-offset-2'
        onClick={handleClose}
      >
        Cancel
      </button>
      <button
        className='tw-px-4 tw-py-2 sm:tw-py-3 tw-rounded-lg tw-font-medium tw-transition-all tw-text-base tw-duration-200 tw-bg-blue-600 tw-no-underline !tw-text-white hover:tw-bg-blue-700 focus:tw-ring-blue-500 hover:tw-shadow-md tw-mr-0'
        onClick={handleConfirm}
        disabled={isConfirmDisabled}
      >
        Confirm Selection
      </button>
    </div>
  );

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      if (!selectedPaymentMethod && paymentMethods && paymentMethods.length > 0) {
        setSelectedPaymentMethod(paymentMethods[0]);
      }
    } else {
      // Reset coupon state when modal closes
      setCouponCode('');
      setAppliedCoupon(null);
      setAppliedDiscountData(null);
      setCouponError(null);
      setCouponSuccess(null);
      setIsAutoApplyingCoupon(false);
      autoAppliedRef.current = false;
    }
  }, [open, paymentMethods, selectedPaymentMethod]);

  // Auto-apply coupon for existing patients when modal opens
  useEffect(() => {
    if (!open || !priceId || autoAppliedRef.current || appliedCoupon) return;

    const autoApplyCoupon = async () => {
      // Check if there's a matching coupon for this priceId (for existing patients)
      const couponInfo = findCouponForPriceId(priceId);
      if (!couponInfo) return;

      autoAppliedRef.current = true;
      setIsAutoApplyingCoupon(true);

      try {
        // Use applyCouponMutation directly to pass patientId
        const { data, error } = await applyCouponMutation({
          priceId,
          couponCode: couponInfo.couponCode,
          patientId,
        });

        if (!error && data?.data) {
          const discountAmount = parseFloat(String(data.data.discountAmount)) || 0;
          setAppliedCoupon(couponInfo.couponCode);
          setAppliedDiscountData({
            originalAmount: String(data.data.originalAmount),
            amountAfterDiscount: String(data.data.amountAfterDiscount),
            discountAmount: String(data.data.discountAmount),
            couponCode: couponInfo.couponCode,
          });
          setCouponSuccess(`Coupon auto-applied! You save $${discountAmount.toFixed(2)}`);
        }
      } catch (error) {
        console.error('Failed to auto-apply coupon:', error);
      } finally {
        setIsAutoApplyingCoupon(false);
      }
    };

    autoApplyCoupon();
  }, [open, priceId, appliedCoupon, findCouponForPriceId, applyCouponMutation, patientId]);

  return (
    <Modal
      size='lg'
      title='Select Payment Method'
      isOpen={open}
      onClose={handleClose}
      footer={paymentMethods.length > 0 ? footer : undefined}
      footerClassName='!tw-p-0 !tw-grid-cols-1 !tw-gap-0'
    >
      {priceId && renderCouponSection()}
      {renderPaymentMethods()}
    </Modal>
  );
};
