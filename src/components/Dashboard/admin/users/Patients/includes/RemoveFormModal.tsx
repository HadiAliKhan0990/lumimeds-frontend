'use client';

import Modal from '@/components/elements/Modal';
import { CircularProgress } from '@/components/elements';

interface RemoveFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  formName: string;
  patientName: string;
  isLoading?: boolean;
}

export function RemoveFormModal({
  isOpen,
  onClose,
  onConfirm,
  formName,
  patientName,
  isLoading = false,
}: RemoveFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      bodyClassName="tw-py-4"
      footer={
        <div className="tw-flex tw-gap-3 tw-w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="tw-flex-1 tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-border-solid tw-rounded-lg tw-text-gray-700 tw-bg-white hover:tw-bg-gray-50 tw-transition-all disabled:tw-opacity-50 disabled:tw-pointer-events-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="tw-flex-1 tw-px-4 tw-py-2 tw-bg-red-600 tw-text-white tw-rounded-lg hover:tw-bg-red-700 tw-transition-colors disabled:tw-opacity-50 disabled:tw-pointer-events-none tw-flex tw-items-center tw-justify-center tw-gap-2"
          >
            {isLoading && <CircularProgress />}
            Remove
          </button>
        </div>
      }
    >
      <div className="tw-mb-4">
        <h5 className="tw-text-lg tw-font-semibold tw-mb-2">Force Delete Form</h5>
        <p className="tw-text-sm tw-text-gray-600">
          Are you sure you want to delete the form <strong>&quot;{formName}&quot;</strong> from{' '}
          <strong>{patientName}</strong>&apos;s patient portal?
        </p>
        <div className="tw-mt-3 tw-p-3 tw-bg-yellow-50 tw-border tw-border-yellow-200 tw-rounded-lg">
          <p className="tw-text-sm tw-text-yellow-800 tw-font-medium tw-mb-1">
            ⚠️ Force Delete Warning
          </p>
          <p className="tw-text-sm tw-text-yellow-700">
            This is a force delete. The form will be permanently removed even if the patient is currently in the process of filling it.
          </p>
        </div>
        <p className="tw-text-sm tw-text-gray-500 tw-mt-3">
          This action cannot be undone. The form will no longer be visible to the patient.
        </p>
      </div>
    </Modal>
  );
}
