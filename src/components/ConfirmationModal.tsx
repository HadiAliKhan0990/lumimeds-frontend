'use client';

import { ReactElement, ReactNode, useEffect, useState } from 'react';
import { Modal, Button, Spinner, ModalProps, Form } from 'react-bootstrap';

export interface ConfirmationModalProps extends ModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  title?: string | ReactNode;
  message?: string | ReactNode | ReactElement;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmButtonDisabled?: boolean;
  cancelButtonDisabled?: boolean;
  loading?: boolean;
  /**
   * Optional dialog class name to control modal width/responsiveness
   */
  dialogClassName?: string;
  /**
   * Optional flag to show reason input field
   */
  showReasonInput?: boolean;
  /**
   * Callback to get the reason value when it changes
   */
  onReasonChange?: (reason: string) => void;
  /**
   * Placeholder text for reason input
   */
  reasonPlaceholder?: string;
  /**
   * Label for reason input
   */
  reasonLabel?: string;
  headerClassName?: string;
  titleClassName?: string;
  footerClassName?: string;
  footerContainerClassName?: string;
}

/**
 * ConfirmationModal
 *
 * Props:
 * - show: boolean, controls modal visibility
 * - onHide: () => void, called when modal is requested to close
 * - onConfirm: () => void, called when user confirms action
 * - title?: string, modal title
 * - message?: string, confirmation message body
 * - confirmLabel?: string, label for confirm button
 * - cancelLabel?: string, label for cancel button
 */
export default function ConfirmationModal({
  show,
  onHide,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Yes',
  cancelLabel = 'No',
  loading = false,
  cancelButtonDisabled,
  confirmButtonDisabled,
  children,
  dialogClassName,
  showReasonInput = false,
  onReasonChange,
  reasonPlaceholder = 'Enter cancellation reason (optional)',
  reasonLabel = 'Reason',
  headerClassName,
  titleClassName,
  footerClassName,
  footerContainerClassName,
  ...props
}: Readonly<ConfirmationModalProps>) {
  const [reason, setReason] = useState('');

  const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setReason(value);
    onReasonChange?.(value);
  };

  const handleHide = () => {
    setReason('');
    onHide();
  };

  // Ensure reason is cleared whenever the modal is programmatically closed
  useEffect(() => {
    if (!show) {
      setReason('');
    }
  }, [show]);

  return (
    <Modal
      {...props}
      show={show}
      onHide={handleHide}
      centered
      contentClassName='border-0 rounded-12'
      dialogClassName={dialogClassName}
    >
      {title && (
        <Modal.Header className={`!tw-border-0 tw-justify-center tw-text-center ${headerClassName || ''}`}>
          <Modal.Title className={`${titleClassName || ''}`}>{title}</Modal.Title>
        </Modal.Header>
      )}

      <Modal.Body className='text-center'>
        {message || children}
        {showReasonInput && (
          <div className='mt-3 text-start'>
            <Form.Label className='fw-medium'>{reasonLabel}</Form.Label>
            <Form.Control
              as='textarea'
              rows={3}
              placeholder={reasonPlaceholder}
              value={reason}
              onChange={handleReasonChange}
              disabled={loading}
            />
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className={`!tw-border-0 ${footerClassName || ''}`}>
        <div className={`row w-100 gx-3 ${footerContainerClassName || ''}`}>
          <div className='col-6'>
            <Button
              disabled={loading || cancelButtonDisabled}
              className='w-100'
              variant='outline-primary'
              onClick={handleHide}
            >
              {cancelLabel}
            </Button>
          </div>
          <div className='col-6'>
            <Button
              disabled={loading || confirmButtonDisabled}
              className='w-100 d-flex align-items-center justify-content-center gap-2'
              variant='primary'
              onClick={onConfirm}
            >
              {loading && <Spinner size='sm' />}
              {confirmLabel}
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
