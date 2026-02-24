'use client';

import Modal from '@/components/elements/Modal';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { Table, Column } from '@/components/Dashboard/Table';
import { MobileCard } from '@/components/Dashboard/MobileCard';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useLazyGetSubmissionLogsQuery } from '@/store/slices/surveysApiSlice';
import { CircularProgress } from '@/components/elements/CircularProgress';
import { formatUSDateTime } from '@/helpers/dateFormatter';

interface UpdateLog {
  id: string;
  updatedBy: {
    id: string;
    firstName: string;
    lastName: string;
    userRole: string;
  };
  updatedAt: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  submissionId: string;
  surveyName?: string;
}

export function SurveyTrackingLogsModal({ isOpen, onClose, submissionId, surveyName }: Readonly<Props>) {
  const isDesktop = useMediaQuery('(min-width: 992px)');
  const [allLogs, setAllLogs] = useState<UpdateLog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;


  const [getSubmissionLogs, { isLoading, isFetching }] = useLazyGetSubmissionLogsQuery();

  const fetchLogs = useCallback(
    async (page: number, append: boolean = false) => {
      try {
        const result = await getSubmissionLogs({
          submissionId,
          page,
          limit,
        }).unwrap();

        // Backend returns: { logs: [...], total, page, limit, totalPages }
        // transformResponse extracts response.data, so result = { logs: [...], total, page, limit, totalPages }
        if (result?.logs && Array.isArray(result.logs)) {
          const logsArray = result.logs;
          if (append) {
            setAllLogs((prev) => [...prev, ...logsArray]);
          } else {
            setAllLogs(logsArray);
          }

          if (result.totalPages !== undefined) {
            setTotalPages(result.totalPages);
          }
        }
      } catch (error) {
        console.error('Error fetching submission logs:', error);
      }
    },
    [submissionId, getSubmissionLogs],
  );

  useEffect(() => {
    if (isOpen && submissionId) {
      setCurrentPage(1);
      setAllLogs([]);
      fetchLogs(1, false);
    }
  }, [isOpen, submissionId, fetchLogs]);

  const fetchMore = useCallback(() => {
    if (currentPage < totalPages && !isFetching) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchLogs(nextPage, true);
    }
  }, [currentPage, totalPages, isFetching, fetchLogs]);

  const columns: Column<UpdateLog>[] = useMemo(
    () => [
      {
        header: 'Updated By',
        renderCell: (log) => (
          <div className='tw-text-gray-600'>
            {log.updatedBy.firstName} {log.updatedBy.lastName}
          </div>
        ),
        className: 'tw-align-middle',
      },
      {
        header: 'Role',
        renderCell: (log) => <div className='tw-text-gray-600 tw-capitalize'>{log?.updatedBy?.userRole || '-'}</div>,
        className: 'tw-align-middle',
      },
      {
        header: 'Updated At',
        renderCell: (log) => <div className='tw-text-gray-600'>{formatUSDateTime(log.updatedAt)}</div>,
        className: 'tw-align-middle',
      },
    ],
    []
  );

  const allLogsLoaded = currentPage >= totalPages;

  const modalTitle = surveyName ? `Update History (${surveyName})` : 'Update History';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size='lg'
      closeOnBackdropClick={false}
      closeOnEscape={false}
      title={modalTitle}
      headerClassName='tw-w-11/12 !tw-text-start'
      disabledBodyPadding={true}
    >
      <div className='tw-max-h-[70vh] tw-overflow-auto'>
        {/* Mobile version */}
        {!isDesktop && (
          <InfiniteScroll
            dataLength={allLogs.length}
            next={fetchMore}
            hasMore={!allLogsLoaded}
            loader={
              <div className='tw-flex tw-justify-center tw-py-4'>
                <CircularProgress className='tw-w-5 tw-h-5' />
              </div>
            }
            height='60vh'
          >
            <MobileCard
              loading={isLoading && allLogs.length === 0}
              data={allLogs}
              columns={columns}
              emptyState={
                <div className='tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-4 tw-my-5 tw-text-gray-600 tw-text-center'>
                  <p className='tw-text-lg tw-font-semibold'>No update history</p>
                  <span className='tw-text-base'>No updates have been made to this survey yet.</span>
                </div>
              }
            />
          </InfiniteScroll>
        )}

        {/* Desktop version */}
        {isDesktop && (
          <div className='tw-p-3'>
            <InfiniteScroll
              dataLength={allLogs.length}
              next={fetchMore}
              hasMore={!allLogsLoaded}
              loader={
                <div className='tw-flex tw-justify-center tw-py-4'>
                  <CircularProgress className='tw-w-5 tw-h-5' />
                </div>
              }
              height='60vh'
            >
              <Table
                data={allLogs}
                columns={columns}
                isFetching={isLoading && allLogs.length === 0}
                emptyState={
                  <div className='tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-4 tw-my-5 tw-text-gray-600 tw-text-center'>
                    <p className='tw-text-lg tw-font-semibold'>No update history</p>
                    <span className='tw-text-base'>No updates have been made to this survey yet.</span>
                  </div>
                }
              />
            </InfiniteScroll>
          </div>
        )}
      </div>
    </Modal>
  );
}

