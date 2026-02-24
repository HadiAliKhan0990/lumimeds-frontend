'use client';

import socket from '@/lib/socket';
import ChatOptions from '@/components/Dashboard/patient/messages/ChatOptions';
import Loading from '@/components/Dashboard/Loading';
import ChatForm from '@/components/Dashboard/patient/messages/ChatForm';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef, useState, UIEvent, useCallback } from 'react';
import { RootState } from '@/store';
import { useLazyGetPatientUnreadCountQuery, useLazyGetUserMessagesQuery } from '@/store/slices/patientChatApiSlice';
import {
  ConversationBreakdown,
  setPatientChatMessages,
  setPatientChatMeta,
  setPatientChatRoom,
  setProviderUnreadCount,
} from '@/store/slices/patientChatSlice';
import { MessageItem } from '@/components/Dashboard/patient/messages/MessageItem';
import { MessagesLoader } from '@/components/Dashboard/messages/MessagesLoader';
import { EmptyState } from '@/components/Dashboard/messages/MessagesEmptyState';
import { useDropzone } from 'react-dropzone';
import { FileUploadDragActive } from '@/components/Dashboard/messages/FileUploadDragActive';
import { useGetPatientProfileQuery } from '@/store/slices/userApiSlice';
import { isValidUUID } from '@/lib/utils/validation';

interface Props {
  selectedProvider: ConversationBreakdown | null;
}

export default function ProviderChatContent({ selectedProvider }: Readonly<Props>) {
  const dispatch = useDispatch();
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Load patient profile to ensure we have the user ID for message comparison
  useGetPatientProfileQuery();

  const { chatId, chatData, isLoading } = useSelector((state: RootState) => state.patientChat);
  const { messages = [], meta } = chatData || {};
  const { hasNextPage = false, page = 0 } = meta || {};

  const [triggerPatientChatMessages, { isFetching }] = useLazyGetUserMessagesQuery();
  const [triggerPatientUnreadCount] = useLazyGetPatientUnreadCountQuery();

  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [canFetchNextPage, setCanFetchNextPage] = useState(true);
  const [previousScrollHeight, setPreviousScrollHeight] = useState<number | null>(null);
  const [attachment, setAttachment] = useState<File>();

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const fetchMessages = async () => {
    if (!chatId || isFetching || !hasNextPage) return;

    // Validate UUID before making API call to prevent backend errors
    if (!isValidUUID(chatId)) {
      console.error('Invalid UUID format for chatId:', chatId);
      return;
    }

    const container = messagesContainerRef.current;
    if (!container) return;

    // Store current scroll height
    const currentScrollHeight = container.scrollHeight;

    try {
      const res = await triggerPatientChatMessages({
        id: chatId,
        page: page + 1,
        limit: 50,
      }).unwrap();

      if (res?.messages) {
        const messageMap = new Map(messages?.map((msg) => [msg.id, msg]) ?? new Map());
        res.messages.forEach((msg) => messageMap.set(msg.id, msg));
        dispatch(setPatientChatMessages(Array.from(messageMap.values())));
      }

      if (res?.meta) dispatch(setPatientChatMeta(res.meta));
      if (res?.chatRoom) dispatch(setPatientChatRoom(res.chatRoom));

      setPreviousScrollHeight(currentScrollHeight); // to apply after render
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop <= 100 && !isFetching && hasNextPage && canFetchNextPage) {
      setCanFetchNextPage(false);
      fetchMessages().finally(() => setCanFetchNextPage(true));
    }
  };

  useEffect(() => {
    if (!chatId) return;
    const markAsRead = () => {
      socket.emit('markAsRead', { userId: chatId }, async () => {
        dispatch(setProviderUnreadCount(0));
        try {
          await triggerPatientUnreadCount();
        } catch {}
      });
    };

    // When opening/viewing a provider chat, mark as read
    markAsRead();

    return () => {
      // no-op
    };
  }, [chatId]);

  // Handle scroll to bottom when messages load for a new provider
  useEffect(() => {
    if (messages.length > 0 && !isLoading && messagesContainerRef.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [chatId, messages.length, isLoading]);

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
    if (previousScrollHeight && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const newScrollHeight = container.scrollHeight;
      container.scrollTop = newScrollHeight - previousScrollHeight;
      setPreviousScrollHeight(null); // reset
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 && !hasScrolledToBottom && !isLoading) {
      setTimeout(() => {
        scrollToBottom();
        setHasScrolledToBottom(true);
      }, 100);
    }
  }, [messages.length, isLoading, hasScrolledToBottom]);

  return (
    <div
      {...getRootProps()}
      className='chat-content flex-column flex-grow-1 d-flex patient_chat_infinite position-relative'
    >
      <input {...getInputProps()} />
      {isDragActive && <FileUploadDragActive />}

      {isLoading ? (
        <MessagesLoader title='Loading your messages...' subTitle='Please wait while we fetch your conversation' />
      ) : !messages?.length ? (
        <EmptyState title='No Messages' subTitle='New Messages will appear here' />
      ) : (
        <div className='py-1 md:py-4 d-flex flex-column flex-grow-1 custom-patient-chat-height-provider'>
          <div
            ref={messagesContainerRef}
            id='messagesContainer'
            onScroll={handleScroll}
            className='flex-grow-1 overflow-auto position-relative px-4 d-flex flex-column gap-3 infinite-scroll-component hide-scroll'
          >
            {isFetching && (
              <div className='mb-1 text-center'>
                <Loading className='size-75' />
              </div>
            )}

            {messages.map((message) => (
              <MessageItem selectedProvider={selectedProvider} key={message.id} message={message} />
            ))}
          </div>
        </div>
      )}

      {!isLoading && (
        <>
          <ChatOptions />
          <ChatForm attachment={attachment} setAttachment={setAttachment} />
        </>
      )}
    </div>
  );
}
