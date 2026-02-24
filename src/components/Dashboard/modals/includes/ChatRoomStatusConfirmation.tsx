'use client';

import toast from 'react-hot-toast';
import type { Error } from '@/lib/types';
import { RootState } from '@/store';
import { useUpdatePatientStatusMutation } from '@/store/slices/chatApiSlice';
import { setChatRoom, setChatRoomStatus } from '@/store/slices/chatSlice';
import { setModal } from '@/store/slices/modalSlice';
import { isAxiosError } from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, CircularProgress } from '@/components/elements';

export const ChatRoomStatusConfirmation = () => {
  const dispatch = useDispatch();

  const { modalType } = useSelector((state: RootState) => state.modal);
  const chatRoom = useSelector((state: RootState) => state.chat.chatRoom);
  const status = useSelector((state: RootState) => state.chat.chatRoomStatus);

  const [updatePatientStatus, { isLoading }] = useUpdatePatientStatusMutation();

  const isOpen = modalType === 'Chatroom Status Confirmation';

  function handleClose() {
    dispatch(setModal({ modalType: undefined }));
    dispatch(setChatRoomStatus(undefined));
  }

  async function handleSubmit() {
    try {
      const { id = '' } = chatRoom || {};
      const { success, message } = await updatePatientStatus({ id, status: status }).unwrap();
      if (success) {
        toast.success(message || 'Chat status updated successfully');
        dispatch(setChatRoom({ id, status }));
        handleClose();
      } else {
        toast.error(message || 'Error while updating the status!');
      }
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data.message
          : (error as Error).data?.message || 'Error while updating the status!'
      );
    }
  }

  const footer = (
    <div className='tw-grid tw-grid-cols-2 tw-gap-2 tw-w-full'>
      <button
        type='button'
        className='tw-w-full tw-px-4 tw-py-2 tw-text-primary tw-border tw-border-solid tw-border-primary tw-rounded-lg tw-bg-white tw-transition-all hover:tw-bg-primary/10'
        onClick={handleClose}
      >
        Cancel
      </button>
      <button
        type='button'
        disabled={isLoading}
        className='tw-w-full tw-px-4 tw-py-2 tw-bg-primary tw-text-white tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-gap-2 tw-transition-all hover:tw-bg-primary/90 disabled:tw-opacity-70 disabled:tw-pointer-events-none'
        onClick={handleSubmit}
      >
        {isLoading && <CircularProgress className='!tw-w-4 !tw-h-4' />}
        Update
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size='md' footer={footer} showFooter={true}>
      <div className='tw-space-y-4 tw-py-4'>
        <div className='text-2xl fw-medium text-center'>
          Change Status to &quot;<span className='text-capitalize'>{status}</span>&quot;?
        </div>
        <div>
          <span className='text-placeholder text-center'>
            Are you sure you want change status to &quot;
            <span className='fw-medium text-dark text-capitalize'>{status}</span>&quot;?
          </span>
        </div>
      </div>
    </Modal>
  );
};
