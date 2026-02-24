'use client';

import { Modal, ReactDatePicker, AutoLink } from '@/components/elements';
import Search from '@/components/Dashboard/Search';
import { parse, format } from 'date-fns';
import { useState, useEffect, useCallback, useRef, useMemo, CSSProperties, Fragment } from 'react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setModal } from '@/store/slices/modalSlice';
import { useLazyGetAdminChatLogsQuery } from '@/store/slices/usersApiSlice';
import { ChatLogMessage, SentByFilter } from '@/types/users';
import { MessagesLoader } from '@/components/Dashboard/messages/MessagesLoader';
import { EmptyState } from '@/components/Dashboard/messages/MessagesEmptyState';
import { Spinner } from 'react-bootstrap';
import { extractS3Key } from '@/lib/helper';
import { FaFilter, FaTimes, FaSync } from 'react-icons/fa';
import { client } from '@/lib/baseQuery';
import { AiFillFilePdf } from 'react-icons/ai';
import { AsyncImage } from 'loadable-image';
import { Blur } from 'transitions-kit';
import { useDynamicImageSize } from '@/hooks/useDynamicImageSize';
import { parseLinks } from '@/lib/linkUtils';

interface ProviderInfo {
  id: string;
  name: string;
}

interface ModalContext {
  patientId?: string;
  providerId?: string;
  providerName?: string;
  mode?: 'patient' | 'order'; // 'patient' shows provider list, 'order' shows chat directly
}

// URL cache for signed URLs
const urlCache = new Map<string, { url: string; expiresAt: number }>();

interface MessageContentProps {
  message: ChatLogMessage;
  highlightText: (text: string, term: string) => React.ReactNode;
  searchTerm: string;
}

function MessageContent({ message, highlightText, searchTerm }: MessageContentProps) {
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const fileUrl = message.metadata?.fileUrl || (message.metadata?.isAttachment ? message.content : null);
  const isImage = fileUrl?.match(/\.(jpeg|jpg|png|gif|webp)$/i);
  const isPdf = fileUrl?.match(/\.pdf$/i);

  // Helper function to apply link detection to highlighted text
  const renderContentWithLinks = (content: string): React.ReactNode => {
    if (!content) return null;
    
    // Apply link detection first, then apply highlighting to the result
    // This ensures links are preserved while still allowing search highlighting
    const linkParts = parseLinks(content);
    
    // Convert link parts to a string representation for highlighting
    // We'll process each part separately
    const processPart = (part: { type: string; content: string; url?: string }): React.ReactNode => {
      if (part.type === 'link' && part.url) {
        // For links, render as link (highlighting will be applied if search term matches)
        const highlighted = highlightText(part.content, searchTerm);
        return (
          <AutoLink href={part.url}>
            {highlighted}
          </AutoLink>
        );
      }
      // For text parts, apply highlighting
      return highlightText(part.content, searchTerm);
    };
    
    return linkParts.map((part, index) => (
      <Fragment key={index}>{processPart(part)}</Fragment>
    ));
  };

  const { isLoading: isImageLoading, height } = useDynamicImageSize(url, 300);

  useEffect(() => {
    if (!fileUrl) return;

    const fetchSignedUrl = async () => {
      // Extract the S3 key from the URL (handles both full URLs and keys)
      const fileKey = extractS3Key(fileUrl);

      // Check cache first
      const cached = urlCache.get(fileKey);
      if (cached && Date.now() < cached.expiresAt) {
        setUrl(cached.url);
        return;
      }

      setIsLoading(true);
      try {
        const { data } = await client.get(`/chat/file-url?key=${encodeURIComponent(fileKey)}`);
        if (data.data?.url) {
          const signedUrl = data.data.url;
          // Cache for 5 minutes
          urlCache.set(fileKey, { url: signedUrl, expiresAt: Date.now() + 5 * 60 * 1000 });
          setUrl(signedUrl);
        }
      } catch (error) {
        console.error('Error fetching file URL:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSignedUrl();
  }, [fileUrl]);

  // Max height for images - used as placeholder until actual height is calculated
  const MAX_IMAGE_HEIGHT = 300;
  // Use max height as placeholder, then actual height (capped at max) when available
  const imageHeight = isImageLoading ? MAX_IMAGE_HEIGHT : Math.min(height, MAX_IMAGE_HEIGHT);

  // If there's a file attachment
  if (fileUrl) {
    // Image handling with max height placeholder
    if (isImage) {
      if (!url) {
        return (
          <div className='tw-flex tw-flex-col tw-gap-2'>
            <div
              style={{ '--dynamic-height': `${MAX_IMAGE_HEIGHT}px` } as CSSProperties}
              className='placeholder-glow chat_image rounded'
            >
              <span className='placeholder h-100 col-12' />
            </div>
          </div>
        );
      }

      return (
        <div className='tw-flex tw-flex-col tw-gap-2'>
          <div
            className={'chat_image' + (isLoading || isImageLoading ? ' rounded overflow-hidden' : '')}
            style={{ '--dynamic-height': `${imageHeight}px` } as CSSProperties}
          >
            {isLoading || isImageLoading ? (
              <div className='placeholder-glow w-100 h-100'>
                <span className='placeholder h-100 col-12' />
              </div>
            ) : (
              <AsyncImage
                onClick={() => window.open(url, '_blank')}
                Transition={Blur}
                loader={
                  <div className='placeholder-glow w-100 h-100'>
                    <span className='placeholder h-100 col-12' />
                  </div>
                }
                src={url}
                alt='Attachment'
                style={{ '--dynamic-height': `${imageHeight}px` } as CSSProperties}
                className='chat_image cursor-pointer rounded'
              />
            )}
          </div>
          {message.content && !message.metadata?.isAttachment && (
            <div className='tw-text-sm'>{renderContentWithLinks(message.content)}</div>
          )}
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className='tw-flex tw-items-center tw-gap-2 tw-text-gray-500'>
          <Spinner size='sm' />
          <span>Loading attachment...</span>
        </div>
      );
    }

    if (isPdf && url) {
      return (
        <div className='tw-flex tw-flex-col tw-gap-2'>
          <a
            href={url}
            target='_blank'
            rel='noopener noreferrer'
            className='tw-flex tw-items-center tw-gap-2 tw-text-blue-600 hover:tw-text-blue-800'
          >
            <AiFillFilePdf size={24} className='tw-text-red-500' />
            <span>View PDF</span>
          </a>
          {message.content && !message.metadata?.isAttachment && (
            <div className='tw-text-sm'>{renderContentWithLinks(message.content)}</div>
          )}
        </div>
      );
    }

    // Non-image/pdf file
    if (url) {
      return (
        <div className='tw-flex tw-flex-col tw-gap-2'>
          <a
            href={url}
            target='_blank'
            rel='noopener noreferrer'
            className='tw-text-blue-600 hover:tw-text-blue-800 tw-underline'
          >
            View Attachment
          </a>
          {message.content && !message.metadata?.isAttachment && (
            <div className='tw-text-sm'>{renderContentWithLinks(message.content)}</div>
          )}
        </div>
      );
    }
  }

  // Regular text message
  return <div className='tw-text-sm'>{renderContentWithLinks(message.content || '')}</div>;
}

export const ProviderPatientChatModal = () => {
  const dispatch = useDispatch();

  const { modalType, ctx } = useSelector((state: RootState) => state.modal);
  const patientFromStore = useSelector((state: RootState) => state.patient);
  const patientOrders = useSelector((state: RootState) => state.patientOrders.data);

  const context = ctx as ModalContext;
  const patientId = context?.patientId || patientFromStore?.id || '';
  const initialProviderId = context?.providerId || '';
  const initialProviderName = context?.providerName || 'Provider';
  const mode = context?.mode || 'order'; // Default to 'order' mode for backward compatibility

  // Extract unique providers from patient orders
  const providers = useMemo<ProviderInfo[]>(() => {
    if (!patientOrders || mode !== 'patient') return [];

    const providerMap = new Map<string, ProviderInfo>();

    patientOrders.forEach((order) => {
      // Check multiple possible provider fields
      const providerInfo = order.providerInfo as {
        id?: string;
        name?: string;
        firstName?: string;
        lastName?: string;
      } | null;
      const assignedProvider = order.assignedProvider;
      const providersArray = order.providers;

      // Try providerInfo first
      if (providerInfo?.id && !providerMap.has(providerInfo.id)) {
        const name =
          providerInfo.name ||
          (providerInfo.firstName && providerInfo.lastName
            ? `${providerInfo.firstName} ${providerInfo.lastName}`
            : 'Unknown Provider');
        providerMap.set(providerInfo.id, { id: providerInfo.id, name });
      }

      // Try assignedProvider
      if (assignedProvider?.id && !providerMap.has(assignedProvider.id)) {
        providerMap.set(assignedProvider.id, {
          id: assignedProvider.id,
          name: assignedProvider.name || 'Unknown Provider',
        });
      }

      // Try providers array
      if (providersArray) {
        providersArray.forEach((p) => {
          if (p?.id && !providerMap.has(p.id)) {
            providerMap.set(p.id, {
              id: p.id,
              name: p.name || 'Unknown Provider',
            });
          }
        });
      }
    });

    return Array.from(providerMap.values());
  }, [patientOrders, mode]);

  const [selectedProvider, setSelectedProvider] = useState<ProviderInfo | null>(null);
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

  // Determine active provider based on mode
  const activeProviderId = mode === 'patient' ? selectedProvider?.id || '' : initialProviderId;
  const activeProviderName = mode === 'patient' ? selectedProvider?.name || 'Provider' : initialProviderName;

  // Debounce search term
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  const isOpen = modalType === 'Provider Patient Chat';

  // Scroll to bottom of messages - using scrollTop like patient chat (not scrollIntoView)
  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, []);

  const handleClose = () => {
    dispatch(setModal({ modalType: undefined }));
    setSearchTerm('');
    setDebouncedSearch('');
    setPage(1);
    setAllMessages([]);
    setHasMore(true);
    setIsInitialLoad(true);
    setSelectedProvider(null);
    setShowFilters(false);
    setDateFrom('');
    setDateTo('');
    setAppliedDateFrom('');
    setAppliedDateTo('');
    setSentBy('all');
    setAppliedSentBy('all');
    hasScrolledRef.current = false;
  };

  // Handle provider selection in patient mode
  const handleSelectProvider = (provider: ProviderInfo) => {
    setSelectedProvider(provider);
    setPage(1);
    setAllMessages([]);
    setHasMore(true);
    setSearchTerm('');
    setDebouncedSearch('');
    setIsInitialLoad(true);
  };

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
      if (!patientId || !activeProviderId) return;

      try {
        const container = scrollContainerRef.current;
        const previousScrollHeight = container?.scrollHeight ?? 0;

        const result = await getAdminChatLogs({
          providerId: activeProviderId,
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
    [patientId, activeProviderId, limit, getAdminChatLogs]
  );

  // Fetch messages when modal opens or provider changes (reset everything including search)
  useEffect(() => {
    if (isOpen && patientId && activeProviderId) {
      setPage(1);
      setAllMessages([]);
      setHasMore(true);
      setSearchTerm('');
      setDebouncedSearch('');
      fetchMessages(1, '', appliedDateFrom, appliedDateTo, appliedSentBy);
    }
  }, [isOpen, patientId, activeProviderId]);

  // Fetch messages when filters change (keep search term)
  useEffect(() => {
    if (isOpen && patientId && activeProviderId && !isInitialLoad) {
      setPage(1);
      setAllMessages([]);
      setHasMore(true);
      fetchMessages(1, debouncedSearch, appliedDateFrom, appliedDateTo, appliedSentBy);
    }
  }, [appliedDateFrom, appliedDateTo, appliedSentBy]);

  // Fetch messages when debounced search changes
  useEffect(() => {
    if (isOpen && patientId && activeProviderId && !isInitialLoad) {
      setPage(1);
      setAllMessages([]);
      setHasMore(true);
      fetchMessages(1, debouncedSearch, appliedDateFrom, appliedDateTo, appliedSentBy);
    }
  }, [debouncedSearch]);

  // Fetch more messages when page changes
  useEffect(() => {
    if (page > 1 && activeProviderId) {
      fetchMessages(page, debouncedSearch, appliedDateFrom, appliedDateTo, appliedSentBy);
    }
  }, [page, activeProviderId, fetchMessages]);

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
  }, [activeProviderId, appliedDateFrom, appliedDateTo, appliedSentBy]);

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

  // Show provider list in patient mode
  const showProviderList = mode === 'patient';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size={showProviderList ? 'xl' : 'lg'}
      className='provider-patient-chat-modal'
      bodyClassName='!tw-overflow-hidden !tw-max-h-none !tw-p-0'
    >
      <div className='tw-flex tw-flex-col md:tw-flex-row tw-h-[85vh] md:tw-h-auto md:tw-min-h-[60vh] md:tw-max-h-[600px]'>
        {/* Provider List - Only in patient mode */}
        {showProviderList && (
          <div className='tw-border-b md:tw-border-b-0 md:tw-w-64 md:tw-border-r tw-border-gray-200 tw-flex tw-flex-col tw-flex-shrink-0'>
            <div className='tw-p-3 md:tw-p-4 tw-border-b tw-border-gray-200'>
              <h5 className='tw-m-0 tw-font-semibold tw-text-sm md:tw-text-base'>Providers</h5>
            </div>
            <div className='tw-flex tw-flex-row md:tw-flex-col tw-overflow-x-auto md:tw-overflow-x-hidden md:tw-overflow-y-auto tw-flex-1 tw-gap-1 md:tw-gap-0 tw-p-2 md:tw-p-0'>
              {providers.length === 0 ? (
                <div className='tw-p-4 tw-text-center tw-text-gray-500 tw-text-sm tw-w-full'>No providers found</div>
              ) : (
                providers.map((provider) => (
                  <button
                    key={provider.id}
                    type='button'
                    onClick={() => handleSelectProvider(provider)}
                    className={`tw-text-left tw-px-3 md:tw-px-4 tw-py-2 md:tw-py-3 tw-border md:tw-border-0 md:tw-border-b tw-border-gray-200 md:tw-border-gray-100 tw-rounded md:tw-rounded-none hover:tw-bg-gray-50 tw-transition-colors tw-whitespace-nowrap md:tw-whitespace-normal tw-flex-shrink-0 md:tw-flex-shrink md:tw-w-full ${
                      selectedProvider?.id === provider.id
                        ? 'tw-bg-blue-50 tw-border-blue-300 md:tw-border-l-4 md:tw-border-l-blue-500'
                        : ''
                    }`}
                  >
                    <div className='tw-font-medium tw-text-xs md:tw-text-sm tw-truncate'>{provider.name}</div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className='tw-flex-1 tw-flex tw-flex-col tw-min-w-0 tw-min-h-0'>
          {/* Header */}
          <div className='tw-p-3 md:tw-p-4 tw-border-b tw-border-gray-200 tw-flex-shrink-0'>
            <h4 className='tw-mb-2 tw-text-base md:tw-text-lg'>
              {showProviderList && !selectedProvider ? 'Select a Provider' : `Chat with ${activeProviderName}`}
            </h4>

            {/* Search bar with Filters and Refresh buttons */}
            {(activeProviderId || !showProviderList) && (
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
            {showFilters && (activeProviderId || !showProviderList) && (
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

          {/* Messages - using same structure as patient chat */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className='tw-flex-1 overflow-auto tw-p-3 md:tw-p-4 tw-min-h-0 hide-scroll'
          >
            {showProviderList && !selectedProvider ? (
              <EmptyState title='Select a Provider' subTitle='Choose a provider from the list to view chat history' />
            ) : !activeProviderId ? (
              <EmptyState title='No Provider' subTitle='No provider assigned to this order' />
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
                          {isMessageFromPatient(message) ? 'Patient' : activeProviderName}
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
      </div>
    </Modal>
  );
};
