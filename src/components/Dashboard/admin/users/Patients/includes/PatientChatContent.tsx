'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageBody } from '@/components/Dashboard/admin/users/Patients/includes/MessageBody';
import ChatForm from '@/components/Dashboard/admin/users/Patients/includes/ChatForm';
import {
  setChatRoom,
  setPatientMessages,
  setPatientMessagesMeta,
  clearPatientMessages,
} from '@/store/slices/chatSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useLazyGetUserMessagesQuery } from '@/store/slices/patientChatApiSlice';
import { EmptyState } from '@/components/Dashboard/messages/MessagesEmptyState';
import { MessagesLoader } from '@/components/Dashboard/messages/MessagesLoader';
import { useDropzone } from 'react-dropzone';
import { FileUploadDragActive } from '@/components/Dashboard/messages/FileUploadDragActive';
import { ChatType } from './PatientChatSidebar';
import { ChatTypeToggle } from './ChatTypeToggle';

interface Props {
  patientData?: {
    id?: string;
    general?: {
      firstName?: string;
      lastName?: string;
    };
    [key: string]: unknown;
  };
  showAdminChatToggle?: boolean;
  chatType?: ChatType;
  onChatTypeChange?: (type: ChatType) => void;
}

export function PatientChatContent({
  patientData,
  showAdminChatToggle = false,
  chatType = 'patient',
  onChatTypeChange,
}: Readonly<Props>) {
  const dispatch = useDispatch();
  const messageContainerRef = useRef<HTMLDivElement>(null);

  const messages = useSelector((state: RootState) => state.chat.patientMessages) || [];
  const userId = useSelector((state: RootState) => state.chat.userId);
  const patient = useSelector((state: RootState) => state.patient);

  const [attachment, setAttachment] = useState<File>();

  const [triggerPatientChatMessages, { isFetching }] = useLazyGetUserMessagesQuery();

  const fetchMessages = useCallback(
    async (id: string) => {
      try {
        const res = await triggerPatientChatMessages({ id, page: 1, limit: 50 }).unwrap();
        const { messages = [], meta, chatRoom } = res || {};
        if (res) {
          dispatch(setPatientMessages(messages));
          dispatch(setPatientMessagesMeta(meta));
          dispatch(setChatRoom(chatRoom));

          if (messages.length > 0) {
            setTimeout(() => {
              const element = document.getElementById('messageEnd');
              const scroller = document.querySelector('#patient_popup .offcanvas-body');
              if (element && scroller) {
                element.scrollIntoView({ behavior: 'instant' });
                scroller.scrollTo({ top: 0, behavior: 'instant' });
              }
            }, 300);
          }
        }
      } catch (err) {
        console.error(err);
      }
    },
    [dispatch, triggerPatientChatMessages]
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setAttachment(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': [],
      'application/pdf': [],
    },
    multiple: false,
    noClick: true,
    onDrop,
  });

  useEffect(() => {
    if (userId) {
      // Clear previous patient messages before fetching new ones
      dispatch(clearPatientMessages());
      fetchMessages(userId);
    } else {
      // Clear messages when userId is cleared
      dispatch(clearPatientMessages());
    }
  }, [userId, patient, dispatch, fetchMessages]);

  return (
    <div
      {...getRootProps()}
      className='chat-content position-sticky top-0 flex-column d-flex rounded-12 flex-grow-1 overflow-hidden'
    >
      <input {...getInputProps()} />
      {isDragActive && <FileUploadDragActive />}

      <div className='border border-c-light flex-grow-1 tw-rounded-t-xl d-flex flex-column'>
        {/* Messages Header */}
        <div className='px-3 py-3 fw-medium'>
          {/* Header with Toggle */}
          <div className='d-flex align-items-center justify-content-between flex-wrap tw-mb-3'>
            <p className='mb-0'>Messages</p>
            {showAdminChatToggle && <ChatTypeToggle chatType={chatType} onChatTypeChange={onChatTypeChange} />}
          </div>

          <div className='d-flex flex-column justify-content-between'>
            <div className='d-flex align-items-center gap-3'>
              <div className='d-flex align-items-center gap-2'>
                <div
                  className='rounded-circle bg-light d-flex align-items-center justify-content-center'
                  style={{ width: '40px', height: '40px' }}
                >
                  <span className='text-muted fw-bold'>{patientData?.general?.firstName?.charAt(0) || 'P'}</span>
                </div>
                <div>
                  <h6 className='mb-0 fw-semibold'>
                    {patientData?.general?.firstName} {patientData?.general?.lastName}
                  </h6>
                </div>
              </div>
            </div>
            {/* <div className='d-flex align-items-center tw-mt-3 gap-2'>
              <span className='text-muted tw-text-xs'>Status</span>
              <span className='badge text-dark border fw-medium tw-capitalize'>{chatRoom?.status || 'Unresolved'}</span>
            </div> */}
          </div>
          <div className='mt-3' style={{ borderBottom: '1px dotted #D6E4FF' }}></div>
        </div>
        <div
          ref={messageContainerRef}
          id='patient_messageContent'
          className='p-3 overflow-auto chat_container flex-grow-1 d-flex flex-column position-relative hide-scroll'
        >
          {isFetching ? (
            <MessagesLoader title='Loading...' subTitle='Please wait while we fetch your conversations' />
          ) : messages.length > 0 ? (
            <MessageBody messageContainerRef={messageContainerRef} />
          ) : (
            <EmptyState title='No Messages' subTitle='New Messages will appear here' />
          )}
          <div id='messageEnd' />
        </div>
      </div>
      <ChatForm attachment={attachment} setAttachment={setAttachment} />
    </div>
  );
}
