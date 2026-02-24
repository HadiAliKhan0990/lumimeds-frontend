'use client';

import toast from 'react-hot-toast';
import PricingPlanModal from '@/components/Dashboard/patient/subscriptions/includes/OtherPlans/includes/PricingPlanModal';
import SwitchPlanModal from '@/components/Dashboard/patient/subscriptions/includes/OtherPlans/includes/SwitchPlanModal';
import SwitchPlanSuccessModal from '@/components/Dashboard/patient/subscriptions/includes/OtherPlans/includes/SwitchPlanSuccessModal';
import PendingIntakeFormModal from '@/components/Dashboard/patient/subscriptions/includes/OtherPlans/includes/PendingIntakeFormModal';
import { PaymentMethodsModal } from '@/components/Dashboard/patient/subscriptions/includes/OtherPlans/includes/PaymentMethodsModal';
import { Error } from '@/lib/types';
import {
  CreateRecurringSubscriptionPayload,
  useCreateRecurringSubscriptionMutation,
} from '@/store/slices/subscriptionsApiSlice';
import { useMemo, useState, useTransition } from 'react';
import { ConfirmationModalState, ModalState, SuccessModalType } from '@/types/products';
import { PlanCard } from '@/components/Dashboard/patient/subscriptions/includes/SubscriptionPlans/includes/PlanCard';
import { PlanProduct, Product, SubscriptionsData } from '@/store/slices/patientAtiveSubscriptionSlice';
import { PaymentMethod } from '@/store/slices/paymentMethodsSlice';
import { PlanType } from '@/types/medications';
import { useRouter } from 'next/navigation';
import { createPaymentToken } from '@/services/paymentMethod';
import { ROUTES } from '@/constants';
import { isAxiosError } from 'axios';
import { AddAddressModal } from '@/components/Dashboard/patient/components/AddAddressModal';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { client } from '@/lib/baseQuery';
import '@/styles/subscriptionStyles.scss';

interface Props {
  subscriptionType: PlanType;
  subscriptions?: SubscriptionsData;
}

export default function OtherPlans({ subscriptionType, subscriptions }: Readonly<Props>) {
  const router = useRouter();
  const patientProfile = useSelector((state: RootState) => state.patientProfile);

  const [showModal, setShowModal] = useState<ModalState>({ show: false, selectedProduct: undefined });
  const [showSuccessModal, setShowSuccessModal] = useState<SuccessModalType>({ state: false, name: '' });
  const [showConfirmationModal, setShowConfirmationModal] = useState<ConfirmationModalState>({
    show: false,
    selectedProduct: undefined,
  });
  const [showPaymentMethodsModal, setShowPaymentMethodsModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | undefined>(undefined);
  const [appliedDiscount, setAppliedDiscount] = useState<{
    originalAmount: string;
    amountAfterDiscount: string;
    discountAmount: string;
    couponCode: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [pendingIntakeSurveyUrl, setPendingIntakeSurveyUrl] = useState<string | null>(null);
  const [showPendingIntakeModal, setShowPendingIntakeModal] = useState(false);
  const [isCheckingPendingIntake, setIsCheckingPendingIntake] = useState(false);

  const [isPending, startTransition] = useTransition();

  const [createRecurringSubscription, { isLoading: isCreating }] = useCreateRecurringSubscriptionMutation();

  const { subscriptionProducts, oneTimeProducts } = subscriptions || {};

  async function handleCreatePaymentMethod() {
    try {
      setLoading(true);
      const { data } = await createPaymentToken();
      if (data.data) {
        startTransition(() => {
          router.push(`${ROUTES.PATIENT_ACCOUNT}/${data?.data?.token}`);
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const handleUpgradePlan = async (address?: CreateRecurringSubscriptionPayload['address']) => {
    const selected = showConfirmationModal.selectedProduct || pendingProduct;

    if (!selected) return;
    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method to continue.');
      return;
    }

    try {
      // Create the subscription (payment method selection is handled separately)
      const { success, message, statusCode } = await createRecurringSubscription({
        price_id: selected.prices?.[0]?.priceId || '',
        paymentMethodId: selectedPaymentMethod.id,
        medicineTypeId: selected.medicineTypeId,
        ...(appliedCouponCode && { couponCode: appliedCouponCode }),
        ...(address && { address }),
      }).unwrap();

      if (success) {
        if (address) {
          setShowAddAddressModal(false);
        }

        // Check pending intake after successful plan purchase/switch (before showing success modal)
        // Retry up to 3 times if surveyUrl is null to confirm it's really null
        let surveyUrlToShow: string | null = null;
        try {
          setIsCheckingPendingIntake(true);
          const email = patientProfile?.email;
          const medicineName = selected.medicineName;
          
          if (email && medicineName) {
            const maxRetries = 2;
            const retryDelay = 1000; // 1 second between retries
            
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
              try {
                const response = await client.get('/patients/check-pending-intake', {
                  params: { email, medicineName },
                });
                
                surveyUrlToShow = response.data?.data?.surveyUrl || null;
                
                // If we got a surveyUrl, break out of the retry loop
                if (surveyUrlToShow) {
                  break;
                }
                
                // If no surveyUrl and not the last attempt, wait before retrying
                if (attempt < maxRetries) {
                  await new Promise((resolve) => setTimeout(resolve, retryDelay));
                }
              } catch (error) {
                console.error(`Error checking pending intake (attempt ${attempt}/${maxRetries}):`, error);
                // If not the last attempt, wait before retrying
                if (attempt < maxRetries) {
                  await new Promise((resolve) => setTimeout(resolve, retryDelay));
                }
              }
            }
          }
        } catch (error) {
          console.error('Error in pending intake check:', error);
        } finally {
          setIsCheckingPendingIntake(false);
        }
        
        // Set the survey URL before showing success modal
        if (surveyUrlToShow) {
          setPendingIntakeSurveyUrl(surveyUrlToShow);
        }
        
        setShowSuccessModal({ state: true, name: selected.name });
        
        setTimeout(() => {
          router.refresh();
        }, 5000);
      } else if (statusCode === 400 && message?.toLowerCase()?.includes('no payment method saved')) {
        handleCreatePaymentMethod();
      } else if (statusCode === 418) {
        setShowAddAddressModal(true);
        setPendingProduct(selected);
      } else {
        toast.error(message || 'Failed to switch subscription plan. Please try again.');
      }

      setSelectedPaymentMethod(null);
      setAppliedCouponCode(undefined);
      setShowConfirmationModal({
        show: false,
        selectedProduct: undefined,
      });
      setPendingProduct(null);
    } catch (err) {
      const { statusCode, message } = isAxiosError(err) ? err.response?.data : (err as Error).data;
      if (statusCode === 400 && message?.toLowerCase()?.includes('no payment method saved')) {
        handleCreatePaymentMethod();
      } else if (statusCode === 418) {
        setShowAddAddressModal(true);
        setPendingProduct(selected);
      } else {
        toast.error(message || 'Failed to switch subscription plan. Please try again.');
      }
    } finally {
      setShowConfirmationModal({
        show: false,
        selectedProduct: undefined,
      });
    }
  };

  const onLearnMore = (plan: PlanProduct) => {
    setShowModal({ show: true, selectedProduct: plan });
  };

  const handlePlanSelect = (plan: Product) => {
    setShowModal((prev) => ({ ...prev, show: false }));
    setSelectedPaymentMethod(null);
    setShowConfirmationModal({
      show: false, // Don't show confirmation modal yet
      selectedProduct: plan,
    });
    // Show payment methods modal first
    setShowPaymentMethodsModal(true);
  };

  const onClose = () => {
    setShowConfirmationModal({
      show: false,
      selectedProduct: undefined,
    });
    setSelectedPaymentMethod(null);
    setAppliedCouponCode(undefined);
    setAppliedDiscount(null);
  };

  const handlePaymentMethodSelect = (
    paymentMethod: PaymentMethod | null, 
    couponCode?: string | null,
    discountData?: { originalAmount: string; amountAfterDiscount: string; discountAmount: string; couponCode: string } | null
  ) => {
    if (paymentMethod) {
      setShowModal((prev) => ({ ...prev, selectedProduct: undefined }));
      setSelectedPaymentMethod(paymentMethod);
      setAppliedCouponCode(couponCode || undefined);
      setAppliedDiscount(discountData || null);
      setShowConfirmationModal((prev) => ({
        ...prev,
        show: true,
      }));
      // Close the payment methods modal after showing confirmation modal
      setShowPaymentMethodsModal(false);
    } else {
      toast.error('Please select a payment method to continue.');
    }
  };

  const handlePaymentMethodsModalClose = () => {
    setShowPaymentMethodsModal(false);
    setSelectedPaymentMethod(null);
    setAppliedCouponCode(undefined);
    setAppliedDiscount(null);
    setShowConfirmationModal({
      show: false,
      selectedProduct: undefined,
    });
  };

  const isNadEnabled = process.env.NEXT_PUBLIC_NAD_ENABLED === 'true';

  const plansData = useMemo(() => {
    if (subscriptionType === PlanType.RECURRING) {
      if (!subscriptionProducts) return [];
      return [
        subscriptionProducts.weight_loss_glp_1_injection_recurring,
        subscriptionProducts.weight_loss_glp_1_gip_injection_recurring,
        isNadEnabled && subscriptionProducts.longevity_nad_injection_recurring,
      ].filter(Boolean);
    } else {
      if (!oneTimeProducts) return [];
      return [
        oneTimeProducts.weight_loss_glp_1_503b_injection_one_time,
        oneTimeProducts.weight_loss_glp_1_gip_injection_one_time,
        isNadEnabled && oneTimeProducts.longevity_nad_injection_one_time,
      ].filter(Boolean);
    }
  }, [subscriptionProducts, oneTimeProducts]);
  return (
    <div className='pt-4'>
      <h2 className='fs-2 fw-normal mb-4'>Plans</h2>
      <div className='position-relative max-w-1000px mx-auto'>
        {plansData.length > 0 && (
          <div className='pb-5 row g-4 justify-content-center'>
            {plansData.map(
              (p) =>
                p && (
                  <div key={p.displayName} className={'col-md-6 ' + (plansData.length > 2 ? 'col-xl-4' : 'col-xl-5')}>
                    <PlanCard plan={p} onLearnMore={onLearnMore} />
                  </div>
                )
            )}
          </div>
        )}
      </div>

      {/* Modals */}

      <PricingPlanModal modalState={showModal} setShowModal={setShowModal} handlePlanSelect={handlePlanSelect} />

      <PaymentMethodsModal
        open={showPaymentMethodsModal}
        handleClose={handlePaymentMethodsModalClose}
        handleSubmit={handlePaymentMethodSelect}
        priceId={showConfirmationModal.selectedProduct?.prices?.[0]?.priceId || undefined}
        patientId={patientProfile?.id}
      />

      <SwitchPlanModal
        isLoading={isCreating || loading || isPending || isCheckingPendingIntake}
        state={showConfirmationModal}
        onClose={onClose}
        onConfirm={handleUpgradePlan}
        appliedDiscount={appliedDiscount}
      />

      <AddAddressModal
        open={showAddAddressModal}
        onClose={() => setShowAddAddressModal(false)}
        onSaveAddress={handleUpgradePlan}
        isSubmitting={isCreating || loading || isPending || isCheckingPendingIntake}
      />

      <SwitchPlanSuccessModal
        show={showSuccessModal.state}
        name={showSuccessModal.name}
        onClose={() => {
          console.log('Success modal closing, pendingIntakeSurveyUrl:', pendingIntakeSurveyUrl);
          setShowSuccessModal({ state: false, name: null });
          
          // Show intake form modal if pending
          if (pendingIntakeSurveyUrl) {
            console.log('Showing PendingIntakeFormModal');
            setShowPendingIntakeModal(true);
          }
        }}
      />

      <PendingIntakeFormModal
        show={showPendingIntakeModal}
        surveyUrl={pendingIntakeSurveyUrl}
        onClose={() => {
          setShowPendingIntakeModal(false);
          setPendingIntakeSurveyUrl(null);
        }}
      />
    </div>
  );
}
