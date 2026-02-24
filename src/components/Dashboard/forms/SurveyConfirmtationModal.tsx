import { Modal, Spinner } from 'react-bootstrap';
import { PiWarningCircle } from 'react-icons/pi';

interface Props {
  open: boolean;
  handleClose: () => void;
  isLoading?: boolean;
  handleSubmit?: () => void;
  errorMessages: string[];
}

export const SurveyConfirmtationModal = ({ open, handleClose, isLoading, handleSubmit, errorMessages }: Props) => {
  return (
    <Modal centered contentClassName='rounded-12' show={open} onHide={handleClose}>
      <Modal.Body>
        <div className='text-center mt-2'>
          <h4 className='mb-2 text-2xl'>Save Changes?</h4>
          <p className='text-sm mb-4'>If you don’t save, changes will be lost.</p>
          <div className='row'>
            <div className='col-6'>
              <button disabled={isLoading} onClick={handleClose} className='btn btn-outline-primary w-100' type='button'>
                Keep Editing
              </button>
            </div>
            <div className='col-6'>
              <button disabled={isLoading} onClick={handleSubmit} type='button' className='btn btn-primary w-100 d-flex align-items-center gap-2 justify-content-center'>
                {isLoading && <Spinner size='sm' />}
                Publish
              </button>
            </div>
          </div>
          {errorMessages.length > 0 && (
            <div className='d-flex flex-column text-start gap-1 text-sm text-danger mt-4 mb-2'>
              {errorMessages.map((err) => (
                <span className='d-flex align-items-center gap-2' key={err}>
                  <PiWarningCircle size={18} />
                  {err}
                </span>
              ))}
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};
