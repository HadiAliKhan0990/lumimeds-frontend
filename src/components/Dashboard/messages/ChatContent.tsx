'use client';

import MessageBody from '@/components/Dashboard/messages/MessageBody';
import ChatForm from '@/components/Dashboard/messages/ChatForm';
import { RootState } from '@/store';
import {
  setChatUsers,
  setPatientsConversations,
  setProvidersConversations,
  setPatientsConversationsMeta,
  setProvidersConversationsMeta,
  setIsNewMessage,
  setNewChatUser,
} from '@/store/slices/chatSlice';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { NewChatHeader } from '@/components/Dashboard/messages/NewChatHeader';
import { ChatContentHeader } from '@/components/Dashboard/messages/ChatContentHeader';
import { NewChatDropdown } from '@/components/Dashboard/messages/NewChatDropdown';
import { useLazyGetConversationsListQuery } from '@/store/slices/chatApiSlice';
import { MessagesLoader } from '@/components/Dashboard/messages/MessagesLoader';
import { useDropzone } from 'react-dropzone';
import { FileUploadDragActive } from '@/components/Dashboard/messages/FileUploadDragActive';
import { EmptyState } from '@/components/Dashboard/messages/MessagesEmptyState';
import { BlastMessagingHeader } from './BlastMessagingHeader';

interface Props {
  accessToken?: string;
  onPatientClick?: (patientId: string, patientName?: string, patientEmail?: string) => void;
}

export default function ChatContent({ accessToken, onPatientClick }: Readonly<Props>) {
  const dispatch = useDispatch();

  const chatContentRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  const [inputValue, setInputValue] = useState<string>('');
  const [attachment, setAttachment] = useState<File>();

  const {
    messages = [],
    conversationsMeta,
    selectedConversation,
    isNewMessage,
    newChatUser,
    messagesLoading,
    selectedRole: role,
    conversationFilter: selectedFilter,
    chatUsers,
  } = useSelector((state: RootState) => state.chat);
  const { isBlaseMessaging } = useSelector((state: RootState) => state.blaseMessaging);

  const meta = useMemo(() => {
    if (role === 'admin') return conversationsMeta.admin;
    if (role === 'patient') return conversationsMeta.patient;
    return conversationsMeta.provider;
  }, [role, conversationsMeta]);

  const { sortField, sortOrder } = meta || {};

  const [triggerConversationsList] = useLazyGetConversationsListQuery();

  const handleCancel = async () => {
    setInputValue('');
    dispatch(setChatUsers(null));
    dispatch(setNewChatUser(null));
    dispatch(setIsNewMessage(false));
    const data = await triggerConversationsList({
      page: meta?.page || 1,
      limit: meta?.limit || 30,
      role,
      ...(selectedFilter === 'Unread' && { unreadOnly: true }),
      ...(selectedFilter === 'Unresolved' && { unresolvedOnly: true }),
      ...(sortOrder && sortField && { sortOrder, sortField }),
    }).unwrap();
    if (role === 'patient') {
      dispatch(setPatientsConversations(data?.conversations));
      dispatch(setPatientsConversationsMeta(data?.meta));
    } else {
      dispatch(setProvidersConversations(data?.conversations));
      dispatch(setProvidersConversationsMeta(data?.meta));
    }
  };

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'instant') => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior });
      }
    }, 100);
  }, []);

  const renderMessageContent = () => {
    if (messagesLoading) {
      return (
        <MessagesLoader title='Loading your messages...' subTitle='Please wait while we fetch your conversation' />
      );
    }
    if (messages.length > 0) {
      return (
        <MessageBody
          messagesEndRef={messagesEndRef}
          messageContainerRef={messageContainerRef}
          accessToken={accessToken}
          onPatientClick={onPatientClick}
        />
      );
    }
    return <EmptyState title='No Messages' subTitle='New Messages will appear here' />;
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

  const headerContent = useMemo(() => {
    if (isBlaseMessaging) {
      return <BlastMessagingHeader />;
    }

    if (isNewMessage) {
      return <NewChatHeader setInputValue={setInputValue} />;
    }

    if (selectedConversation) {
      return <ChatContentHeader />;
    }
  }, [isBlaseMessaging, isNewMessage, selectedConversation]);

  useOutsideClick({
    ref: chatContentRef,
    handler: () => {
      if (newChatUser) {
        handleCancel();
      }
    },
  });

  // Scroll to bottom only when conversation ID changes, not on status updates
  useEffect(() => {
    if (selectedConversation?.chatRoom?.id && messages.length > 0) {
      scrollToBottom('instant');
    }
  }, [selectedConversation?.chatRoom?.id, scrollToBottom]);

  useEffect(() => {
    dispatch(setNewChatUser(null));
    dispatch(setIsNewMessage(false));
    dispatch(setChatUsers(null));
  }, [role]);

  return (
    <div
      ref={chatContentRef}
      {...getRootProps()}
      className={
        'chat-content flex-column position-relative flex-grow-1 ' +
        (isNewMessage || selectedConversation || isBlaseMessaging ? 'd-flex' : '')
      }
    >
      {headerContent}

      {(selectedConversation || isNewMessage || isBlaseMessaging) && <input {...getInputProps()} />}

      {isDragActive && <FileUploadDragActive />}

      {selectedConversation || isNewMessage || isBlaseMessaging ? (
        <div
          ref={messageContainerRef}
          className={'position-relative flex-grow-1 p-4 hide-scroll' + (isNewMessage ? '' : ' overflow-auto')}
          id='messageContent'
        >
          {isNewMessage && chatUsers && <NewChatDropdown inputValue={inputValue} setInputValue={setInputValue} />}
          {renderMessageContent()}
          <div ref={messagesEndRef} />
        </div>
      ) : (
        <EmptyState title='No Conversation Selected' subTitle='Select a conversation or start a new one' />
      )}
      {(selectedConversation || newChatUser || isBlaseMessaging) && (
        <ChatForm
          attachment={attachment}
          setAttachment={setAttachment}
          removeSearchInput={setInputValue}
          accessToken={accessToken}
        />
      )}
    </div>
  );
}
