import { useState } from 'react';
import { TelepathLambdaPatient, TelepathLambdaIntakeForm } from '@/store/slices/telepathApiSlice';

// Image component with loading state
const ImageWithLoader = ({ src, alt }: { src: string; alt: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className='tw-w-[200px] tw-h-[150px] tw-bg-gray-100 tw-rounded tw-border tw-border-gray-200 tw-flex tw-items-center tw-justify-center'>
        <span className='tw-text-sm tw-text-gray-400'>Failed to load</span>
      </div>
    );
  }

  return (
    <div className='tw-relative tw-w-[200px] tw-h-[150px]'>
      {isLoading && (
        <div className='tw-absolute tw-inset-0 tw-bg-gray-100 tw-rounded tw-border tw-border-gray-200 tw-flex tw-items-center tw-justify-center'>
          <div className='spinner-border spinner-border-sm text-primary' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`tw-max-w-[200px] tw-max-h-[150px] tw-object-cover tw-rounded tw-border tw-border-gray-200 hover:tw-border-blue-500 tw-transition-colors ${isLoading ? 'tw-opacity-0' : 'tw-opacity-100'}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
};

interface Props {
  isLoading: boolean;
  errorType: 'not_found' | 'error' | null;
  patient: TelepathLambdaPatient | undefined;
  intakeForms: TelepathLambdaIntakeForm[] | undefined;
}

export const PatientBasic = ({ isLoading, errorType, patient, intakeForms }: Props) => {
  // Get the last intakeForm, then get the last item of its data array
  const lastForm = intakeForms?.[intakeForms.length - 1];
  const lastFormData = lastForm?.data;
  const lastDataItem = lastFormData?.[lastFormData.length - 1];

  // Extract selfie_image and document_id from the last data item
  const selfieImage = lastDataItem?.selfie_image;
  const documentId = lastDataItem?.document_id;

  const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  };

  if (isLoading) {
    return (
      <div className='tw-p-4'>
        <div className='tw-flex tw-justify-center tw-py-8'>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (errorType === 'not_found') {
    return (
      <div className='tw-p-4'>
        <div className='tw-text-center tw-py-8 tw-text-gray-500'>Record not found</div>
      </div>
    );
  }

  if (errorType === 'error') {
    return (
      <div className='tw-p-4'>
        <div className='tw-text-center tw-py-8 tw-text-red-500'>Error loading patient data</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className='tw-p-4'>
        <div className='tw-text-center tw-py-8 tw-text-gray-500'>No patient data available</div>
      </div>
    );
  }

  return (
    <div className='tw-p-4'>
      <div className='tw-space-y-3'>
        <h5 className='tw-font-semibold tw-text-lg tw-mb-4'>Patient Information</h5>

        {/* Name */}
        <p className='tw-text-base'>
          <span className='tw-text-blue-600 tw-font-medium'>Name:</span>{' '}
          <span className='tw-text-gray-800'>
            {patient.first_name} {patient.last_name}
          </span>
        </p>

        {/* Email */}
        <p className='tw-text-base'>
          <span className='tw-text-blue-600 tw-font-medium'>Email:</span>{' '}
          <span className='tw-text-gray-800'>{patient.email}</span>
        </p>

        {/* Phone */}
        <p className='tw-text-base'>
          <span className='tw-text-blue-600 tw-font-medium'>Phone:</span>{' '}
          <span className='tw-text-gray-800'>{patient.phone}</span>
        </p>

        {/* Selfie Image */}
        {isValidImageUrl(selfieImage) && (
          <div className='tw-mt-4'>
            <p className='tw-text-blue-600 tw-font-medium tw-mb-2'>Selfie:</p>
            <a href={selfieImage!} target='_blank' rel='noopener noreferrer' className='tw-block'>
              <ImageWithLoader src={selfieImage!} alt='Patient Selfie' />
            </a>
          </div>
        )}

        {/* Document ID */}
        {isValidImageUrl(documentId) && (
          <div className='tw-mt-4'>
            <p className='tw-text-blue-600 tw-font-medium tw-mb-2'>Document ID:</p>
            <a href={documentId!} target='_blank' rel='noopener noreferrer' className='tw-block'>
              <ImageWithLoader src={documentId!} alt='Document ID' />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
