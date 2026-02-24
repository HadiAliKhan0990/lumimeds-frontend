'use client';

import OneTimePurchases from '@/components/Dashboard/patient/subscriptions/includes/OneTimePurchases';
import SubscriptionPlans from '@/components/Dashboard/patient/subscriptions/includes/SubscriptionPlans';
import { Tab, Tabs } from 'react-bootstrap';
import { PLANS_BENEFITS } from '@/constants/products';
import { GetPaymentMethodsResponseData } from '@/services/paymentMethod/types';
import { setPaymentMethods } from '@/store/slices/paymentMethodsSlice';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPatientActiveSubscription, SubscriptionsData } from '@/store/slices/patientAtiveSubscriptionSlice';
import { PauseSubscriptionModal } from '@/components/Dashboard/patient/subscriptions/includes/PauseSubscriptionModal';
import { CancelSubscriptionModal } from '@/components/Dashboard/patient/subscriptions/includes/CancelSubscriptionModal';
import { ResumeSubscriptionModal } from '@/components/Dashboard/patient/subscriptions/includes/ResumeSubscriptionModal';
import { CancellationReasonModal } from '@/components/Dashboard/patient/subscriptions/includes/CancellationReasonModal';

interface Props {
  paymentMethods?: GetPaymentMethodsResponseData;
  subscriptions?: SubscriptionsData;
}

export default function PaymentsSubscriptions({ paymentMethods, subscriptions }: Readonly<Props>) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (paymentMethods) {
      dispatch(setPaymentMethods(paymentMethods?.paymentMethods));
    }
  }, [paymentMethods]);

  useEffect(() => {
    if (subscriptions) {
      dispatch(setPatientActiveSubscription(subscriptions));
    }
  }, [subscriptions]);

  return (
    <>
      <Tabs variant='pills' defaultActiveKey={'Subscription Plans'} className='flex-row gap-4 mb-4 subscription-tabs'>
        {tabs.map(({ title, Component }) => (
          <Tab
            tabClassName='rounded-pill w-100 border border-light-blue-gray py-12'
            key={title}
            eventKey={title}
            title={title}
          >
            <Component subscriptions={subscriptions} />
          </Tab>
        ))}
      </Tabs>
      <h2 className='fs-2 fw-normal my-5'>Plan Benefits</h2>
      <div className='row g-5'>
        {PLANS_BENEFITS.map(({ title, Icon }, index) => (
          <div key={title + index} className='col-sm-6 col-lg-3 d-flex flex-column gap-3 align-items-center mb-8rem'>
            <Icon className='text-primary' size={64} />
            <span className='text-2xl max-w-130px text-center'>{title}</span>
          </div>
        ))}
      </div>

      {/* Modals */}
      <PauseSubscriptionModal />
      <CancelSubscriptionModal />
      <ResumeSubscriptionModal />
      <CancellationReasonModal />
    </>
  );
}

const tabs = [
  {
    title: 'Subscription Plans',
    Component: SubscriptionPlans,
  },
  {
    title: 'One-Time Purchase',
    Component: OneTimePurchases,
  },
];
