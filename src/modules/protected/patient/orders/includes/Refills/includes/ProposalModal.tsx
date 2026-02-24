'use client';

import { Modal } from '@/components/elements';
import toast from 'react-hot-toast';
import {
  RefillSurveyRequest,
  RefillProposalStatus,
  useUpdateRefillProposalMutation,
} from '@/store/slices/refillsApiSlice';
import { PaymentMethod } from '@/store/slices/paymentMethodsSlice';
import { PaymentMethodsModal } from '@/components/Dashboard/patient/subscriptions/includes/OtherPlans/includes/PaymentMethodsModal';
import { useState } from 'react';
import { formatToUSD } from '@/lib/helper';
import { FiCheck, FiX } from 'react-icons/fi';
import { useLazyGetPaymentMethodsQuery } from '@/store/slices/patientPaymentApiSlice';
import { CircularProgress } from '@/components/elements/CircularProgress';
import { isAxiosError } from 'axios';
import { Error } from '@/lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  request: RefillSurveyRequest | null;
  onSuccess?: (refill?: RefillSurveyRequest | null) => void;
}

export const ProposalModal = ({ isOpen, onClose, request, onSuccess }: Readonly<Props>) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [updateRefillProposal] = useUpdateRefillProposalMutation();
  const [getPaymentMethods, { isFetching }] = useLazyGetPaymentMethodsQuery();

  const { replacementPrice, order } = request || {};
  const amount = replacementPrice?.amount ? formatToUSD(Number(replacementPrice.amount) * 100) : 'N/A';

  const handleAccept = async () => {
    await getPaymentMethods();
    setShowPaymentModal(true);
  };

  const handleReject = async () => {
    if (!replacementPrice?.id) {
      toast.error('Invalid request data');
      return;
    }

    setIsProcessing(true);
    try {
      const { success, message, data } = await updateRefillProposal({
        refillRequestId: request?.id || '',
        payload: {
          status: RefillProposalStatus.REJECT,
        },
      }).unwrap();

      if (success) {
        toast.success('Request rejected successfully');
        onSuccess?.(data);
        onClose();
      } else {
        toast.error(message || 'Failed to reject request');
      }
    } catch (error) {
      toast.error(
        isAxiosError(error) ? error.response?.data.message : (error as Error).data.message || 'Failed to reject request'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentMethodSelect = async (selectedPaymentMethod: PaymentMethod | null) => {
    setShowPaymentModal(false);

    if (!selectedPaymentMethod || !replacementPrice?.id) {
      toast.error('Please select a payment method');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await updateRefillProposal({
        refillRequestId: request?.id || '',
        payload: {
          status: RefillProposalStatus.ACCEPT,
          paymentMethodId: selectedPaymentMethod.id,
        },
      }).unwrap();

      if (result.success) {
        toast.success('Request accepted successfully! Your refill will be processed.');
        onSuccess?.(result.data);
        onClose();
      } else {
        toast.error(result.message || 'Failed to accept request');
      }
    } catch (error) {
      toast.error(
        isAxiosError(error) ? error.response?.data.message : (error as Error).data.message || 'Failed to accept request'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  const footer = (
    <div className='tw-flex tw-gap-3 tw-w-full'>
      <button
        type='button'
        onClick={handleReject}
        disabled={isProcessing || isFetching}
        className='tw-flex-1 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-4 tw-py-3 tw-text-red-700 tw-border-solid tw-bg-white tw-border tw-border-red-300 tw-rounded-lg hover:tw-bg-red-50 tw-transition-all tw-font-medium disabled:tw-opacity-50 disabled:tw-pointer-events-none'
      >
        {isProcessing ? <CircularProgress className='!tw-w-4 !tw-h-4' /> : <FiX className='tw-w-4 tw-h-4' />}
        Decline
      </button>
      <button
        type='button'
        onClick={handleAccept}
        disabled={isProcessing || isFetching}
        className='tw-flex-1 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-4 tw-py-3 tw-text-white tw-bg-green-600 tw-rounded-lg hover:tw-bg-green-700 tw-transition-all tw-font-medium disabled:tw-opacity-50 disabled:tw-pointer-events-none'
      >
        {isProcessing || isFetching ? (
          <CircularProgress className='!tw-w-4 !tw-h-4' />
        ) : (
          <FiCheck className='tw-w-4 tw-h-4' />
        )}
        Accept & Pay
      </button>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title='Refill Request'
        size='lg'
        footer={footer}
        isLoading={isProcessing}
        loadingText='Processing your response...'
      >
        <div className='tw-space-y-6'>
          {/* Request details */}
          <div className='tw-space-y-3'>
            <div className='tw-flex tw-justify-between tw-items-center gap-2 tw-py-2 tw-border-b tw-border-green-200'>
              <span className='tw-text-gray-600 tw-text-nowrap'>Product:</span>
              <span className='tw-font-medium tw-text-gray-900 tw-text-right'>{order?.productName || ''}</span>
            </div>

            <div className='tw-flex tw-justify-between tw-items-center tw-py-2 tw-border-b tw-border-green-200'>
              <span className='tw-text-gray-600'>Amount:</span>
              <span className='tw-text-2xl tw-font-bold tw-text-green-600'>{amount}</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Payment Methods Modal */}
      <PaymentMethodsModal
        open={showPaymentModal}
        handleClose={() => setShowPaymentModal(false)}
        handleSubmit={handlePaymentMethodSelect}
        showAddPaymentButton
      />
    </>
  );
};
