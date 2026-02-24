'use client';

import React from 'react';
import { Button, Modal, Spinner } from 'react-bootstrap';

interface OrderReassignConfirmModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  isPulling?: boolean;
  orderCount: number;
  patientName?: string;
  visitType?: 'video' | 'document';
}

export const OrderReassignConfirmModal: React.FC<OrderReassignConfirmModalProps> = ({
  show,
  onHide,
  onConfirm,
  isPulling = false,
  orderCount,
  // visitType = 'document',
}) => {
  // const orderTypeText = visitType === 'video' ? 'appointment' : 'encounter';
  // const orderTypePlural = orderCount > 1 ? `${orderTypeText}s` : orderTypeText;

  return (
    <Modal show={show} onHide={onHide} centered backdrop='static' style={{ zIndex: 1070 }}>
      <Modal.Header className='border-0' closeButton>
        <Modal.Title className='tw-text-base sm:tw-text-lg'>Confirm Order Reassignment</Modal.Title>
      </Modal.Header>
      <Modal.Body className='tw-px-3 sm:tw-px-4'>
        <div className='tw-mb-3 sm:tw-mb-4'>
          <div className='tw-flex tw-items-start sm:tw-items-center tw-gap-2 tw-mb-2 sm:tw-mb-3'>
            <span className='tw-text-2xl sm:tw-text-3xl tw-flex-shrink-0'>⚠️</span>
            <h5 className='tw-mb-0 tw-text-sm sm:tw-text-base tw-font-semibold tw-text-gray-900'>
              Orders Assigned to Other Provider
            </h5>
          </div>
          {/* <p className='tw-text-sm sm:tw-text-base tw-text-gray-700'>
            {orderCount} {orderTypePlural} you selected {orderCount > 1 ? 'are' : 'is'} currently assigned to another
            provider.
          </p> */}
          <p className='tw-text-sm sm:tw-text-base tw-text-gray-700'>
            The orders you selected — {orderCount} in total — is already assigned to another provider.
          </p>
          <p className='tw-text-sm sm:tw-text-base tw-text-gray-700 tw-mb-0'>
            Are you sure you want to pull {orderCount > 1 ? 'these orders' : 'this order'}?
          </p>
        </div>
        {/* <div className='tw-p-2 sm:tw-p-3 tw-bg-orange-50 tw-border tw-border-orange-200 tw-rounded-lg'>
          <p className='tw-text-xs sm:tw-text-sm tw-text-orange-900 tw-mb-0'>
            <strong>Note:</strong> This will reassign {orderCount > 1 ? 'these orders' : 'this order'} to you and notify
            the current provider.
          </p>
        </div> */}
      </Modal.Body>
      <Modal.Footer className='border-0 tw-flex-col sm:tw-flex-row tw-gap-2 sm:tw-gap-0'>
        <Button
          variant='btn btn-outline-primary'
          onClick={onHide}
          disabled={isPulling}
          className='tw-w-full sm:tw-w-auto tw-text-sm sm:tw-text-base tw-order-2 sm:tw-order-1'
        >
          Cancel
        </Button>
        <Button
          variant='btn btn-primary'
          onClick={onConfirm}
          disabled={isPulling}
          className='tw-w-full sm:tw-w-auto tw-text-sm sm:tw-text-base tw-order-1 sm:tw-order-2'
        >
          {isPulling ? (
            <>
              <Spinner as='span' animation='border' size='sm' role='status' aria-hidden='true' className='me-1' />
              Pulling...
            </>
          ) : (
            'Yes, Reassign'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
