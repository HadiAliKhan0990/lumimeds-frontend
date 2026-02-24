'use client';

import { Modal } from '@/components/elements';
import toast from 'react-hot-toast';
import { SubscriptionActionConfirmation } from './SubscriptionPlans/includes/SubscriptionActionConfirmation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  setPatientSubscriptionLoading,
  setSelectedPatientActiveSubscription,
  setSubscriptionModalOpenType,
} from '@/store/slices/patientSubscriptionSlice';
import {
  useResumeScheduledSubscriptionMutation,
  useResumeSubscriptionMutation,
} from '@/store/slices/subscriptionsApiSlice';
import { Error } from '@/lib/types';
import { isAxiosError } from 'axios';
import { useRouter } from 'next/navigation';

export const ResumeSubscriptionModal = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const patientSubscription = useSelector((state: RootState) => state.patientSubscription);
  const { subscriptionModalOpenType, selectedPatientActiveSubscription, isLoading } = patientSubscription || {};
  const { subscriptionId, productName, status } = selectedPatientActiveSubscription || {};

  const [resumeSubscription] = useResumeSubscriptionMutation();
  const [resumeScheduledSubscription] = useResumeScheduledSubscriptionMutation();

  const handleConfirmPause = async () => {
    try {
      dispatch(setPatientSubscriptionLoading(true));

      const mutateAsync = status === 'pause_scheduled' ? resumeScheduledSubscription : resumeSubscription;

      const { success, message } = await mutateAsync({ subscriptionId: subscriptionId || '' }).unwrap();
      if (success) {
        toast.success(message || 'Subscription resumed successfully');
        router.refresh();
        handleClose();
      } else {
        toast.error(message || 'Failed to resume activeSubscription.');
      }
    } catch (err) {
      toast.error(
        isAxiosError(err)
          ? err.response?.data.message
          : (err as Error).data.message || 'Failed to resume activeSubscription.'
      );
    } finally {
      dispatch(setPatientSubscriptionLoading(false));
    }
  };

  const handleClose = () => {
    dispatch(setSubscriptionModalOpenType(undefined));
    dispatch(setSelectedPatientActiveSubscription(undefined));
  };

  const message = <>Are you sure you want to resume {productName ? <strong>{productName}</strong> : 'Subscription'}?</>;

  return (
    <Modal size='lg' isOpen={subscriptionModalOpenType === 'resume'} onClose={handleClose}>
      <SubscriptionActionConfirmation
        title='Resume Subscription'
        message={message}
        onConfirm={handleConfirmPause}
        onClose={handleClose}
        isLoading={isLoading}
        confirmLabel='Yes'
        confirmVariant='primary'
      />
    </Modal>
  );
};
