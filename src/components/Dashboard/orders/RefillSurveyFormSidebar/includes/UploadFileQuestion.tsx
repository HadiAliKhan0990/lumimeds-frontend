import AsyncImgLoader from '@/components/AsyncImgLoader';
import Dropzone, { FileRejection } from 'react-dropzone';
import toast from 'react-hot-toast';
import { QuestionType } from '@/lib/enums';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { FormValues } from '@/types/refillForm';
import { useFormikContext } from 'formik';
import { useCallback, useEffect, useState } from 'react';
import { IoCloudUploadOutline, IoImageOutline } from 'react-icons/io5';
import { RiCloseLargeLine, RiFilePdfLine } from 'react-icons/ri';
import { AsyncImage } from 'loadable-image';
import { Blur } from 'transitions-kit';

interface Props {
  question: SurveyQuestion;
}

export const UploadFileQuestion = ({ question }: Readonly<Props>) => {
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  const { values, setFieldValue } = useFormikContext<FormValues>();

  const questionId = question.id || '';
  const fileValue = values[questionId] as File | string | null | undefined;
  const isFile = fileValue instanceof File;
  const isUrl = typeof fileValue === 'string' && fileValue.length > 0;

  // File upload handlers - defined outside switch to comply with React hooks rules
  const handleFileDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[], questionId: string) => {
      if (rejectedFiles && rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors) {
          const error = rejection.errors[0];
          if (error.code === 'file-too-large') {
            toast.error('File size must be less than 5MB');
          } else if (error.code === 'file-invalid-type') {
            toast.error('Only PDF or image files are allowed (PDF, JPEG, PNG, GIF, WebP)');
          } else {
            toast.error('File upload failed. Please try again.');
          }
        }
        return;
      }

      if (acceptedFiles && acceptedFiles.length > 0) {
        setFieldValue(questionId, acceptedFiles[0]);
      }
    },
    [setFieldValue]
  );

  const handleRemoveFile = useCallback(
    (questionId: string) => {
      setFieldValue(questionId, '');
    },
    [setFieldValue]
  );

  const getFileName = () => {
    if (isFile) {
      return fileValue.name;
    }
    if (isUrl) {
      return fileValue.split('/').pop() || 'Uploaded file';
    }
    return '';
  };

  const getImageUrl = () => {
    if (isFile && filePreviewUrl) {
      return filePreviewUrl;
    }
    if (isUrl) {
      return fileValue;
    }
    return null;
  };

  const imageUrl = getImageUrl();
  const isPdfFile =
    (isFile && fileValue instanceof File && fileValue.type === 'application/pdf') ||
    (isUrl && typeof fileValue === 'string' && fileValue.toLowerCase().endsWith('.pdf'));
  const isImageFile =
    (isFile && fileValue instanceof File && fileValue.type.startsWith('image/')) ||
    (isUrl && typeof fileValue === 'string' && !fileValue.toLowerCase().endsWith('.pdf'));

  // Handle file preview URL for FILE_UPLOAD questions
  useEffect(() => {
    if (question.questionType === QuestionType.FILE_UPLOAD && question.id) {
      const fileValue = values[question.id] as File | string | null | undefined;
      const isFile = fileValue instanceof File;

      if (isFile && fileValue instanceof File) {
        const objectUrl = URL.createObjectURL(fileValue);
        setFilePreviewUrl(objectUrl);

        // Cleanup function to revoke the object URL
        return () => {
          URL.revokeObjectURL(objectUrl);
          setFilePreviewUrl(null);
        };
      } else {
        setFilePreviewUrl(null);
      }
    } else {
      setFilePreviewUrl(null);
    }
  }, [question.questionType, question.id, values]);

  return (
    <div className='tw-space-y-3 tw-animate-fade-in'>
      <Dropzone
        onDrop={(acceptedFiles, rejectedFiles) => handleFileDrop(acceptedFiles, rejectedFiles, questionId)}
        accept={{
          'application/pdf': ['.pdf'],
          'image/jpeg': ['.jpg', '.jpeg'],
          'image/png': ['.png'],
          'image/gif': ['.gif'],
          'image/webp': ['.webp'],
        }}
        maxSize={5 * 1024 * 1024} // 5MB
        multiple={false}
      >
        {({ getRootProps, getInputProps, isDragActive }) => (
          <div
            {...getRootProps()}
            className={
              'tw-p-8 tw-rounded-lg tw-border-2 tw-border-dashed tw-flex tw-flex-col tw-items-center tw-gap-y-3 tw-cursor-pointer tw-transition-colors ' +
              (isDragActive
                ? 'tw-border-primary tw-bg-primary/5'
                : 'tw-border-gray-300 hover:tw-border-primary hover:tw-bg-gray-50')
            }
          >
            <input {...getInputProps()} />
            <IoCloudUploadOutline className='tw-w-8 tw-h-8 tw-text-gray-400' />
            <div className='tw-text-center'>
              <p className='tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1'>
                {isDragActive ? 'Drop the file here' : 'Click or drag file to upload'}
              </p>
              <p className='tw-text-xs tw-text-gray-500'>Supported formats: PDF, JPEG, PNG, GIF, WebP (Max 5MB)</p>
            </div>
          </div>
        )}
      </Dropzone>

      {(isFile || isUrl) && (
        <div className='tw-rounded-lg tw-border tw-border-gray-200 tw-bg-white tw-p-3 tw-flex tw-items-center tw-justify-between tw-animate-fade-in'>
          <div className='tw-inline-flex tw-items-center tw-gap-x-3 tw-flex-1 tw-min-w-0'>
            {isPdfFile ? (
              <RiFilePdfLine className='tw-w-5 tw-h-5 tw-text-red-600 tw-flex-shrink-0' />
            ) : (
              <IoImageOutline className='tw-w-5 tw-h-5 tw-text-gray-600 tw-flex-shrink-0' />
            )}
            <span className='tw-text-sm tw-text-gray-700 tw-truncate'>{getFileName()}</span>
          </div>
          <div className='tw-inline-flex tw-items-center tw-gap-x-2 tw-flex-shrink-0'>
            {imageUrl && isImageFile && (
              <div className='tw-w-10 tw-h-10 tw-rounded tw-overflow-hidden tw-border tw-border-gray-200 tw-bg-gray-50'>
                <AsyncImage
                  src={imageUrl}
                  alt='Preview'
                  className='tw-w-full tw-h-full tw-object-cover'
                  Transition={Blur}
                  loader={<AsyncImgLoader />}
                />
              </div>
            )}
            {isPdfFile && (
              <div className='tw-w-10 tw-h-10 tw-rounded tw-flex tw-items-center tw-justify-center tw-border tw-border-gray-200 tw-bg-red-50'>
                <RiFilePdfLine className='tw-w-6 tw-h-6 tw-text-red-600' />
              </div>
            )}
            <button
              type='button'
              onClick={() => handleRemoveFile(questionId)}
              className='tw-p-1 tw-rounded hover:tw-bg-gray-100 tw-transition-all'
              aria-label='Remove file'
            >
              <RiCloseLargeLine className='tw-w-5 tw-h-5' />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
