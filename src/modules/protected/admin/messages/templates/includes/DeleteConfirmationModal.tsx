'use client';

import toast from 'react-hot-toast';
import { Modal } from '@/components/elements';
import { useDeleteMessageTemplateMutation, MessageTemplateType } from '@/store/slices/messageTemplatesApiSlice';
import { CircularProgress } from '@/components/elements/CircularProgress';
import { isAxiosError } from 'axios';
import { Error } from '@/lib/types';
import { FiAlertTriangle } from 'react-icons/fi';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: MessageTemplateType | null;
}

export function DeleteConfirmationModal({ isOpen, onClose, template }: Readonly<DeleteConfirmationModalProps>) {
  const [deleteTemplate, { isLoading }] = useDeleteMessageTemplateMutation();

  const handleDelete = async () => {
    if (!template) return;

    try {
      const { success, message } = await deleteTemplate(template.id).unwrap();

      if (success) {
        toast.success(message || 'Template deleted successfully');
        onClose();
      } else {
        toast.error(message || 'Failed to delete template');
      }
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data.message
          : (error as Error).data.message || 'Failed to delete template'
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Delete Message Template'
      size='md'
      showFooter={true}
      footer={
        <div className='tw-grid tw-grid-cols-2 tw-gap-2 tw-w-full'>
          <button type='button' className='btn btn-secondary tw-w-full' onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button
            type='button'
            className='btn btn-danger d-flex align-items-center justify-content-center gap-2 tw-w-full'
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading && <CircularProgress />}
            Delete Template
          </button>
        </div>
      }
    >
      <div className='tw-flex tw-flex-col tw-items-center tw-text-center'>
        <div className='tw-w-16 tw-h-16 tw-rounded-full tw-bg-red-100 tw-flex tw-items-center tw-justify-center tw-mb-4'>
          <FiAlertTriangle className='tw-text-red-600' size={32} />
        </div>
        <h5 className='tw-mb-2'>Are you sure?</h5>
        <p className='text-muted tw-mb-0'>
          Do you really want to delete the template <strong>&quot;{template?.name}&quot;</strong>? This action cannot be
          undone.
        </p>
      </div>
    </Modal>
  );
}
