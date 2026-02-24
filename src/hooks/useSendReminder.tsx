import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import toast from 'react-hot-toast';
import {
  useSendEmailReminderMutation,
  useSendSMSReminderMutation,
  useSendRenewalEmailReminderMutation,
  useSendRenewalSMSReminderMutation,
} from '@/store/slices/ordersApiSlice';

const getFriendlyErrorMessage = (error: FetchBaseQueryError) => {
  const data = error?.data as { message?: string | string[]; error?: string };
  if (Array.isArray(data?.message)) {
    return data.message.join(', ');
  }
  if (typeof data?.message === 'string' && data.message.trim().length) {
    return data.message;
  }
  if (data?.error) {
    return data.error;
  }
  return 'We could not send the reminder right now. Please try again.';
};

/**
 * Shared hook for sending email and SMS reminders for orders and refills.
 *
 * @param orderId - The order ID to send reminders for
 * @returns Object containing handlers and loading states for sending email and SMS reminders
 */
export const useSendReminder = (orderId: string | null | undefined) => {
  const [sendEmailReminder, { isLoading: isSendingEmailReminder }] = useSendEmailReminderMutation();
  const [sendSMSReminder, { isLoading: isSendingSMSReminder }] = useSendSMSReminderMutation();

  const handleSendEmailReminder = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!orderId) {
      toast.error('Order ID is required to send reminder');
      return;
    }

    try {
      await sendEmailReminder({ orderId }).unwrap();
      toast.success('Reminder successfully sent.');
    } catch (error) {
      const fetchError = error as FetchBaseQueryError;
      const errorMessage = getFriendlyErrorMessage(fetchError);
      toast.error(
        (t) => (
          <div>
            <div>{errorMessage}</div>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                handleSendEmailReminder(e);
              }}
              className='tw-mt-2 tw-px-3 tw-py-1 tw-bg-red-600 tw-text-white tw-rounded tw-text-sm hover:tw-bg-red-700'
            >
              Retry
            </button>
          </div>
        ),
        { duration: 5000 }
      );
    }
  };

  const handleSendSMSReminder = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!orderId) {
      toast.error('Order ID is required to send reminder');
      return;
    }

    try {
      await sendSMSReminder({ orderId }).unwrap();
      toast.success('Reminder successfully sent.');
    } catch (error) {
      const fetchError = error as FetchBaseQueryError;
      const errorMessage = getFriendlyErrorMessage(fetchError);
      toast.error(
        (t) => (
          <div>
            <div>{errorMessage}</div>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                handleSendSMSReminder(e);
              }}
              className='tw-mt-2 tw-px-3 tw-py-1 tw-bg-red-600 tw-text-white tw-rounded tw-text-sm hover:tw-bg-red-700'
            >
              Retry
            </button>
          </div>
        ),
        { duration: 5000 }
      );
    }
  };

  return {
    handleSendEmailReminder,
    handleSendSMSReminder,
    isSendingEmailReminder,
    isSendingSMSReminder,
  };
};

/**
 * Shared hook for sending email and SMS reminders for renewals.
 *
 * @param subscriptionId - The subscription ID to send reminders for
 * @returns Object containing handlers and loading states for sending email and SMS reminders
 */
export const useSendRenewalReminder = (subscriptionId: string | null | undefined) => {
  const [sendRenewalEmailReminder, { isLoading: isSendingEmailReminder }] = useSendRenewalEmailReminderMutation();
  const [sendRenewalSMSReminder, { isLoading: isSendingSMSReminder }] = useSendRenewalSMSReminderMutation();

  const handleSendEmailReminder = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!subscriptionId) {
      toast.error('Order does not have a subscription ID');
      return;
    }

    try {
      await sendRenewalEmailReminder({ subscriptionId }).unwrap();
      toast.success('Reminder successfully sent.');
    } catch (error) {
      const fetchError = error as FetchBaseQueryError;
      const errorMessage = getFriendlyErrorMessage(fetchError);
      toast.error(
        (t) => (
          <div>
            <div>{errorMessage}</div>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                handleSendEmailReminder(e);
              }}
              className='tw-mt-2 tw-px-3 tw-py-1 tw-bg-red-600 tw-text-white tw-rounded tw-text-sm hover:tw-bg-red-700'
            >
              Retry
            </button>
          </div>
        ),
        { duration: 5000 }
      );
    }
  };

  const handleSendSMSReminder = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!subscriptionId) {
      toast.error('Order does not have a subscription ID');
      return;
    }

    try {
      await sendRenewalSMSReminder({ subscriptionId }).unwrap();
      toast.success('Reminder successfully sent.');
    } catch (error) {
      const fetchError = error as FetchBaseQueryError;
      const errorMessage = getFriendlyErrorMessage(fetchError);
      toast.error(
        (t) => (
          <div>
            <div>{errorMessage}</div>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                handleSendSMSReminder(e);
              }}
              className='tw-mt-2 tw-px-3 tw-py-1 tw-bg-red-600 tw-text-white tw-rounded tw-text-sm hover:tw-bg-red-700'
            >
              Retry
            </button>
          </div>
        ),
        { duration: 5000 }
      );
    }
  };

  return {
    handleSendEmailReminder,
    handleSendSMSReminder,
    isSendingEmailReminder,
    isSendingSMSReminder,
  };
};
