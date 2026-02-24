'use client';

import { Modal, Button } from 'react-bootstrap';
import { FormIcon } from '@/components/Icon/FormIcon';

type Props = {
  show: boolean;
  surveyUrl: string | null;
  onClose: () => void;
};

export default function PendingIntakeFormModal({ show, surveyUrl, onClose }: Readonly<Props>) {
  console.log('PendingIntakeFormModal render:', { show, surveyUrl });
  const handleFillIntakeForm = () => {
    if (surveyUrl) {
      // Construct URL with preventClose parameter
      let finalUrl: string;
      try {
        const url = new URL(surveyUrl);
        url.searchParams.set('preventClose', 'true');
        finalUrl = url.toString();
      } catch {
        const url = new URL(surveyUrl, window.location.origin);
        url.searchParams.set('preventClose', 'true');
        finalUrl = url.toString();
      }

      window.open(finalUrl, '_blank');
    }
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} centered aria-labelledby='pending-intake-modal-title'>
      <Modal.Body className='text-center p-4'>
        {/* Icon */}
        <div className='d-flex justify-content-center mb-3'>
          <div className='rounded-circle d-inline-flex align-items-center justify-content-center tw-w-20 tw-h-20 tw-bg-primary'>
            <FormIcon className='tw-w-10 tw-h-10' />
          </div>
        </div>

        {/* Title */}
        <h5 className='mb-3 fw-bold'>Fill Intake Form</h5>

        {/* Alert Box */}
        <div className='bg-light rounded p-3 mb-4'>
          <p className='fw-bold text-dark mb-2'>Medical Intake Required</p>
          <p className='text-muted small mb-0'>
            To complete your order, please fill out the Medical Intake Form.
          </p>
        </div>

        {/* Buttons */}
        <div className='d-flex gap-2'>
          <Button variant='outline-secondary' className='flex-grow-1' onClick={onClose}>
            Later
          </Button>
          <Button variant='primary' className='flex-grow-1' onClick={handleFillIntakeForm}>
            Fill Intake Form
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

