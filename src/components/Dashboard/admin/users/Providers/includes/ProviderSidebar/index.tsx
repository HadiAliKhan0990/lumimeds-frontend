'use client';

import { ProviderPopup } from '@/components/Dashboard/admin/users/Providers/includes/ProviderSidebar/includes/ProviderPopup';
import { Offcanvas, OffcanvasProps } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { IoArrowBack, IoChatbubblesOutline } from 'react-icons/io5';
import { ChatLogs } from './includes/ChatLogs';
import { ProviderChatLogsPatient } from '@/types/users';
import { PatientChatContentAdmin } from '@/components/Dashboard/admin/users/Patients/includes/PatientChatContentAdmin';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setUserId } from '@/store/slices/chatSlice';
import { setPatient } from '@/store/slices/patientSlice';

interface ProviderSidebarProps extends OffcanvasProps {
  initialView?: 'details' | 'chatLogs';
}

export default function ProviderSidebar({ onHide, initialView = 'details', ...props }: Readonly<ProviderSidebarProps>) {
  const dispatch = useDispatch();
  const provider = useSelector((state: RootState) => state.provider);

  const [showState, setShowState] = useState<'details' | 'chatLogs' | 'chatRoom'>(initialView);
  const [selectedPatient, setSelectedPatient] = useState<ProviderChatLogsPatient | null>(null);

  function handleClose() {
    onHide();
    setShowState('details');
    setSelectedPatient(null);
  }

  const handleOpenChatRoom = (patient: ProviderChatLogsPatient) => {
    // Set patient data in Redux for PatientChatContentAdmin
    const { userId, ...patientData } = patient;

    dispatch(setPatient(patientData));
    // Set userId for chat - use patient.userId (user ID) for chat messages
    dispatch(setUserId(userId));
    setSelectedPatient(patient);
    setShowState('chatRoom');
  };

  useEffect(() => {
    setShowState(initialView);
  }, [initialView, props.show]);

  return (
    <Offcanvas
      {...props}
      className={showState === 'details' || showState === 'chatRoom' ? 'provider' : 'provider_chat_logs'}
      scroll
      placement='end'
      onHide={handleClose}
    >
      <Offcanvas.Header closeButton className='align-items-start'>
        <div
          className={
            'tw-flex tw-items-center' +
            (showState === 'details' ? ' tw-justify-between tw-w-full tw-flex-grow tw-pr-2' : ' tw-gap-4')
          }
        >
          {(showState === 'chatLogs' || showState === 'chatRoom') && (
            <button
              className='tw-flex tw-items-center tw-justify-center tw-gap-2 tw-text-primary tw-text-sm tw-font-medium tw-p-0'
              type='button'
              onClick={() => {
                if (showState === 'chatRoom') {
                  setShowState('chatLogs');
                } else {
                  setShowState('details');
                }
              }}
            >
              <IoArrowBack className='tw-size-4' />
              Back
            </button>
          )}
          <Offcanvas.Title>
            {showState === 'details'
              ? 'Provider Details'
              : showState === 'chatRoom'
              ? [selectedPatient?.firstName, selectedPatient?.lastName].filter(Boolean).join(' ')
              : 'Chat Logs'}
          </Offcanvas.Title>
          {showState === 'details' && (provider?.unreadMessageCount ?? 0) > 0 && (
            <button
              className='tw-flex tw-items-center tw-justify-center tw-transition-all tw-px-2 tw-py-1 hover:tw-bg-primary/10 tw-gap-2 tw-text-primary tw-border-solid tw-border-primary tw-border tw-text-sm tw-font-medium'
              type='button'
              onClick={() => setShowState('chatLogs')}
            >
              <IoChatbubblesOutline className='tw-size-5' />
              Chat Logs
            </button>
          )}
        </div>
      </Offcanvas.Header>
      <Offcanvas.Body className={'pt-0' + (showState === 'chatLogs' ? ' px-0' : '')}>
        {showState === 'details' && <ProviderPopup onClose={handleClose} />}
        {showState === 'chatLogs' && (
          <ChatLogs
            selectedPatient={selectedPatient}
            setSelectedPatient={setSelectedPatient}
            onOpenChatRoom={handleOpenChatRoom}
          />
        )}
        {showState === 'chatRoom' && (
          <div className='patient_sidebar'>
            <PatientChatContentAdmin />
          </div>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}
