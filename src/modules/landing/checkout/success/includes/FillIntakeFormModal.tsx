'use client';

import { Modal } from '@/components/elements';
import { Reload } from '@/components/Icon/Reload';
import { FormIcon } from '@/components/Icon/FormIcon';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { useLazyGetIntakeSurveyUrlQuery } from '@/store/slices/checkoutApiSlice';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FillIntakeFormModal = ({ isOpen, onClose }: Readonly<Props>) => {
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const userEmail = useSelector((state: RootState) => state.checkout.userEmail);

  const [found, setFound] = useState(false);
  const [surveyUrl, setSurveyUrl] = useState<string>('');
  const [getIntakeSurveyUrl] = useLazyGetIntakeSurveyUrlQuery();

  // Get polling interval from env variable (default to 5 seconds)
  const pollIntervalSeconds = Number.parseInt(process.env.NEXT_PUBLIC_INTAKE_SURVEY_POLL_INTERVAL_SECONDS || '5', 10);

  // Start polling immediately
  const pollIntakeSurveyUrl = async () => {
    if (!isOpen || !userEmail) return;
    try {
      const result = await getIntakeSurveyUrl({ email: userEmail }).unwrap();
      if (result.data.found) {
        setFound(true);
        setSurveyUrl(result.data.surveyUrl);
        // Stop polling when found
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    } catch (error) {
      console.error('Error fetching intake survey URL:', error);
    }
  };

  function handleFillIntakeForm() {
    // Close modal first
    onClose();

    // Construct URL with preventClose parameter
    let finalUrl: string;
    try {
      // Try to parse as absolute URL first
      const url = new URL(surveyUrl);
      url.searchParams.set('preventClose', 'true');
      finalUrl = url.toString();
    } catch {
      // If it's a relative URL, construct it with current origin
      const url = new URL(surveyUrl, globalThis.window.location.origin);
      url.searchParams.set('preventClose', 'true');
      finalUrl = url.toString();
    }

    // Open in new tab after a small delay to ensure modal closes
    setTimeout(() => {
      globalThis.window.open(finalUrl, '_blank');
    }, 100);
  }

  useEffect(() => {
    if (!isOpen || !userEmail) return;

    // Reset state when modal opens
    setFound(false);
    setSurveyUrl('');

    // Initial call
    pollIntakeSurveyUrl();

    // Set up polling interval
    pollingIntervalRef.current = setInterval(() => {
      pollIntakeSurveyUrl();
    }, pollIntervalSeconds * 1000);

    // Cleanup on unmount or when modal closes
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isOpen, userEmail, getIntakeSurveyUrl, pollIntervalSeconds]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnEscape={false}
      closeOnBackdropClick={false}
      size='sm'
      bodyClassName='tw-py-4'
      showCloseButton={found}
    >
      {found ? (
        <div className='tw-text-center tw-min-h-64 tw-flex tw-flex-col tw-items-center tw-justify-center'>
          {/* Icon */}
          <div className='tw-mb-6 tw-flex tw-items-center tw-justify-center'>
            <div className='tw-w-20 tw-h-20 tw-rounded-full tw-bg-primary tw-flex tw-items-center tw-justify-center'>
              <FormIcon className='tw-w-10 tw-h-10' />
            </div>
          </div>

          {/* Title */}
          <h2 className='tw-text-2xl tw-font-bold tw-text-gray-800 tw-mb-6'>Fill Intake Form</h2>

          {/* Alert Box */}
          <div className='tw-bg-gray-100 tw-rounded-lg tw-p-4 tw-mb-6 tw-w-full'>
            <p className='tw-font-bold tw-text-gray-800 tw-mb-2'>Medical Intake Required</p>
            <p className='tw-text-sm tw-text-gray-600'>
              To complete your order, please fill out the Medical Intake Form first.
            </p>
          </div>

          {/* Buttons */}

          <button
            type='button'
            onClick={handleFillIntakeForm}
            className='tw-w-full tw-px-4 tw-py-2 tw-bg-blue-600 tw-text-white tw-rounded-md tw-font-medium hover:tw-bg-blue-700 tw-transition-colors'
          >
            Fill Intake Form
          </button>
        </div>
      ) : (
        <div className='tw-text-center tw-min-h-64'>
          <p className='tw-text-2xl tw-font-bold tw-mb-4'>Processing</p>
          <p className='tw-mb-8'>Please wait while we are processing your Order</p>
          <div className='tw-flex tw-items-center tw-justify-center tw-flex-col tw-gap-8'>
            <Reload className='tw-text-primary tw-animate-spin tw-w-32 tw-h-32 tw-flex-shrink-0' />
            <span className='tw-text-primary tw-font-medium'>Processing...</span>
          </div>
        </div>
      )}
    </Modal>
  );
};
