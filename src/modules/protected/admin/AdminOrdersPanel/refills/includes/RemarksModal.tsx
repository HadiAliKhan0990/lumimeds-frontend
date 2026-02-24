'use client';

import { Modal } from '@/components/elements';
import * as Yup from 'yup';
import { RefillSurveyRequest, useUpdateRefillRemarksMutation } from '@/store/slices/refillsApiSlice';
import { ErrorMessage, Field, Form, Formik, FormikHelpers, FormikProps } from 'formik';
import { toast } from 'react-hot-toast';
import { CircularProgress } from '@/components/elements/CircularProgress';
import { useRef } from 'react';
import { isAxiosError } from 'axios';
import { Error } from '@/lib/types';

export interface RemarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  refill: RefillSurveyRequest | null;
  onSuccess: (refill: RefillSurveyRequest) => void;
}

interface RemarksFormValues {
  remarks: string;
}

const validationSchema = Yup.object({
  remarks: Yup.string().trim().required('Remarks are required').min(3, 'Remarks must be at least 3 characters'),
});

export function RemarksModal({ isOpen, onClose, refill, onSuccess }: Readonly<RemarksModalProps>) {
  const formikRef = useRef<FormikProps<RemarksFormValues>>(null);

  const [updateRefillRemarks, { isLoading }] = useUpdateRefillRemarksMutation();

  if (!refill) return null;

  const initialValues: RemarksFormValues = {
    remarks: refill.remarks || '',
  };

  const handleClose = () => {
    if (!isLoading) {
      formikRef.current?.resetForm();
      onClose();
    }
  };

  const handleSubmit = async ({ remarks }: RemarksFormValues, { resetForm }: FormikHelpers<RemarksFormValues>) => {
    // Check if remarks have actually changed
    const trimmedRemarks = remarks.trim();
    const originalRemarks = (refill.remarks || '').trim();

    if (trimmedRemarks === originalRemarks) {
      toast.error('No changes detected. Please modify the remarks before submitting.');
      return;
    }

    try {
      const { success, message, data } = await updateRefillRemarks({
        refillRequestId: refill.id,
        remarks: trimmedRemarks,
      }).unwrap();

      if (success) {
        toast.success(message || 'Remarks updated successfully');
        resetForm();
        handleClose();

        if (data) {
          onSuccess(data);
        }
      } else {
        toast.error(message || 'Failed to update remarks');
      }
    } catch (error) {
      toast.error(
        isAxiosError(error) ? error.response?.data.message : (error as Error).data.message || 'Failed to update remarks'
      );
    }
  };

  const modalFooter = (
    <>
      <div className='col-sm-6'>
        <button
          type='button'
          className='btn btn-outline-primary tw-w-full'
          onClick={handleClose}
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>
      <div className='col-sm-6'>
        <button
          type='submit'
          form='remarks-form'
          className='btn btn-primary tw-w-full !tw-flex tw-items-center tw-justify-center tw-gap-2'
          disabled={isLoading}
        >
          {isLoading && <CircularProgress className='!tw-w-4 !tw-h-4' />}
          Update Remarks
        </button>
      </div>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size='md'
      title='Update Refill Remarks'
      footer={modalFooter}
      showFooter
    >
      <Formik
        innerRef={formikRef}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        <Form id='remarks-form'>
          <div className='mb-3'>
            <label className='form-label fw-semibold mb-2'>
              Remarks <span className='tw-text-red-500'>*</span>
            </label>
            <Field
              as='textarea'
              name='remarks'
              className='form-control'
              rows={4}
              placeholder='Add remarks, notes, or instructions...'
            />
            <ErrorMessage name='remarks' component='div' className='text-danger text-xs mt-2' />
          </div>
        </Form>
      </Formik>
    </Modal>
  );
}
