import { Button, Spinner } from 'react-bootstrap';
import { FiDownload } from 'react-icons/fi';

interface PrescriptionModalFooterProps {
  onClose: () => void;
  onDownload: () => void;
  isDownloading: boolean;
  isDownloadDisabled: boolean;
}

export const PrescriptionModalFooter = ({
  onClose,
  onDownload,
  isDownloading,
  isDownloadDisabled,
}: PrescriptionModalFooterProps) => {
  return (
    <div className='position-fixed bottom-0 start-0 end-0 bg-light py-3 tw-border-t tw-border-gray-300 tw-z-[1050]'>
      <div className='d-flex justify-content-center gap-2'>
        <Button
          className='d-flex align-items-center justify-content-center gap-2 px-3'
          variant='outline-primary'
          onClick={onClose}
        >
          Close
        </Button>

        <Button
          className='d-flex align-items-center justify-content-center gap-2 px-3'
          variant='outline-primary'
          onClick={onDownload}
          disabled={isDownloading || isDownloadDisabled}
        >
          {isDownloading ? <Spinner className='border-2' size='sm' /> : <FiDownload size={16} />}
          Download PDF
        </Button>
      </div>
    </div>
  );
};
