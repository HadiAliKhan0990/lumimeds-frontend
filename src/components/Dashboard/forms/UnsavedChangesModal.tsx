import { Modal, Spinner } from 'react-bootstrap';

interface Props {
  open: boolean;
  handleClose: () => void;
  isLoading?: boolean;
  handleSubmit?: () => void;
  errorMessages: string[];
}

export const UnsavedChangesModal = ({ open, handleClose, isLoading, handleSubmit }: Props) => {
  return (
    <Modal centered contentClassName='rounded-12' show={open} onHide={handleClose}>
      <Modal.Body>
        <div className='text-center mt-2'>
          <h4 className='mb-2 text-2xl'>Unsaved Changes</h4>
          <p className='text-sm mb-4'>If you leave page, any changes you have made will be lost.</p>
          <div className='row'>
            <div className='col-6'>
              <button onClick={handleClose} className='btn btn-outline-primary w-100' type='button'>
                Discard Changes
              </button>
            </div>
            <div className='col-6'>
              <button
                disabled={isLoading}
                onClick={handleSubmit}
                className='btn btn-primary w-100 d-flex align-items-center gap-2 justify-content-center'
              >
                {isLoading && <Spinner size='sm' />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};
