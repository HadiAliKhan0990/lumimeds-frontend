'use client';

import { ReactNode } from 'react';
import { Spinner } from 'react-bootstrap';

interface Props {
  title: string;
  message: string | ReactNode;
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
  confirmLabel?: string;
  confirmVariant?: string;
  cancelLabel?: string;
}

export const SubscriptionActionConfirmation = ({
  title,
  cancelLabel = 'No',
  message,
  onConfirm,
  onClose,
  isLoading,
  confirmLabel = 'Yes',
  confirmVariant = 'dark',
}: Props) => {
  return (
    <>
      <div className='tw-py-5'>

        <p className='text-2xl fw-medium text-center'>{title}</p>
        <p className='my-4 text-center'>{message}</p>
        <div className='row g-3'>
          <div className='col-6'>
            <button className='btn btn-outline-primary rounded-2 w-100' onClick={onClose}>
              {cancelLabel}
            </button>
          </div>
          <div className='col-6'>
            <button
              onClick={onConfirm}
              className={`btn btn-${confirmVariant} rounded-2 w-100 d-flex align-items-center justify-content-center gap-2`}
              disabled={isLoading}
            >
              {isLoading && <Spinner size='sm' />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>

    </>
  );
};
