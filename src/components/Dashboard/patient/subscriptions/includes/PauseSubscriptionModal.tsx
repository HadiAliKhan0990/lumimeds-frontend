'use client';
import toast from 'react-hot-toast';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useState } from 'react';
import { Modal } from '@/components/elements';
import { SubscriptionActionConfirmation } from './SubscriptionPlans/includes/SubscriptionActionConfirmation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  setPatientSubscriptionLoading,
  setSelectedPatientActiveSubscription,
  setSubscriptionModalOpenType,
} from '@/store/slices/patientSubscriptionSlice';
import { usePauseSubscriptionMutation } from '@/store/slices/subscriptionsApiSlice';
import { Error } from '@/lib/types';
import { isAxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { SuccessCircleCheck } from '@/components/Icon/SuccessCircleCheck';

export const PauseSubscriptionModal = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const patientSubscription = useSelector((state: RootState) => state.patientSubscription);
  const { subscriptionModalOpenType, selectedPatientActiveSubscription, isLoading } = patientSubscription || {};
  const { subscriptionId, productName } = selectedPatientActiveSubscription || {};

  const renewsAt = selectedPatientActiveSubscription?.renewsAt;

  const [pauseSubscription] = usePauseSubscriptionMutation();
  const [resumeDate, setResumeDate] = useState<Date | null>(null);
  const [dateError, setDateError] = useState<string>('');

  const handleConfirmPause = async () => {
    // Validate that resume date is selected
    if (!resumeDate) {
      setDateError('Please select a resume date');
      toast.error('Please select a resume date to continue');
      return;
    }

    try {
      dispatch(setPatientSubscriptionLoading(true));
      setDateError('');

      const payload: { subscriptionId: string; resumptionDate?: string } = {
        subscriptionId: subscriptionId || '',
        resumptionDate: format(resumeDate, 'yyyy-MM-dd'),
      };

      const { success, message } = await pauseSubscription(payload).unwrap();
      if (success) {
        toast.success(message || 'Subscription paused successfully');
        router.refresh();
        handleClose();
      } else {
        toast.error(message || 'Failed to pause activeSubscription.');
      }
    } catch (err) {
      toast.error(
        isAxiosError(err)
          ? err.response?.data.message
          : (err as Error).data.message || 'Failed to pause activeSubscription.'
      );
    } finally {
      dispatch(setPatientSubscriptionLoading(false));
    }
  };

  const handleClose = () => {
    setResumeDate(null);
    setDateError('');
    dispatch(setSubscriptionModalOpenType(undefined));
    dispatch(setSelectedPatientActiveSubscription(undefined));
  };

  const handleDateChange = (date: Date | null) => {
    setResumeDate(date);
    if (date) {
      setDateError('');
    }
  };

  const nextDayRenewalDate = renewsAt ? new Date(renewsAt).setDate(new Date(renewsAt).getDate() + 1) : undefined;

  const message = (
    <div className='mb-4'>
      <p className='mb-3'>
        Select the date on which you would like your subscription to resume for {productName ? <strong>{productName}</strong> : 'Subscription'}?
      </p>

      <div className=' tw-text-start tw-pb-2'>
        <div className='tw-flex tw-items-center tw-justify-end'>
          <div className='tw-bg-primary/20 tw-text-primary tw-rounded-full tw-px-2 tw-py-1 tw-w-fit tw-mb-1 tw-flex tw-items-center tw-justify-between tw-font-medium tw-text-sm'>
            <span>Delay Renewal start date: {renewsAt ? format(new Date(renewsAt), 'MM/dd/yyyy') : 'N/A'}</span>
          </div>
        </div>

        <label className='form-label fw-medium !tw-mb-1'>
          Select resume date <span className='text-danger'>*</span>
        </label>
        <ReactDatePicker
          onKeyDown={(e) => e.preventDefault()}
          selected={resumeDate}
          onChange={handleDateChange}
          minDate={nextDayRenewalDate ? new Date(nextDayRenewalDate) : undefined}
          placeholderText='Select a date to resume subscription'
          dateFormat='MM/dd/yyyy'
          wrapperClassName='w-100'
          popperClassName='react-datepicker-popper'
          className={`${dateError ? 'is-invalid' : ''} form-control shadow-none date-input tw-cursor-pointer`}
        />
        {dateError && <div className='text-danger small mt-1'>{dateError}</div>}
        {resumeDate && !dateError && (
          <div className='tw-mt-2 tw-inline-flex tw-items-center tw-gap-2 tw-rounded-full tw-bg-sky-100 tw-px-3 tw-py-1.5 tw-text-base tw-font-semibold'>

            <span>
              Your next charge will occur on:{' '}
              {resumeDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <SuccessCircleCheck size={20} circleFill='#22c55e' checkmarkStroke='#ffffff' />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      className='!tw-overflow-visible'
      size='lg'
      isOpen={subscriptionModalOpenType === 'pause'}
      onClose={handleClose}
    >
      <SubscriptionActionConfirmation
        title='Delay Renewal'
        message={message}
        onConfirm={handleConfirmPause}
        onClose={handleClose}
        isLoading={isLoading}
        confirmLabel='Delay Renewal'
        cancelLabel='Discard'
        confirmVariant='primary'
      />
    </Modal>
  );
};
