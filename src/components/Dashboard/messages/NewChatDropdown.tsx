'use client';

import Search from '@/components/Dashboard/Search';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useDebounce } from '@/hooks/useDebounce';
import {
  setChatUsers,
  setChatUsersMeta,
  setIsNewMessage,
  setMessages,
  setMessagesLoading,
  setMessagesMeta,
  setNewChatUser,
  setPatientChatPaymentType,
  setPatientChatPlanName,
  setSelectedConversation,
} from '@/store/slices/chatSlice';
import {
  setIsBlaseMessaging,
  setIsSelectedAll,
  setSelectedUsers,
  setIsDialogOpen,
} from '@/store/slices/blaseMessagingSlice';
import { getChatUsers } from '@/services/chat';
import { formatProviderName } from '@/lib/utils/providerName';
import { formatUSDate } from '@/helpers/dateFormatter';
import { ChatUserType } from '@/services/chat/types';
import { AnimatePresence, motion } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import { CircularProgress } from '@/components/elements/CircularProgress';
import { MessagesLoader } from './MessagesLoader';
import { useLazyGetUserMessagesQuery } from '@/store/slices/patientChatApiSlice';

interface Props {
  inputValue: string;
  setInputValue: (ag: string) => void;
}

export const NewChatDropdown = ({ setInputValue, inputValue }: Props) => {
  const dispatch = useDispatch();

  const [isFetchingUser, setisFetchingUser] = useState(false);

  const {
    conversations,
    selectedRole,
    chatUsersMeta,
    selectedConversation,
    messages = [],
  } = useSelector((state: RootState) => state.chat);
  const chatUsers = useSelector((state: RootState) => state.chat.chatUsers || []);

  const debouncedSearchTerm = useDebounce(inputValue, 750);

  const [triggerPatientChatMessages] = useLazyGetUserMessagesQuery();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.currentTarget.value);
  };

  const handleCancel = () => {
    setInputValue('');
    dispatch(setChatUsers(null));
    dispatch(setNewChatUser(null));
    dispatch(setIsNewMessage(false));
  };

  const fetchUsers = async () => {
    setisFetchingUser(true);

    try {
      const { users, meta } = await getChatUsers(selectedRole, 1, null, debouncedSearchTerm || null);
      dispatch(setChatUsers(users));
      dispatch(setChatUsersMeta(meta));
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setisFetchingUser(false);
    }
  };

  const loadMoreUsers = async () => {
    if (isFetchingUser || (chatUsersMeta?.page ?? 1) >= (chatUsersMeta?.totalPages ?? 1)) return;

    const nextPage = (chatUsersMeta?.page ?? 1) + 1;
    try {
      const { users, meta } = await getChatUsers(selectedRole, nextPage, null, debouncedSearchTerm || null);
      dispatch(setChatUsers([...(chatUsers ?? []), ...users]));
      if (meta) {
        dispatch(setChatUsersMeta({ ...meta, page: nextPage }));
      }
    } catch (error) {
      console.error('Failed to load more users:', error);
    }
  };

  const fetchMessages = async (id: string) => {
    try {
      dispatch(setMessagesLoading(true));
      const data = await triggerPatientChatMessages({ id, page: 1, limit: 50 }).unwrap();
      dispatch(setMessages(data?.messages ?? []));
      dispatch(setMessagesMeta(data?.meta ?? null));
      dispatch(setPatientChatPaymentType(data?.paymentType));
      dispatch(setPatientChatPlanName(data?.planName));
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(setMessagesLoading(false));
    }
  };

  const handleUserClick = async (chatUser: ChatUserType) => {
    const existedConversation = conversations[selectedRole as 'patient' | 'provider']?.find(
      (item) => item.otherUser?.id === chatUser.id
    );

    if (existedConversation) {
      // Clear messages if switching to a different conversation
      if (
        messages.length > 0 &&
        selectedConversation &&
        selectedConversation?.otherUser?.id !== existedConversation.otherUser?.id
      ) {
        dispatch(setMessages([]));
      }

      dispatch(setSelectedConversation(existedConversation));
      dispatch(setIsNewMessage(false));
      dispatch(setNewChatUser(null));
      dispatch(setIsBlaseMessaging(false));
      dispatch(setIsDialogOpen(false));
      dispatch(setIsSelectedAll(false));
      dispatch(setSelectedUsers([]));

      // Only fetch messages if switching to a different conversation
      if (existedConversation.otherUser?.id !== selectedConversation?.otherUser?.id) {
        fetchMessages(chatUser.id);
      }
    } else {
      dispatch(setNewChatUser(chatUser));
    }

    dispatch(setChatUsers(null));
    setInputValue('');
  };

  const renderContent = () => {
    if (isFetchingUser && chatUsers.length === 0) {
      return <MessagesLoader title='Loading...' subTitle='Please wait while we fetch users' />;
    }

    if (chatUsers.length > 0) {
      return (
        <InfiniteScroll
          dataLength={chatUsers.length}
          next={loadMoreUsers}
          hasMore={(chatUsersMeta?.page ?? 1) < (chatUsersMeta?.totalPages ?? 1)}
          loader={
            <div className='tw-py-5 tw-flex tw-justify-center'>
              <CircularProgress />
            </div>
          }
          height='227px'
        >
          {chatUsers.map((chatUser) => (
            <button
              key={chatUser.id}
              className='btn-transparent tw-flex tw-items-center tw-border-0 tw-w-full tw-text-start tw-py-2 tw-px-3 hover:tw-bg-neutral-50 tw-transition-all tw-rounded-md'
              onClick={() => handleUserClick(chatUser)}
            >
              <div
                className='tw-mr-4 tw-text-sm tw-uppercase tw-bg-neutral-100 tw-rounded-full tw-w-8 tw-h-8 tw-min-w-8 tw-min-h-8 tw-flex tw-items-center tw-justify-center tw-flex-shrink-0'
                style={{ aspectRatio: '1/1' }}
              >
                {chatUser.firstName[0]}
              </div>
              <span className='tw-text-sm'>
                <span className='tw-capitalize'>
                  {chatUser.role === 'provider'
                    ? formatProviderName(chatUser.firstName, chatUser.lastName)
                    : [chatUser.firstName, chatUser.lastName].filter(Boolean).join(' ')}
                </span>
                {chatUser.dob && (
                  <>
                    {' - '}
                    {formatUSDate(chatUser.dob)}
                  </>
                )}
                {chatUser.email && (
                  <>
                    {' - '}
                    <span className='tw-normal-case'>{chatUser.email}</span>
                  </>
                )}
              </span>
            </button>
          ))}
        </InfiniteScroll>
      );
    }

    return (
      <div className='tw-flex tw-items-center tw-justify-center tw-h-full tw-text-neutral-500 tw-text-sm tw-py-8 tw-px-4'>
        {inputValue
          ? 'No matching users found. Check spelling or try searching by email.'
          : `Start typing to search ${selectedRole}s`}
      </div>
    );
  };

  useEffect(() => {
    if (selectedRole) {
      fetchUsers();
    }
  }, [debouncedSearchTerm, selectedRole]);

  return (
    <>
      <div className='newChatBackDrop' />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className='tw-absolute tw-left-3 tw-z-50 tw-shadow-lg tw-border tw-border-neutral-200 md:tw-left-6 tw-max-w-[calc(100%-24px)] tw-min-h-80 tw-w-[600px] tw-bg-white tw-rounded-lg tw-py-4 tw-flex tw-flex-col -tw-top-3'
        >
          <button
            onClick={handleCancel}
            className='tw-p-1 tw-rounded-md hover:tw-bg-neutral-100 tw-transition-all tw-text-neutral-600 hover:tw-text-neutral-900 tw-absolute tw-top-1.5 tw-right-1.5'
            aria-label='Close dialog'
          >
            <IoClose size={20} />
          </button>
          <div className='tw-space-y-3 tw-mb-3 tw-px-4'>
            <div className='tw-flex tw-items-center tw-justify-between'>
              <span className='tw-font-medium tw-capitalize'>{selectedRole + 's List'}</span>
            </div>
            <Search
              isLoading={isFetchingUser}
              autoFocus
              onChange={handleInputChange}
              value={inputValue}
              placeholder={`Search ${selectedRole}s...`}
            />
          </div>

          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </>
  );
};
