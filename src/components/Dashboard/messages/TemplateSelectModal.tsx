'use client';

import Modal from '@/components/elements/Modal';
import InfiniteScroll from 'react-infinite-scroll-component';
import Search from '@/components/Dashboard/Search';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useLazyGetMessageTemplatesQuery, MessageTemplateType } from '@/store/slices/messageTemplatesApiSlice';
import { Spinner } from 'react-bootstrap';
import { FiSearch } from 'react-icons/fi';
import { ROUTES } from '@/constants';
import { FaPlus } from 'react-icons/fa6';
import { useDebounce } from '@/hooks/useDebounce';
import { MessagesLoader } from './MessagesLoader';

interface TemplateSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (content: string, templateId: string) => void;
}

export default function TemplateSelectModal({ isOpen, onClose, onSelectTemplate }: Readonly<TemplateSelectModalProps>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [templatesList, setTemplatesList] = useState<MessageTemplateType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [triggerTemplates, { isFetching }] = useLazyGetMessageTemplatesQuery();

  // Debounce search query with 500ms delay
  const debouncedSearchQuery = useDebounce(searchQuery, 750);

  const fetchTemplates = async (page: number, search?: string) => {
    try {
      const result = await triggerTemplates({
        page,
        limit: 10,
        isActive: true,
        search: search || undefined,
      }).unwrap();

      const { data, meta } = result;

      if (page === 1) {
        setTemplatesList(data || []);
      } else {
        setTemplatesList((prev) => [...prev, ...(data || [])]);
      }

      setCurrentPage(meta.page);
      setTotalPages(meta.totalPages);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const fetchMore = () => {
    if (currentPage < totalPages && !isFetching) {
      fetchTemplates(currentPage + 1, debouncedSearchQuery);
    }
  };

  const handleSelectTemplate = (template: MessageTemplateType) => {
    onSelectTemplate(template.content, template.id);
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setTemplatesList([]);
    setCurrentPage(1);
    setTotalPages(1);
    onClose();
  };

  // Initial load when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      fetchTemplates(1, '');
    }
  }, [isOpen]);

  // Fetch templates when debounced search query changes
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      fetchTemplates(1, debouncedSearchQuery);
    }
  }, [debouncedSearchQuery]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title='Select Message Template'
      size='lg'
      showFooter={true}
      footer={
        <button
          type='button'
          className='tw-w-full tw-px-6 tw-py-2 tw-text-primary tw-border tw-border-solid tw-border-primary tw-rounded-lg hover:tw-bg-primary/10 tw-transition-all'
          onClick={handleClose}
        >
          Cancel
        </button>
      }
      bodyClassName='!tw-px-0'
    >
      {/* Search */}
      <div className='tw-mb-4 tw-px-4 md:tw-px-5'>
        <Search
          isLoading={searchQuery.length > 0 && isFetching}
          placeholder='Search templates by name...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Templates List with Infinite Scroll */}
      <div
        id='template-scroll-container'
        className='tw-max-h-[calc(500px-54px)] tw-min-h-40 tw-overflow-y-auto tw-px-4 md:tw-px-5'
      >
        {isFetching && templatesList.length === 0 && (
          <MessagesLoader
            className='tw-mt-4'
            title='Loading templates...'
            subTitle='Please wait while we fetch your templates'
          />
        )}

        {!isFetching && templatesList.length === 0 && (
          <div className='tw-text-center tw-py-8'>
            <div className='tw-text-gray-400 tw-mb-2'>
              <FiSearch size={48} className='tw-mx-auto tw-mb-3' />
            </div>
            <p className='tw-text-gray-600 tw-font-medium tw-mb-1'>No templates found</p>
            <p className='tw-text-sm tw-text-gray-400'>
              {searchQuery ? 'Try a different search term' : 'Create your first template to get started'}
            </p>

            <Link
              href={ROUTES.ADMIN_MESSAGES_TEMPLATES}
              className='btn btn-primary d-inline-flex align-items-center justify-content-center gap-2 mt-3'
            >
              <FaPlus size={16} /> Create Template
            </Link>
          </div>
        )}

        {templatesList.length > 0 && (
          <InfiniteScroll
            dataLength={templatesList.length}
            next={fetchMore}
            hasMore={currentPage < totalPages}
            loader={
              <div className='tw-flex tw-justify-center py-4'>
                <Spinner size='sm' />
              </div>
            }
            scrollableTarget='template-scroll-container'
          >
            <div className='tw-space-y-2'>
              {templatesList.map((template) => (
                <div
                  key={template.id}
                  className='tw-flex tw-items-center tw-justify-between tw-gap-4 tw-p-3 tw-border tw-border-gray-200 tw-rounded-lg'
                >
                  {/* Template Name */}
                  <span className='tw-text-base tw-block tw-flex-grow'>{template.name}</span>

                  {/* Select Button */}
                  <button
                    type='button'
                    className='tw-px-4 tw-py-2 tw-bg-blue-600 tw-rounded-md tw-text-sm tw-font-medium tw-text-white hover:tw-bg-blue-700 tw-transition-all tw-text-nowrap'
                    onClick={() => handleSelectTemplate(template)}
                    title='Use this template'
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          </InfiniteScroll>
        )}
      </div>
    </Modal>
  );
}
