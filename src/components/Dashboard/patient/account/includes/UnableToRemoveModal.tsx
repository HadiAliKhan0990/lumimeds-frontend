import { Modal, Button } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';

interface UnableToRemoveModalProps {
  show: boolean;
  onHide: () => void;
}

export const UnableToRemoveModal: React.FC<UnableToRemoveModalProps> = ({ show, onHide }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header className='border-0 position-relative'>
        <Modal.Title className='text-center flex-grow-1'>Unable to remove</Modal.Title>
        <IoMdClose className='cursor-pointer position-absolute top-0 end-0 m-2' onClick={onHide} size={24} />
      </Modal.Header>

      <Modal.Body className='text-center'>
        <p>You cannot remove your default payment method.</p>
        <p className='mb-4 pb-2'>Please set another payment method as default before removing this one.</p>

        <Button variant='primary' onClick={onHide} className='w-100'>
          Ok, I understand
        </Button>
      </Modal.Body>
    </Modal>
  );
};
