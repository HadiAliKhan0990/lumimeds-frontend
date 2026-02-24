import { IoClose } from 'react-icons/io5';
import { Blur } from 'transitions-kit';
import { AsyncImage } from 'loadable-image';
import { FaRegFileAlt } from 'react-icons/fa';
import { Spinner } from 'react-bootstrap';

interface Props {
  attachment: File;
  attachmentError?: string;
  onRemove: () => void;
  isLoading?: boolean;
}

export const SelectedFile = ({ attachment, attachmentError, onRemove, isLoading }: Props) => {
  return (
    <div className='p-2 bg-white flex-grow-1 rounded-4 d-flex flex-column align-items-start gap-1'>
      <div className='position-relative'>
        {attachment.type.startsWith('image') ? (
          <AsyncImage
            Transition={Blur}
            loader={
              <div className='placeholder-glow w-100 h-100'>
                <span className='placeholder h-100 col-12' />
              </div>
            }
            src={URL.createObjectURL(attachment)}
            alt=''
            className={'w-80px h-80px border rounded-12 ' + (attachmentError ? 'border-danger' : '')}
          />
        ) : (
          <div
            className={
              'w-80px h-80px border rounded-12 d-flex align-items-center justify-content-center ' +
              (attachmentError ? 'border-danger' : '')
            }
          >
            <FaRegFileAlt size={40} />
          </div>
        )}

        {isLoading ? (
          <div className='d-flex align-items-center justify-content-center position-absolute rounded-12 top-0 end-0 bottom-0 start-0 bg-black bg-opacity-50'>
            <Spinner className='border-2' variant='light' />
          </div>
        ) : (
          <button
            onClick={onRemove}
            type='button'
            className='btn btn-primary rounded-circle position-absolute top-minus-3px right-minus-3px p-0 w-24px h-24px d-flex align-items-center justify-content-center'
          >
            <IoClose size={16} className='flex-shrink-0' />
          </button>
        )}
      </div>
      {attachmentError && <div className='text-danger text-sm'>{attachmentError}</div>}
    </div>
  );
};
