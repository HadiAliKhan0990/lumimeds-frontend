'use client';

import toast from 'react-hot-toast';
import { Modal } from '@/components/elements';
import { isAxiosError } from 'axios';
import { Patient } from '@/store/slices/patientSlice';
import { useUpdatePatientDetailsMutation } from '@/store/slices/patientsApiSlice';
import { Error } from '@/lib/types';
import { useFormik } from 'formik';
import { banValidationSchema, MAX_REASON_LENGTH } from '@/schemas/banPatient';
import { IoIosWarning } from 'react-icons/io';

interface BanModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSuccess: (updates: Partial<Patient>) => void;
}

export const BanModal = ({ isOpen, onClose, patient, onSuccess }: Readonly<BanModalProps>) => {
  const [updatePatientDetails, { isLoading }] = useUpdatePatientDetailsMutation();

  const formik = useFormik({
    initialValues: {
      banReason: '',
    },
    validationSchema: banValidationSchema,
    onSubmit: async (values) => {
      if (!patient?.id || !patient?.firstName || !patient?.lastName) return;

      try {
        const { success, message } = await updatePatientDetails({
          id: patient.id,
          isArchived: true,
          banReason: values.banReason.trim() || undefined,
        }).unwrap();

        if (success) {
          toast.success(message || 'Patient banned successfully');
          formik.resetForm();
          onSuccess({
            isBanned: true,
            banReason: values.banReason.trim() || null,
          });
        } else {
          toast.error(message || 'Failed to ban patient');
        }
      } catch (error) {
        toast.error(
          isAxiosError(error)
            ? error.response?.data.message
            : (error as Error).data?.message || 'Error while banning patient'
        );
      }
    },
  });

  const handleClose = () => {
    if (!isLoading) {
      formik.resetForm();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title='Ban User'
      size='lg'
      showCloseButton={!isLoading}
      closeOnBackdropClick={!isLoading}
      closeOnEscape={!isLoading}
      isLoading={isLoading}
      loadingText='Banning user...'
      showFooter
      footer={
        <>
          <button
            type='button'
            onClick={handleClose}
            disabled={isLoading}
            className='btn btn-outline-primary tw-flex-1'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={() => formik.handleSubmit()}
            disabled={isLoading || !formik.isValid}
            className='btn btn-danger tw-flex-1'
          >
            Confirm Ban
          </button>
        </>
      }
    >
      <div>
        <p className='tw-text-gray-700 tw-mb-4'>
          You are about to ban{' '}
          <span className='tw-font-semibold'>{`${patient?.firstName || ''} ${patient?.lastName || ''}`}</span>. This
          will immediately log them out and restrict account access.
          <br />
          You can unban this user anytime from the admin panel.
        </p>

        <label htmlFor='banReason' className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
          Reason for ban (Optional)
        </label>
        <textarea
          id='banReason'
          name='banReason'
          rows={4}
          value={formik.values.banReason}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder='e.g., Policy violation, spam activity, or inappropriate behavior'
          className={`tw-w-full tw-px-3 tw-py-2 tw-border tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-resize-none ${
            formik.touched.banReason && formik.errors.banReason ? 'tw-border-red-500' : 'tw-border-gray-300'
          }`}
          disabled={isLoading}
        />
        <div className='tw-flex tw-justify-between tw-items-center'>
          <div>
            {formik.touched.banReason && formik.errors.banReason && (
              <p className='tw-text-sm tw-text-red-600'>{formik.errors.banReason}</p>
            )}
          </div>
          <p
            className={`tw-text-xs ${
              formik.values.banReason.length > MAX_REASON_LENGTH ? 'tw-text-red-600' : 'tw-text-gray-500'
            }`}
          >
            {formik.values.banReason.length}/{MAX_REASON_LENGTH}
          </p>
        </div>

        <div className='tw-bg-yellow-50 tw-border tw-border-yellow-200 tw-rounded-md tw-p-3 tw-flex tw-gap-2'>
          <IoIosWarning className='tw-text-yellow-600 tw-mt-0.5' />
          <span className='tw-text-sm tw-text-yellow-800'>
            <strong>Warning:</strong> The user will lose access to their account until unbanned.
          </span>
        </div>
      </div>
    </Modal>
  );
};
