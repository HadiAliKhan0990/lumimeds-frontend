'use client';

import ChatForm from '@/components/Dashboard/patient/messages/ChatForm';
import ChatOptions from '@/components/Dashboard/patient/messages/ChatOptions';
import Loading from '@/components/Dashboard/Loading';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef, useState, UIEvent, useCallback } from 'react';
import { RootState } from '@/store';
import { useLazyGetUserMessagesQuery } from '@/store/slices/patientChatApiSlice';
import { setPatientChatMessages, setPatientChatMeta, setPatientChatRoom } from '@/store/slices/patientChatSlice';
import { MessageItem } from '@/components/Dashboard/patient/messages/MessageItem';
import { MessagesLoader } from '@/components/Dashboard/messages/MessagesLoader';
import { EmptyState } from '@/components/Dashboard/messages/MessagesEmptyState';
import { useDropzone } from 'react-dropzone';
import { FileUploadDragActive } from '@/components/Dashboard/messages/FileUploadDragActive';
import { isValidUUID } from '@/lib/utils/validation';

export default function ChatContent() {
  const dispatch = useDispatch();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messageContentRef = useRef<HTMLDivElement | null>(null);

  const messages = useSelector((state: RootState) => state.patientChat.chatData.messages || []);
  const meta = useSelector((state: RootState) => state.patientChat.chatData.meta);
  const chatId = useSelector((state: RootState) => state.patientChat.chatId);
  const isLoading = useSelector((state: RootState) => state.patientChat.isLoading);

  const [triggerPatientChatMessages, { isFetching }] = useLazyGetUserMessagesQuery();
  const { hasNextPage = false, page = 0 } = meta || {};

  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [canFetchNextPage, setCanFetchNextPage] = useState(true);
  const [previousScrollHeight, setPreviousScrollHeight] = useState<number | null>(null);
  const [attachment, setAttachment] = useState<File>();

  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    console.log('scrollToBottom', behavior);
    if (messagesContainerRef.current) {
      // Prevent any potential body scroll by ensuring we only scroll the container
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
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
      // Disable initial scroll to prevent body scroll on mounting
      setHasScrolledToBottom(true);
    }
  }, [messages.length, isLoading, hasScrolledToBottom]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > 0 && hasScrolledToBottom) {
      setTimeout(() => {
        scrollToBottom('smooth');
      }, 100);
    }
  }, [messages.length, hasScrolledToBottom]);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    // Prevent scroll from bubbling up to body
    e.stopPropagation();

    const target = e.currentTarget;
    if (target.scrollTop <= 100 && !isFetching && hasNextPage && canFetchNextPage) {
      setCanFetchNextPage(false);
      fetchMessages().finally(() => setCanFetchNextPage(true));
    }
  };

  return (
    <div
      {...getRootProps()}
      className='chat-content flex-column flex-grow-1 d-flex patient_chat_infinite position-relative'
      style={{ overflow: 'hidden' }}
    >
      <input {...getInputProps()} />
      {isDragActive && <FileUploadDragActive />}

      {isLoading ? (
        <MessagesLoader title='Loading your messages...' subTitle='Please wait while we fetch your conversation' />
      ) : !messages?.length ? (
        <EmptyState title='No Messages' subTitle='New Messages will appear here' />
      ) : (
        <div className='py-1 md:py-4 d-flex flex-column flex-grow-1  custom-patient-chat-height'>
          <div
            ref={messagesContainerRef}
            id='messagesContainer'
            onScroll={handleScroll}
            className='flex-grow-1 overflow-auto position-relative px-4 d-flex flex-column gap-3 infinite-scroll-component hide-scroll'
          >
            {isFetching && (
              <div className='mb-3 text-center'>
                <Loading className='size-75' />
              </div>
            )}

            {messages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}

            <div ref={messageContentRef} id='messageContent' />
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
