import { useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudIcon } from '@/components/Icon/CloudIcon';

interface Props {
  onFilesAdded: (image: File) => void;
  disabled?: boolean;
}

export function ProductDropzone({ onFilesAdded, disabled }: Readonly<Props>) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (onFilesAdded && acceptedFiles.length > 0) {
        onFilesAdded(acceptedFiles[0]);
      }
    },
    [onFilesAdded]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    disabled,
    multiple: false,
    accept: {
      'image/*': [],
    },
  });

  const borderColorClass = useMemo(() => {
    if (isDragReject) {
      return 'danger';
    } else if (isDragActive) {
      return 'info';
    } else {
      return 'primary';
    }
  }, [isDragActive, isDragReject]);

  return (
    <div
      {...getRootProps()}
      className={`dropzone-container cursor-pointer rounded p-4 text-center ${borderColorClass}`}
    >
      <input {...getInputProps()} />
      <CloudIcon className='text-primary tw-mx-auto' size={36} />
      <p className='text-sm my-2'>
        Drag your file(s) or <span className='text-primary'>browse</span>
      </p>
      <span className='text-muted text-sm'>Max 10 MB files are allowed</span>
    </div>
  );
}
