'use client';

import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';
import { IoClose } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { ProductImage } from '@/components/ProductImage';
import StarTrophyIcon from '@/components/Icon/StarTrophyIcon';
import { MedicalIntakeModal } from '@/components/Dashboard/modals/MedicalIntakeModal';
import { SubscriptionUpgradeModal } from '@/components/Dashboard/modals/SubscriptionUpgradeModal';
import { SubscriptionUpgradeConfirmationModal } from '@/components/Dashboard/modals/SubscriptionUpgradeConfirmationModal';
// import { SubscriptionUpgradeSuccessModal } from '@/components/Dashboard/modals/SubscriptionUpgradeSuccessModal';
import { AlertBox } from '@/components/Dashboard/patient/AlertBox';
import { SubscriptionsData } from '@/store/slices/patientAtiveSubscriptionSlice';
import { RootState } from '@/store';
import { formatUSDate, formatUSTime } from '@/helpers/dateFormatter';
import { shouldHideCalendlyFeature, shouldShowCalendlyFeature } from '@/helpers/featureFlags';
import { ROUTES, SUBSCRIPTION_UPGRADE } from '@/constants';
import { format } from 'date-fns';
import {
  useGetPatientProfileQuery,
  useLazyCheckOneTimeToSubscriptionEligibilityQuery,
} from '@/store/slices/userApiSlice';
import { SubscriptionUpgradeSuccessModal } from '@/components/Dashboard/modals/SubscriptionUpgradeSuccessModal';
import {
  useLazyGetRefillSurveyRequestsQuery,
  RefillSurveyRequest,
} from '@/store/slices/refillsApiSlice';
import { useUpgradePlanMutation, useGetActiveSubscriptionQuery } from '@/store/slices/subscriptionsApiSlice';
import { useGetPaymentMethodsQuery } from '@/store/slices/patientPaymentApiSlice';
import { PlanType } from '@/types/medications';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import priceIdsData from '@/data/priceIds.json';
import InjectionInstructionsCard from '@/components/Common/InjectionInstructions';


interface Props {
  subscriptions?: SubscriptionsData;
}

const SHIPPING_NOTICE_STORAGE_KEY = 'shipping_notice_dismissed';
const SUBSCRIPTION_UPGRADE_MODAL_DISMISSED_KEY = 'subscription_upgrade_modal_dismissed_';

export default function Dashboard({ subscriptions }: Readonly<Props>) {
  const pathname = usePathname();
  const router = useRouter();
  const [hideModal, setHideModal] = useState(false);
  const [showShippingNotice, setShowShippingNotice] = useState(false);
  const [showSubscriptionUpgradeModal, setShowSubscriptionUpgradeModal] = useState(false);
  const [showSubscriptionUpgradeConfirmationModal, setShowSubscriptionUpgradeConfirmationModal] = useState(false);
  const [showSubscriptionUpgradeSuccessModal, setShowSubscriptionUpgradeSuccessModal] = useState(false);
  const [isEligibleForUpgrade, setIsEligibleForUpgrade] = useState(false);
  const [pendingRefillRequests, setPendingRefillRequests] = useState<RefillSurveyRequest[]>([]);

  const profile = useSelector((state: RootState) => state.patientProfile);
  const { data: surveys = [] } = useSelector((state: RootState) => state.patientSurveys.globalPending);
  const storeSubscriptions = useSelector((state: RootState) => state.patientActiveSubscription);
  const paymentMethods = useSelector((state: RootState) => state.paymentMethods);
  const currentSubscriptions = storeSubscriptions?.activeSubscriptions?.length > 0 ? storeSubscriptions : subscriptions;

  // Use the query hook to ensure profile is loaded immediately
  useGetPatientProfileQuery();
  useGetActiveSubscriptionQuery(); // Refresh subscriptions after upgrade
  useGetPaymentMethodsQuery(); // Fetch payment methods and store in Redux

  const [getRefillSurveyRequests] = useLazyGetRefillSurveyRequestsQuery();
  const [checkEligibility] = useLazyCheckOneTimeToSubscriptionEligibilityQuery();
  const [upgradePlan, { isLoading: isUpgrading }] = useUpgradePlanMutation();

  // Get priceIds from staging
  const priceIds = priceIdsData.staging;
  const currentPriceId = priceIds.glp1_gip_3m_starter;
  const toSwitchPriceId = priceIds.glp1_gip_3m_subscription;

  // Get upgrade details from constants
  const upgradePercentage = SUBSCRIPTION_UPGRADE.PERCENTAGE;
  const upgradePrice = SUBSCRIPTION_UPGRADE.PRICE;

  // Get one-time purchase subscription for medicineTypeId
  const oneTimeSubscription = useMemo(() => {
    return currentSubscriptions?.activeSubscriptions?.find(
      (sub) => sub.subscriptionType === PlanType.ONE_TIME
    );
  }, [currentSubscriptions]);

  // Get medicineTypeId from one-time product data
  const medicineTypeId = useMemo(() => {
    if (!oneTimeSubscription || !currentSubscriptions?.oneTimeProducts) return '';

    // Find the product that matches the one-time subscription
    const oneTimeProduct = currentSubscriptions.oneTimeProducts.weight_loss_glp_1_gip_injection_one_time;
    if (oneTimeProduct?.products?.[0]?.medicineTypeId) {
      return oneTimeProduct.products[0].medicineTypeId;
    }

    return '';
  }, [oneTimeSubscription, currentSubscriptions]);

  const isIntakeIncomplete = profile?.isTelePathFormComplete === false;

  const showCalendlyModal = shouldHideCalendlyFeature(profile?.email);

  const showModal = isIntakeIncomplete && !hideModal && showCalendlyModal;

  const showAlert = isIntakeIncomplete && showCalendlyModal;

  const currentDate = formatUSDate(new Date());

  const currentTime = formatUSTime(new Date());

  const handleDismissShippingNotice = () => {
    localStorage.setItem(SHIPPING_NOTICE_STORAGE_KEY, 'true');
    setShowShippingNotice(false);
  };

  const handleActivatePortal = () => {
    window.open('https://lumimeds.telepath.clinic/signup', '_blank');
  };

  const handleOnCancel = () => {
    setHideModal(true);
  };

  const handleCloseSubscriptionUpgradeModal = () => {
    // Save dismissal state for current route
    const storageKey = `${SUBSCRIPTION_UPGRADE_MODAL_DISMISSED_KEY}${pathname}`;
    localStorage.setItem(storageKey, 'true');
    setShowSubscriptionUpgradeModal(false);
  };

  const handleShowConfirmationModal = () => {
    setShowSubscriptionUpgradeConfirmationModal(true);
  };

  const handleShowUpgradeModal = () => {
    setShowSubscriptionUpgradeModal(true);
  };

  const handleCloseConfirmationModal = () => {
    setShowSubscriptionUpgradeConfirmationModal(false);
  };

  const handleCloseSuccessModal = () => {
    setShowSubscriptionUpgradeSuccessModal(false);
    // Redirect to payments-subscriptions page after closing success modal
    router.push(ROUTES.PATIENT_PAYMENTS_SUBSCRIPTIONS);
  };

  const handleUpgradeSubscription = async (selectedPaymentMethodId: string) => {
    if (!oneTimeSubscription) {
      toast.error('Unable to find one-time purchase subscription.');
      return;
    }

    if (!selectedPaymentMethodId) {
      toast.error('Please select a payment method.');
      return;
    }

    if (!medicineTypeId) {
      toast.error('Unable to determine medicine type. Please try again.');
      return;
    }

    try {
      const { success, message, statusCode } = await upgradePlan({
        currentPriceId,
        toSwitchPriceId,
        paymentMethodId: selectedPaymentMethodId,
        medicineTypeId,
      }).unwrap();

      if (success) {
        toast.success('Subscription upgraded successfully!');
        setShowSubscriptionUpgradeConfirmationModal(false);
        setShowSubscriptionUpgradeModal(false);
        // Show success modal (redirect will happen when user closes it)
        setShowSubscriptionUpgradeSuccessModal(true);
        // Refresh subscriptions - the useGetActiveSubscriptionQuery will automatically refresh
      } else if (statusCode === 400 && message?.toLowerCase()?.includes('no payment method saved')) {
        toast.error('Please add a payment method first.');
      } else {
        toast.error(message || 'Failed to upgrade subscription. Please try again.');
      }
    } catch (err) {
      const error = err as FetchBaseQueryError;
      const errorData = error?.data as { statusCode?: number; message?: string } | undefined;

      const statusCode = errorData?.statusCode;
      const message = errorData?.message;

      if (statusCode === 400 && message?.toLowerCase()?.includes('no payment method saved')) {
        toast.error('Please add a payment method first.');
      } else {
        toast.error(message || 'Failed to upgrade subscription. Please try again.');
      }
      // Close modal on error
      setShowSubscriptionUpgradeConfirmationModal(false);
    }
  };

  const showPendingSubmissionAlert = useMemo(() => {
    const showPendingAlert = shouldShowCalendlyFeature(profile?.email);

    if (showPendingAlert) {
      return surveys?.filter((survey) => survey.isSubmissionRequired).length > 0;
    }

    return false;
  }, [profile?.email, surveys]);

  // Check for pending refill payment requests (status: on_hold with replacementPrice)
  useEffect(() => {
    const fetchPendingRefillRequests = async () => {
      try {
        const result = await getRefillSurveyRequests({
          status: 'on_hold',
          page: 1,
          limit: 100, // Get all pending requests
        }).unwrap();

        if (result?.data?.requests) {
          // Filter for requests that have a replacementPrice (admin has sent payment request)
          const pendingRequests = result.data.requests.filter(
            (request: RefillSurveyRequest) => request.status === 'on_hold' && request.replacementPrice?.id
          );
          setPendingRefillRequests(pendingRequests);
        }
      } catch (error) {
        console.error('Error fetching refill requests:', error);
        setPendingRefillRequests([]);
      }
    };

    // Only fetch if user is logged in (profile exists)
    if (profile?.id) {
      fetchPendingRefillRequests();
    }
  }, [profile?.id, getRefillSurveyRequests]);

  const showPendingRefillAlert = useMemo(() => {
    return pendingRefillRequests.length > 0;
  }, [pendingRefillRequests]);

  // Check localStorage on mount to determine if alert should be shown
  useEffect(() => {
    const isDismissed = localStorage.getItem(SHIPPING_NOTICE_STORAGE_KEY) === 'true';
    setShowShippingNotice(!isDismissed);
  }, []);

  // Check eligibility for subscription upgrade using API
  useEffect(() => {
    const fetchEligibility = async () => {
      try {
        const result = await checkEligibility().unwrap();
        const isEligible = result?.isEligible || false;
        setIsEligibleForUpgrade(isEligible);

        // Check if modal was dismissed for current route
        const storageKey = `${SUBSCRIPTION_UPGRADE_MODAL_DISMISSED_KEY}${pathname}`;
        const isDismissed = localStorage.getItem(storageKey) === 'true';

        // Only show modal if eligible AND not dismissed for this route
        setShowSubscriptionUpgradeModal(isEligible && !isDismissed);
      } catch (error) {
        // If API fails, don't show the modal
        console.error('Error checking upgrade eligibility:', error);
        setIsEligibleForUpgrade(false);
        setShowSubscriptionUpgradeModal(false);
      }
    };

    // Only check eligibility if user is logged in (profile exists)
    if (profile?.id) {
      fetchEligibility();
    }
  }, [profile?.id, checkEligibility, pathname]);

  return (
    <>
      <div className='patient-home'>
        {showShippingNotice && (
          <div
            className='tw-flex tw-gap-3 tw-bg-yellow-50 tw-border tw-border-yellow-200 tw-text-yellow-800 tw-rounded-lg tw-p-4 tw-mb-4 tw-relative'
            role='alert'
          >
            <div className='tw-flex-1 tw-text-start'>
              <strong className='tw-font-semibold'>Shipping Notice:</strong> Once your medical intake form has been
              CORRECTLY COMPLETED, Please allow 5-7 business days for your order to be Processed and Shipped.
            </div>
            <button
              onClick={handleDismissShippingNotice}
              className='tw-flex-shrink-0 tw-self-center tw-text-yellow-600 hover:tw-text-yellow-800 tw-transition-colors tw-rounded tw-p-1 hover:tw-bg-yellow-100'
              aria-label='Dismiss alert'
            >
              <IoClose className='tw-w-5 tw-h-5' />
            </button>
          </div>
        )}

        {/* Date Placeholder */}
        <p>{currentDate}</p>

        {/* Greeting Placeholder */}

        <h1 className='page-title mb-5'>{`Hello, ${profile?.firstName || 'User'}!`}</h1>

        {(showPendingSubmissionAlert || showAlert || showPendingRefillAlert) && (
          <div className='tw-space-y-4 tw-mb-6'>
            <div className='alert-box__heading'>
              <h1>Alerts</h1>
            </div>
            {showPendingRefillAlert ? (
              <AlertBox
                currentDate={currentDate}
                currentTime={currentTime}
                title='Action Required: Pending Refill Payment Request'
                description={`You have ${pendingRefillRequests.length} pending refill payment request${pendingRefillRequests.length > 1 ? 's' : ''
                  } from the admin. Please review and respond to proceed with your refill.`}
                actions={
                  <Link href={`${ROUTES.PATIENT_ORDERS}?tab=Refills`} className='btn btn-primary'>
                    View Request{pendingRefillRequests.length > 1 ? 's' : ''}
                  </Link>
                }
              />
            ) : null}
            {showPendingSubmissionAlert ? (
              <AlertBox
                currentDate={currentDate}
                currentTime={currentTime}
                title='Action Required: Complete Your Medical Intake'
                description='Complete your medical intake form so our providers can review your request and confirm the right treatment.'
                actions={
                  <Link href={ROUTES.PATIENT_FORMS} className='btn btn-primary'>
                    Complete
                  </Link>
                }
              />
            ) : null}
            {showAlert ? (
              <AlertBox
                currentDate={currentDate}
                currentTime={currentTime}
                title='Action Required: Complete Your Medical Intake'
                description='Set up your Telepath portal now so our doctors can receive and review your request for medication and correct dosage.'
                actions={
                  <button onClick={handleActivatePortal} className='alert-box__actions-button'>
                    Set up now
                  </button>
                }
              />
            ) : null}
          </div>
        )}

        <div className='dashboard-card  tw-p-5 md:tw-p-9 tw-bg-primary/15 tw-border tw-border-primary/10 tw-rounded-lg'>
          <p className={'tw-text-xl'}>Your Plans</p>
          {subscriptions?.activeSubscriptions.length && subscriptions?.activeSubscriptions.length > 0 ? (
            <div className='tw-flex tw-flex-col tw-gap-6'>
              {subscriptions.activeSubscriptions.map((subscription) => {
                const showAction =
                  subscription?.orderStatus?.toLowerCase() === 'reverted' ||
                  subscription?.orderStatus?.toLowerCase() === 'rolled_back';
                return (
                  <div className={'card border-0 rounded-3 shadow-md p-2'} key={subscription.id}>
                    <div className='tw-p-4 tw-flex tw-items-start  tw-gap-2 sm:tw-gap-4'>
                      <ProductImage
                        imageClassName='!tw-h-5/6 tw-my-auto'
                        image={subscription?.productImage ?? ''}
                        alt={subscription?.productName ?? ''}
                        className='tw-w-16 tw-h-16 tw-py-4 tw-flex-shrink-0 border rounded-2 tw-flex tw-items-center tw-justify-center'
                      />
                      <div className='tw-flex-grow fw-bold subscription-title tw-line-clamp-3 tw-break-words'>
                        <div>{subscription?.productName || 'No active subscription'}</div>
                      </div>
                      <Link
                        href={'/patient/payments-subscriptions'}
                        className='tw-px-1.5 tw-py-1.5 tw-border-black tw-border tw-text-black tw-no-underline tw-font-medium tw-text-nowrap tw-rounded-lg hover:tw-bg-black hover:tw-text-white bouncing-effect patient_update_btn'
                      >
                        Manage Plan
                      </Link>
                    </div>
                    <div className='tw-px-4 tw-pb-2 tw-flex tw-flex-col tw-gap-1'>
                      <div className='tw-flex tw-flex-col sm:tw-flex-row tw-gap-1 sm:tw-gap-2 tw-items-start sm:tw-items-center tw-flex-shrink-0'>
                        <div className='tw-flex tw-items-center tw-gap-2 tw-flex-wrap'>
                          <span className='tw-font-medium tw-flex-shrink-0'>Status</span>
                          <div className={`status-badge ${subscription?.orderStatus?.toLowerCase() ?? 'pending'}`}>
                            {showAction ? 'Action Required' : subscription?.orderStatus?.split('_').join(' ') ?? 'N/A'}
                          </div>
                          {subscription.orderStatus === 'Pending_Renewal_Intake' &&
                            subscription?.renewalIntakeSurveyUrl && (
                              <a
                                href={subscription?.renewalIntakeSurveyUrl}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='tw-underline-offset-4 tw-text-nowrap'
                              >
                                Complete Intake
                              </a>
                            )}
                        </div>

                        {subscription?.orderLastUpdatedAt && (
                          <div className='tw-text-gray-500 tw-flex-shrink-0'>
                            <span>Updated on:</span>{' '}
                            <span>{format(new Date(subscription.orderLastUpdatedAt), 'MMM d, yyyy')}</span>
                          </div>
                        )}
                          <InjectionInstructionsCard />
                         
                      </div>
                      {showAction ? (
                        <div className='tw-text-primary tw-text-sm'>Please contact the support team.</div>
                      ) : (
                        subscription?.orderPatientRemarks && (
                          <div className='tw-font-medium tw-flex tw-gap-2'>
                            <span className='tw-flex-shrink-0'>Remarks:</span> {subscription.orderPatientRemarks}
                          </div>
                        )
                      )}

                      {/* Upgrade Banner - Show inside card below status line when eligible */}
                      {isEligibleForUpgrade && subscription.subscriptionType === PlanType.ONE_TIME && (
                        <div className='tw-mt-4 tw-bg-[#3060FE] tw-rounded-lg tw-px-4 md:tw-px-6 tw-py-4 tw-flex tw-items-center tw-gap-4 tw-justify-between tw-flex-wrap'>
                          <div className='tw-flex tw-items-center tw-gap-4 tw-flex-1'>
                            <div className='tw-flex-shrink-0'>
                              <StarTrophyIcon />
                            </div>
                            <p className='tw-text-sm md:tw-text-base tw-text-white tw-mb-0 tw-font-secondary'>
                              Yahoo! You are eligible for a discounted upgrade with {upgradePercentage} discount applied. Pay only ${upgradePrice} for $649 Subscription
                            </p>
                          </div>
                          <button
                            onClick={handleShowUpgradeModal}
                            className='tw-bg-white tw-text-black tw-px-4 md:tw-px-6 tw-py-2.5 tw-rounded-lg tw-font-medium tw-text-sm md:tw-text-base tw-transition-colors tw-duration-200 tw-font-secondary tw-whitespace-nowrap'
                          >
                            Upgrade to Value 3-Month Subscription
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className='tw-text-center tw-py-8'>
              <h4>No current plans.</h4>
              <p className='tw-font-medium'> You don&apos;t have any active plans right now.</p>
              <Link href={ROUTES.PATIENT_PAYMENTS_SUBSCRIPTIONS} className='btn btn-primary fw-semibold px-4 py-2'>
                Buy Plan
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}

      <MedicalIntakeModal show={showModal} onComplete={handleActivatePortal} onCancel={handleOnCancel} />
      <SubscriptionUpgradeModal
        show={showSubscriptionUpgradeModal}
        onClose={handleCloseSubscriptionUpgradeModal}
        onShowConfirmation={handleShowConfirmationModal}
      />
      <SubscriptionUpgradeConfirmationModal
        show={showSubscriptionUpgradeConfirmationModal}
        onClose={handleCloseConfirmationModal}
        onConfirm={handleUpgradeSubscription}
        isLoading={isUpgrading}
        paymentMethods={paymentMethods}
      />
      <SubscriptionUpgradeSuccessModal
        show={showSubscriptionUpgradeSuccessModal}
        onClose={handleCloseSuccessModal}
        subscriptionName={oneTimeSubscription?.productName}
      />
    </>
  );
}
