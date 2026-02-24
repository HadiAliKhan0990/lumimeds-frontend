'use client';

import InfiniteScroll from 'react-infinite-scroll-component';
import Loading from '@/components/Dashboard/Loading';
import Search from '@/components/Dashboard/Search';
import toast from 'react-hot-toast';
import { useCallback, useMemo, useState } from 'react';
import { LuSquarePen } from 'react-icons/lu';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  ConversationFilter,
  setChatUsers,
  setChatUsersMeta,
  setConversationFilter,
  setIsNewMessage,
  setLoadingChats,
  setMessages,
  setMessagesMeta,
  setPatientsConversations,
  setPatientsConversationsMeta,
  setProvidersConversations,
  setProvidersConversationsMeta,
  setSelectedConversation,
} from '@/store/slices/chatSlice';
import { getChatUsers } from '@/services/chat';
import { debounce } from 'lodash';
import { useWindowWidth } from '@/hooks/useWindowWidth';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { UserConversationCard } from '@/components/Dashboard/messages/UserConversationCard';
import { useLazyGetConversationsListQuery } from '@/store/slices/chatApiSlice';
import { MessagesLoader } from '@/components/Dashboard/messages/MessagesLoader';
import { EmptyState } from '@/components/Dashboard/messages/MessagesEmptyState';
import { ChatFiltersDropdown } from '@/components/Dashboard/messages/ChatFiltersDropdown';
import { RoleTabs } from '@/components/Dashboard/messages/RoleTabs';
import { FilterButton } from '@/components/Dashboard/messages/FilterButton';
import { usePathname } from 'next/navigation';
import { NewConversationDropdown } from '@/components/Dashboard/messages/NewConversationDropdown';
import { isAxiosError } from 'axios';
import { Error } from '@/lib/types';

export default function ChatSidebar() {
  const dispatch = useDispatch();
  const { windowWidth } = useWindowWidth();
  const pathname = usePathname();

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const [triggerConversationsList] = useLazyGetConversationsListQuery();

  const {
    conversations,
    selectedConversation,
    isNewMessage,
    conversationsMeta,
    isLoadingChats,
    filtersLoading,
    selectedRole: role,
    conversationFilter: selectedFilter,
  } = useSelector((state: RootState) => state.chat);

  const { isBlaseMessaging } = useSelector((state: RootState) => state.blaseMessaging);

  const meta = useMemo(() => {
    if (role === 'admin') return conversationsMeta.admin;
    if (role === 'patient') return conversationsMeta.patient;
    return conversationsMeta.provider;
  }, [role, conversationsMeta]);

  const { page = 1, limit = 30, totalPages = 1, sortField, sortOrder, stats } = meta || {};

  const counts = useMemo(() => {
    return (stats?.totalConversations || 0) + (stats?.unreadConversations || 0) + (stats?.unresolvedConversations || 0);
  }, [stats]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setSearch(value);
    debounceFn(value);
  };

  const debouncedSearch = async (value: string) => {
    try {
      const currentMeta =
        role === 'admin'
          ? conversationsMeta.admin
          : role === 'patient'
          ? conversationsMeta.patient
          : conversationsMeta.provider;
      
      const preservedStats = currentMeta?.stats;

      const { conversations, meta } = await triggerConversationsList({
        search: value,
        page: 1, // Always reset to page 1 when searching
        limit,
        role,
        ...(selectedFilter === 'Unread' && { unreadOnly: true }),
        ...(selectedFilter === 'Unresolved' && { unresolvedOnly: true }),
        ...(sortOrder && sortField && { sortOrder, sortField }),
      }).unwrap();

      // Preserve overall stats when searching with filters applied
      const finalMeta = {
        ...meta,
        sortOrder,
        sortField,
        search: value,
        stats: selectedFilter === 'All' ? meta?.stats : preservedStats || meta?.stats,
      };

      if (role === 'patient') {
        dispatch(setPatientsConversations(conversations));
        dispatch(setPatientsConversationsMeta(finalMeta));
      } else {
        dispatch(setProvidersConversations(conversations));
        dispatch(setProvidersConversationsMeta(finalMeta));
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const debounceFn = useCallback(debounce(debouncedSearch, 1000), [
    role,
    selectedFilter,
    meta?.sortField,
    meta?.sortOrder,
    meta?.page,
    meta?.limit,
  ]);

  const handleNewMessage = async () => {
    const newIsNewMessage = !isNewMessage;

    if (windowWidth > 992) {
      dispatch(setIsNewMessage(newIsNewMessage));
    }

    if (newIsNewMessage) {
      dispatch(setChatUsers(null));
      dispatch(setSelectedConversation(null));
      dispatch(setMessages(null));
      dispatch(setMessagesMeta(null));
    } else if (!conversations || conversations[role as 'patient' | 'provider'].length === 0) {
      try {
        const currentMeta =
          role === 'admin'
            ? conversationsMeta.admin
            : role === 'patient'
            ? conversationsMeta.patient
            : conversationsMeta.provider;
        
        const preservedStats = currentMeta?.stats;

        const data = await triggerConversationsList({
          page: 1,
          limit,
          role,
          ...(search && { search }),
          ...(selectedFilter === 'Unread' && { unreadOnly: true }),
          ...(selectedFilter === 'Unresolved' && { unresolvedOnly: true }),
          ...(sortOrder && sortField && { sortOrder, sortField }),
        }).unwrap();

        const finalMeta = {
          ...data?.meta,
          sortOrder,
          sortField,
          stats: selectedFilter === 'All' ? data?.meta?.stats : preservedStats || data?.meta?.stats,
        };

        if (role === 'patient') {
          dispatch(setPatientsConversations(data?.conversations));
          dispatch(setPatientsConversationsMeta(finalMeta));
        } else {
          dispatch(setProvidersConversations(data?.conversations));
          dispatch(setProvidersConversationsMeta(finalMeta));
        }
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
      }
    }
  };

  const handleRoleSelection = async () => {
    const { users, meta } = await getChatUsers(role, 1);
    dispatch(setChatUsers(users));
    dispatch(setChatUsersMeta(meta));

    if (windowWidth <= 992) {
      dispatch(setIsNewMessage(true));
    }
  };

  const handleFilterConversations = async (filter: ConversationFilter) => {
    try {
      dispatch(setLoadingChats(true));
      dispatch(setConversationFilter(filter));

      const currentMeta =
        role === 'admin'
          ? conversationsMeta.admin
          : role === 'patient'
          ? conversationsMeta.patient
          : conversationsMeta.provider;

      const preservedSortOrder = currentMeta?.sortOrder;
      const preservedSortField = currentMeta?.sortField;
      // Preserve overall stats - only update stats when filter is 'All'
      const preservedStats = currentMeta?.stats;

      const data = await triggerConversationsList({
        page: 1,
        limit: 30,
        role,
        ...(search && { search }),
        ...(filter === 'Unread' && { unreadOnly: true }),
        ...(filter === 'Unresolved' && { unresolvedOnly: true }),
        ...(preservedSortOrder &&
          preservedSortField && { sortOrder: preservedSortOrder, sortField: preservedSortField }),
      }).unwrap();

      const { conversations = [], meta: newMeta } = data || {};

      // Only update stats when fetching 'All' conversations, otherwise preserve existing stats
      const finalMeta = {
        ...newMeta,
        sortOrder: preservedSortOrder,
        sortField: preservedSortField,
        // Preserve overall stats unless we're fetching all conversations
        stats: filter === 'All' ? newMeta?.stats : preservedStats || newMeta?.stats,
      };

      if (role === 'patient') {
        dispatch(setPatientsConversations(conversations));
        dispatch(setPatientsConversationsMeta(finalMeta));
      } else {
        dispatch(setProvidersConversations(conversations));
        dispatch(setProvidersConversationsMeta(finalMeta));
      }
      dispatch(setSelectedConversation(undefined));
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data?.message || 'Error fetching conversations'
          : (error as Error)?.data?.message || 'Error fetching conversations'
      );
    } finally {
      dispatch(setLoadingChats(false));
    }
  };

  const fetchConversations = useCallback(async () => {
    if (isLoadingChats || loading) return;
    try {
      setLoading(true);
      const nextPage = (page || 1) + 1;
      const { conversations: fetched = [], meta: newMeta } = await triggerConversationsList({
        page: nextPage,
        limit,
        role,
        ...(search && { search }),
        ...(selectedFilter === 'Unread' && { unreadOnly: true }),
        ...(selectedFilter === 'Unresolved' && { unresolvedOnly: true }),
        ...(sortOrder && sortField && { sortOrder, sortField }),
      }).unwrap();
      const term = (search || '').trim().toLowerCase();
      const firstMatches = term
        ? fetched.filter((c) => (c.otherUser?.firstName || '').toLowerCase().includes(term))
        : fetched;
      const filteredFetched =
        term && firstMatches.length === 0
          ? fetched.filter((c) => (c.otherUser?.lastName || '').toLowerCase().includes(term))
          : firstMatches;

      if (role === 'patient') {
        dispatch(setPatientsConversations([...(conversations.patient ?? []), ...filteredFetched]));
        dispatch(setPatientsConversationsMeta({ ...newMeta, sortOrder, sortField }));
      } else {
        dispatch(setProvidersConversations([...(conversations.provider ?? []), ...filteredFetched]));
        dispatch(setProvidersConversationsMeta({ ...newMeta, sortOrder, sortField }));
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [isLoadingChats, loading, page, limit, role, search, selectedFilter, sortOrder, sortField, conversations]);

  const isShowNewConversationDropdown = useMemo(
    () => role === 'patient' && pathname.includes('/admin'),
    [pathname, role]
  );

  const currentConversations = useMemo(() => {
    return conversations[role as 'patient' | 'provider' | 'admin'] || [];
  }, [conversations, role]);

  const allConversationsLoaded = (page || 1) >= (totalPages || 1);

  const renderSidebarContent = () => {
    if (isLoadingChats || (filtersLoading && currentConversations.length === 0)) {
      return <MessagesLoader title='Loading...' subTitle='Please wait while we fetch your conversations' />;
    }

    if (currentConversations.length > 0) {
      return (
        <InfiniteScroll
          style={{ height: '100%' }}
          dataLength={currentConversations.length}
          next={fetchConversations}
          hasMore={!allConversationsLoaded}
          loader={
            <div className='py-4 d-flex justify-content-center align-items-center'>
              <Loading />
            </div>
          }
          scrollableTarget='chat-sidebar-scrollable'
          className='tw-overflow-visible !tw-h-full'
          height={'100%'}
        >
          {currentConversations.map((conversation) => (
            <UserConversationCard key={conversation.otherUser?.id} conversation={conversation} />
          ))}
        </InfiniteScroll>
      );
    }

    return <EmptyState title='No Conversations available' subTitle='New conversations will appear here' />;
  };

  return (
    <div
      className={`chat-sidebar p-3 flex-column ${counts > 0 ? 'unread-count' : ''} ${
        isNewMessage || selectedConversation || isBlaseMessaging ? 'hidden' : 'd-flex'
      }`}
    >
      <RoleTabs />
      {role === 'admin' ? null : (
        <>
          <div className='mb-3 d-flex align-items-center gap-3 px-2'>
            <Search onChange={handleSearch} value={search} placeholder='Search...' className='flex-grow-1' />
            <ChatFiltersDropdown search={search} />
            {isShowNewConversationDropdown ? (
              <NewConversationDropdown handleRoleSelection={handleRoleSelection} handleNewMessage={handleNewMessage} />
            ) : (
              <OverlayTrigger overlay={<Tooltip className='text-none text-xs'>Start a new conversation</Tooltip>}>
                <button
                  onClick={handleRoleSelection}
                  type='button'
                  className='border bg-transparent p-0 flex-shrink-0 d-flex align-items-center justify-content-center conversations_filters_toggler'
                >
                  <LuSquarePen onClick={handleNewMessage} size={24} />
                </button>
              </OverlayTrigger>
            )}
          </div>
          <div className='flex-shrink-0 d-flex align-items-center gap-2 mb-3 overflow-x-auto px-2'>
            {['All', 'Unread', 'Unresolved'].map((title, idx) => (
              <FilterButton
                key={title}
                title={title}
                index={idx}
                handleFilterConversations={handleFilterConversations}
              />
            ))}
          </div>
        </>
      )}
      <div id='chat-sidebar-scrollable' className='flex-grow-1 overflow-y-auto tw-h-full'>
        {renderSidebarContent()}
      </div>
    </div>
  );
}
