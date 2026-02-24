'use client';

import { contactDetailsSchema } from '@/lib/schema/patientContactDetails';
import { RootState } from '@/store';
import { setModal } from '@/store/slices/modalSlice';
import { useUpdatePatientDetailsMutation } from '@/store/slices/patientsApiSlice';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { useFormik } from 'formik';
import type { Error } from '@/lib/types';
import { CustomPhoneInput } from '@/components/elements/Inputs/CustomPhoneInput';
import { formatUSPhone, formatUSPhoneWithoutPlusOne, removeSpacesAndBracketsFromString } from '@/lib/helper';
import { Modal, CircularProgress } from '@/components/elements';

export function PatientEditContactDetails() {
  const dispatch = useDispatch();
  const { modalType } = useSelector((state: RootState) => state.modal);
  const patient = useSelector((state: RootState) => state.patient);
  const ctx = useSelector((state: RootState) => state.modal.ctx) as unknown as {
    email: string;
    phoneNumber: string;
  };

  const isOpen = modalType === 'Edit Patient Contact Details';

  const [updatePatientDetails, { isLoading }] = useUpdatePatientDetailsMutation();

  // Prepare initial values and track original for dirty check
  const initialValues = {
    email: ctx?.email ?? '',
    phoneNumber: formatUSPhoneWithoutPlusOne(ctx?.phoneNumber ?? '') || '',
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema: contactDetailsSchema,
    onSubmit: async (values) => {
      if (values.email === ctx?.email && values.phoneNumber === ctx?.phoneNumber) {
        dispatch(setModal({ modalType: undefined }));
        return;
      }

      const formatted = formatUSPhone(values?.phoneNumber ?? '');

      const symbolsRemoved = removeSpacesAndBracketsFromString(formatted ?? '');

      const payload = {
        ...(values.email !== ctx?.email && { email: values.email }),
        ...(values.phoneNumber !== ctx?.phoneNumber && { phoneNumber: `+1${symbolsRemoved}` }),
      };

      try {
        const { error, data } = await updatePatientDetails({
          id: patient.id,
          ...payload,
        });
        if (error) {
          toast.error((error as Error).data?.message || 'Error updating Patient Contact Details!');
        } else {
          toast.success((data as Error).data.message || 'Patient Contact Details Updated!');
          dispatch(setModal({ modalType: undefined }));
        }
      } catch (err) {
        if (isAxiosError(err)) {
          toast.error(err.response?.data.message);
        } else {
          toast.error('Error updating Patient Contact Details!');
        }
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    dispatch(setModal({ modalType: undefined }));
  };

  const footer = (
    <div className='tw-grid tw-grid-cols-2 tw-gap-2 tw-w-full'>
      <button
        type='button'
        className='tw-w-full tw-px-4 tw-py-2 tw-text-primary tw-border tw-border-solid tw-border-primary tw-rounded-lg tw-bg-white tw-transition-all hover:tw-bg-primary/10'
        onClick={handleClose}
      >
        Discard
      </button>
      <button
        type='submit'
        form='patient-edit-contact-details-form'
        disabled={isLoading || formik.isSubmitting}
        className='tw-w-full tw-px-4 tw-py-2 tw-bg-primary tw-text-white tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-gap-2 tw-transition-all hover:tw-bg-primary/90 disabled:tw-opacity-70 disabled:tw-pointer-events-none'
      >
        {(isLoading || formik.isSubmitting) && <CircularProgress className='!tw-w-4 !tw-h-4' />}
        Save
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size='md' footer={footer} showFooter={true} title='Contact Details'>
      <form id='patient-edit-contact-details-form' onSubmit={formik.handleSubmit} className='tw-space-y-4'>
        <div>
          <label htmlFor='email' className='form-label small text-secondary'>
            Email
          </label>
          <input
            id='email'
            name='email'
            type='text'
            className={`form-control shadow-none${formik.touched.email && formik.errors.email ? ' is-invalid' : ''}`}
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.email && formik.errors.email && (
            <span className='small text-danger'>{formik.errors.email}</span>
          )}
        </div>

        <div>
          <label htmlFor='phoneNumber' className='form-label small text-secondary'>
            Phone Number
          </label>
          <CustomPhoneInput
            value={formik.values.phoneNumber}
            onChange={({ target: { value } }) => {
              formik.setFieldValue('phoneNumber', value);
            }}
            onBlur={formik.handleBlur}
            name='phoneNumber'
            className='form-control shadow-none'
          />
          {formik.touched.phoneNumber && formik.errors.phoneNumber && (
            <span className='small text-danger'>{formik.errors.phoneNumber}</span>
          )}
        </div>
      </form>
    </Modal>
  );
}
