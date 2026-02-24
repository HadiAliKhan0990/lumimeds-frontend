'use client';

import ChatForm from '@/components/Dashboard/admin/users/Patients/includes/ChatForm';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MessageBody } from '@/components/Dashboard/admin/users/Patients/includes/MessageBody';
import {
  setChatRoom,
  setChatRoomStatus,
  setPatientMessages,
  setPatientMessagesMeta,
  clearPatientMessages,
} from '@/store/slices/chatSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { PATIENT_CHAT_STATUS } from '@/components/Dashboard/constants';
import { capitalizeFirst } from '@/lib/helper';
import { setModal } from '@/store/slices/modalSlice';
import { useLazyGetUserMessagesQuery } from '@/store/slices/patientChatApiSlice';
import { EmptyState } from '@/components/Dashboard/messages/MessagesEmptyState';
import { MessagesLoader } from '@/components/Dashboard/messages/MessagesLoader';
import { useDropzone } from 'react-dropzone';
import { FileUploadDragActive } from '@/components/Dashboard/messages/FileUploadDragActive';

export function PatientChatContentAdmin() {
  const dispatch = useDispatch();
  const messageContainerRef = useRef<HTMLDivElement>(null);

  const chatRoom = useSelector((state: RootState) => state.chat.chatRoom);
  const messages = useSelector((state: RootState) => state.chat.patientMessages) || [];
  const userId = useSelector((state: RootState) => state.chat.userId);

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

  const chatStatusOptions = useMemo(() => {
    const currentStatus = chatRoom?.status;
    return PATIENT_CHAT_STATUS.filter((status) => {
      // If current status is resolved, also filter out unread
      if (currentStatus === 'resolved' && status === 'unread') return false;
      return true;
    });
  }, [chatRoom, userId]);

  const renderMessageContent = () => {
    if (isFetching && messages.length === 0) {
      return <MessagesLoader title='Loading...' subTitle='Please wait while we fetch your conversations' />;
    }
    if (messages.length > 0) {
      return <MessageBody messageContainerRef={messageContainerRef} />;
    }
    return <EmptyState title='No Messages' subTitle='New Messages will appear here' />;
  };

  useEffect(() => {
    if (userId) {
      // Clear previous patient messages before fetching new ones
      dispatch(clearPatientMessages());
      fetchMessages(userId);
    } else {
      // Clear messages when userId is cleared
      dispatch(clearPatientMessages());
    }
  }, [userId, dispatch, fetchMessages]);

  return (
    <div
      {...getRootProps()}
      className='chat-content position-sticky top-0 flex-column d-flex rounded-12 flex-grow-1 overflow-hidden'
    >
      <input {...getInputProps()} />
      {isDragActive && <FileUploadDragActive />}

      <div className='border border-c-light flex-grow-1 tw-rounded-t-xl d-flex flex-column'>
        {chatRoom && (
          <div className='px-2 pt-2'>
            <div className='border-bottom pb-2'>
              <div className='d-flex align-items-center gap-2'>
                <span className='text-placeholder flex-shrink-0'>Status</span>
                <select
                  disabled={!chatRoom?.id || isFetching}
                  onChange={(e) => {
                    dispatch(setChatRoomStatus(e.target.value));
                    dispatch(setModal({ modalType: 'Chatroom Status Confirmation' }));
                  }}
                  value={chatRoom.status}
                  className='form-select rounded-pill shadow-none form-select-sm max-w-150px'
                >
                  {chatStatusOptions.map((title) => (
                    <option key={title} value={title}>
                      {capitalizeFirst(title)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
        <div
          ref={messageContainerRef}
          id='patient_messageContent'
          className='p-3 overflow-auto chat_container flex-grow-1 d-flex flex-column position-relative hide-scroll'
        >
          {renderMessageContent()}
          <div id='messageEnd' />
        </div>
      </div>
      <ChatForm attachment={attachment} setAttachment={setAttachment} />
    </div>
  );
}
