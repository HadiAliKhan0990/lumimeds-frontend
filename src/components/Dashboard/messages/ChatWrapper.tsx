'use client';

import toast from 'react-hot-toast';
import { connectChatSocket } from '@/lib/chatSocket';
import { Role } from '@/services/chat/types';
import { RootState } from '@/store';
import { ConversationsResponse, useLazyGetConversationsListQuery } from '@/store/slices/chatApiSlice';
import {
  setChatUsers,
  setPatientsConversations,
  setPatientsConversationsMeta,
  setLoadingChats,
  setIsNewMessage,
  setNewChatUser,
  setAdminConversations,
  setAdminConversationsMeta,
  setProvidersConversations,
  setProvidersConversationsMeta,
  updateConversationStatusByChatRoomId,
  ChatMessages,
} from '@/store/slices/chatSlice';
import { decrementChatUnreadCount } from '@/store/slices/notificationsSlice';
import { PropsWithChildren, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { isAxiosError } from 'axios';
import { Error } from '@/lib/types';

interface Props extends PropsWithChildren {
  accessToken: string;
  conversationsData: ConversationsResponse['data'];
  tab: Role;
}

export default function ChatWrapper({ accessToken, conversationsData, tab, children }: Readonly<Props>) {
  const dispatch = useDispatch();

  const newMessageHandlerRef = useRef<((message: ChatMessages) => void) | null>(null);

  const { selectedConversation, conversationFilter, selectedRole, conversationsMeta } = useSelector(
    (state: RootState) => state.chat
  );

  const [triggerConversationsList] = useLazyGetConversationsListQuery();

  const fetchConversations = async () => {
    try {
      let currentMeta:
        | typeof conversationsMeta.admin
        | typeof conversationsMeta.patient
        | typeof conversationsMeta.provider
        | null = null;
      if (selectedRole === 'admin') {
        currentMeta = conversationsMeta.admin;
      } else if (selectedRole === 'patient') {
        currentMeta = conversationsMeta.patient;
      } else {
        currentMeta = conversationsMeta.provider;
      }

      const { sortOrder, sortField } = currentMeta || {};

      const data = await triggerConversationsList({
        page: 1,
        limit: 30,
        role: selectedRole || tab,
        ...(conversationFilter === 'Unread' && { unreadOnly: true }),
        ...(conversationFilter === 'Unresolved' && { unresolvedOnly: true }),
        ...(sortOrder && sortField && { sortOrder, sortField }),
      }).unwrap();

      if (selectedRole === 'admin') {
        dispatch(setAdminConversations(data?.conversations));
        dispatch(setAdminConversationsMeta({ ...data?.meta, sortOrder, sortField }));
      } else if (selectedRole === 'patient') {
        dispatch(setPatientsConversations(data?.conversations));
        dispatch(setPatientsConversationsMeta({ ...data?.meta, sortOrder, sortField }));
      } else {
        dispatch(setProvidersConversations(data?.conversations));
        dispatch(setProvidersConversationsMeta({ ...data?.meta, sortOrder, sortField }));
      }
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data?.message || 'Error fetching conversations'
          : (error as Error)?.data?.message || 'Error fetching conversations'
      );
    }
  };

  const handleNewMessage = (message: ChatMessages) => {
    const chatRoomId = message.chatRoomId || message.chatRoom?.id;

    if (!chatRoomId) return;

    const roleToUpdate = selectedRole || tab;
    const currentStatus = message.chatRoom?.status;
    const newStatus = currentStatus === 'resolved' ? 'unresolved' : currentStatus || 'unresolved';

    dispatch(
      updateConversationStatusByChatRoomId({
        chatRoomId,
        status: newStatus,
        message,
        role: roleToUpdate,
      })
    );
  };

  const connectSocket = (token: string, hasInitialConversations: boolean) => {
    const chatSocket = connectChatSocket(token);

    // Store handler reference for cleanup
    newMessageHandlerRef.current = handleNewMessage;

    // Helper function to set initial conversations from props
    const setInitialConversations = () => {
      // Ensure sort values are preserved when setting initial conversations
      const sortField = conversationsData.meta?.sortField || 'createdAt';
      const sortOrder = conversationsData.meta?.sortOrder || 'DESC';

      if (tab === 'admin') {
        dispatch(setAdminConversations(conversationsData.conversations));
        dispatch(setAdminConversationsMeta({ ...conversationsData.meta, sortField, sortOrder }));
      } else if (tab === 'patient') {
        dispatch(setPatientsConversations(conversationsData.conversations));
        dispatch(setPatientsConversationsMeta({ ...conversationsData.meta, sortField, sortOrder }));
      } else {
        dispatch(setProvidersConversations(conversationsData.conversations));
        dispatch(setProvidersConversationsMeta({ ...conversationsData.meta, sortField, sortOrder }));
      }
    };

    // Helper function to handle conversations setup
    const handleConversationsSetup = () => {
      if (hasInitialConversations) {
        setInitialConversations();
      } else {
        fetchConversations();
      }
    };

    // If socket is already connected, handle immediately and return early
    if (chatSocket.connected) {
      dispatch(setLoadingChats(false));
      handleConversationsSetup();
    }

    // Set up a timeout to ensure loading is set to false even if connection hangs
    // Matches socket.io timeout (10s) to avoid race conditions with slow connections
    const connectionTimeout = setTimeout(() => {
      dispatch(setLoadingChats(false));
      console.warn('Chat socket connection timeout - setting loading to false');
    }, 10000); // 10 seconds timeout - matches socket.io client timeout

    const handleConnect = async () => {
      clearTimeout(connectionTimeout);
      dispatch(setLoadingChats(false));
      handleConversationsSetup();
    };

    const handleConnectError = (error: unknown) => {
      clearTimeout(connectionTimeout);
      dispatch(setLoadingChats(false));
      console.log('Chat socket connection error:', error);
    };

    const handleDisconnect = (reason: string) => {
      console.log('Chat socket disconnected', reason);
      // Only set loading to false on disconnect if it was an error
      if (reason === 'io server disconnect' || reason === 'transport close') {
        clearTimeout(connectionTimeout);
        dispatch(setLoadingChats(false));
      }
    };

    chatSocket.on('connect', handleConnect);
    chatSocket.on('connect_error', handleConnectError);
    chatSocket.on('disconnect', handleDisconnect);

    // Listen for new messages to update conversations state
    chatSocket.on('newMessage', handleNewMessage);

    // Cleanup function to remove listeners and clear timeout
    return () => {
      clearTimeout(connectionTimeout);
      chatSocket.off('connect', handleConnect);
      chatSocket.off('connect_error', handleConnectError);
      chatSocket.off('disconnect', handleDisconnect);
      chatSocket.off('newMessage', handleNewMessage);
    };
  };

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (accessToken) {
      cleanup = connectSocket(
        accessToken,
        Boolean(conversationsData?.conversations?.length && conversationsData?.conversations?.length > 0)
      );
    }

    return () => {
      if (cleanup) {
        cleanup();
      }

      // Clean up the newMessage listener
      if (newMessageHandlerRef.current) {
        const chatSocket = connectChatSocket(accessToken);
        chatSocket.off('newMessage', newMessageHandlerRef.current);
        newMessageHandlerRef.current = null;
      }

      // Note: We don't disconnect the socket here as it's a global instance
      // that might be used by other components. The socket will be cleaned up
      // when the token changes or the app unmounts via the chatSocket module.
    };
  }, [accessToken, conversationsData, tab]);

  useEffect(() => {
    if (selectedConversation) {
      const unread = selectedConversation.unreadCount ?? 0;
      if (unread > 0) {
        const chatSocket = connectChatSocket(accessToken);
        chatSocket.emit('markAsRead', { userId: selectedConversation.otherUser?.id }, fetchConversations);
        dispatch(
          decrementChatUnreadCount({
            channel: selectedRole === 'admin' ? 'admin' : 'patient',
            amount: unread,
          })
        );
      }
      dispatch(setChatUsers(null));
      dispatch(setIsNewMessage(false));
    }
  }, [selectedConversation?.otherUser?.id, selectedConversation?.unreadCount, accessToken, selectedRole]);

  useEffect(() => {
    return () => {
      dispatch(setChatUsers(null));
      dispatch(setNewChatUser(null));
      dispatch(setIsNewMessage(false));
    };
  }, []);

  return children;
}
