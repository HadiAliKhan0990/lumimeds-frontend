'use client';

import Modal from '@/components/elements/Modal';
import { CircularProgress } from '@/components/elements/CircularProgress';
import { Provider } from '@/store/slices/providerSlice';

interface UnsuspendProviderModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void | Promise<void>;
  provider: Provider | null;
  loading?: boolean;
}

export const UnsuspendProviderModal = ({
  show,
  onHide,
  onConfirm,
  provider,
  loading = false,
}: Readonly<UnsuspendProviderModalProps>) => {
  const handleConfirm = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onConfirm();
  };

  const handleHide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
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
        disabled={loading}
        className='tw-flex-1 tw-px-4 tw-py-2 tw-bg-primary tw-text-white tw-rounded-lg hover:tw-bg-primary/90 tw-transition-colors tw-font-medium tw-flex tw-items-center tw-justify-center tw-gap-2 disabled:tw-opacity-50 disabled:tw-pointer-events-none'
      >
        {loading && <CircularProgress className='!tw-w-4 !tw-h-4' />}
        Unsuspend Provider
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={show}
      onClose={handleHide}
      title='Unsuspend Provider'
      size='md'
      footer={footer}
      showFooter={true}
      isLoading={loading}
      loadingText='Unsuspending provider...'
      closeOnBackdropClick={!loading}
      closeOnEscape={!loading}
    >
      <div className='tw-text-center' onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
        <p className='tw-mb-3'>
          Are you sure you want to unsuspend <strong>{providerName}</strong>?
        </p>
        <div className='tw-bg-green-50 tw-border tw-border-green-200 tw-rounded-lg tw-p-4 tw-mb-4 tw-text-start'>
          <strong className='tw-text-green-800'>Note:</strong>
          <span className='tw-text-green-800'> This action will:</span>
          <ul className='tw-mb-0 tw-mt-2 tw-text-green-800 tw-list-disc tw-list-inside tw-space-y-1'>
            <li>Allow the provider to log in again</li>
            <li>Restore their access to the system</li>
            <li>Make them available for order assignments</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

