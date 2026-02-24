'use client';

import ActiveSubscription from '@/components/Dashboard/patient/subscriptions/includes/ActiveSubscription';
import OtherPlans from '@/components/Dashboard/patient/subscriptions/includes/OtherPlans';
import { PlanType } from '@/types/medications';
import { SubscriptionsData } from '@/store/slices/patientAtiveSubscriptionSlice';
import { useMemo } from 'react';
import { FiInbox } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface Props {
  subscriptions?: SubscriptionsData;
}

export default function SubscriptionPlans({ subscriptions }: Readonly<Props>) {
  // Get the latest subscription data from Redux store
  const storeSubscriptions = useSelector((state: RootState) => state.patientActiveSubscription);
  
  // Prioritize store data (which gets updated after API calls), fallback to props for initial load
  const currentSubscriptions = storeSubscriptions?.activeSubscriptions?.length > 0 ? storeSubscriptions : subscriptions;
  
  const activeSubscriptionData = useMemo(() => {
    return (
      currentSubscriptions?.activeSubscriptions.filter(
        (subscription) => subscription.subscriptionType === PlanType.RECURRING
      ) || []
    );
  }, [currentSubscriptions]);
  return (
    <>
      <div className='pt-4 font-instrument-sans'>
        <h2 className='fs-1 fw-normal mb-4'>Active Subscriptions</h2>
        <div className='tw-flex tw-flex-col tw-gap-7'>
          {activeSubscriptionData.length > 0 ? (
            activeSubscriptionData.map((subscription) => (
              <div className='tw-w-full' key={subscription.id}>
                <ActiveSubscription subscription={subscription} />
              </div>
            ))
          ) : (
            <div className='tw-w-full'>
              <div className='tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-3 tw-rounded-xl tw-border tw-border-primary-light tw-bg-primary-light/60 tw-px-6 tw-py-10 tw-text-center'>
                <FiInbox className='tw-h-10 tw-w-10 tw-text-primary' aria-hidden='true' />
                <h3 className='tw-text-base tw-font-medium tw-text-primary'>No active subscriptions</h3>
                <p className='tw-text-sm tw-text-primary/80'>
                  You don’t have any active subscriptions yet. Choose a plan below to get started.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <OtherPlans subscriptionType={PlanType.RECURRING} subscriptions={currentSubscriptions} />
    </>
  );
}
