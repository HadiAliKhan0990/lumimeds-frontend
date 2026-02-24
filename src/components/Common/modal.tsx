import { ReactNode } from 'react';

type Props = {
  title: string;
  show: boolean;
  onClose: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  saveText?: string;
  deleteText?: string;
  hideCancel?: boolean;
  children: ReactNode;
  isAdding?: boolean;
  isUpdating?: boolean;
  isRemoving?: boolean;
};

export default function Modal({
  title,
  show,
  onClose,
  onSave,
  onDelete,
  saveText = 'Save',
  deleteText = 'Remove',
  hideCancel = false,
  children,
  isAdding = false,
  isUpdating = false,
  isRemoving = false,
}: Props) {
  if (!show) return null;

  const getSaveButtonText = () => {
    if (isAdding) return 'Adding...';
    if (isUpdating) return 'Updating...';
    return saveText;
  };

  const getDeleteButtonText = () => {
    if (isRemoving) return 'Removing...';
    return deleteText;
  };

  const isAnyActionInProgress = isAdding || isUpdating || isRemoving;

  return (
    <>
      <div className='modal px-1 fade show d-block' tabIndex={-1}>
        <div className='modal-dialog ls.custom-width modal-dialog-centered'>
          <div className='modal-content border border-light rounded-3'>
            <div className='modal-header border-bottom'>
              <h5 className='modal-title fw-bold fs-4'>{title}</h5>
              <button
                type='button'
                className='btn-close'
                onClick={onClose}
                disabled={isAnyActionInProgress}
                style={{ cursor: isAnyActionInProgress ? 'not-allowed' : 'pointer' }}
              />
            </div>
            <div className='modal-body'>{children}</div>
            <div className='modal-footer border-top border-light justify-content-between'>
              {onDelete ? (
                <button
                  type='button'
                  className='btn btn-danger'
                  onClick={onDelete}
                  disabled={isAnyActionInProgress}
                  style={{ cursor: isAnyActionInProgress ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                >
                  {getDeleteButtonText()}
                </button>
              ) : (
                <span />
              )}
              <div className='d-flex gap-2'>
                {!hideCancel && (
                  <button
                    type='button'
                    className='btn border border-muted text-muted'
                    onClick={onClose}
                    disabled={isAnyActionInProgress}
                    style={{ cursor: isAnyActionInProgress ? 'not-allowed' : 'pointer' }}
                  >
                    Cancel
                  </button>
                )}
                {onSave && (
                  <button
                    type='button'
                    className='btn btn-primary'
                    onClick={onSave}
                    disabled={isAnyActionInProgress}
                    style={{ cursor: isAnyActionInProgress ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                  >
                    {getSaveButtonText()}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='modal-backdrop fade show'></div>
    </>
  );
}
