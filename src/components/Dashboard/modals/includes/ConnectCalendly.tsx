'use client';

import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setModal } from '@/store/slices/modalSlice';
import { FaTimes } from 'react-icons/fa';
import CalendlyButton from '@/components/Dashboard/provider/CalendlyButton';
import { toast } from 'react-hot-toast';
import { shouldShowCalendlyFeature } from '@/helpers/featureFlags';

export function ConnectCalendly() {
  const dispatch = useDispatch();

  const prevAuthorizedRef = useRef<boolean | null>(null);

  const calendlyState = useSelector((state: RootState) => state.calendly);
  const calendlyStatus = calendlyState.status;
  const isCalendlyLoaded = calendlyState.isLoaded;
  const provider = useSelector((state: RootState) => state.provider);

  const isCalendlyLoading = calendlyState.isLoading;

  useEffect(() => {
    const showModal = shouldShowCalendlyFeature(provider?.email);
    const isAuthorized = calendlyStatus?.authorized;

    const wasUnauthorized = prevAuthorizedRef.current === false;
    const isNowAuthorized = isAuthorized === true;

    if (showModal && isCalendlyLoaded && wasUnauthorized && isNowAuthorized) {
      dispatch(setModal({ modalType: undefined }));
    }

    if (isCalendlyLoaded) {
      prevAuthorizedRef.current = isAuthorized;
    }
  }, [isCalendlyLoaded, calendlyStatus?.authorized, dispatch]);

  const handleClose = () => {
    dispatch(setModal({ modalType: undefined }));
  };

  return (
    <>
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <p className='m-0 text-base fw-bold'>Connect Calendly Account</p>
        <button
          onClick={handleClose}
          className='p-0 m-0 d-flex align-items-center bg-transparent border-0'
          aria-label='Close'
        >
          <FaTimes size={'16'} />
        </button>
      </div>

      <div className='d-flex flex-column gap-4'>
        <div>
          <p className='text-sm fw-medium mb-3'>Follow the below instructions to get Telehealth Appointments:</p>

          <ul className='text-sm text-muted mb-3 ps-3 tw-list-decimal'>
            <li>Connect with Calendly</li>
            <li>Create your event in Calendly</li>
            <ul className='tw-my-2 !tw-pl-2 tw-list-disc'>
              <li>
                Create an event named: <strong>lumimeds-events</strong>
              </li>
              <li>
                Choose the location: <strong>custom</strong>
              </li>
              <li>
                <span className='text-dark'>Copy the following URL and paste it in the location field: </span>
                <span className='small fw-semibold text-dark'>https://lumimeds.doxy.me/sync</span>
                <button
                  className='btn btn-sm p-1 ms-2'
                  onClick={() => {
                    navigator.clipboard.writeText('https://lumimeds.doxy.me/sync');
                    toast.success('URL copied to clipboard');
                  }}
                  title='Copy URL'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='12'
                    height='12'
                    fill='currentColor'
                    className='bi bi-clipboard'
                    viewBox='0 0 16 16'
                  >
                    <path d='M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z' />
                    <path d='M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z' />
                  </svg>
                </button>
              </li>
            </ul>
            <li>Enable video visits for patient appointments</li>
          </ul>
          <div className='bg-warning bg-opacity-10 border border-warning border-opacity-25 rounded p-3'>
            <p className='text-sm text-warning-emphasis mb-0'>
              <strong>Note:</strong> If you don&apos;t connect your Calendly & create the event, you will not be able to
              have a video call with patients.
            </p>
          </div>
        </div>

        {isCalendlyLoaded && !calendlyStatus?.authorized && !isCalendlyLoading && (
          <div className='row g-3'>
            <div className='col-6'>
              <button className='btn w-100 btn-outline-primary' onClick={handleClose}>
                Cancel
              </button>
            </div>
            <div className='col-6'>
              <CalendlyButton />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
