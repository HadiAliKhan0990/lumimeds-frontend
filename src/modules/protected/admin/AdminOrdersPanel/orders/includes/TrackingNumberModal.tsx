'use client';

import { Modal } from '@/components/elements';
import type { Error } from '@/lib/types';
import { isAxiosError } from 'axios';
import { toast } from 'react-hot-toast';

export interface TrackingNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackingNumber: string;
  setTrackingNumber: (value: string) => void;
  courierService: string;
  setCourierService: (value: string) => void;
  isUpdating: boolean;
  onSave: (trackingNumber: string, courierService: string) => Promise<void>;
}

export const TrackingNumberModal = ({
  isOpen,
  onClose,
  trackingNumber,
  setTrackingNumber,
  courierService,
  setCourierService,
  isUpdating,
  onSave,
}: TrackingNumberModalProps) => {
  const handleClose = () => {
    setTrackingNumber('');
    setCourierService('');
    onClose();
  };

  const handleSave = async () => {
    try {
      await onSave(trackingNumber, courierService);
      handleClose();
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data?.message
          : (error as Error).data?.message || 'Failed to update tracking number'
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title='Add Tracking Number/Courier Service'
      size='md'
      headerClassName='!tw-text-left'
      footer={
        <div className='tw-flex tw-gap-2 tw-justify-end tw-w-full'>
          <button
            type='button'
            className='tw-px-4 tw-py-2 tw-text-primary tw-border tw-border-solid tw-border-primary tw-rounded-lg tw-bg-white tw-transition-all hover:tw-bg-primary/10'
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            type='button'
            className='tw-px-4 tw-py-2 tw-bg-primary tw-text-white tw-rounded-lg tw-transition-all hover:tw-bg-primary/90 disabled:tw-opacity-70 disabled:tw-pointer-events-none'
            disabled={isUpdating}
            onClick={handleSave}
          >
            {isUpdating ? 'Saving...' : 'Save'}
          </button>
        </div>
      }
      showFooter={true}
    >
      <div className='tw-mb-3'>
        <label htmlFor='tracking-number-input' className='form-label tw-text-start tw-block'>
          Enter Tracking number
        </label>
        <input
          id='tracking-number-input'
          type='text'
          className='form-control'
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
        />
        <label htmlFor='courier-service-input' className='form-label tw-mt-3 tw-text-start tw-block'>
          Courier Service
        </label>
        <input
          id='courier-service-input'
          type='text'
          className='form-control'
          value={courierService}
          onChange={(e) => setCourierService(e.target.value)}
          placeholder='e.g., UPS, FedEx, USPS'
        />
      </div>
    </Modal>
  );
};
