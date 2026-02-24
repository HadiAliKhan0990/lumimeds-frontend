'use client';

import Search from '@/components/Dashboard/Search';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getChatUsers } from '@/services/chat';
import { debounce } from 'lodash';
import { ChatUserType } from '@/services/chat/types';
import { BlastUserCard } from './BlastUserCard';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  setIsDialogOpen,
  setIsSelectedAll,
  setSelectedUsers,
  setIsSendEmail,
  setIsBlaseMessaging,
} from '@/store/slices/blaseMessagingSlice';
import { AnimatePresence, motion } from 'framer-motion';
import { CircularProgress } from '@/components/elements/CircularProgress';
import { MessagesLoader } from '@/components/Dashboard/messages/MessagesLoader';
import { useWindowWidth } from '@/hooks/useWindowWidth';
import { IoClose } from 'react-icons/io5';

export const UsersDialog = () => {
  const hasInitiallyLoaded = useRef(false);
  const dispatch = useDispatch<AppDispatch>();
  const { windowWidth } = useWindowWidth();

  const { isSelectedAll, selectedUsers, isDialogOpen, isSendEmail } = useSelector(
    (state: RootState) => state.blaseMessaging
  );

  const [inputValue, setInputValue] = useState('');
  const [users, setUsers] = useState<ChatUserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setInputValue(value);
    setPage(1);
    debouncedSearch(value);
  };

  const handleSelectAll = () => {
    dispatch(setIsSelectedAll(true));
    dispatch(setSelectedUsers([]));
  };

  const handleUnselectAll = () => {
    dispatch(setIsSelectedAll(false));
    dispatch(setSelectedUsers([]));
  };

  const handleCompleteSelection = () => {
    dispatch(setIsDialogOpen(false));
  };

  const handleCloseDialog = () => {
    dispatch(setIsDialogOpen(false));
    dispatch(setIsBlaseMessaging(false));
    dispatch(setIsSelectedAll(false));
    dispatch(setSelectedUsers([]));
  };

  const handleToggleSendEmail = () => {
    dispatch(setIsSendEmail(!isSendEmail));
  };

  const searchUsers = async (searchTerm: string, pageNum: number = 1) => {
    try {
      setLoading(true);
      const { users: fetchedUsers, meta } = await getChatUsers('patient', pageNum, 10, searchTerm || null);
      setUsers(fetchedUsers || []);
      setTotalPages(meta.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreUsers = async () => {
    if (loading || page >= totalPages) return;

    try {
      const nextPage = page + 1;
      const { users: fetchedUsers, meta } = await getChatUsers('patient', nextPage, 10, inputValue || null);
      setUsers((prevUsers) => [...prevUsers, ...(fetchedUsers || [])]);
      setTotalPages(meta.totalPages);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more patients:', error);
    }
  };

  const hasSelection = useMemo(() => isSelectedAll || selectedUsers.length > 0, [isSelectedAll, selectedUsers]);

  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      searchUsers(searchTerm, 1);
    }, 750),
    []
  );

  const maxVisible = useMemo(() => (windowWidth > 768 ? 7 : 3), [windowWidth]);

  useEffect(() => {
    if (hasInitiallyLoaded.current || loading) return;

    // Initial load
    hasInitiallyLoaded.current = true;
    searchUsers('', 1);

    // Cleanup debounce on unmount
    return () => {
      debouncedSearch.cancel();
    };
  }, []);

  const renderContent = () => {
    if (loading && users.length === 0) {
      return <MessagesLoader title='Loading...' subTitle='Please wait while we fetch patients' />;
    }

    if (users.length > 0) {
      return (
        <InfiniteScroll
          dataLength={users.length}
          next={loadMoreUsers}
          hasMore={page < totalPages}
          loader={
            <div className='tw-py-5 tw-flex tw-justify-center'>
              <CircularProgress />
            </div>
          }
          height='227px'
          className='tw-space-y-3 tw-px-4'
        >
          {users.map((user) => (
            <BlastUserCard user={user} key={user.id} />
          ))}
        </InfiniteScroll>
      );
    }

    return (
      <div className='tw-flex tw-items-center tw-justify-center tw-h-full tw-text-neutral-500 tw-text-sm tw-flex-grow'>
        {inputValue ? 'No patients found' : 'Start typing to search patients'}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isDialogOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={
            'tw-absolute tw-left-3 tw-z-50 tw-shadow-lg tw-border tw-border-neutral-200 md:tw-left-6 tw-min-h-96 tw-max-w-[calc(100%-24px)] tw-w-[400px] tw-bg-white tw-rounded-lg tw-py-4 tw-flex tw-flex-col blast_users_dialog' +
            (selectedUsers.length > maxVisible ? ' exceeded_limit_dialog' : '')
          }
        >
          <button
            type='button'
            onClick={handleCloseDialog}
            className='tw-p-1 tw-rounded-md hover:tw-bg-neutral-100 tw-transition-all tw-text-neutral-600 hover:tw-text-neutral-900 tw-absolute tw-top-1.5 tw-right-1.5'
            aria-label='Close dialog'
          >
            <IoClose size={20} />
          </button>
          <div className='tw-space-y-3 tw-mb-3 tw-px-4'>
            <div className='tw-flex tw-items-center tw-justify-between'>
              <span className='tw-font-medium'>Patients</span>
            </div>
            <Search
              isLoading={loading}
              autoFocus
              onChange={handleInputChange}
              value={inputValue}
              placeholder='Search patients...'
            />
            <div className='tw-flex tw-items-center tw-gap-2 tw-px-1'>
              <input
                type='checkbox'
                id='sendEmail'
                checked={isSendEmail}
                onChange={handleToggleSendEmail}
                className='tw-w-4 tw-h-4 tw-cursor-pointer tw-accent-primary'
              />
              <label htmlFor='sendEmail' className='tw-text-sm tw-cursor-pointer tw-select-none tw-mb-0'>
                Send email notification
              </label>
              <span className='tw-flex-grow' />

              {inputValue.length === 0 &&
                (isSelectedAll ? (
                  <button
                    onClick={handleUnselectAll}
                    className='tw-text-xs tw-text-red-500 tw-font-medium hover:tw-underline tw-transition-all tw-p-0'
                  >
                    Remove All
                  </button>
                ) : (
                  <button
                    onClick={handleSelectAll}
                    className='tw-text-xs tw-text-primary tw-font-medium hover:tw-underline tw-transition-all tw-p-0'
                  >
                    Send to All
                  </button>
                ))}
            </div>
          </div>

          {renderContent()}

          <div className='tw-px-4 tw-mt-3'>
            <button onClick={handleCompleteSelection} disabled={!hasSelection} className='btn btn-primary tw-w-full'>
              Complete Selection
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
