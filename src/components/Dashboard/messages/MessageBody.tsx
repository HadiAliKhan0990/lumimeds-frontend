'use client';

import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import {
  addMessage,
  ChatMessages,
  Meta,
  setMessages,
  setMessagesMeta,
  updateConversationStatusByChatRoomId,
} from '@/store/slices/chatSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { MessageItem } from './MessageItem';
import { useLazyGetUserMessagesQuery } from '@/store/slices/patientChatApiSlice';
import { connectChatSocket } from '@/lib/chatSocket';
import Loading from '@/components/Dashboard/Loading';

interface Props {
  messagesEndRef: RefObject<HTMLDivElement | null>;
  messageContainerRef: RefObject<HTMLDivElement | null>;
  accessToken?: string;
  onPatientClick?: (patientId: string, patientName?: string, patientEmail?: string) => void;
}

export default function MessageBody({
  messagesEndRef,
  messageContainerRef,
  accessToken,
  onPatientClick,
}: Readonly<Props>) {
  const dispatch = useDispatch();

  const isFetching = useRef(false);
  const previousScrollHeight = useRef<number | null>(null);

  const [hasInitialized, setHasInitialized] = useState(false);

  const {
    messages = [],
    selectedConversation,
    selectedRole: role,
    messagesMeta,
    conversations,
  } = useSelector((state: RootState) => state.chat);

  const { page = 1, hasNextPage = false } = messagesMeta || {};

  const [triggerPatientChatMessages, { isFetching: isApiFetching }] = useLazyGetUserMessagesQuery();

  const fetchMessages = useCallback(async () => {
    const userId = selectedConversation?.otherUser?.id;
    const container = messageContainerRef.current;

    if (!userId || !hasNextPage || isFetching.current || isApiFetching || !container) return;

    isFetching.current = true;
    previousScrollHeight.current = container.scrollHeight;

    try {
      const data = await triggerPatientChatMessages({ id: userId, page: page + 1, limit: 50 }).unwrap();
      const newMessages = data?.messages ?? [];

      const existingIds = new Set(messages.map((m) => m.id));
      const uniqueNewMessages = newMessages.filter((msg) => !existingIds.has(msg.id));

      if (uniqueNewMessages.length > 0) {
        dispatch(setMessages([...uniqueNewMessages, ...messages]));
      }

      if (data?.meta) {
        dispatch(setMessagesMeta(data.meta as Meta));
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      isFetching.current = false;
    }
  }, [selectedConversation, hasNextPage, isApiFetching, messages]);

  // Restore scroll after fetch
  useEffect(() => {
    const container = messageContainerRef.current;
    if (container && previousScrollHeight.current !== null) {
      const newScrollHeight = container.scrollHeight;
      container.scrollTop = newScrollHeight - previousScrollHeight.current;
      previousScrollHeight.current = null;
    }
  }, [messages]);

  // Scroll listener for top reach
  useEffect(() => {
    const container = messageContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop <= 100 && hasNextPage && !isFetching.current) {
        fetchMessages();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [fetchMessages, hasNextPage]);

  const handleNewMessage = useCallback(
    (res: ChatMessages) => {
      // Check if message belongs to selected conversation by chatRoomId
      const matchesByChatRoom = selectedConversation?.chatRoom?.id === res.chatRoomId;

      // Fallback: Check if message is between current user and selected conversation's otherUser
      // This handles cases where chatRoomId might not match (e.g., admin-provider conversations)
      const otherUserId = selectedConversation?.otherUser?.id;
      const matchesByUser = otherUserId && (res.senderId === otherUserId || res.receiverId === otherUserId);

      // Check if message already exists to prevent duplicates
      const messageExists = messages.some((msg) => msg.id === res.id);

      if ((matchesByChatRoom || matchesByUser) && !messageExists) {
        // Add message to messages array
        dispatch(addMessage(res));

        // Update conversation in conversations array (or add if doesn't exist)
        if (res.chatRoomId) {
          dispatch(
            updateConversationStatusByChatRoomId({
              chatRoomId: res.chatRoomId,
              status: 'unresolved',
              message: res,
              role, // Pass role to determine which array to update/add to
            })
          );
        }

        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);

        const chatSocket = connectChatSocket(accessToken || '');
        chatSocket.emit('markAsRead', { userId: selectedConversation?.otherUser?.id });
      }
    },
    [dispatch, messagesEndRef, selectedConversation, conversations, role, messages]
  );

  // Initial scroll
  useEffect(() => {
    if (!hasInitialized && messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
        setHasInitialized(true);
      }, 100);
    }
  }, [messages]);

  // Socket events
  useEffect(() => {
    const chatSocket = connectChatSocket(accessToken || '');
    chatSocket.on('newMessage', handleNewMessage);
    return () => {
      chatSocket.off('newMessage', handleNewMessage);
    };
  }, [handleNewMessage]);

  return (
    <div className='d-flex flex-column flex-grow-1 gap-3'>
      {(isFetching.current || isApiFetching) && hasNextPage && (
        <div className='mb-3 text-center'>
          <Loading className='size-75' />
        </div>
      )}
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} onPatientClick={onPatientClick} />
      ))}
    </div>
  );
}
