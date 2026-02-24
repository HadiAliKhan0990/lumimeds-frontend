'use client';

import InfiniteScroll from 'react-infinite-scroll-component';
import toast from 'react-hot-toast';
import { useEffect, useState, useMemo } from 'react';
import { TrackingLogInfo, useLazyGetTrackingLogsQuery } from '@/store/slices/ordersApiSlice';
import { CircularProgress, Modal } from '@/components/elements';
import { Column, Table } from '@/components/Dashboard/Table';
import { MobileCard } from '@/components/Dashboard/MobileCard';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { format } from 'date-fns';
import { isAxiosError } from 'axios';
import { Error as ApiError } from '@/lib/types';

interface TrackingLogsModalProps {
  show: boolean;
  onHide: () => void;
  orderId: string;
}

export function TrackingLogsModal({ show, onHide, orderId }: Readonly<TrackingLogsModalProps>) {
  const [trackingLogs, setTrackingLogs] = useState<TrackingLogInfo[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;
  const isDesktop = useMediaQuery('(min-width: 992px)');

  const [triggerGetTrackingLogs, { isFetching }] = useLazyGetTrackingLogsQuery();

  const fetchTrackingLogs = async (page: number, append: boolean = false) => {
    if (isFetching) return;

    try {
      const response = await triggerGetTrackingLogs({
        orderId,
        page,
        limit,
        sortOrder: 'DESC',
      }).unwrap();

      if (response.data) {
        const logs = response.data.trackingLogs || [];
        const meta = response.data.meta || { totalPages: 1 };

        if (append) {
          setTrackingLogs((prev) => [...prev, ...logs]);
        } else {
          setTrackingLogs(logs);
        }

        setTotalPages(meta.totalPages);
        setCurrentPage(page);
        setHasMore(page < meta.totalPages);
      }
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data?.message
          : (error as ApiError).data.message || 'Failed to fetch tracking logs'
      );
    }
  };

  const fetchMore = () => {
    if (currentPage < totalPages && !isFetching) {
      fetchTrackingLogs(currentPage + 1, true);
    }
  };

  useEffect(() => {
    if (show && orderId) {
      setTrackingLogs([]);
      setCurrentPage(1);
      setTotalPages(1);
      setHasMore(true);
      fetchTrackingLogs(1, false);
    }
  }, [show, orderId]);

  const columns: Column<TrackingLogInfo>[] = useMemo(
    () => [
      {
        header: <div className='tw-w-full tw-font-medium'>Logs</div>,
        renderCell: (row) => {
          const items = row.change?.split('. ') ?? [];
          return (
            <ul className='!tw-pl-0 tw-list-disc tw-list-inside'>
              {items.map((item, index) => (
                <li key={index} className='tw-text-base tw-whitespace-pre-wrap'>
                  {item}.
                </li>
              ))}
            </ul>
          );
        },
        className: 'tw-self-start',
        gridTitleClassName: 'tw-self-baseline',
      },
      {
        header: <div className='tw-w-full tw-font-medium'>Date & Time</div>,
        renderCell: (row) => {
          return (
            <div className='tw-text-base tw-font-medium '>{format(new Date(row.updatedAt), 'MMM dd, yyyy h:mm a')}</div>
          );
        },
        className: 'tw-min-w-64 tw-self-start',
        gridTitleClassName: 'tw-self-baseline',
      },
    ],
    []
  );

  return (
    <Modal
      isOpen={show}
      onClose={onHide}
      title='Tracking Logs History'
      size='lg'
      headerClassName='!tw-text-left'
      disabledBodyPadding={false}
      isLoading={isFetching && trackingLogs.length === 0}
      loadingText='Loading tracking logs...'
    >
      <InfiniteScroll
        dataLength={trackingLogs.length}
        next={fetchMore}
        hasMore={hasMore}
        loader={
          <div className='tw-flex tw-justify-center tw-py-4'>
            <CircularProgress className='tw-w-5 tw-h-5' />
          </div>
        }
        scrollableTarget='tracking-logs-scrollable'
        height='60vh'
      >
        {isDesktop ? (
          <Table data={trackingLogs} columns={columns} isFetching={false} />
        ) : (
          <MobileCard data={trackingLogs} columns={columns} loading={false} />
        )}
      </InfiniteScroll>
    </Modal>
  );
}
