'use client';

import { Modal } from 'react-bootstrap';
import { HiExclamation, HiInformationCircle } from 'react-icons/hi';
import './styles.css';
interface MedicalIntakeModalProps {
  show: boolean;
  onComplete: () => void;
  onCancel: () => void;
}

export const MedicalIntakeModal = ({ show, onComplete, onCancel }: MedicalIntakeModalProps) => {
  return (
    <Modal show={show} centered backdrop='static' keyboard={false} className='medical-intake-modal'>
      <Modal.Body className='p-4'>
        <h2 className='text-center mb-3'>Complete Your Medical Intake</h2>
        <hr className='modal-divider mb-4' />

        <div className='text-center mb-4'>
          <h5 className='fw-bold mb-2'>Set Up Your Telepath Portal Now</h5>
          <p className='fs-16'>
            This is a critical step — it&apos;s how our doctors receive and review your request for medication and
            <br className='d-md-none' />
            correct dosage.
          </p>
        </div>

        <div className='alert alert-primary d-flex align-items-start mb-4 py-2'>
          <span className='tw-mr-2 tw-mt-1'>
            <HiInformationCircle size={18} color='#0077ff' />
          </span>
          <span className='fs-16'>
            Heads-up: It may look like you&apos;re placing a new order <br /> — but you&apos;re not.
          </span>
        </div>

        <div className='mb-4'>
          <div className='portal-steps-box'>
            <span className='mb-3 text-lg'>Inside the Telepath Portal, you&apos;ll:</span>
            <ul className='list-unstyled mb-0'>
              <li className='mb-2 fs-16'>
                • Submit your medication request & Medical Intake Form by clicking SHOP NOW
              </li>
              <li className='mb-2 fs-16'>
                • Upload important documents (i.e prescription photo, last injection date, etc.)
              </li>
              <li className='mb-2 fs-16'>• Track your approval status in real time</li>
              <li className='fs-16'>
                <span className='me-1'>
                  <span className='me-1'>•</span>
                  <HiExclamation size={24} className='tw-inline' color='#ffd000' />
                </span>
                Don&apos;t forget to upload everything! Missing documents may delay approval.
              </li>
            </ul>
          </div>
        </div>

        <div className='row g-2'>
          <div className='col-6'>
            <button className='btn btn-outline-secondary text-dark w-100' onClick={onCancel}>
              Cancel
            </button>
          </div>
          <div className='col-6'>
            <button className='btn btn-primary w-100' onClick={onComplete}>
              Activate Telepath
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};
