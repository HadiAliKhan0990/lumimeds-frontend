'use client';

import ActiveSubscription from '@/components/Dashboard/patient/subscriptions/includes/ActiveSubscription';
import OtherPlans from '@/components/Dashboard/patient/subscriptions/includes/OtherPlans';
import { SubscriptionUpgradeModal } from '@/components/Dashboard/modals/SubscriptionUpgradeModal';
import { SubscriptionUpgradeConfirmationModal } from '@/components/Dashboard/modals/SubscriptionUpgradeConfirmationModal';
import { PlanType } from '@/types/medications';
import { SubscriptionsData } from '@/store/slices/patientAtiveSubscriptionSlice';
import { useMemo, useState, useEffect } from 'react';
import { FiInbox } from 'react-icons/fi';
import { IoClose } from 'react-icons/io5';
import toast from 'react-hot-toast';
import StarTrophyIcon from '@/components/Icon/StarTrophyIcon';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { usePathname } from 'next/navigation';
import { useLazyCheckOneTimeToSubscriptionEligibilityQuery } from '@/store/slices/userApiSlice';
import { useUpgradePlanMutation, useGetActiveSubscriptionQuery } from '@/store/slices/subscriptionsApiSlice';
import priceIdsData from '@/data/priceIds.json';
import { SUBSCRIPTION_UPGRADE } from '@/constants';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SubscriptionUpgradeSuccessModal } from '@/components/Dashboard/modals/SubscriptionUpgradeSuccessModal';

interface Props {
  subscriptions?: SubscriptionsData;
}

const SUBSCRIPTION_UPGRADE_MODAL_DISMISSED_KEY = 'subscription_upgrade_modal_dismissed_';
const SUBSCRIPTION_UPGRADE_SUCCESS_BANNER_KEY = 'subscription_upgrade_success_banner_shown';
const SUBSCRIPTION_UPGRADE_SUCCESS_BANNER_DISMISSED_KEY = 'subscription_upgrade_success_banner_dismissed';
const TARGET_SUBSCRIPTION_PRODUCT_NAME = 'Compounded Tirzepatide (GLP-1/GIP) Weight loss Injections Value 3-Month Subscription';

export default function OneTimePurchases({ subscriptions }: Readonly<Props>) {
  const pathname = usePathname();
  const [showSubscriptionUpgradeModal, setShowSubscriptionUpgradeModal] = useState(false);
  const [showSubscriptionUpgradeConfirmationModal, setShowSubscriptionUpgradeConfirmationModal] = useState(false);
  const [showSubscriptionUpgradeSuccessModal, setShowSubscriptionUpgradeSuccessModal] = useState(false);
  const [isEligibleForUpgrade, setIsEligibleForUpgrade] = useState(false);
  const [showUpgradeSuccessBanner, setShowUpgradeSuccessBanner] = useState(false);
  // Get upgrade details from constants
  const upgradePercentage = SUBSCRIPTION_UPGRADE.PERCENTAGE;
  const upgradePrice = SUBSCRIPTION_UPGRADE.PRICE;
  // Get the latest subscription data from Redux store
  const storeSubscriptions = useSelector((state: RootState) => state.patientActiveSubscription);
  const profile = useSelector((state: RootState) => state.patientProfile);
  const paymentMethods = useSelector((state: RootState) => state.paymentMethods);
  
  // Prioritize store data (which gets updated after API calls), fallback to props for initial load
  const currentSubscriptions = storeSubscriptions?.activeSubscriptions?.length > 0 ? storeSubscriptions : subscriptions;

  const [checkEligibility] = useLazyCheckOneTimeToSubscriptionEligibilityQuery();
  const [upgradePlan, { isLoading: isUpgrading }] = useUpgradePlanMutation();
  useGetActiveSubscriptionQuery(); // Refresh subscriptions after upgrade

  // Get priceIds from staging
  const priceIds = priceIdsData.staging;
  const currentPriceId = priceIds.glp1_gip_3m_starter;
  const toSwitchPriceId = priceIds.glp1_gip_3m_subscription;

  // Get one-time purchase subscription
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
  
  const activeSubscriptionData = useMemo(() => {
    return (
      currentSubscriptions?.activeSubscriptions.filter(
        (subscription) => subscription.subscriptionType === PlanType.ONE_TIME
      ) || []
    );
  }, [currentSubscriptions]);

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

  useEffect(() => {
    // Initialize banner visibility from localStorage on mount
    const bannerShown = localStorage.getItem(SUBSCRIPTION_UPGRADE_SUCCESS_BANNER_KEY) === 'true';
    setShowUpgradeSuccessBanner(bannerShown);

    // Check if recurring subscription exists in API response and hide banner if found
    if (currentSubscriptions?.activeSubscriptions && bannerShown) {
      const hasTargetRecurringSubscription = currentSubscriptions.activeSubscriptions.some(
        (sub) =>
          sub.subscriptionType === PlanType.RECURRING &&
          sub.productName === TARGET_SUBSCRIPTION_PRODUCT_NAME
      );

      if (hasTargetRecurringSubscription) {
        // Clear localStorage and hide banner when recurring subscription appears in API response
        localStorage.removeItem(SUBSCRIPTION_UPGRADE_SUCCESS_BANNER_KEY);
        localStorage.removeItem(SUBSCRIPTION_UPGRADE_SUCCESS_BANNER_DISMISSED_KEY);
        setShowUpgradeSuccessBanner(false);
      }
    }
  }, [currentSubscriptions]);

  const handleCloseSubscriptionUpgradeModal = () => {
    // Save dismissal state for current route
    const storageKey = `${SUBSCRIPTION_UPGRADE_MODAL_DISMISSED_KEY}${pathname}`;
    localStorage.setItem(storageKey, 'true');
    setShowSubscriptionUpgradeModal(false);
  };

  const handleShowConfirmationModal = () => {
    setShowSubscriptionUpgradeConfirmationModal(true);
  };

  const handleCloseConfirmationModal = () => {
    setShowSubscriptionUpgradeConfirmationModal(false);
  };

  const handleCloseSuccessModal = () => {
    setShowSubscriptionUpgradeSuccessModal(false);
  };

  const handleShowUpgradeModal = () => {
    setShowSubscriptionUpgradeModal(true);
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
        // Show success modal
        setShowSubscriptionUpgradeSuccessModal(true);
        setShowUpgradeSuccessBanner(true);
        localStorage.setItem(SUBSCRIPTION_UPGRADE_SUCCESS_BANNER_KEY, 'true');
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
  return (
    <>
      <div className='pt-4 font-instrument-sans'>
        <h2 className='fs-1 fw-normal mb-4'>Active One-Time Purchases</h2>
        {/* Upgrade Success Banner - Show after successful upgrade */}
        {showUpgradeSuccessBanner && isEligibleForUpgrade && (
          <div className='tw-mb-4 tw-bg-black tw-text-white tw-rounded-lg tw-px-4 md:tw-px-6 tw-py-4 tw-flex tw-items-center tw-gap-4 tw-justify-between tw-shadow-md tw-border tw-border-white/20'>
            <div className='tw-flex tw-items-center tw-gap-4 tw-flex-1'>
              <div className='tw-flex-shrink-0'>
                <StarTrophyIcon />
              </div>
              <p className='tw-text-sm md:tw-text-base tw-text-white tw-mb-0 tw-font-secondary tw-font-bold'>
                Great! You have been upgraded to the 3 months subscription successfully. It will take a few minutes to show its status here.
              </p>
            </div>
            <button
              onClick={() => {
                setShowUpgradeSuccessBanner(false);
                localStorage.removeItem(SUBSCRIPTION_UPGRADE_SUCCESS_BANNER_KEY);
                // Mark banner as dismissed to prevent upgrade banner from showing
                localStorage.setItem(SUBSCRIPTION_UPGRADE_SUCCESS_BANNER_DISMISSED_KEY, 'true');
              }}
              className='tw-flex-shrink-0 tw-p-1 hover:tw-bg-white/20 tw-rounded-full tw-transition-colors tw-duration-200 tw-text-white'
              aria-label='Close banner'
            >
              <IoClose className='tw-w-5 tw-h-5' />
            </button>
          </div>
        )}
        
        <div className='tw-flex tw-flex-col tw-gap-7'>
          {activeSubscriptionData.length > 0 ? (
            activeSubscriptionData.map((subscription) => (
              <div className='tw-w-full' key={subscription.id}>
                <ActiveSubscription
                  subscription={subscription}
                  banner={
                    isEligibleForUpgrade && 
                    subscription.subscriptionType === PlanType.ONE_TIME && 
                    !showUpgradeSuccessBanner &&
                    localStorage.getItem(SUBSCRIPTION_UPGRADE_SUCCESS_BANNER_DISMISSED_KEY) !== 'true' ? (
                      <div className='tw-bg-[#3060FE] tw-rounded-lg tw-px-4 md:tw-px-6 tw-py-4 tw-flex tw-items-center tw-gap-4 tw-justify-between tw-flex-wrap'>
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
                          className='tw-bg-white tw-text-black tw-px-4 md:tw-px-6 tw-py-2.5 tw-rounded-lg tw-font-medium tw-text-sm md:tw-text-base hover:tw-bg-gray-200 tw-transition-colors tw-duration-200 tw-font-secondary tw-whitespace-nowrap'
                        >
                          Upgrade to Value 3-Month Subscription
                        </button>
                      </div>
                    ) : undefined
                  }
                />
              </div>
            ))
          ) : (
            <div className='tw-w-full'>
              <div className='tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-3 tw-rounded-xl tw-border tw-border-primary-light tw-bg-primary-light/60 tw-px-6 tw-py-10 tw-text-center'>
                <FiInbox className='tw-h-10 tw-w-10 tw-text-primary' aria-hidden='true' />
                <h3 className='tw-text-base tw-font-medium tw-text-primary'>No one-time purchases</h3>
                <p className='tw-text-sm tw-text-primary/80'>
                  You don’t have any one-time purchases yet. Choose a plan below to get started.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <OtherPlans subscriptionType={PlanType.ONE_TIME} subscriptions={currentSubscriptions} />
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
      />
    </>
  );
}