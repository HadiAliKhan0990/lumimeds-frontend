'use client';

import { Modal } from '@/components/elements';
import {
  RefillSurveyRequest,
  UpdateRefillStatusPayload,
  useUpdateRefillStatusMutation,
} from '@/store/slices/refillsApiSlice';
import { ErrorMessage, Field, Form, Formik, FormikHelpers, FormikProps } from 'formik';
import { toast } from 'react-hot-toast';
import { ManageRefillRequestValues, validationSchema } from '@/schemas/manageRefillRequest';
import { actionOptions } from '@/constants/manageRefillRequest';
import { useRef } from 'react';
import { isAxiosError } from 'axios';
import { Error } from '@/lib/types';
import { CircularProgress } from '@/components/elements/CircularProgress';

export interface ManageRefillModalProps {
  isOpen: boolean;
  onClose: () => void;
  refill: RefillSurveyRequest | null;
  onSuccess: (refill: RefillSurveyRequest) => void;
}

export function ManageRefillModal({ isOpen, onClose, refill, onSuccess }: Readonly<ManageRefillModalProps>) {
  const formikRef = useRef<FormikProps<ManageRefillRequestValues>>(null);

  const [updateRefillStatus, { isLoading }] = useUpdateRefillStatusMutation();

  if (!refill) return null;

  const initialValues: ManageRefillRequestValues = {
    status: 'approved',
    replacementPriceId: '',
    remarks: '',
  };

  const handleClose = () => {
    if (!isLoading) {
      formikRef.current?.resetForm();
      onClose();
    }
  };

  const handleSubmit = async (
    { status, replacementPriceId, remarks }: ManageRefillRequestValues,
    { resetForm }: FormikHelpers<ManageRefillRequestValues>
  ) => {
    try {
      const payload: UpdateRefillStatusPayload = {
        status: status,
      };

      payload.remarks = remarks?.trim() || '';

      if (status === 'on_hold' && replacementPriceId) {
        payload.replacementPriceId = replacementPriceId;
      }

      const { success, message, data } = await updateRefillStatus({
        refillRequestId: refill.id,
        payload,
      }).unwrap();

      if (success) {
        toast.success(message || 'Refill status updated successfully');
        resetForm();
        handleClose();

        if (data) {
          onSuccess(data);
        }
      } else {
        toast.error(message || 'Failed to update refill status');
      }
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data.message
          : (error as Error).data.message || 'Failed to update refill status'
      );
    }
  };

  const modalFooter = (
    <>
      <div className='col-sm-6'>
        <button type='button' className='btn btn-outline-primary tw-w-full' onClick={onClose} disabled={isLoading}>
          Cancel
        </button>
      </div>
      <div className='col-sm-6'>
        <button
          type='submit'
          form='manage-refill-form'
          className='btn btn-primary tw-w-full !tw-flex tw-items-center tw-justify-center tw-gap-2'
          disabled={isLoading}
        >
          {isLoading && <CircularProgress className='!tw-w-4 !tw-h-4' />}
          Submit
        </button>
      </div>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='md' title='Manage Refill Request' footer={modalFooter} showFooter>
      <Formik
        innerRef={formikRef}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values }) => (
          <Form id='manage-refill-form'>
            {/* Action Selection */}
            <div className='mb-4'>
              <label className='form-label fw-semibold mb-3'>
                Select Action <span className='tw-text-red-500'>*</span>
              </label>
              <div className='d-flex flex-column gap-3'>
                {actionOptions.map(({ Icon, id, value, label, description, colorClass }) => {
                  const isSelected = values.status === value;
                  return (
                    <label
                      key={id}
                      htmlFor={id}
                      className={`border rounded-3 tw-p-3 tw-flex tw-items-center tw-gap-x-3 tw-transition-all tw-cursor-pointer ${
                        isSelected
                          ? `${colorClass.border} ${colorClass.bg} bg-opacity-10 shadow-sm`
                          : 'border-secondary bg-white'
                      }`}
                    >
                      <div
                        className={`tw-flex tw-items-center tw-justify-center tw-rounded-full tw-h-8 tw-w-8 tw-transition-all ${
                          isSelected ? `${colorClass.iconBg} text-white` : 'bg-light text-muted'
                        }`}
                      >
                        <Icon size={18} className='tw-flex-shrink-0' />
                      </div>
                      <div>
                        <div className='tw-font-semibold tw-text-sm tw-mb-1'>{label}</div>
                        <div className='tw-text-xs text-muted'>{description}</div>
                      </div>
                      <Field hidden type='radio' name='status' value={value} id={id} />
                    </label>
                  );
                })}
              </div>
              <ErrorMessage name='status' component='div' className='text-danger text-xs mt-2' />
            </div>

            {/* Replacement Price Selection - Only show when "Submit Replacement Price" is selected */}
            {values.status === 'on_hold' && refill.replacementPrices && refill.replacementPrices.length > 0 && (
              <div className='mb-4'>
                <label className='form-label fw-semibold mb-2'>
                  Replacement Price <span className='tw-text-red-500'>*</span>
                </label>
                <Field as='select' name='replacementPriceId' className='form-select'>
                  <option selected disabled value=''>
                    Select a replacement price
                  </option>
                  {refill.replacementPrices.map((price) => (
                    <option key={price.id} value={price.id}>
                      ${price.amount}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name='replacementPriceId' component='div' className='text-danger text-xs mt-2' />
              </div>
            )}

            <div className='mb-3'>
              <label className='form-label fw-semibold mb-2'>Remarks</label>
              <Field
                as='textarea'
                name='remarks'
                className='form-control'
                rows={4}
                placeholder='Add any notes, reasons, or instructions...'
                style={{ resize: 'none' }}
              />
              <ErrorMessage name='remarks' component='div' className='text-danger text-xs mt-2' />
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
