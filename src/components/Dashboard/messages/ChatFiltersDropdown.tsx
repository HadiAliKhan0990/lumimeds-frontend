'use client';

import { useMemo, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { BsFilterLeft } from 'react-icons/bs';
import { FiltersToggle } from '@/components/Dashboard/messages/FiltersToggle';
import { useLazyGetConversationsListQuery } from '@/store/slices/chatApiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  ConversationSortFieldType,
  ConversationSortOrderType,
  setAdminConversations,
  setAdminConversationsMeta,
  setPatientsConversations,
  setProvidersConversations,
  setPatientsConversationsMeta,
  setProvidersConversationsMeta,
  setFiltersLoading,
} from '@/store/slices/chatSlice';

interface SortOption {
  label: string;
  value: 'newest' | 'oldest' | 'asc' | 'desc' | 'reset';
}

interface Props {
  search?: string;
}

export const ChatFiltersDropdown = ({ search }: Props) => {
  const dispatch = useDispatch();

  const [selectedSort, setSelectedSort] = useState<SortOption['value'] | undefined>();

  const selectedFilter = useSelector((state: RootState) => state.chat.conversationFilter);
  const selectedRole = useSelector((state: RootState) => state.chat.selectedRole);
  const conversationsMeta = useSelector((state: RootState) => state.chat.conversationsMeta);

  const meta = useMemo(() => {
    if (selectedRole === 'admin') return conversationsMeta.admin;
    if (selectedRole === 'patient') return conversationsMeta.patient;
    return conversationsMeta.provider;
  }, [selectedRole, conversationsMeta]);

  const { limit = 30 } = meta || {};

  const [triggerConversationsList] = useLazyGetConversationsListQuery();

  async function filterConversations(
    sortOrder?: ConversationSortOrderType,
    sortField?: ConversationSortFieldType,
    reset?: boolean
  ) {
    try {
      dispatch(setFiltersLoading(true));
      const { conversations, meta: newMeta } = await triggerConversationsList({
        page: 1,
        limit,
        role: selectedRole,
        ...(search && { search }),
        ...(selectedFilter === 'Unread' && { unreadOnly: true }),
        ...(selectedFilter === 'Unresolved' && { unresolvedOnly: true }),
        ...(sortOrder && sortField && !reset && { sortOrder, sortField }),
      }).unwrap();
      if (selectedRole === 'admin') {
        dispatch(setAdminConversations(conversations));
        dispatch(setAdminConversationsMeta({ ...newMeta, sortOrder, sortField }));
      } else if (selectedRole === 'patient') {
        dispatch(setPatientsConversations(conversations));
        dispatch(setPatientsConversationsMeta({ ...newMeta, sortOrder, sortField }));
      } else {
        dispatch(setProvidersConversations(conversations));
        dispatch(setProvidersConversationsMeta({ ...newMeta, sortOrder, sortField }));
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      dispatch(setFiltersLoading(false));
    }
  }

  const handleSelect = (value: SortOption['value']) => {
    switch (value) {
      case 'newest':
        setSelectedSort(value);
        filterConversations('DESC', 'createdAt');
        break;
      case 'oldest':
        setSelectedSort(value);
        filterConversations('ASC', 'createdAt');
        break;
      case 'asc':
        setSelectedSort(value);
        filterConversations('ASC', 'name');
        break;
      case 'desc':
        setSelectedSort(value);
        filterConversations('DESC', 'name');
        break;
      case 'reset':
        if (['newest', 'oldest', 'asc', 'desc'].includes(selectedSort ?? '')) {
          setSelectedSort(undefined);
          filterConversations();
        }
        break;
    }
  };

  const sortOptions: SortOption[] = useMemo(() => {
    if (['newest', 'oldest', 'asc', 'desc'].includes(selectedSort ?? '')) {
      return [
        { label: 'Newest', value: 'newest' },
        { label: 'Oldest', value: 'oldest' },
        { label: 'Alphabetical (A-Z)', value: 'asc' },
        { label: 'Alphabetical (Z-A)', value: 'desc' },
        { label: 'Clear Filters', value: 'reset' },
      ];
    } else {
      return [
        { label: 'Newest', value: 'newest' },
        { label: 'Oldest', value: 'oldest' },
        { label: 'Alphabetical (A-Z)', value: 'asc' },
        { label: 'Alphabetical (Z-A)', value: 'desc' },
      ];
    }
  }, [selectedSort]);
  return (
    <Dropdown className='chat_filters_dropdown'>
      <Dropdown.Toggle title='Filters' as={FiltersToggle}>
        <BsFilterLeft size={24} className='flex-shrink-0' />
      </Dropdown.Toggle>
      <Dropdown.Menu className='shadow border-light'>
        {sortOptions.map((option) => (
          <Dropdown.Item
            as='button'
            key={option.value}
            active={selectedSort === option.value}
            onClick={() => handleSelect(option.value)}
          >
            {option.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};
