'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import Dropzone, { FileRejection } from 'react-dropzone';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCloudUploadOutline, IoImageOutline, IoCameraOutline } from 'react-icons/io5';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { RiCloseLargeLine } from 'react-icons/ri';
import { PatientSurveyAnswerType } from '@/lib/types';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/constants';
import Image from 'next/image';
import idCardImage from '@/assets/id-card.png';

interface Props {
  question: SurveyQuestion;
  answers: PatientSurveyAnswerType[];
  setAnswers: (ag: PatientSurveyAnswerType[]) => void;
}

const MAX_FILE_SIZE = 5242880; // 5MB in bytes

// Keywords list for ID verification questions
const ID_VERIFICATION_KEYWORDS = [
  "driver's license",
  'drivers license',
  'passport',
  'government-issued id',
  'government issued id',
  'photo id',
  'state id',
  'national id',
];

const isIdVerificationQuestion = (question: SurveyQuestion): boolean => {
  if (!question) return false;

  const questionText = (question.questionText || '').toLowerCase().trim();
  const description = (question.description || '').toLowerCase().trim();
  const combinedText = `${questionText} ${description}`.trim();
  if (!combinedText) return false;

  return ID_VERIFICATION_KEYWORDS.some((keyword) => combinedText.includes(keyword));
};

export const UploadDocument = ({ question, answers, setAnswers }: Props) => {
  const answer = answers.find((answer) => answer.questionId === question.id)?.answer;
  const pathname = usePathname();

  // Check if this is an ID verification question
  const isIdVerification = useMemo(() => isIdVerificationQuestion(question), [question]);

  // File upload states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Webcam states
  const [showWebcam, setShowWebcam] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user'); // Start with front camera
  const webcamRef = useRef<Webcam>(null);

  const images = {
    'image/jpeg': ['.jpeg', '.jpg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/heic': ['.heic'],
    'image/heif': ['.heif'],
  };

  const acceptedTypes = pathname.includes(ROUTES.PATIENT_SURVEY) ? images : { ...images, 'application/pdf': ['.pdf'] };

  // Helper function to format accepted file extensions
  const getAcceptedExtensions = () => {
    const extensions: string[] = [];
    for (const exts of Object.values(acceptedTypes)) {
      extensions.push(...exts.map((ext) => ext.toUpperCase().replace('.', '')));
    }
    return [...new Set(extensions)].join(', ');
  };

  // Helper function to get file type description
  const getFileTypeDescription = () => {
    const isPatientSurvey = pathname.includes(ROUTES.PATIENT_SURVEY);
    if (isPatientSurvey) {
      return 'images';
    }
    return 'images or PDFs';
  };

  const onDrop = async (files: File[]) => {
    setError(null);
    setIsLoading(true);

    const file = files[0];
    if (file) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
        setError(
          `The file "${file.name}" is ${fileSizeMB}MB, which exceeds the 5MB limit. Please compress the file or choose a smaller one.`,
        );
        setIsLoading(false);
        return;
      }

      const _answers = answers.map((answer) => {
        if (answer.questionId === question.id)
          return {
            questionId: question.id,
            answer: file,
            isValid: true,
          };
        return answer;
      });

      setAnswers(_answers);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  };

  const onDropRejected = (fileRejections: FileRejection[]) => {
    const rejection = fileRejections[0];
    const fileName = rejection.file?.name || 'File';
    const fileSize = rejection.file?.size || 0;

    if (rejection.errors) {
      const error = rejection.errors[0];
      if (error.code === 'file-too-large') {
        const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);
        setError(
          `The file "${fileName}" is ${fileSizeMB}MB, which exceeds the 5MB limit. Please compress the file or choose a smaller one.`,
        );
      } else if (error.code === 'file-invalid-type') {
        const fileExtension = fileName.split('.').pop()?.toUpperCase() || 'unknown';
        setError(`"${fileName}" is a .${fileExtension} file, which isn't supported here.`);
      } else {
        setError(`Unable to upload "${fileName}". ${error.message || 'Please try again or choose a different file.'}`);
      }
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    const updatedAnswers = answers.map((a) =>
      a.questionId === question.id ? { ...a, answer: '', isValid: false } : a,
    );
    setAnswers(updatedAnswers);
    setError(null);
  };

  const handleCapturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
  }, [webcamRef]);

  const handleSubmitPhoto = async () => {
    if (!capturedImage) return;

    setError(null);
    setIsLoading(true);

    try {
      const base64Data = capturedImage.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      // Create File object from blob - same as drag & drop
      const timestamp = Date.now();
      const file = new File([blob], `webcam-photo-${timestamp}.jpg`, {
        type: 'image/jpeg',
        lastModified: timestamp,
      });

      // Validate file size (same as regular upload)
      if (file.size > MAX_FILE_SIZE) {
        const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
        setError(
          `The captured photo is ${fileSizeMB}MB, which exceeds the 5MB limit. Please try taking the photo again.`,
        );
        setIsLoading(false);
        setShowWebcam(false);
        setCapturedImage(null);
        return;
      }

      const _answers = answers.map((answer) => {
        if (answer.questionId === question.id)
          return {
            questionId: question.id,
            answer: file,
            isValid: true,
          };
        return answer;
      });

      setAnswers(_answers);
      setIsLoading(false);
      setShowWebcam(false);
      setCapturedImage(null);
    } catch (error) {
      console.log(error);
      setError('Failed to process the captured photo. Please try again.');
      setIsLoading(false);
      setShowWebcam(false);
      setCapturedImage(null);
    }
  };

  const handleCloseWebcam = () => {
    // If image is captured, just clear it to retake
    // Otherwise close the modal entirely
    if (capturedImage) {
      setCapturedImage(null);
    } else {
      setShowWebcam(false);
      setFacingMode('user'); // Reset to front camera
    }
  };

  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Clear error when component unmounts or answer changes
  useEffect(() => {
    if (!answer) {
      setError(null);
      setIsLoading(false);
    }
  }, [answer]);

  return (
    <>
      {/* ID Card Image - Display above dropzone for ID verification questions */}
      {isIdVerification && (
        <div className='tw-flex tw-justify-center tw-mb-4 md:tw-mb-6'>
          <div className='tw-w-full tw-max-w-[250px] md:tw-max-w-[335px] tw-h-auto'>
            <Image
              src={idCardImage}
              alt='ID Card Example'
              width={335}
              height={203}
              className='tw-w-full tw-h-auto'
              priority
            />
          </div>
        </div>
      )}

      <Dropzone
        maxSize={MAX_FILE_SIZE}
        accept={acceptedTypes}
        onDrop={onDrop}
        onDropRejected={onDropRejected}
        disabled={isLoading}
      >
        {({ getRootProps, getInputProps, isDragActive }) => (
          <div className='tw-space-y-3'>
            <div
              {...getRootProps()}
              className={
                'tw-p-12 tw-rounded-lg file-dropzone tw-bg-white tw-flex tw-flex-col tw-items-center tw-gap-y-3 tw-relative ' +
                (isDragActive ? 'drag-active' : '') +
                (isLoading ? 'tw-opacity-60 tw-pointer-events-none' : 'tw-cursor-pointer') +
                (error ? 'tw-border-2 tw-border-red-500' : '')
              }
            >
              <input {...getInputProps()} disabled={isLoading} />
              {isLoading ? (
                <div className='tw-flex tw-flex-col tw-items-center tw-gap-2'>
                  <IoCloudUploadOutline size={24} className='tw-animate-pulse' />
                  <span className='tw-font-medium'>Processing file...</span>
                </div>
              ) : (
                <>
                  <IoCloudUploadOutline size={24} className='tw-text-gray-400' />
                  <span className='tw-font-medium tw-text-center tw-text-gray-700'>
                    Click or drag file to this area to upload
                  </span>
                  <div className='tw-text-sm tw-text-gray-600'>
                    <span className='tw-font-semibold'>Maximum size:</span> 5MB
                  </div>
                </>
              )}
            </div>

            {error && (
              <div className='tw-p-3 tw-rounded-lg tw-bg-red-50 tw-border tw-border-red-200'>
                <div className='tw-flex tw-items-start tw-gap-2'>
                  <span className='tw-text-red-600 tw-font-semibold'>Error:</span>
                  <div className='tw-flex-1'>
                    <span className='tw-text-red-700 tw-text-sm'>{error}</span>
                    <div className='tw-mt-2 tw-text-xs tw-text-red-600'>
                      Accepted formats: {getFileTypeDescription()} ({getAcceptedExtensions()}) • Maximum size: 5MB
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Dropzone>

      {/* OR Divider */}
      <div className='tw-flex tw-items-center tw-gap-3 tw-my-4'>
        <div className='tw-flex-1 tw-border-t tw-border-gray-300'></div>
        <span className='tw-text-gray-500 tw-font-medium'>OR</span>
        <div className='tw-flex-1 tw-border-t tw-border-gray-300'></div>
      </div>

      {/* Take Photo Button */}
      <div className='tw-block tw-text-center'>
        <button
          onClick={() => setShowWebcam(true)}
          disabled={isLoading}
          className='tw-flex tw-items-center tw-gap-2 tw-mx-auto tw-px-6 tw-py-3 tw-bg-primary tw-text-white tw-rounded-lg hover:tw-opacity-90 tw-transition-all tw-font-medium disabled:tw-opacity-50 disabled:tw-cursor-not-allowed'
        >
          <IoCameraOutline size={20} />
          Take Photo
        </button>
      </div>

      {/* Webcam Modal */}
      <AnimatePresence>
        {showWebcam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-black tw-bg-opacity-50 tw-p-0 md:tw-p-4'
            onClick={handleCloseWebcam}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className='tw-bg-white tw-rounded-none md:tw-rounded-lg tw-shadow-xl tw-max-w-3xl tw-w-full tw-flex tw-flex-col md:tw-h-auto'
              style={{ height: '60vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - Fixed at top */}
              <div className='tw-flex tw-items-center tw-justify-between tw-p-2.5 sm:tw-p-4 tw-border-b tw-bg-white tw-flex-shrink-0'>
                <h3 className='tw-text-sm sm:tw-text-lg tw-font-semibold tw-text-gray-800'>
                  {capturedImage ? 'Review Photo' : 'Take Photo'}
                </h3>
                <div className='tw-flex tw-items-center tw-gap-1.5 sm:tw-gap-2'>
                  {/* Flip Camera Button - Show on mobile only, in header next to close button */}
                  {!capturedImage && (
                    <button
                      onClick={handleFlipCamera}
                      className='md:tw-hidden tw-text-gray-500 hover:tw-text-gray-700 tw-transition-colors tw-p-1 sm:tw-p-2 tw-rounded-full hover:tw-bg-gray-100 active:tw-scale-95'
                      aria-label='Flip camera'
                      title='Switch camera'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth={2}
                        stroke='currentColor'
                        className='tw-w-4 tw-h-4 sm:tw-w-5 sm:tw-h-5'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99'
                        />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={handleCloseWebcam}
                    className='tw-text-gray-500 hover:tw-text-gray-700 tw-transition-colors tw-p-1 sm:tw-p-2 tw-rounded-full hover:tw-bg-gray-100'
                    aria-label={capturedImage ? 'Retake photo' : 'Close'}
                    title={capturedImage ? 'Retake photo' : 'Close'}
                  >
                    <RiCloseLargeLine className='tw-w-4 tw-h-4 sm:tw-w-6 sm:tw-h-6' />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div
                className={`tw-flex-1 tw-overflow-hidden tw-flex tw-items-center tw-justify-center tw-relative ${!capturedImage ? 'tw-bg-black' : 'tw-bg-white'}`}
              >
                <div className='tw-relative tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center'>
                  {!capturedImage ? (
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat='image/jpeg'
                      className='tw-w-full tw-h-full tw-object-cover'
                      videoConstraints={{
                        facingMode: facingMode,
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                      }}
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={capturedImage}
                      alt='Captured'
                      className='tw-w-full tw-h-auto tw-max-h-full tw-object-contain'
                    />
                  )}
                </div>
              </div>

              {/* Footer - Fixed at bottom with single action button */}
              <div className='tw-flex tw-items-center tw-justify-center tw-p-2.5 sm:tw-p-4 tw-border-t tw-bg-white tw-flex-shrink-0'>
                {!capturedImage ? (
                  <button
                    onClick={handleCapturePhoto}
                    className='tw-w-full sm:tw-w-auto tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-5 sm:tw-px-8 tw-py-2.5 sm:tw-py-3 tw-bg-blue-600 tw-text-white tw-rounded-lg hover:tw-bg-blue-700 tw-transition-colors tw-font-medium tw-text-sm sm:tw-text-base'
                  >
                    <IoCameraOutline size={18} className='sm:tw-w-5 sm:tw-h-5' />
                    Capture Photo
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitPhoto}
                    className='tw-w-full sm:tw-w-auto tw-px-5 sm:tw-px-8 tw-py-2.5 sm:tw-py-3 tw-bg-blue-600 tw-text-white tw-rounded-lg hover:tw-bg-blue-700 tw-transition-colors tw-font-medium tw-text-sm sm:tw-text-base'
                  >
                    Use This Photo
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {answer instanceof File && !isLoading && (
        <div className='rounded-2 file-name-container tw-flex tw-justify-between tw-items-center tw-bg-white tw-mt-3 tw-p-3'>
          <div className='tw-flex tw-items-center tw-gap-3 tw-flex-1 tw-min-w-0'>
            <IoImageOutline size={24} className='tw-flex-shrink-0' />
            <div className='tw-flex tw-flex-col tw-min-w-0 tw-flex-1'>
              <span className='tw-truncate tw-font-medium'>{answer.name}</span>
              <span className='tw-text-xs tw-text-gray-500'>
                {answer.size ? `${(answer.size / 1024 / 1024).toFixed(2)}MB` : ''}
              </span>
            </div>
          </div>
          <div className='tw-flex tw-items-center tw-gap-3 tw-flex-shrink-0'>
            {/* Image Preview - Only for images */}
            {answer.type.startsWith('image/') && (
              <div className='tw-w-16 tw-h-16 tw-rounded tw-overflow-hidden tw-border tw-border-gray-200 tw-bg-gray-50 tw-flex-shrink-0'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={URL.createObjectURL(answer)} alt='Preview' className='tw-w-full tw-h-full tw-object-cover' />
              </div>
            )}
            <RiCloseLargeLine
              className='cursor-pointer tw-text-gray-500 hover:tw-text-gray-700 tw-transition-colors'
              size={20}
              onClick={handleRemove}
            />
          </div>
        </div>
      )}
    </>
  );
};
