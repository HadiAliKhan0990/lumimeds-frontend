import { HTMLAttributes } from 'react';
import { FiUploadCloud } from 'react-icons/fi';
import { GrAttachment } from 'react-icons/gr';

export function FileUploadDragActive({ className, ...props }: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      {...props}
      className={
        'position-absolute top-0 end-0 bottom-0 start-0 z-3 text-center p-5 rounded-4 border-3 border-primary border-dashed bg-light d-flex align-items-center justify-content-center flex-column ' +
        className
      }
    >
      <FiUploadCloud size={48} className='text-primary mb-3' />
      <h4 className='fw-bold mb-2'>Drop files to upload</h4>
      <p className='text-muted mb-0'>
        Drag and drop images (JPG, PNG) or PDF files here <br />
        or click to browse files (Max size: 5MB)
      </p>
      <div className='mt-3 text-sm text-muted'>
        <GrAttachment className='me-2' />
        Supported formats: .jpg, .jpeg, .png, .gif, .pdf
      </div>
    </div>
  );
}
