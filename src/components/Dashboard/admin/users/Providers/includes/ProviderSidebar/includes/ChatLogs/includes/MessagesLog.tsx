'use client';

import Search from '@/components/Dashboard/Search';
import { ReactDatePicker } from '@/components/elements';
import { parse, format } from 'date-fns';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useLazyGetAdminChatLogsQuery } from '@/store/slices/usersApiSlice';
import { ChatLogMessage, ProviderChatLogsPatient, SentByFilter } from '@/types/users';
import { MessagesLoader } from '@/components/Dashboard/messages/MessagesLoader';
import { EmptyState } from '@/components/Dashboard/messages/MessagesEmptyState';
import { Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaFilter, FaTimes, FaSync } from 'react-icons/fa';
import { IoChatbubblesOutline } from 'react-icons/io5';
import { MessageContent } from './MessageContent';

interface Props {
  patient: ProviderChatLogsPatient;
  onOpenChatRoom?: (patient: ProviderChatLogsPatient) => void;
}

export const MessagesLog = ({ patient, onOpenChatRoom }: Readonly<Props>) => {
  const { provider } = useSelector((state: RootState) => state.provider);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [allMessages, setAllMessages] = useState<ChatLogMessage[]>([]);
  const [hasMore, setHasMore] = useState(true);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [appliedDateFrom, setAppliedDateFrom] = useState('');
  const [appliedDateTo, setAppliedDateTo] = useState('');
  const [sentBy, setSentBy] = useState<SentByFilter>('all');
  const [appliedSentBy, setAppliedSentBy] = useState<SentByFilter>('all');

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasScrolledRef = useRef(false);
  const [getAdminChatLogs, { isFetching: isLoadingMessages }] = useLazyGetAdminChatLogsQuery();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const providerId = provider?.id || '';
  const patientId = patient?.id || '';
  const patientName = [patient?.firstName, patient?.lastName].filter(Boolean).join(' ') || 'Patient';
  // Access provider info safely - provider state has a nested provider property
  // Using type assertion to match how ProviderPopup accesses it
  const providerInfo = (provider as { provider?: { firstName?: string | null; lastName?: string | null } | null })
    ?.provider;
  const providerName =
    providerInfo?.firstName && providerInfo?.lastName
      ? `${providerInfo.firstName} ${providerInfo.lastName}`.trim()
      : 'Provider';

  // Debounce search term
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 750);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, []);

  // Apply filters
  const handleApplyFilters = () => {
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);
    setAppliedSentBy(sentBy);
  };

  // Clear filters
  const handleClearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSentBy('all');
    setAppliedDateFrom('');
    setAppliedDateTo('');
    setAppliedSentBy('all');
    setSearchTerm('');
    setDebouncedSearch('');
    setPage(1);
    setAllMessages([]);
    setHasMore(true);
    setIsInitialLoad(true);
    fetchMessages(1, '', '', '', 'all');
  };

  const hasActiveFilters = appliedDateFrom || appliedDateTo || appliedSentBy !== 'all';

  // Refresh messages
  const handleRefresh = () => {
    setPage(1);
    setAllMessages([]);
    setHasMore(true);
    setIsInitialLoad(true);
    fetchMessages(1, debouncedSearch, appliedDateFrom, appliedDateTo, appliedSentBy);
  };

  // Fetch messages
  const fetchMessages = useCallback(
    async (
      pageToFetch: number,
      searchQuery: string = '',
      startDate: string = '',
      endDate: string = '',
      sentByFilter: SentByFilter = 'all'
    ) => {
      if (!patientId || !providerId) return;

      try {
        const container = scrollContainerRef.current;
        const previousScrollHeight = container?.scrollHeight ?? 0;

        const result = await getAdminChatLogs({
          providerId,
          patientId,
          page: pageToFetch,
          limit,
          query: searchQuery || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          sentBy: sentByFilter,
        }).unwrap();

        if (result?.messages) {
          const messages = [...(result.messages ?? [])].reverse();
          if (pageToFetch > 1 && !searchQuery) {
            setAllMessages((prev) => [...messages, ...prev]);

            requestAnimationFrame(() => {
              if (container) {
                const newScrollHeight = container.scrollHeight;
                container.scrollTop = newScrollHeight - previousScrollHeight;
              }
            });
          } else {
            setAllMessages(messages);
            setIsInitialLoad(false);
          }

          setHasMore(result.meta?.hasNextPage ?? false);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    },
    [patientId, providerId, limit, getAdminChatLogs]
  );

  // Fetch messages when patient changes
  useEffect(() => {
    if (patientId && providerId) {
      setPage(1);
      setAllMessages([]);
      setHasMore(true);
      setSearchTerm('');
      setDebouncedSearch('');
      setIsInitialLoad(true);
      fetchMessages(1, '', appliedDateFrom, appliedDateTo, appliedSentBy);
    }
  }, [patientId, providerId]);

  // Fetch messages when filters change
  useEffect(() => {
    if (patientId && providerId && !isInitialLoad) {
      setPage(1);
      setAllMessages([]);
      setHasMore(true);
      fetchMessages(1, debouncedSearch, appliedDateFrom, appliedDateTo, appliedSentBy);
    }
  }, [appliedDateFrom, appliedDateTo, appliedSentBy]);

  // Fetch messages when debounced search changes
  useEffect(() => {
    if (patientId && providerId && !isInitialLoad) {
      setPage(1);
      setAllMessages([]);
      setHasMore(true);
      fetchMessages(1, debouncedSearch, appliedDateFrom, appliedDateTo, appliedSentBy);
    }
  }, [debouncedSearch]);

  // Fetch more messages when page changes
  useEffect(() => {
    if (page > 1 && providerId && patientId) {
      fetchMessages(page, debouncedSearch, appliedDateFrom, appliedDateTo, appliedSentBy);
    }
  }, [page, providerId, patientId, fetchMessages]);

  // Scroll to bottom after initial messages load (only once)
  useEffect(() => {
    if (!isInitialLoad && allMessages.length > 0 && page === 1 && !debouncedSearch && !hasScrolledRef.current) {
      hasScrolledRef.current = true;
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }, [isInitialLoad, allMessages.length, page, debouncedSearch, scrollToBottom]);

  // Reset scroll flag when messages are cleared or filters change
  useEffect(() => {
    hasScrolledRef.current = false;
  }, [patientId, appliedDateFrom, appliedDateTo, appliedSentBy]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || isLoadingMessages || !hasMore || debouncedSearch) return;

    if (container.scrollTop < 100) {
      setPage((prev) => prev + 1);
    }
  }, [isLoadingMessages, hasMore, debouncedSearch]);

  const highlightText = (text: string, term: string) => {
    if (!term.trim()) return text;
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className='bg-warning px-0'>
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const isMessageFromPatient = (message: ChatLogMessage) => {
    // Use sender.role from the message response
    return message.sender?.role === 'patient';
  };

  return (
    <div className='tw-h-full tw-flex tw-flex-col tw-min-w-0 tw-overflow-hidden'>
      {/* Header */}
      <div className='tw-p-3 md:tw-p-4 tw-border-b tw-border-gray-200 tw-flex-shrink-0'>
        <div className='tw-flex tw-items-center tw-justify-between tw-mb-2'>
          <h4 className='tw-m-0 tw-text-base md:tw-text-lg tw-flex tw-items-center tw-gap-2'>
            <span className='tw-capitalize'>{patientName}</span>
            {onOpenChatRoom && (
              <OverlayTrigger placement='top' overlay={<Tooltip id='chat-tooltip'>Chat with {patientName}</Tooltip>}>
                <span className='tw-inline-flex tw-cursor-pointer hover:tw-opacity-80 tw-transition-opacity'>
                  <IoChatbubblesOutline onClick={() => onOpenChatRoom(patient)} className='tw-text-primary tw-size-5' />
                </span>
              </OverlayTrigger>
            )}
          </h4>
        </div>

        {/* Search bar with Filters and Refresh buttons */}
        {providerId && (
          <div className='tw-flex tw-gap-2 tw-items-center'>
            <div className='tw-flex-1 tw-min-w-0'>
              <Search
                isLoading={isLoadingMessages}
                placeholder='Search...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type='button'
              onClick={() => setShowFilters(!showFilters)}
              className={`tw-flex tw-items-center tw-gap-1 md:tw-gap-2 tw-px-2 md:tw-px-3 tw-py-2 tw-rounded tw-text-sm tw-border tw-transition-colors tw-whitespace-nowrap tw-flex-shrink-0 ${
                hasActiveFilters || showFilters
                  ? 'tw-bg-blue-50 tw-border-blue-300 tw-text-blue-600'
                  : 'tw-bg-gray-50 tw-border-gray-300 tw-text-gray-600 hover:tw-bg-gray-100'
              }`}
            >
              <FaFilter size={12} />
              <span className='tw-hidden sm:tw-inline'>Filters</span>
              {hasActiveFilters && (
                <span className='tw-bg-blue-500 tw-text-white tw-rounded-full tw-w-4 tw-h-4 md:tw-w-5 md:tw-h-5 tw-flex tw-items-center tw-justify-center tw-text-xs'>
                  !
                </span>
              )}
            </button>
            <button
              type='button'
              onClick={handleRefresh}
              disabled={isLoadingMessages}
              className='tw-flex tw-items-center tw-justify-center tw-p-2 tw-rounded tw-text-sm tw-border tw-border-gray-300 tw-bg-gray-50 tw-text-gray-600 hover:tw-bg-gray-100 tw-transition-colors disabled:tw-opacity-50 tw-flex-shrink-0'
              title='Refresh messages'
            >
              <FaSync size={14} className={isLoadingMessages ? 'tw-animate-spin' : ''} />
            </button>
          </div>
        )}

        {/* Filter Panel */}
        {showFilters && providerId && (
          <div className='tw-bg-gray-50 tw-rounded-lg tw-p-2 md:tw-p-3 tw-mt-2 md:tw-mt-3 tw-border tw-border-gray-200'>
            <div className='tw-grid tw-grid-cols-2 md:tw-flex md:tw-flex-wrap tw-gap-2 md:tw-gap-3 tw-items-end'>
              <div className='tw-col-span-1 md:tw-flex-1 md:tw-min-w-[160px]'>
                <label className='tw-block tw-text-xs tw-text-gray-600 tw-mb-1'>Date From</label>
                <ReactDatePicker
                  isClearable
                  selected={dateFrom ? parse(dateFrom, 'yyyy-MM-dd', new Date()) : null}
                  onChange={(date) => setDateFrom(date ? format(date, 'yyyy-MM-dd') : '')}
                  placeholderText='Select'
                  dateFormat='MM/dd/yyyy'
                  maxDate={dateTo ? parse(dateTo, 'yyyy-MM-dd', new Date()) : new Date()}
                  className='tw-text-sm'
                  popperClassName='react-datepicker-popper'
                />
              </div>
              <div className='tw-col-span-1 md:tw-flex-1 md:tw-min-w-[160px]'>
                <label className='tw-block tw-text-xs tw-text-gray-600 tw-mb-1'>Date To</label>
                <ReactDatePicker
                  isClearable
                  selected={dateTo ? parse(dateTo, 'yyyy-MM-dd', new Date()) : null}
                  onChange={(date) => setDateTo(date ? format(date, 'yyyy-MM-dd') : '')}
                  placeholderText='Select'
                  dateFormat='MM/dd/yyyy'
                  minDate={dateFrom ? parse(dateFrom, 'yyyy-MM-dd', new Date()) : undefined}
                  maxDate={new Date()}
                  className='tw-text-sm'
                  popperClassName='react-datepicker-popper'
                />
              </div>
              <div className='tw-col-span-1 md:tw-flex-1 md:tw-min-w-[120px]'>
                <label className='tw-block tw-text-xs tw-text-gray-600 tw-mb-1'>Sent By</label>
                <select
                  value={sentBy}
                  onChange={(e) => setSentBy(e.target.value as SentByFilter)}
                  className='tw-w-full tw-px-2 tw-py-1.5 tw-border tw-border-gray-300 tw-rounded tw-text-sm tw-bg-white'
                >
                  <option value='all'>Any</option>
                  <option value='patient'>Patient</option>
                  <option value='provider'>Provider</option>
                </select>
              </div>
              <div className='tw-col-span-1 tw-flex tw-gap-2 tw-justify-end md:tw-justify-start'>
                <button
                  type='button'
                  onClick={handleApplyFilters}
                  disabled={dateFrom === appliedDateFrom && dateTo === appliedDateTo && sentBy === appliedSentBy}
                  className='tw-px-3 tw-py-1.5 tw-bg-blue-500 tw-text-white tw-rounded tw-text-sm hover:tw-bg-blue-600 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed'
                >
                  Apply
                </button>
                {hasActiveFilters && (
                  <button
                    type='button'
                    onClick={handleClearFilters}
                    className='tw-px-2 md:tw-px-3 tw-py-1.5 tw-bg-gray-200 tw-text-gray-700 tw-rounded tw-text-sm hover:tw-bg-gray-300 tw-flex tw-items-center tw-gap-1'
                  >
                    <FaTimes size={10} />
                    <span className='tw-hidden sm:tw-inline'>Clear</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className='tw-flex-1 tw-overflow-y-auto tw-p-3 md:tw-p-4 tw-min-h-0 hide-scroll'
      >
        {!providerId ? (
          <EmptyState title='No Provider' subTitle='No provider selected' />
        ) : isLoadingMessages && allMessages.length === 0 ? (
          <MessagesLoader title='Loading messages...' subTitle='Please wait' />
        ) : allMessages.length === 0 ? (
          <EmptyState
            title='No Messages'
            subTitle={debouncedSearch ? 'No messages match your search' : 'No messages found'}
          />
        ) : (
          <div className='d-flex flex-column gap-3'>
            {isLoadingMessages && allMessages.length > 0 && (
              <div className='tw-flex tw-justify-center tw-py-3'>
                <Spinner size='sm' />
              </div>
            )}
            {!hasMore && allMessages.length > 0 && !debouncedSearch && (
              <div className='tw-text-center tw-text-gray-400 tw-text-xs tw-py-2'>No more messages</div>
            )}
            {allMessages.map((message) => (
              <div
                key={message.id}
                className={`d-flex ${isMessageFromPatient(message) ? 'tw-justify-end' : 'tw-justify-start'}`}
              >
                <div
                  className={`tw-max-w-[85%] md:tw-max-w-[70%] tw-p-2 md:tw-p-3 tw-rounded-lg tw-shadow-sm ${
                    isMessageFromPatient(message)
                      ? 'tw-bg-blue-50 tw-border tw-border-blue-200'
                      : 'tw-bg-gray-100 tw-border tw-border-gray-200'
                  }`}
                >
                  <div className='tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start tw-mb-1 md:tw-mb-2 tw-gap-1 md:tw-gap-3'>
                    <span className='tw-font-semibold tw-text-xs md:tw-text-sm'>
                      {isMessageFromPatient(message) ? patientName : providerName}
                    </span>
                    {message.createdAt && (
                      <span className='tw-text-[10px] md:tw-text-xs tw-text-gray-500 tw-whitespace-nowrap'>
                        {format(new Date(message.createdAt), 'M/d/yyyy h:mm a')}
                      </span>
                    )}
                  </div>
                  <MessageContent message={message} highlightText={highlightText} searchTerm={debouncedSearch} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
