'use client';

import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import toast from 'react-hot-toast';
import { Spinner, Modal } from 'react-bootstrap';
import { formatUSDateTime } from '@/helpers/dateFormatter';
import {
  BlastMessageRecord,
  useLazyGetBlastMessagesListQuery,
  useRetryBlastMessageMutation,
} from '@/store/slices/chatApiSlice';
import { Column, Table } from '@/components/Dashboard/Table';
import { MobileCard } from '@/components/Dashboard/MobileCard';
import { connectChatSocket } from '@/lib/chatSocket';
import { getErrorMessage } from '@/lib/errors';

interface SocketEventData {
  blastMessageId: string;
  processedCount?: number;
  processedPatients?: number;
  successfulEmailCount?: number;
  successfulMessageCount?: number;
  successfulEmails?: number;
  successfulMessages?: number;
  failedEmailCount: number;
  failedMessageCount?: number;
  failedMessagesCount?: number;
  totalPatients?: number;
}

interface Props {
  accessToken: string;
}

export default function BlastMessagesReport({ accessToken = '' }: Readonly<Props>) {
  const [blastMessages, setBlastMessages] = useState<BlastMessageRecord[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const [getBlastMessages, { isFetching }] = useLazyGetBlastMessagesListQuery();
  const [retryBlastMessage] = useRetryBlastMessageMutation();

  const handleViewMessage = (message: string) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
  };

  const handleCloseModal = () => {
    setShowMessageModal(false);
    setSelectedMessage(null);
  };

  const fetchBlastMessages = async (pageNum: number = 1) => {
    try {
      const { data, success } = await getBlastMessages({ page: pageNum, limit: 30 }).unwrap();

      if (success && data?.data) {
        setBlastMessages((prev) => (pageNum === 1 ? data.data : [...prev, ...data.data]));
        setMeta(data.meta);
      }
    } catch (error) {
      console.error('Failed to fetch blast messages:', error);
      if (pageNum === 1) setBlastMessages([]);
    }
  };

  const fetchMore = () => {
    if (!allBlastMessagesLoaded) {
      fetchBlastMessages(meta.page + 1);
    }
  };

  const handleRetry = async (blastMessageId: string) => {
    setRetryingId(blastMessageId);
    try {
      const response = await retryBlastMessage({ blastMessageId }).unwrap();
      toast.success(response.message || 'Blast message retried successfully');
      await fetchBlastMessages(1);
    } catch (error) {
      toast.error(getErrorMessage(error) || 'Failed to retry blast message');
    } finally {
      setRetryingId(null);
    }
  };

  const columns: Column<BlastMessageRecord>[] = [
    {
      header: 'Message',
      renderCell: (row) => (
        <button
          type='button'
          className='btn btn-link p-0 text-truncate text-sm tw-max-w-[250px] hover:tw-text-primary tw-transition-colors'
          onClick={(e) => {
            e.stopPropagation();
            handleViewMessage(row.message);
          }}
          title='Click to view full message'
        >
          {row.message || '-'}
        </button>
      ),
    },
    {
      header: 'Total Patients',
      accessor: 'totalPatients',
    },
    {
      header: 'Successful',
      accessor: 'successfulMessages',
    },
    {
      header: 'Failed',
      accessor: 'failedMessagesCount',
    },
    {
      header: 'Status',
      renderCell: (row) => {
        const statusColors: Record<string, string> = {
          completed: 'success',
          failed: 'danger',
          in_progress: 'warning',
          pending: 'secondary',
        };
        const color = statusColors[row.status] || 'secondary';
        return (
          <span className={`status-badge bg-${color} text-white text-capitalize`}>
            {row.status?.replace('_', ' ') || '-'}
          </span>
        );
      },
    },
    {
      header: 'Created At',
      renderCell: (row) => <small className='text-muted text-nowrap'>{formatUSDateTime(row.createdAt)}</small>,
    },
    {
      header: 'Actions',
      renderCell: (row) =>
        row.status === 'failed' ? (
          <button
            className='btn btn-sm btn-outline-primary'
            onClick={(e) => {
              e.stopPropagation();
              handleRetry(row.id);
            }}
            disabled={retryingId === row.id}
          >
            {retryingId === row.id ? <Spinner animation='border' size='sm' /> : 'Retry'}
          </button>
        ) : null,
    },
  ];

  // Handle real-time progress updates
  const handleBlastMessageProgress = (data: SocketEventData) => {
    setBlastMessages((prev) => {
      const updated = prev.map((msg) =>
        msg.id === data.blastMessageId
          ? {
              ...msg,
              processedPatients: data.processedCount || msg.processedPatients,
              successfulEmails: data.successfulEmailCount || msg.successfulEmails,
              successfulMessages: data.successfulMessageCount || msg.successfulMessages,
              failedEmailCount: data.failedEmailCount || msg.failedEmailCount,
              failedMessagesCount: data.failedMessageCount || msg.failedMessagesCount,
            }
          : msg
      );
      return updated;
    });
  };

  // Handle completion event
  const handleBlastMessageCompleted = (data: SocketEventData) => {
    const processed = data.totalPatients || 0;
    const successful = data.successfulMessages || 0;
    const failed = data.failedMessagesCount || 0;

    toast.success(`Blast message completed! Processed: ${processed}, Successful: ${successful}, Failed: ${failed}`, {
      duration: 5000,
    });

    fetchBlastMessages(1);
  };

  // Setup socket listeners
  useEffect(() => {
    if (!accessToken) {
      console.warn('⚠️ No access token provided for socket connection');
      return;
    }

    const socket = connectChatSocket(accessToken);

    const setupListeners = () => {
      socket.on('blastMessageProgress', handleBlastMessageProgress);
      socket.on('blastMessageCompleted', handleBlastMessageCompleted);
    };

    // Check if already connected
    if (socket.connected) {
      console.log('✅ Socket already connected');
      setupListeners();
    } else {
      console.log('⏳ Waiting for socket to connect...');
      socket.on('connect', setupListeners);
    }

    return () => {
      console.log('🧹 Cleaning up blast message socket listeners');
      socket.off('blastMessageProgress', handleBlastMessageProgress);
      socket.off('blastMessageCompleted', handleBlastMessageCompleted);
      socket.off('connect', setupListeners);
    };
  }, [accessToken]);

  // Initial fetch
  useEffect(() => {
    fetchBlastMessages(1);
  }, []);

  const loader = (
    <div className='d-flex justify-content-center py-4'>
      <Spinner size='sm' />
    </div>
  );

  const allBlastMessagesLoaded = meta.page >= meta.totalPages;

  return (
    <>
      <div className='mb-4'>
        <h2 className='tw-text-lg tw-font-medium tw-mb-1'>Blast Messages Report</h2>
        <p className='text-muted mb-0 text-sm'>View and manage all blast message campaigns</p>
      </div>

      <div className='d-lg-none'>
        <InfiniteScroll
          dataLength={blastMessages.length}
          next={fetchMore}
          hasMore={!allBlastMessagesLoaded}
          loader={loader}
          height='calc(100vh - 330px)'
        >
          <MobileCard loading={isFetching && !blastMessages.length} data={blastMessages} columns={columns} />
        </InfiniteScroll>
      </div>

      <div className='d-none d-lg-block'>
        <InfiniteScroll
          dataLength={blastMessages.length}
          next={fetchMore}
          hasMore={!allBlastMessagesLoaded}
          loader={loader}
          height='calc(100vh - 245px)'
        >
          <Table data={blastMessages} columns={columns} isFetching={isFetching && blastMessages.length === 0} />
        </InfiniteScroll>
      </div>

      {/* Message View Modal */}
      <Modal show={showMessageModal} onHide={handleCloseModal} centered size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>Blast Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='tw-whitespace-pre-wrap tw-break-words tw-text-base tw-leading-relaxed'>
            {selectedMessage || 'No message content'}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className='btn btn-secondary' onClick={handleCloseModal}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
