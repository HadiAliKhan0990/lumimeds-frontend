'use client';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { formatUSDate } from '@/helpers/dateFormatter';
import Image from 'next/image';
import { setModal } from '@/store/slices/modalSlice';
import { Modal } from '@/components/elements';

export function ViewNoteDetails() {
  const dispatch = useDispatch();
  const { modalType } = useSelector((state: RootState) => state.modal);
  const ctx = useSelector((state: RootState) => state.modal.ctx) as {
    note: {
      id: string;
      description: string;
      createdAt: string;
      createdByInfo?: {
        firstName?: string;
        lastName?: string;
      };
    };
  };

  const { note } = ctx || {};

  const isOpen = modalType === 'View Note Details';

  const handleClose = () => {
    dispatch(setModal({ modalType: undefined }));
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title='Note Details' size='md' bodyClassName='tw-pb-4'>
      {!note ? (
        <div className='tw-p-4 tw-text-center'>
          <span className='text-muted'>No note details available</span>
        </div>
      ) : (
        <div className='tw-space-y-4'>
          {/* Created Date */}
          <div className='tw-text-sm text-muted'>Created on {formatUSDate(note.createdAt)}</div>

          {/* Note Content */}
          <div>
            <div className='tw-block tw-font-medium tw-text-dark tw-mb-2'>Description</div>
            <div className='tw-p-3 tw-bg-[#F0FDF4] tw-rounded-3 tw-min-h-[120px] tw-whitespace-pre-wrap tw-break-words'>
              {note.description}
            </div>
          </div>

          {/* Author Info */}
          <div className='tw-flex tw-items-center tw-gap-2'>
            <Image
              src='/assets/svg/document-normal.svg'
              alt='Document'
              width={16}
              height={16}
              className='text-muted'
              unoptimized
            />
            <span className='text-muted tw-text-sm'>
              Added by {note.createdByInfo?.firstName} {note.createdByInfo?.lastName || 'Smith'}
            </span>
          </div>
        </div>
      )}
    </Modal>
  );
}
