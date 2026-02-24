import { Modal, Spinner } from 'react-bootstrap';
import { PiWarningCircle } from 'react-icons/pi';

interface Props {
  open: boolean;
  handleClose: () => void;
  isLoading?: boolean;
  handleSubmit?: () => void;
  name: string;
  errorMessages: string[];
  isDraft?: boolean;
}

export const PublishChangesModal = ({ open, handleClose, isLoading, handleSubmit, name, errorMessages, isDraft }: Props) => {
  return (
    <Modal centered contentClassName='rounded-12' show={open} onHide={handleClose}>
      <Modal.Body>
        <div className='text-center my-2'>
          <h4 className='mb-5 text-2xl'>{isDraft ? `Save “${name}” as draft?` : `Publish “${name}”?`}</h4>
          <div className='row'>
            <div className='col-6'>
              <button onClick={handleClose} className='btn btn-outline-primary w-100' type='button'>
                Keep Editing
              </button>
            </div>
            <div className='col-6'>
              <button disabled={isLoading} onClick={handleSubmit} className='btn btn-primary w-100 d-flex align-items-center gap-2 justify-content-center'>
                {isLoading && <Spinner size='sm' />}
                {isDraft ? 'Save Draft' : 'Publish'}
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
