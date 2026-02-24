'use client';

import { generalDetailsSchema, PatientGeneralDetailsSchema } from '@/lib/schema/patientGeneralDetails';
import type { Error } from '@/lib/types';
import { RootState } from '@/store';
import { setModal } from '@/store/slices/modalSlice';
import { useUpdatePatientDetailsMutation } from '@/store/slices/patientsApiSlice';
import { yupResolver } from '@hookform/resolvers/yup';
import { isAxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { parseDateString } from '@/helpers/dateFormatter';
import { Modal, CircularProgress } from '@/components/elements';

export function PatientEditGeneralDetails() {
  const dispatch = useDispatch();
  const { modalType } = useSelector((state: RootState) => state.modal);
  const [updatePatientDetails, { isLoading }] = useUpdatePatientDetailsMutation();
  const patient = useSelector((state: RootState) => state.patient);
  const isOpen = modalType === 'Edit Patient General Details';
  const ctx = useSelector((state: RootState) => state.modal.ctx) as unknown as {
    firstName: string;
    lastName: string;
    dob: string;
    gender: NonNullable<'male' | 'female' | 'other' | undefined>;
  };

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
    formState: { errors, dirtyFields, isValid },
  } = useForm<PatientGeneralDetailsSchema>({
    defaultValues: {
      firstName: '',
      lastName: '',
      dob: new Date().toISOString().slice(0, 10),
      gender: undefined,
    },
    resolver: yupResolver(generalDetailsSchema),
    mode: 'onChange', // Validate on every change
  });

  const handleClose = () => {
    reset();
    dispatch(setModal({ modalType: undefined }));
  };

  const handleEditGeneralDetails = async (data: PatientGeneralDetailsSchema) => {
    const keys = Object.keys(data).filter((k) => dirtyFields[k as keyof typeof dirtyFields]);
    if (keys && keys.length > 0) {
      const updatedPatientDetails = {
        ...keys.map((k) => ({ [k]: data[k as keyof typeof data] })),
      };
      const mergedObject = Object.assign({}, ...Object.values(updatedPatientDetails));

      try {
        const { error, data } = await updatePatientDetails({
          id: patient.id,
          ...mergedObject,
        });
        if (error) {
          toast.error((error as Error).data.message || 'Error updating patient general details!');
        } else {
          toast.success((data as Error['data']).message || 'Patient General Details Updated!');
          handleClose();
        }
      } catch (error) {
        if (isAxiosError(error)) {
          toast.error(error.response?.data.message);
        } else {
          toast.error('Error updating patient general details!');
        }
      }
    } else {
      handleClose();
    }
  };

  useEffect(() => {
    if (patient) {
      const setValues = async () => {
        setValue('firstName', ctx?.firstName ?? '', { shouldValidate: true });
        setValue('lastName', ctx?.lastName ?? '', { shouldValidate: true });
        setValue('dob', ctx?.dob, { shouldValidate: true });
        setValue('gender', ctx?.gender ?? 'male', { shouldValidate: true });

        if (ctx?.dob) {
          // Parse date string in local timezone to avoid timezone shifts
          const parsedDate = parseDateString(ctx.dob);
          setSelectedDate(parsedDate);
        }

        await trigger(); // Trigger validation after setting all values
      };
      setValues();
    }
  }, [patient]);

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
        form='patient-edit-general-details-form'
        disabled={!isValid || isLoading}
        className='tw-w-full tw-px-4 tw-py-2 tw-bg-primary tw-text-white tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-gap-2 tw-transition-all hover:tw-bg-primary/90 disabled:tw-opacity-70 disabled:tw-pointer-events-none'
      >
        {isLoading && <CircularProgress className='!tw-w-4 !tw-h-4' />}
        Save
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title='General Details' size='md' footer={footer} showFooter={true}>
      <form
        id='patient-edit-general-details-form'
        onSubmit={handleSubmit(handleEditGeneralDetails)}
        className='tw-space-y-4'
      >
        <div>
          <label htmlFor='firstName' className='form-label text-sm text-secondary'>
            First Name
          </label>
          <input
            {...register('firstName')}
            className={`form-control shadow-none ${errors.firstName ? 'is-invalid' : ''}`}
            type='text'
          />
          {!!errors.firstName && <span className='text-sm text-danger'>{errors.firstName.message}</span>}
        </div>
        <div>
          <label htmlFor='lastName' className='form-label text-sm text-secondary'>
            Last Name
          </label>
          <input
            {...register('lastName')}
            className={`form-control shadow-none ${errors.lastName ? 'is-invalid' : ''}`}
          />
          {!!errors.lastName && <span className='text-sm text-danger'>{errors.lastName.message}</span>}
        </div>
        <div>
          <label htmlFor='gender' className='form-label text-sm text-secondary'>
            Gender
          </label>
          <select {...register('gender')} className={`form-select shadow-none ${errors.gender ? 'is-invalid' : ''}`}>
            <option value=''>Select Gender</option>
            <option value={'male'}>Male</option>
            <option value={'female'}>Female</option>
            <option value={'other'}>Other</option>
          </select>
          {!!errors.gender && <span className='text-sm text-danger'>{errors.gender.message}</span>}
        </div>
        <div>
          <label htmlFor='dob' className='form-label text-sm text-secondary'>
            Date of Birth
          </label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => {
              setSelectedDate(date);
              if (date) {
                const formattedDate = format(date, 'yyyy-MM-dd');
                setValue('dob', formattedDate, { shouldValidate: true, shouldDirty: true });
                trigger('dob');
              }
            }}
            dateFormat='MM/dd/yyyy'
            placeholderText='MM/DD/YYYY'
            className={`form-control shadow-none ${errors.dob ? 'is-invalid' : ''}`}
            showMonthDropdown
            showYearDropdown
            dropdownMode='select'
            maxDate={new Date()}
          />
          {errors.dob && (
            <span className='text-sm text-danger'>
              {errors.dob.type === 'min-age' && 'You must be at least 18 years old'}
              {errors.dob.type === 'max-age' && 'Maximum age allowed is 100 years'}
              {errors.dob.type === 'required' && 'Date of birth is required'}
            </span>
          )}
        </div>
      </form>
    </Modal>
  );
}
