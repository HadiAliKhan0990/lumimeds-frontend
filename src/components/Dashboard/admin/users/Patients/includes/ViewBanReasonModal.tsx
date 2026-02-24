'use client';

import { Modal } from '@/components/elements';
import { Patient } from '@/store/slices/patientSlice';
import { IoIosInformationCircle } from 'react-icons/io';

interface ViewBanReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

export const ViewBanReasonModal = ({ isOpen, onClose, patient }: Readonly<ViewBanReasonModalProps>) => {
  const hasBanReason = patient?.banReason && patient.banReason.trim() !== '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Ban Details'
      size='md'
      showCloseButton
      closeOnBackdropClick
      closeOnEscape
      showFooter
      footer={
        <button type='button' onClick={onClose} className='btn btn-outline-primary tw-flex-1'>
          Close
        </button>
      }
    >
      <div>
        <div className='tw-mb-4'>
          <p className='tw-text-gray-700'>
            <span className='tw-font-semibold'>Patient: </span>
            {`${patient?.firstName || ''} ${patient?.lastName || ''}`}
          </p>
        </div>

        <div className='tw-mb-2'>
          <label className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>Reason for Ban</label>
          {hasBanReason ? (
            <div className='tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-md tw-p-3'>
              <span className='tw-text-gray-800 tw-whitespace-pre-wrap'>{patient.banReason}</span>
            </div>
          ) : (
            <div className='tw-bg-blue-50 tw-border tw-border-blue-200 tw-rounded-md tw-p-3 tw-flex tw-gap-2'>
              <IoIosInformationCircle className='tw-text-blue-600 tw-mt-0.5 tw-flex-shrink-0' />
              <span className='tw-text-sm tw-text-blue-800'>No reason was provided when this user was banned.</span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
