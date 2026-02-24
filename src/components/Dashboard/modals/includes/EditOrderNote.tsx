'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setModal } from '@/store/slices/modalSlice';
import { useEditOrderNoteMutation, EditOrderNoteData } from '@/store/slices/orderNotesApiSlice';
import { isAxiosError } from 'axios';
import { useState, useEffect } from 'react';
import { patientNoteSchema, PatientNoteSchema } from '@/lib/schema/patientNote';
import toast from 'react-hot-toast';
import { Modal, CircularProgress } from '@/components/elements';

export function EditOrderNote() {
  const dispatch = useDispatch();
  const { modalType } = useSelector((state: RootState) => state.modal);
  const patientNote = useSelector((state: RootState) => state.patientNote);
  const [isLoading, setLoading] = useState(false);

  const [editOrderNote] = useEditOrderNoteMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<PatientNoteSchema>({
    defaultValues: { title: '', description: '' },
    resolver: yupResolver(patientNoteSchema),
  });

  const isOpen = modalType === 'Edit Order Note';

  useEffect(() => {
    if (patientNote) {
      setValue('title', patientNote.title || '');
      setValue('description', patientNote.description || '');
    }
  }, [patientNote, setValue]);

  const handleClose = () => {
    reset();
    dispatch(setModal({ modalType: undefined }));
  };

  const handleEditNote = async (data: PatientNoteSchema) => {
    try {
      setLoading(true);

      const editNote: EditOrderNoteData = {
        id: patientNote.id || '',
        title: data.title ?? '',
        description: data.description,
      };
      const result = await editOrderNote(editNote);
      if ('error' in result) {
        toast.error('Error updating order note');
      } else {
        toast.success('Note Updated Successfully!');
        handleClose();
      }
    } catch (e) {
      if (isAxiosError(e)) {
        toast.error(e.response?.data.message);
      } else {
        toast.error('Error updating order note!');
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
        form='edit-order-note-form'
        disabled={isLoading}
        className='tw-w-full tw-px-4 tw-py-2 tw-bg-primary tw-text-white tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-gap-2 tw-transition-all hover:tw-bg-primary/90 disabled:tw-opacity-70 disabled:tw-pointer-events-none'
      >
        {isLoading && <CircularProgress className='!tw-w-4 !tw-h-4' />}
        Save
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size='lg' footer={footer} showFooter={true}>
      <form id='edit-order-note-form' onSubmit={handleSubmit(handleEditNote)} className='tw-mt-6'>
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
          <textarea {...register('description')} className='form-control shadow-none tw-min-h-[200px] tw-resize-y' rows={8} />
          {!!errors.description && <span className='text-sm text-danger'>{errors.description.message}</span>}
        </div>
      </form>
    </Modal>
  );
}
