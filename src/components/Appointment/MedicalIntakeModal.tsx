'use client';

import { RootState } from '@/store';
import { Modal } from 'react-bootstrap';
import { HiExclamation } from 'react-icons/hi';
import { IoMdClose } from 'react-icons/io';
import { useSelector } from 'react-redux';

interface MedicalIntakeModalProps {
  show: boolean;
  onHide: () => void;
}

export const MedicalIntakeModal = ({ show, onHide }: MedicalIntakeModalProps) => {
  const checkout = useSelector((state: RootState) => state.checkout);
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Body>
        <IoMdClose className='cursor-pointer tw-ml-auto' size={24} onClick={onHide} />
        <div className='d-flex align-items-center justify-content-center gap-3 mb-3'>
          <HiExclamation className='flex-shrink-0' color='#CA8A04' size={32} />
          <span className='text-2xl fw-medium'>Important next step</span>
        </div>
        <div className='text-center'>
          <p>
            Your order will only be processed once you complete the <strong>Medical intake</strong>.
          </p>
          {checkout?.telepathInstructionsUrl && (
            <p className='mb-0 text-decoration-underline'>Make sure to review the instructions first.</p>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer className='border-0 pb-3'>
        <div className='row w-100'>
          {checkout?.telepathInstructionsUrl && (
            <div className='col-6'>
              <a
                target='_blank'
                className='w-100 btn btn-outline-primary rounded-pill py-2'
                href={checkout.telepathInstructionsUrl}
              >
                Step by step guide
              </a>
            </div>
          )}
          <div className={checkout?.telepathInstructionsUrl ? 'col-6' : 'col-12'}>
            <a target='_blank' className='w-100 rounded-pill btn btn-primary py-2' href={checkout.medicalFormUrl}>
              Answer Form
            </a>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
