'use client';

import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setModal } from '@/store/slices/modalSlice';
import { useAddOrderNoteMutation, OrderNoteData } from '@/store/slices/orderNotesApiSlice';
import { isAxiosError } from 'axios';
import { patientNoteSchema, PatientNoteSchema } from '@/lib/schema/patientNote';
import type { Error } from '@/lib/types';
import { Modal, CircularProgress } from '@/components/elements';

export function AddOrderNote() {
  const dispatch = useDispatch();

  const { modalType } = useSelector((state: RootState) => state.modal);
  const order = useSelector((state: RootState) => state.order);

  const [addOrderNote, { isLoading }] = useAddOrderNoteMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PatientNoteSchema>({
    defaultValues: { title: '', description: '' },
    resolver: yupResolver(patientNoteSchema),
  });

  const isOpen = modalType === 'Add Order Note';

  const handleClose = () => {
    reset();
    dispatch(setModal({ modalType: undefined }));
  };

  const handleAddNote = async (data: PatientNoteSchema) => {
    try {
      const patientId = order.patient?.id ?? '';
      const orderId = order.id;

      // Validate that orderId exists and is actually a valid order ID (not the same as patientId)
      // If order.id is undefined, null, empty, or the same as patient.id, it means there's no valid order
      const isValidOrderId = orderId && orderId !== patientId && orderId.trim() !== '';

      if (!isValidOrderId) {
        toast.error('Please select a valid order to add an order note.');
        return;
      }

      const newNote: OrderNoteData = {
        patientId,
        orderId,
        title: data.title ?? '',
        description: data.description,
        type: 'Order',
      };

      const { success, message } = await addOrderNote(newNote).unwrap();
      if (success) {
        toast.success('Order Note Added Successfuly!');
        handleClose();
      } else {
        toast.error(message);
      }
    } catch (e) {
      if (isAxiosError(e)) {
        toast.error(e.response?.data.message);
      } else {
        toast.error((e as Error)?.data?.message || 'Error adding order note!');
      }
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
        form='add-order-note-form'
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
      <form id='add-order-note-form' onSubmit={handleSubmit(handleAddNote)} className='tw-mt-6'>
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
