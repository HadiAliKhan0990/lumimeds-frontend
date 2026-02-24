'use client';

import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { Modal } from '@/components/elements';
import { Patient } from '@/store/slices/patientSlice';
import { useUpdatePatientDetailsMutation } from '@/store/slices/patientsApiSlice';
import { Error } from '@/lib/types';

interface UnbanModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSuccess: (updates: Partial<Patient>) => void;
}

export const UnbanModal = ({ isOpen, onClose, patient, onSuccess }: Readonly<UnbanModalProps>) => {
  const [updatePatientDetails, { isLoading }] = useUpdatePatientDetailsMutation();

  const handleUnban = async () => {
    if (!patient?.id || !patient?.firstName || !patient?.lastName) return;

    try {
      const { success, message } = await updatePatientDetails({
        id: patient.id,
        isArchived: false,
      }).unwrap();

      if (success) {
        toast.success(message || 'Patient unbanned successfully');
        onSuccess({ isBanned: false });
      } else {
        toast.error(message || 'Failed to unban patient');
      }
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data.message
          : (error as Error).data?.message || 'Error while unbanning patient'
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Unban User'
      size='md'
      showCloseButton={!isLoading}
      closeOnBackdropClick={!isLoading}
      closeOnEscape={!isLoading}
      isLoading={isLoading}
      loadingText='Unbanning user...'
      showFooter
      footer={
        <>
          <button type='button' onClick={onClose} disabled={isLoading} className='btn btn-secondary tw-flex-1'>
            Cancel
          </button>
          <button type='button' onClick={handleUnban} disabled={isLoading} className='btn btn-primary tw-flex-1'>
            Confirm Unban
          </button>
        </>
      }
    >
      <div className='tw-text-center'>
        <p className='tw-text-gray-700 tw-mb-4'>
          Are you sure you want to unban{' '}
          <span className='tw-font-semibold'>
            {patient?.firstName || ''} {patient?.lastName || ''}
          </span>
          ?
        </p>
        <p className='tw-text-sm tw-text-gray-600'>
          This user will regain access to their account and be able to use the platform again.
        </p>
      </div>
    </Modal>
  );
};
