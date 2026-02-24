'use client';

import ChatSidebar from '@/components/Dashboard/messages/ChatSidebar';
import ChatContentWithPatientModal from '@/components/Dashboard/messages/ChatContentWithPatientModal';
import Link from 'next/link';
import { MobileHeader } from '@/components/Dashboard/MobileHeader';
import { useEffect, useMemo, useRef, useCallback } from 'react';
import { connectChatSocket } from '@/lib/chatSocket';
import { useLazyGetConversationsListQuery } from '@/store/slices/chatApiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  setAdminConversations,
  setAdminConversationsMeta,
  setPatientsConversations,
  setPatientsConversationsMeta,
  setProvidersConversations,
  setProvidersConversationsMeta,
  type ChatConversation,
} from '@/store/slices/chatSlice';
import { BlaseMessageConversationItem } from '@/types/chat';
import { ROUTES } from '@/constants';
import { Dropdown } from 'react-bootstrap';
import { clearPatient } from '@/store/slices/patientSlice';
import { clearProvider } from '@/store/slices/providerSlice';

interface Props {
  accessToken: string;
}

export default function AdminMessages({ accessToken }: Readonly<Props>) {
  const dispatch = useDispatch<AppDispatch>();
  const socketRef = useRef<ReturnType<typeof connectChatSocket> | null>(null);

  const {
    conversations,
    conversationsMeta,
    selectedRole: role,
    conversationFilter: selectedFilter,
  } = useSelector((state: RootState) => state.chat);

  const meta = useMemo(() => {
    if (role === 'admin') return conversationsMeta.admin;
    if (role === 'patient') return conversationsMeta.patient;
    return conversationsMeta.provider;
  }, [role, conversationsMeta]);

  const { page = 1, limit = 30, sortField, sortOrder } = meta || {};

  const [triggerConversationsList] = useLazyGetConversationsListQuery();

  const getCurrentConversations = useCallback((): ChatConversation[] => {
    const roleKey = role as 'admin' | 'patient' | 'provider';
    return conversations[roleKey] || [];
  }, [conversations, role]);

  // Helper to get unique conversation key (based on DB identifiers only)
  const getConversationKey = (conversation: ChatConversation): string => {
    // Use otherUser.id as primary identifier (this is the DB key)
    if (conversation.otherUser?.id) return `user-${conversation.otherUser.id}`;
    if (conversation.chatRoom?.id) return `room-${conversation.chatRoom.id}`;

    // This should rarely happen - log warning if it does
    return `invalid-${Date.now()}-${Math.random()}`;
  };

  // Helper to merge conversations while maintaining existing order
  const mergeConversations = useCallback(
    (existingConversations: ChatConversation[], newConversations: ChatConversation[]): ChatConversation[] => {
      // Create a map of fetched conversations for quick lookup
      const fetchedMap = new Map<string, ChatConversation>();
      newConversations.forEach((conversation) => {
        const key = getConversationKey(conversation);
        if (!key.startsWith('invalid-')) {
          fetchedMap.set(key, conversation);
        }
      });

      // Update existing conversations with fresh data, maintaining their order
      const updatedExisting = existingConversations.map((existing) => {
        const key = getConversationKey(existing);
        const fetched = fetchedMap.get(key);
        if (fetched) {
          fetchedMap.delete(key); // Remove from map to track which ones are new
          return fetched; // Use fresh data from API
        }
        return existing; // Keep existing if not in fetched list
      });

      // Add any new conversations that weren't in existing list (append at the end)
      const newOnes = Array.from(fetchedMap.values());

      return [...updatedExisting, ...newOnes];
    },
    []
  );

  // Optimized fetch function with uniqueness check
  const fetchConversationsWithoutLoading = useCallback(async () => {
    try {
      const currentMeta =
        role === 'admin'
          ? conversationsMeta.admin
          : role === 'patient'
          ? conversationsMeta.patient
          : conversationsMeta.provider;

      const preservedSortOrder = sortOrder || currentMeta?.sortOrder;
      const preservedSortField = sortField || currentMeta?.sortField;

      const { conversations: fetchedConversations, meta: fetchedMeta } = await triggerConversationsList({
        page,
        limit,
        role,
        ...(selectedFilter === 'Unread' && { unreadOnly: true }),
        ...(selectedFilter === 'Unresolved' && { unresolvedOnly: true }),
        ...(preservedSortOrder &&
          preservedSortField && { sortOrder: preservedSortOrder, sortField: preservedSortField }),
      }).unwrap();

      const shouldReplace = selectedFilter !== 'All' || page === 1;
      const finalConversations = shouldReplace
        ? fetchedConversations
        : mergeConversations(getCurrentConversations(), fetchedConversations);

      // Dispatch based on role, preserving sort order
      if (role === 'admin') {
        dispatch(setAdminConversations(finalConversations));
        dispatch(
          setAdminConversationsMeta({ ...fetchedMeta, sortOrder: preservedSortOrder, sortField: preservedSortField })
        );
      } else if (role === 'patient') {
        dispatch(setPatientsConversations(finalConversations));
        dispatch(
          setPatientsConversationsMeta({ ...fetchedMeta, sortOrder: preservedSortOrder, sortField: preservedSortField })
        );
      } else {
        dispatch(setProvidersConversations(finalConversations));
        dispatch(
          setProvidersConversationsMeta({
            ...fetchedMeta,
            sortOrder: preservedSortOrder,
            sortField: preservedSortField,
          })
        );
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, [
    triggerConversationsList,
    page,
    limit,
    role,
    selectedFilter,
    sortOrder,
    sortField,
    conversationsMeta,
    getCurrentConversations,
    mergeConversations,
    dispatch,
  ]);

  // Optimized conversation item handler - refetch to respect filters and sorting
  const handleConversationItem = useCallback(
    (data: BlaseMessageConversationItem) => {
      const { conversationItem } = data;

      // Early validation - ensure we have otherUser.id or chatRoom.id
      const hasValidIdentifier = conversationItem?.otherUser?.id || conversationItem?.chatRoom?.id;
      if (!hasValidIdentifier) {
        console.warn('Invalid conversation item - missing otherUser.id and chatRoom.id:', conversationItem);
        return;
      }

      // Refetch conversations to respect current filters and sorting
      // This ensures the conversation appears only if it matches the current filter
      // and maintains the correct sort order
      fetchConversationsWithoutLoading();
    },
    [fetchConversationsWithoutLoading]
  );

  // Single useEffect to manage all socket event listeners
  useEffect(() => {
    // Connect to socket
    const socket = connectChatSocket(accessToken);
    socketRef.current = socket;

    // Wait for socket to be connected before registering listeners
    const setupListeners = () => {
      // Register all event listeners
      socket.on('conversationItem', handleConversationItem);
      socket.on('newMessage', fetchConversationsWithoutLoading);
    };

    // Check if already connected
    if (socket.connected) {
      setupListeners();
    } else {
      // Wait for connection
      socket.on('connect', setupListeners);
    }

    // Cleanup function
    return () => {
      // Remove event listeners
      socket.off('conversationItem', handleConversationItem);
      socket.off('newMessage', fetchConversationsWithoutLoading);
      socket.off('connect', setupListeners);
      dispatch(clearPatient());
      dispatch(clearProvider());
    };
  }, [accessToken, handleConversationItem, fetchConversationsWithoutLoading]);

  return (
    <>
      <div className='d-none d-lg-flex justify-content-between align-items-center mb-3'>
        <span className='text-2xl fw-semibold flex-grow-1 flex-grow-1'>Messages</span>
        <Link href={ROUTES.ADMIN_MESSAGES_TEMPLATES} className='btn btn-outline-primary btn-sm'>
          Manage Templates
        </Link>
      </div>
      <MobileHeader
        title='Messages'
        className='mb-3 d-lg-none'
        actions={
          <Dropdown.Item as={Link} href={ROUTES.ADMIN_MESSAGES_TEMPLATES}>
            Manage Templates
          </Dropdown.Item>
        }
      />
      <div className='d-flex bg-white rounded-4 overflow-hidden admin-chat chat-messages'>
        <ChatSidebar />
        <ChatContentWithPatientModal accessToken={accessToken} />
      </div>
    </>
  );
}
