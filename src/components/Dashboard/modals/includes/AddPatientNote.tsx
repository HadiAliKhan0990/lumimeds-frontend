'use client';

import { patientNoteSchema, PatientNoteSchema } from '@/lib/schema/patientNote';
import type { Error } from '@/lib/types';
import { RootState } from '@/store';
import { setModal, setModalType } from '@/store/slices/modalSlice';
import { PatientNoteData, useAddPatientNoteMutation } from '@/store/slices/patientsApiSlice';
import { yupResolver } from '@hookform/resolvers/yup';
import { isAxiosError } from 'axios';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { triggerNotesRefetch } from '@/store/slices/patientNotesSlice';
import { Modal, CircularProgress } from '@/components/elements';

export function AddPatientNote() {
  const dispatch = useDispatch();

  const { modalType } = useSelector((state: RootState) => state.modal);
  const patient = useSelector((state: RootState) => state.patient);
  const order = useSelector((state: RootState) => state.order);

  const type = useSelector((state: RootState) => state.modal.type);

  const [isLoading, setLoading] = useState(false);

  const [addPatientNote] = useAddPatientNoteMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientNoteSchema>({
    defaultValues: {
      title: '',
      description: '',
    },
    resolver: yupResolver(patientNoteSchema),
  });

  const isOpen = modalType === 'Add Patient Note';

  const handleClose = () => {
    reset();
    dispatch(setModal({ modalType: undefined }));
    dispatch(setModalType(undefined));
  };

  const handleAddNote = async (data: PatientNoteSchema) => {
    try {
      setLoading(true);

      // Use patient ID from Redux store, fallback to order patient ID
      const patientId = patient.id || order?.patient?.id || '';

      // Ensure type is set - default to 'Patient' for patient notes if not specified
      const noteType = type || 'Patient';

      const newNote: PatientNoteData = {
        patientId: patientId,
        title: data.title,
        description: data.description,
        type: noteType,
      };
      const { error } = await addPatientNote(newNote);
      if (error) {
        toast.error((error as Error).data.message);
      } else {
        toast.success('Note Added Successfully!');
        // Trigger refetch - components will refetch with their correct types
        dispatch(triggerNotesRefetch());
        handleClose();
      }
    } catch (e) {
      if (isAxiosError(e)) {
        toast.error(e.response?.data.message);
      } else {
        toast.error('Error archiving notes!');
      }
    } finally {
      setLoading(false);
    }
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
        form='add-patient-note-form'
        disabled={isLoading}
        className='tw-w-full tw-px-4 tw-py-2 tw-bg-primary tw-text-white tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-gap-2 tw-transition-all hover:tw-bg-primary/90 disabled:tw-opacity-70 disabled:tw-pointer-events-none'
      >
        {isLoading && <CircularProgress className='!tw-w-4 !tw-h-4' />}
        Add
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size='lg' footer={footer} showFooter={true}>
      <form id='add-patient-note-form' onSubmit={handleSubmit(handleAddNote)} className='tw-mt-6'>
        {/* <div>
          <label className='form-label text-sm' htmlFor='title'>
            Title
          </label>
          <input {...register('title')} className='form-control shadow-none' type='text' />
          {!!errors.title && <span className='text-sm text-danger'>{errors.title.message}</span>}
        </div> */}
        <div>
          <label className='form-label text-sm' htmlFor='description'>
            Description
          </label>
          <textarea
            {...register('description')}
            className='form-control shadow-none tw-min-h-[200px] tw-resize-y'
            rows={8}
          />
          {!!errors.description && <span className='text-sm text-danger'>{errors.description.message}</span>}
        </div>
      </form>
    </Modal>
  );
}
