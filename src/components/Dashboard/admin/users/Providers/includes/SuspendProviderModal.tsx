'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/elements/Modal';
import { CircularProgress } from '@/components/elements/CircularProgress';
import { Provider } from '@/store/slices/providerSlice';

interface SuspendProviderModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: (suspendReason: string) => void | Promise<void>;
  provider: Provider | null;
  loading?: boolean;
}

export const SuspendProviderModal = ({
  show,
  onHide,
  onConfirm,
  provider,
  loading = false,
}: Readonly<SuspendProviderModalProps>) => {
  const [suspendReason, setSuspendReason] = useState('');

  // Clear reason when modal closes
  useEffect(() => {
    if (!show) {
      setSuspendReason('');
    }
  }, [show]);

  const handleConfirm = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!suspendReason.trim()) {
      return;
    }
    onConfirm(suspendReason);
  };

  const handleHide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSuspendReason('');
    onHide();
  };

  const providerName = provider?.provider
    ? `${provider.provider.firstName} ${provider.provider.lastName}`
    : 'this provider';

  const footer = (
    <div className='tw-flex tw-gap-3 tw-w-full'>
      <button
        type='button'
        onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}
        onClick={handleHide}
        disabled={loading}
        className='tw-flex-1 tw-px-4 tw-py-2 tw-border tw-border-primary tw-text-primary tw-bg-white tw-rounded-lg hover:tw-bg-gray-50 tw-transition-colors tw-font-medium disabled:tw-opacity-50 disabled:tw-pointer-events-none'
      >
        Cancel
      </button>
      <button
        type='button'
        onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}
        onClick={handleConfirm}
        disabled={!suspendReason.trim() || loading}
        className='tw-flex-1 tw-px-4 tw-py-2 tw-bg-primary tw-text-white tw-rounded-lg hover:tw-bg-primary/90 tw-transition-colors tw-font-medium tw-flex tw-items-center tw-justify-center tw-gap-2 disabled:tw-opacity-50 disabled:tw-pointer-events-none'
      >
        {loading && <CircularProgress className='!tw-w-4 !tw-h-4' />}
        Suspend Provider
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={show}
      onClose={handleHide}
      title='Suspend Provider'
      size='md'
      footer={footer}
      showFooter={true}
      isLoading={loading}
      loadingText='Suspending provider...'
      closeOnBackdropClick={!loading}
      closeOnEscape={!loading}
    >
      <div className='tw-text-center' onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
        <p className='tw-mb-3'>
          Are you sure you want to suspend <strong>{providerName}</strong>?
        </p>
        <div className='tw-bg-yellow-50 tw-border tw-border-yellow-200 tw-rounded-lg tw-p-4 tw-mb-4 tw-text-start'>
          <strong className='tw-text-yellow-800'>Warning:</strong>
          <span className='tw-text-yellow-800'> This action will:</span>
          <ul className='tw-mb-0 tw-mt-2 tw-text-yellow-800 tw-list-disc tw-list-inside tw-space-y-1'>
            <li>Prevent the provider from logging in</li>
            <li>Revert all their pending orders to admin</li>
            <li>Cancel all their scheduled consultations</li>
            <li>Remove them from the provider assignment dropdown</li>
          </ul>
        </div>
        <div className='tw-text-start'>
          <label className='tw-block tw-font-medium tw-mb-2 tw-text-gray-700'>Suspension Reason (Required)</label>
          <textarea
            rows={3}
            placeholder='Enter the reason for suspending this provider (required)'
            value={suspendReason}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSuspendReason(e.target.value)}
            onMouseDown={(e: React.MouseEvent<HTMLTextAreaElement>) => e.stopPropagation()}
            onClick={(e: React.MouseEvent<HTMLTextAreaElement>) => e.stopPropagation()}
            disabled={loading}
            className='tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-primary focus:tw-border-transparent disabled:tw-opacity-50 disabled:tw-cursor-not-allowed tw-resize-none'
          />
        </div>
      </div>
    </Modal>
  );
};

