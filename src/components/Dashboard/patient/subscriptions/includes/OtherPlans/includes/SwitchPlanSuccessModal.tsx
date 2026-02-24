import { Modal, Button } from 'react-bootstrap';
import { SuccessCircleCheck } from '@/components/Icon/SuccessCircleCheck';

type SuccessModalProps = {
  show: boolean;
  name: string | null;
  onClose: () => void;
};

export default function SwitchPlanSuccessModal({ show, name, onClose }: Readonly<SuccessModalProps>) {
  return (
    <Modal show={show} onHide={onClose} centered aria-labelledby='switch-plan-success-title'>
      <Modal.Body className='text-center p-4'>
        <div className='d-flex justify-content-center mb-3'>
          <div className='rounded-circle d-inline-flex align-items-center justify-content-center tw-w-16 tw-h-16 tw-bg-success-alpha'>
            <SuccessCircleCheck size={36} />
          </div>
        </div>
        <h5 className='mb-2 text-success'>Subscription activated</h5>
        <p className='mb-3'>
          {`Your subscription for `}
          <strong>{name ?? ''}</strong>
          {` has been activated successfully.`}
        </p>
        <p className='text-muted small mb-4'>It may take a few seconds for the update to reflect in your dashboard.</p>
        <Button variant='primary' className='px-4' onClick={onClose} autoFocus>
          OK, got it
        </Button>
      </Modal.Body>
    </Modal>
  );
}
