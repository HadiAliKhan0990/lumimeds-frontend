'use client';

import { Modal } from '@/components/elements';
import toast from 'react-hot-toast';
import { SubscriptionActionConfirmation } from './SubscriptionPlans/includes/SubscriptionActionConfirmation';
import { CancellationReasonModal } from './CancellationReasonModal';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  setPatientSubscriptionLoading,
  setSelectedPatientActiveSubscription,
  setSubscriptionModalOpenType,
} from '@/store/slices/patientSubscriptionSlice';
import { useCancelSubscriptionMutation } from '@/store/slices/subscriptionsApiSlice';
import { Error } from '@/lib/types';
import { isAxiosError } from 'axios';
import { useRouter } from 'next/navigation';

export const CancelSubscriptionModal = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const patientSubscription = useSelector((state: RootState) => state.patientSubscription);
  const { subscriptionModalOpenType, selectedPatientActiveSubscription, isLoading } = patientSubscription || {};
  const { subscriptionId, productName } = selectedPatientActiveSubscription || {};

  const [cancelSubscription] = useCancelSubscriptionMutation();

  const handleConfirmPause = async () => {
    try {
      dispatch(setPatientSubscriptionLoading(true));
      const { success, message } = await cancelSubscription({ subscriptionId: subscriptionId || '' }).unwrap();
      if (success) {
        toast.success(message || 'Subscription canceled successfully');
        router.refresh();
        handleClose();
      } else {
        toast.error(message || 'Failed to cancel activeSubscription.');
      }
    } catch (err) {
      toast.error(
        isAxiosError(err)
          ? err.response?.data.message
          : (err as Error).data.message || 'Failed to cancel activeSubscription.'
      );
    } finally {
      dispatch(setPatientSubscriptionLoading(false));
    }
  };

  const handleClose = () => {
    dispatch(setSubscriptionModalOpenType(undefined));
    dispatch(setSelectedPatientActiveSubscription(undefined));
  };

  const message = <>Are you sure you want to cancel {productName ? <strong>{productName}</strong> : 'Subscription'}?</>;

  // Show cancellation reason modal instead of direct confirmation
  if (subscriptionModalOpenType === 'cancellation-reason') {
    return <CancellationReasonModal />;
  }

  return (
    <Modal size='lg' isOpen={subscriptionModalOpenType === 'cancel'} onClose={handleClose}>
      <SubscriptionActionConfirmation
        title='Cancel Subscription'
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
