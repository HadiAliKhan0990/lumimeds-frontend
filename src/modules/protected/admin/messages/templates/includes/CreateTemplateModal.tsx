'use client';

import toast from 'react-hot-toast';
import { Modal, TipTapEditor } from '@/components/elements';
import { FormikHelpers, useFormik } from 'formik';
import { useCreateMessageTemplateMutation } from '@/store/slices/messageTemplatesApiSlice';
import {
  messageTemplateValidationSchema,
  MessageTemplateFormValues,
  ALLOWED_VARIABLES,
} from '@/schemas/messageTemplate';
import { CircularProgress } from '@/components/elements/CircularProgress';
import { isAxiosError } from 'axios';
import { Error } from '@/lib/types';

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTemplateModal({ isOpen, onClose }: Readonly<CreateTemplateModalProps>) {
  const initialValues: MessageTemplateFormValues = {
    name: '',
    content: '',
  };

  const [createTemplate, { isLoading }] = useCreateMessageTemplateMutation();

  const handleSubmit = async (
    values: MessageTemplateFormValues,
    { resetForm }: FormikHelpers<MessageTemplateFormValues>
  ) => {
    try {
      const { success, message } = await createTemplate({
        name: values.name,
        content: values.content,
      }).unwrap();

      if (success) {
        toast.success(message || 'Template created successfully');
        resetForm();
        onClose();
      } else {
        toast.error(message || 'Failed to create template');
      }
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data.message
          : (error as Error).data.message || 'Failed to create template'
      );
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema: messageTemplateValidationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true,
  });

  const { values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting } = formik;

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title='Create Message Template'
      size='xl'
      showFooter={true}
      footer={
        <div className='tw-flex tw-gap-2 tw-justify-end tw-w-full'>
          <button
            type='button'
            className='btn btn-outline-primary tw-flex-1'
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type='submit'
            form='create-template-form'
            className='btn btn-primary d-flex align-items-center justify-content-center gap-2 tw-flex-1'
            disabled={isLoading || isSubmitting}
          >
            {(isLoading || isSubmitting) && <CircularProgress />}
            Create Template
          </button>
        </div>
      }
    >
      <form id='create-template-form' onSubmit={formik.handleSubmit}>
        <div className='mb-3'>
          <label htmlFor='name' className='form-label'>
            Template Name <span className='text-danger'>*</span>
          </label>
          <input
            type='text'
            id='name'
            name='name'
            className={`form-control ${touched.name && errors.name ? 'is-invalid' : ''}`}
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder='e.g., Refill Request Approved'
          />
          {touched.name && errors.name && <div className='invalid-feedback d-block'>{errors.name}</div>}
        </div>

        <div className='mb-3'>
          <label htmlFor='content' className='form-label'>
            Content <span className='text-danger'>*</span>
          </label>
          <div className='mb-2 tw-text-sm text-muted'>
            Use &#123;&#123;variableName&#125;&#125; for dynamic content. Available variables:{' '}
            {ALLOWED_VARIABLES.map((variable) => `{{${variable}}}`).join(', ')}
          </div>
          <TipTapEditor
            content={values.content}
            onChange={(content) => setFieldValue('content', content)}
            placeholder='Enter template content...'
          />
          {touched.content && errors.content && <div className='text-danger tw-text-sm tw-mt-1'>{errors.content}</div>}
        </div>
      </form>
    </Modal>
  );
}
