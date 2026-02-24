'use client';

import { Modal } from '@/components/elements';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setModal } from '@/store/slices/modalSlice';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { Error as ApiError } from '@/lib/types';
import { TrustpilotLogInfo, useLazyGetTrustpilotLogsQuery } from '@/store/slices/patientApiSlice';

interface ModalContext {
  patientId?: string;
  mode?: 'patient' | 'order';
}

export const TrustpilotLogsModal = () => {
  const dispatch = useDispatch();

  const { modalType, ctx } = useSelector((state: RootState) => state.modal);
  const patientFromStore = useSelector((state: RootState) => state.patient);
  const [trustpilotLogs, setTrustpilotLogs] = useState<TrustpilotLogInfo[]>([]);
  const context = ctx as ModalContext;
  const patientId = context?.patientId || patientFromStore?.id || '';

  const [limit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isOpen = modalType === 'Trustpilot Logs';

  const handleClose = () => {
    dispatch(setModal({ modalType: undefined }));
    setTrustpilotLogs([]);
    setCurrentPage(1);
    setTotalPages(1);
  };

  const [triggerGetTrustpilotLogs, { isFetching }] = useLazyGetTrustpilotLogsQuery();

  const fetchTrustpilotLogs = useCallback(
    async (page: number, append: boolean = false) => {
      if (isFetching || !patientId) return;

      try {
        const response = await triggerGetTrustpilotLogs({
          patientId,
          page,
          limit,
          sortOrder: 'DESC'
        }).unwrap();

        if (response.data) {
          const logs = response.data.logs || [];

          if (append) {
            setTrustpilotLogs((prev) => [...prev, ...logs]);
          } else {
            setTrustpilotLogs(logs);
          }
          setTotalPages(response?.data?.meta?.totalPages || 1);
          setCurrentPage(page);
        }
      } catch (error) {
        toast.error(
          isAxiosError(error)
            ? error.response?.data?.message
            : (error as ApiError).data.message || 'Failed to fetch Trustpilot logs'
        );
      }
    },
    [isFetching, triggerGetTrustpilotLogs, patientId, limit]
  );

  useEffect(() => {
    if (isOpen && patientId) {
      fetchTrustpilotLogs(1, false);
    }
  }, [isOpen, patientId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !isFetching) {
      fetchTrustpilotLogs(currentPage + 1, true);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size={'xl'}
      className="trustpilot-logs-modal"
      bodyClassName="!tw-overflow-hidden !tw-max-h-none !tw-p-0"
    >
      <div className="tw-flex tw-flex-col tw-h-[85vh] md:tw-h-auto md:tw-min-h-[60vh] md:tw-max-h-[600px]">
        {/* Header */}
        <div className="tw-p-4 tw-border-b tw-border-gray-200">
          <h2 className="tw-text-xl tw-font-semibold tw-text-gray-900">Trustpilot Logs History</h2>
          {patientId && (
            <p className="tw-text-sm tw-text-gray-500 tw-mt-1">
              Patient ID: {patientId}
            </p>
          )}
        </div>

        {/* Logs Content */}
        <div
          ref={scrollContainerRef}
          className="tw-flex-1 tw-overflow-y-auto tw-p-4"
        >
          {isFetching && trustpilotLogs.length === 0 ? (
            <div className="tw-flex tw-items-center tw-justify-center tw-h-full">
              <div className="tw-text-gray-500">Loading logs...</div>
            </div>
          ) : trustpilotLogs.length === 0 ? (
            <div className="tw-flex tw-items-center tw-justify-center tw-h-full">
              <div className="tw-text-gray-500">No logs found</div>
            </div>
          ) : (
            <div className="tw-space-y-4">
              {trustpilotLogs.map((log) => (
                <div
                  key={log.id}
                  className="tw-bg-white tw-border tw-border-gray-200 tw-rounded-lg tw-p-4 tw-shadow-sm hover:tw-shadow-md tw-transition-shadow"
                >
                  {/* Log Header */}
                  <div className="tw-flex tw-justify-between tw-items-start tw-mb-3">
                    <div>
                      <p
                        className={`tw-inline-block tw-px-3 tw-py-1 tw-text-xs tw-font-semibold tw-rounded-full ${
                          log.action === 'ERROR'
                            ? 'tw-bg-red-100 tw-text-red-800'
                            : 'tw-bg-green-100 tw-text-green-800'
                        }`}
                      >
                        {log.action === 'ERROR' ? 'Error' : 'Success'}
                      </p>
                    </div>
                    <div className="tw-text-xs tw-text-gray-500">
                      {formatDate(log?.createdAt)}
                    </div>
                  </div>

                  {/* Patient & Admin Info */}
                  <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-3 tw-mb-3">
                    <div>
                      <p className="tw-text-xs tw-text-gray-500 tw-mb-1">Patient</p>
                      <p className="tw-text-sm tw-font-medium tw-text-gray-900">
                        {log?.patient?.firstName} {log?.patient?.lastName}
                      </p>
                      <p className="tw-text-xs tw-text-gray-600">{log?.patient?.email}</p>
                    </div>
                    <div>
                      <p className="tw-text-xs tw-text-gray-500 tw-mb-1">Admin</p>
                      <p className="tw-text-sm tw-text-gray-900">{log?.admin?.email}</p>
                    </div>
                  </div>

                  {/* Request Content */}
                  {log?.requestPayload?.content && (
                    <div className="tw-mb-3">
                      <p className="tw-text-xs tw-text-gray-500 tw-mb-1">Message Content</p>
                      <p
                        className="tw-text-sm tw-text-gray-700 tw-bg-gray-50 tw-p-2 tw-rounded"
                        dangerouslySetInnerHTML={{ __html: log?.requestPayload?.content }}
                      />
                    </div>
                  )}

                  {/* Trustpilot Link */}
                  {log?.requestPayload?.link && (
                    <div className="tw-mb-3">
                      <p className="tw-text-xs tw-text-gray-500 tw-mb-1">Review Link</p>
                      <a
                        href={log?.requestPayload?.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tw-text-sm tw-text-blue-600 hover:tw-underline tw-break-all"
                      >
                        {log?.requestPayload?.link}
                      </a>
                    </div>
                  )}

                  {/* Error Message */}
                  {log?.errorMessage && (
                    <div className="tw-mt-3 tw-p-2 tw-bg-red-50 tw-border tw-border-red-200 tw-rounded">
                      <p className="tw-text-xs tw-text-red-600 tw-font-medium">Error</p>
                      <p className="tw-text-sm tw-text-red-700">{log?.errorMessage}</p>
                    </div>
                  )}
                </div>
              ))}

              {/* Load More Button */}
              {currentPage < totalPages && (
                <div className="tw-flex tw-justify-center tw-pt-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={isFetching}
                    className="tw-px-4 tw-py-2 tw-bg-blue-600 tw-text-white tw-rounded-lg hover:tw-bg-blue-700 disabled:tw-bg-gray-400 disabled:tw-cursor-not-allowed tw-transition-colors"
                  >
                    {isFetching ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};