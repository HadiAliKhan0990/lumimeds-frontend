'use client';

import Link from 'next/link';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useLazyGetMessageTemplatesQuery, MessageTemplateType } from '@/store/slices/messageTemplatesApiSlice';
import { FilterGroup } from '@/components/Dashboard/Table/includes/FilterGroup';
import { MetaPayload } from '@/lib/types';
import { Dropdown, Spinner } from 'react-bootstrap';
import { CreateTemplateModal } from './includes/CreateTemplateModal';
import { UpdateTemplateModal } from './includes/UpdateTemplateModal';
import { PreviewModal } from './includes/PreviewModal';
import { DeleteConfirmationModal } from './includes/DeleteConfirmationModal';
import { Table, Column } from '@/components/Dashboard/Table';
import { MobileCard } from '@/components/Dashboard/MobileCard';
import { formatUSDateTime } from '@/helpers/dateFormatter';
import { FiPlus, FiArrowLeft } from 'react-icons/fi';
import { RowActions } from './includes/RowActions';
import { MobileHeader } from '@/components/Dashboard/MobileHeader';
import { ROUTES } from '@/constants';

export default function MessageTemplates() {
  const search = useSelector((state: RootState) => state.sort.search);
  const sortOrder = useSelector((state: RootState) => state.sort.sortOrder);
  const sortStatus = useSelector((state: RootState) => state.sort.sortStatus);

  const { data: templates, meta } = useSelector((state: RootState) => state.messageTemplates);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplateType | null>(null);

  const { totalPages = 1, page: currentPage = 1 } = meta || {};

  const [triggerTemplates, { isFetching }] = useLazyGetMessageTemplatesQuery();

  const handleUpdateTemplates = async ({ meta: newMeta, search, sortOrder, sortStatus }: MetaPayload) => {
    try {
      await triggerTemplates({
        search: search || undefined,
        page: newMeta?.page || 1,
        limit: 30,
        ...(sortOrder && { sortOrder }),
        ...(sortStatus && { isActive: sortStatus === 'active' }),
      }).unwrap();
    } catch (e) {
      console.log(e);
    }
  };

  const fetchMore = () => {
    if (!isFetching && currentPage < totalPages) {
      handleUpdateTemplates({
        meta: { page: currentPage + 1, limit: meta.limit },
        search,
        sortOrder,
        sortStatus,
      } as MetaPayload);
    }
  };

  const handleEdit = (template: MessageTemplateType) => {
    setSelectedTemplate(template);
    setShowUpdateModal(true);
  };

  const handlePreview = (template: MessageTemplateType) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  };

  const handleDelete = (template: MessageTemplateType) => {
    setSelectedTemplate(template);
    setShowDeleteModal(true);
  };

  const columns: Column<MessageTemplateType>[] = [
    { header: 'Template ID', accessor: 'templateUniqueId' },
    { header: 'Template Name', accessor: 'name' },
    {
      header: 'Status',
      renderCell: (row) => (
        <span className={`status-badge ${row.isActive ? 'active' : 'inactive'}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Last Updated',
      renderCell: (row) => {
        if (!row.updatedAt) return '-';
        return <span className='text-nowrap'>{formatUSDateTime(row.updatedAt)}</span>;
      },
    },
    {
      header: 'Actions',
      renderCell: (row) => <RowActions template={row} onEdit={handleEdit} onDelete={handleDelete} />,
    },
  ];

  useEffect(() => {
    handleUpdateTemplates({
      meta: { page: 1, limit: 30 } as MetaPayload['meta'],
      search,
      sortOrder,
      sortStatus,
    });
  }, [search, sortOrder, sortStatus]);

  return (
    <>
      {/* Back Button */}
      <Link href={ROUTES.ADMIN_MESSAGES} className='d-inline-flex align-items-center gap-2'>
        <FiArrowLeft /> Back to Messages
      </Link>

      <div className='d-none d-lg-flex tw-justify-between tw-items-center mb-4'>
        <h4 className='fw-medium'>Messages Templates</h4>
        <button
          className='btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-2'
          onClick={() => setShowCreateModal(true)}
        >
          <FiPlus /> Create Template
        </button>
      </div>

      <MobileHeader
        title='Messages Templates'
        className='mb-3 d-lg-none'
        actions={
          <Dropdown.Item
            as='button'
            onClick={() => setShowCreateModal(true)}
            className='d-flex align-items-center gap-2'
          >
            <FiPlus /> Create Template
          </Dropdown.Item>
        }
      />

      <div className='mb-4'>
        <FilterGroup
          handleChange={handleUpdateTemplates}
          filters={['active', 'inactive']}
          visibility={{
            showSearch: true,
            showStatusFilter: true,
            showSort: true,
            showMultiSelect: false,
            showArchiveFilter: false,
          }}
        />
      </div>

      {/* Mobile View */}
      <div className='d-md-none'>
        <InfiniteScroll
          dataLength={templates.length}
          next={fetchMore}
          hasMore={currentPage < totalPages}
          loader={
            <div className='d-flex justify-content-center py-4'>
              <Spinner size='sm' />
            </div>
          }
          height={'calc(100vh - 283px)'}
        >
          <MobileCard
            data={templates}
            columns={columns}
            rowOnClick={handlePreview}
            loading={isFetching && templates.length === 0}
          />
        </InfiniteScroll>
      </div>

      {/* Desktop View */}
      <div className='table-responsive mt-4 d-none d-md-block'>
        <InfiniteScroll
          dataLength={templates.length}
          next={fetchMore}
          hasMore={currentPage < totalPages}
          loader={
            <div className='d-flex justify-content-center py-4'>
              <Spinner size='sm' />
            </div>
          }
          height={'calc(100vh - 206px)'}
        >
          <Table
            data={templates}
            rowOnClick={handlePreview}
            columns={columns}
            isFetching={isFetching && templates.length === 0}
          />
        </InfiniteScroll>
      </div>

      {/* Modals */}
      <CreateTemplateModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />

      <UpdateTemplateModal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
      />

      <PreviewModal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
        onEdit={() => {
          setShowPreviewModal(false);
          setShowUpdateModal(true);
        }}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
      />
    </>
  );
}
