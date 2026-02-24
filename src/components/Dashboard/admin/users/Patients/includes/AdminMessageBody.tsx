'use client';

import Loading from '@/components/Dashboard/Loading';
import { useCallback, useEffect, useRef, useMemo, RefObject } from 'react';
import {
  addMessage,
  ChatMessages,
  setChatRoom,
  setMessages,
  setMessagesMeta,
  updateConversationStatusByChatRoomId,
} from '@/store/slices/chatSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { MessageItem } from '@/components/Dashboard/messages/MessageItem';
import { getCurrentChatSocket } from '@/lib/chatSocket';
import { useLazyGetUserMessagesQuery } from '@/store/slices/patientChatApiSlice';
import { usePathname } from 'next/navigation';
import { providerSocket } from '@/lib/providerSocket';
import { providerDashboardSocket } from '@/lib/providerDashboardSocket';

interface Props {
  messageContainerRef: RefObject<HTMLDivElement | null>;
  adminUserId: string;
  adminName?: string; // The admin's display name for messages
}

export const AdminMessageBody = ({ messageContainerRef, adminUserId, adminName }: Props) => {
  const dispatch = useDispatch();

  const scrollEndRef = useRef<HTMLDivElement>(null);
  const isFetching = useRef(false);
  const previousScrollHeight = useRef<number | null>(null);

  const pathname = usePathname();
  const isUserProvider = pathname.includes('/provider');

  const chatSocket = getCurrentChatSocket();
  const decidedSocket = isUserProvider ? providerSocket : chatSocket;

  const {
    selectedRole,
    chatRoom,
    messagesMeta,
    messages = [],
    conversations = [],
  } = useSelector((state: RootState) => state.chat);

  const { page = 0, hasNextPage = false } = messagesMeta || {};

  const [triggerAdminMessages, { isFetching: isApiFetching }] = useLazyGetUserMessagesQuery();

  const messageIds = useMemo(() => new Set(messages.map((msg) => msg.id)), [messages]);

  const fetchMessages = useCallback(async () => {
    const container = messageContainerRef.current;
    if (isFetching.current || !hasNextPage || isApiFetching || !container || !adminUserId) return;

    isFetching.current = true;
    previousScrollHeight.current = container.scrollHeight;

    try {
      const data = await triggerAdminMessages({
        id: adminUserId,
        page: page + 1,
        limit: 50,
      }).unwrap();

      const newMessages = data?.messages?.filter((msg) => !messageIds.has(msg.id)) || [];

      if (newMessages.length > 0) {
        dispatch(setMessages([...newMessages, ...messages]));
      }

      if (data?.meta) dispatch(setMessagesMeta(data.meta));
      if (data?.chatRoom) dispatch(setChatRoom(data.chatRoom));
    } catch (err) {
      console.error('Failed to fetch admin messages:', err);
    } finally {
      isFetching.current = false;
    }
  }, [adminUserId, page, hasNextPage, isApiFetching, messages, messageIds, dispatch]);

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
      // Only add message if it's not already in the list and belongs to current admin chat
      if (!messageIds.has(res.id)) {
        // Add message to messages array
        dispatch(addMessage(res));

        // Update conversation in conversations array (or add if doesn't exist)
        if (res.chatRoomId) {
          dispatch(
            updateConversationStatusByChatRoomId({
              chatRoomId: res.chatRoomId,
              status: 'unresolved',
              message: res,
              role: selectedRole, // Pass role to determine which array to update/add to
            })
          );
        }

        requestAnimationFrame(() => {
          scrollEndRef.current?.scrollIntoView({
            behavior: 'instant',
            block: 'end',
          });
        });
      }
    },
    [dispatch, messageIds, chatRoom, conversations, selectedRole]
  );

  useEffect(() => {
    decidedSocket?.on('newMessage', handleNewMessage);

    const newMessagelistener = (message: ChatMessages) => handleNewMessage(message);

    providerDashboardSocket.onNewMessage(newMessagelistener);

    return () => {
      decidedSocket?.off('newMessage', handleNewMessage);

      providerDashboardSocket.removeNewMessageListener(newMessagelistener);
    };
  }, [handleNewMessage]);

  useEffect(() => {
    const element = document.getElementById('admin_messageContent');
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
        <MessageItem isPopup message={message} key={message.id} otherUserName={adminName} />
      ))}

      <div ref={scrollEndRef} id='adminMessageEnd' />
    </div>
  );
};
