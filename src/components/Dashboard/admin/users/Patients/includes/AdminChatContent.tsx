'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AdminMessageBody } from '@/components/Dashboard/admin/users/Patients/includes/AdminMessageBody';
import ChatForm from '@/components/Dashboard/admin/users/Patients/includes/ChatForm';
import {
  setMessages,
  setMessagesMeta,
  addMessage,
  ChatConversation,
  ChatMessages,
} from '@/store/slices/chatSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useLazyGetUserMessagesQuery } from '@/store/slices/patientChatApiSlice';
import { useLazyGetConversationsListQuery } from '@/store/slices/chatApiSlice';
import { EmptyState } from '@/components/Dashboard/messages/MessagesEmptyState';
import { MessagesLoader } from '@/components/Dashboard/messages/MessagesLoader';
import { useDropzone } from 'react-dropzone';
import { FileUploadDragActive } from '@/components/Dashboard/messages/FileUploadDragActive';
import { ChatType } from './PatientChatSidebar';
import { ChatTypeToggle } from './ChatTypeToggle';
import { toast } from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { Error } from '@/lib/types';


interface AdminChatContentProps {
  showAdminChatToggle?: boolean;
  chatType?: ChatType;
  onChatTypeChange?: (type: ChatType) => void;
}

export function AdminChatContent({
  showAdminChatToggle = false,
  chatType = 'admin',
  onChatTypeChange,
}: AdminChatContentProps) {
  const dispatch = useDispatch();
  const messageContainerRef = useRef<HTMLDivElement>(null);

  const messages = useSelector((state: RootState) => state.chat.messages) || [];

  const [attachment, setAttachment] = useState<File>();
  const [selectedAdmin, setSelectedAdmin] = useState<ChatConversation | null>(null);

  const [triggerAdminMessages, { isFetching: isFetchingMessages }] = useLazyGetUserMessagesQuery();
  const [triggerGetConversations, { isFetching: isFetchingConversations }] = useLazyGetConversationsListQuery();

  const fetchAdminConversations = async () => {
    try {
      const res = await triggerGetConversations({ role: 'admin', page: 1, limit: 50 }).unwrap();
      const { conversations = [] } = res || {};

      // Auto-select first admin if available
      if (conversations.length > 0 && !selectedAdmin) {
        handleSelectAdmin(conversations[0]);
      }
    } catch (err) {
      toast.error(
        isAxiosError(err) ? err.response?.data?.message : (err as Error).data?.message || 'Error fetching admin conversations!'
      );
    }
  };

  const fetchMessages = async (adminId: string) => {
    try {
      const res = await triggerAdminMessages({ id: adminId, page: 1, limit: 50 }).unwrap();
      const { messages: fetchedMessages = [], meta } = res || {};
      if (res) {
        dispatch(setMessages(fetchedMessages));
        dispatch(setMessagesMeta(meta ?? null));

        if (fetchedMessages.length > 0) {
          setTimeout(() => {
            const element = document.getElementById('adminMessageEnd');
            const scroller = document.querySelector('#patient_popup .offcanvas-body');
            if (element && scroller) {
              element.scrollIntoView({ behavior: 'instant' });
              scroller.scrollTo({ top: 0, behavior: 'instant' });
            }
          }, 300);
        }
      }
    } catch (err) {
      toast.error(
        isAxiosError(err) ? err.response?.data?.message : (err as Error).data?.message || 'Error fetching admin messages!'
      );
    }
  };

  const handleSelectAdmin = (conversation: ChatConversation) => {
    setSelectedAdmin(conversation);
    if (conversation.otherUser?.id) {
      fetchMessages(conversation.otherUser.id);
    }
  };

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
    fetchAdminConversations();
    // Clear messages when component mounts to avoid showing stale admin messages
    dispatch(setMessages(null));
  }, []);

  const isFetching = isFetchingConversations || isFetchingMessages;

  return (
    <div
      {...getRootProps()}
      className='chat-content position-sticky top-0 flex-column d-flex rounded-12 flex-grow-1 overflow-hidden'
    >
      <input {...getInputProps()} />
      {isDragActive && <FileUploadDragActive />}

      <div className='border border-c-light flex-grow-1 tw-rounded-t-xl d-flex flex-column'>
        {/* Admin Chat Header */}
        <div className='px-3 py-3 fw-medium'>
          {/* Header with Toggle */}
          <div className='d-flex align-items-center justify-content-between flex-wrap tw-mb-3'>
            <p className='mb-0'>Messages</p>
            {showAdminChatToggle && (
              <ChatTypeToggle chatType={chatType} onChatTypeChange={onChatTypeChange} />
            )}
          </div>

          {/* Selected Admin Info */}
          {selectedAdmin && (
            <div className='d-flex align-items-center gap-2 tw-mb-3'>
              <div
                className='rounded-circle bg-light d-flex align-items-center justify-content-center'
                style={{ width: '40px', height: '40px' }}
              >
                <span className='text-muted fw-bold'>
                  {selectedAdmin.otherUser?.firstName?.charAt(0) || 'A'}
                </span>
              </div>
              <div>
                <h6 className='mb-0 fw-semibold'>
                  {selectedAdmin.otherUser?.firstName} {selectedAdmin.otherUser?.lastName}
                </h6>
              </div>
            </div>
          )}

          <div style={{ borderBottom: '1px dotted #D6E4FF' }}></div>
        </div>

        <div
          ref={messageContainerRef}
          id='admin_messageContent'
          className='p-3 overflow-auto chat_container flex-grow-1 d-flex flex-column position-relative hide-scroll'
        >
          {isFetching ? (
            <MessagesLoader title='Loading...' subTitle='Please wait while we fetch your conversations' />
          ) : !selectedAdmin ? (
            <EmptyState title='No Admin Selected' subTitle='Select an admin to view messages' />
          ) : messages.length > 0 ? (
            <AdminMessageBody 
              messageContainerRef={messageContainerRef} 
              adminUserId={selectedAdmin?.otherUser?.id || ''} 
              adminName={`${selectedAdmin?.otherUser?.firstName || ''} ${selectedAdmin?.otherUser?.lastName || ''}`.trim() || 'Admin'}
            />
          ) : (
            <EmptyState title='No Messages' subTitle='Start a conversation with this admin' />
          )}
          <div id='adminMessageEnd' />
        </div>
      </div>
      {selectedAdmin && (
        <ChatForm 
          attachment={attachment} 
          setAttachment={setAttachment}
          receiverId={selectedAdmin?.otherUser?.id || ''}
          onMessageSent={(msg: ChatMessages) => dispatch(addMessage(msg))}
        />
      )}
    </div>
  );
}

