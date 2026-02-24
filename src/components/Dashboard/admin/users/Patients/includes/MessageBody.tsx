'use client';

import { useCallback, useEffect, useRef, useMemo, RefObject } from 'react';
import {
  addPatientChatMessage,
  ChatMessages,
  setChatRoom,
  setPatientMessages,
  setPatientMessagesMeta,
  updateConversationStatusByChatRoomId,
} from '@/store/slices/chatSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import Loading from '@/components/Dashboard/Loading';
import { MessageItem } from '@/components/Dashboard/messages/MessageItem';
import { getCurrentChatSocket, connectChatSocket } from '@/lib/chatSocket';
import { useLazyGetUserMessagesQuery } from '@/store/slices/patientChatApiSlice';
import { usePathname } from 'next/navigation';
import { providerSocket } from '@/lib/providerSocket';
import { providerDashboardSocket } from '@/lib/providerDashboardSocket';

interface Props {
  messageContainerRef: RefObject<HTMLDivElement | null>;
}

export const MessageBody = ({ messageContainerRef }: Props) => {
  const dispatch = useDispatch();

  const scrollEndRef = useRef<HTMLDivElement>(null);
  const isFetching = useRef(false);
  const previousScrollHeight = useRef<number | null>(null);

  const pathname = usePathname();
  const isUserProvider = pathname.includes('/provider');

  const chatSocket = getCurrentChatSocket();
  const decidedSocket = isUserProvider ? providerSocket : chatSocket;

  const {
    userId,
    patientMessages: messages = [],
    patientMeta: meta,
    chatRoom,
  } = useSelector((state: RootState) => state.chat);

  const { page = 0, hasNextPage = false } = meta || {};

  const [triggerPatientChatMessages, { isFetching: isApiFetching }] = useLazyGetUserMessagesQuery();

  const messageIds = useMemo(() => new Set(messages.map((msg) => msg.id)), [messages]);

  const fetchMessages = useCallback(async () => {
    const container = messageContainerRef.current;
    if (isFetching.current || !hasNextPage || isApiFetching || !container) return;

    isFetching.current = true;
    previousScrollHeight.current = container.scrollHeight;

    try {
      const data = await triggerPatientChatMessages({
        id: userId || '',
        page: page + 1,
        limit: 50,
      }).unwrap();

      const newMessages = data?.messages?.filter((msg) => !messageIds.has(msg.id)) || [];

      if (newMessages.length > 0) {
        dispatch(setPatientMessages([...newMessages, ...messages]));
      }

      if (data?.meta) dispatch(setPatientMessagesMeta(data.meta));
      if (data?.chatRoom) dispatch(setChatRoom(data.chatRoom));
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      isFetching.current = false;
    }
  }, [userId, page, hasNextPage, isApiFetching, messages, messageIds, dispatch]);

  // Restore scroll position after new messages are added
  useEffect(() => {
    const container = messageContainerRef.current;
    if (container && previousScrollHeight.current !== null) {
      const newScrollHeight = container.scrollHeight;
      container.scrollTop = newScrollHeight - previousScrollHeight.current;
      previousScrollHeight.current = null;
    }
  }, [messages]);

  // Scroll handler for loading more
  useEffect(() => {
    const container = messageContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop <= 100 && !isFetching.current && hasNextPage) {
        fetchMessages();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [fetchMessages, hasNextPage]);

  const handleNewMessage = useCallback(
    (res: ChatMessages) => {
      // Only add message if it belongs to the same chatroom
      const messageChatRoomId = res.chatRoom?.id || res.chatRoomId;
      const currentChatRoomId = chatRoom?.id;

      // Only append if it's the same chatroom, otherwise ignore
      if (!messageChatRoomId || !currentChatRoomId || messageChatRoomId !== currentChatRoomId) {
        // Message doesn't belong to current chatroom, ignore it
        return;
      }

      dispatch(addPatientChatMessage(res));

      // Update conversation in conversations array (or add if doesn't exist)
      const chatRoomId = res.chatRoom?.id || res.chatRoomId;
      if (chatRoomId) {
        // Determine new status: unresolved if currently resolved, otherwise keep current status
        const status = chatRoom?.status === 'resolved' ? 'unresolved' : chatRoom?.status || 'unresolved';

        // Update or add conversation at the top of the appropriate array
        dispatch(
          updateConversationStatusByChatRoomId({
            chatRoomId,
            status,
            message: res,
          })
        );

        // Also update the local chatRoom state
        if (chatRoom) {
          dispatch(setChatRoom({ ...chatRoom, status }));
        }
      }

      requestAnimationFrame(() => {
        scrollEndRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        });
      });
    },
    [dispatch, chatRoom, isUserProvider]
  );

  useEffect(() => {
    // Listen to decidedSocket (providerSocket for providers, chatSocket for admins)
    if (decidedSocket) {
      decidedSocket.on('newMessage', handleNewMessage);
    }

    // Also listen to main chat socket for provider side to catch all messages
    let mainChatSocket: ReturnType<typeof connectChatSocket> | null = null;
    if (isUserProvider) {
      // Get access token from localStorage or use empty string
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') || '' : '';
      mainChatSocket = connectChatSocket(token);
      mainChatSocket.on('newMessage', handleNewMessage);
    }

    // Listen to provider dashboard socket
    const newMessagelistener = (message: ChatMessages) => handleNewMessage(message);
    providerDashboardSocket.onNewMessage(newMessagelistener);

    return () => {
      if (decidedSocket) {
        decidedSocket.off('newMessage', handleNewMessage);
      }
      if (mainChatSocket) {
        mainChatSocket.off('newMessage', handleNewMessage);
      }
      providerDashboardSocket.removeNewMessageListener(newMessagelistener);
    };
  }, [handleNewMessage, decidedSocket, isUserProvider]);

  useEffect(() => {
    const element = document.getElementById('patient_messageContent');
    if (element && messages.length > 0) {
      element.scrollTop = element.scrollHeight;
    }
  }, []);
  return (
    <div className='d-flex flex-column flex-grow-1 gap-3'>
      {(isApiFetching || isFetching.current) && hasNextPage && (
        <div className='mb-3 text-center'>
          <Loading className='size-75' />
        </div>
      )}

      {messages.map((message) => (
        <MessageItem isPopup message={message} key={message.id} />
      ))}

      <div ref={scrollEndRef} id='messageEnd' />
    </div>
  );
};
