'use client';

import ShadowScroll from '@/components/LayoutGestures/ShadowScroll';
import { Modal, Tabs, Tab } from '@/components/elements';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setModal } from '@/store/slices/modalSlice';
import {
  useLazyGetTelepathDataQuery,
  useLazyGetTelepathLambdaDataQuery,
  TelepathMessage,
  TelepathNote,
  TelepathQueryParams,
  TelepathLambdaResponse,
} from '@/store/slices/telepathApiSlice';
import { Messages } from './includes/Messages';
import { PatientBasic } from './includes/PatientBasic';
import { OrderListing } from './includes/OrderListing';
import { SurveyForms } from './includes/SurveyForms';
import { LambdaChartNotes } from './includes/LambdaChartNotes';
import { DividerButton } from '@/components/Buttons/DividerButton';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { OrderDetailsModal } from '@/components/Common/OrderDetailsModal';
import { OrderPopup } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/OrderPopup';
import { setSelectedOrderId } from '@/store/slices/selectedOrderSlice';
import { setOrder, Order } from '@/store/slices/orderSlice';

type TabValue = 'patient-basic' | 'order-listing' | 'survey-forms' | 'chart-notes' | 'messages';

export const TelepathHistory = () => {
  const dispatch = useDispatch();

  const { modalType, ctx } = useSelector((state: RootState) => state.modal);
  const patientFromStore = useSelector((state: RootState) => state.patient);
  const order = useSelector((state: RootState) => state.order);

  // Get patientId and email from ctx or fallback to Redux store
  const patientId = (ctx as { patientId?: string })?.patientId || patientFromStore?.id || '';

  const [activeTab, setActiveTab] = useState<TabValue>('patient-basic');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [allData, setAllData] = useState<(TelepathMessage | TelepathNote)[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [getTelepathData, { isError, error }] = useLazyGetTelepathDataQuery();

  // Lambda API for intake forms, notes, and orders
  const [lambdaData, setLambdaData] = useState<TelepathLambdaResponse | null>(null);
  const [lambdaErrorType, setLambdaErrorType] = useState<'not_found' | 'error' | null>(null);
  const [getTelepathLambdaData, { isFetching: isLambdaFetching }] = useLazyGetTelepathLambdaDataQuery();
  const [orderModalType, setOrderModalType] = useState<'orderDetails' | 'orderPopup' | null>(null);

  const isOpen = modalType === 'Telepath History';

  // Fetch Lambda data when modal opens
  useEffect(() => {
    const fetchLambdaData = async () => {
      if (isOpen && patientId) {
        setLambdaErrorType(null);
        try {
          const result = await getTelepathLambdaData({ patientId: patientId }).unwrap();
          setLambdaData(result);
        } catch (err: unknown) {
          console.error('Error fetching Lambda data:', err);
          // Check if it's a 404 error
          const errorStatus = (err as { status?: number })?.status;
          if (errorStatus === 404) {
            setLambdaErrorType('not_found');
          } else {
            setLambdaErrorType('error');
          }
        }
      }
    };
    fetchLambdaData();
  }, [isOpen, patientId, getTelepathLambdaData]);

  const handleClose = () => {
    dispatch(setModal({ modalType: undefined }));
    // Reset state on close
    setPage(1);
    setAllData([]);
    setHasMore(true);
    setActiveTab('patient-basic');
    setLambdaData(null);
    setLambdaErrorType(null);
    setOrderModalType(null);
  };

  const handleOrderClick = (orderId: string) => {
    dispatch(setSelectedOrderId(orderId));
    const order: Order = { id: orderId };
    dispatch(setOrder(order));
    setOrderModalType('orderDetails');
  };

  // Tabs that use Lambda API instead of old telepath API
  const lambdaTabs = ['patient-basic', 'order-listing', 'survey-forms', 'chart-notes'];

  // Fetch data function (only for tabs using old telepath API)
  const fetchData = useCallback(
    async (isLoadingMore = false) => {
      if (!patientId || !isOpen) return;

      // Skip API call for tabs that use Lambda data
      if (lambdaTabs.includes(activeTab)) return;

      if (isLoadingMore) {
        setIsFetchingMore(true);
      } else {
        setIsInitialLoading(true);
      }

      // Determine API type based on active tab
      const apiType = activeTab === 'messages' ? 'patient_messages' : 'notes';

      const params: TelepathQueryParams = {
        patientId,
        type: apiType,
        page,
        limit,
      };

      try {
        const result = await getTelepathData(params).unwrap();

        if (result?.data) {
          if (isLoadingMore) {
            // Append new data to existing data
            setAllData((prev) => [...prev, ...result.data]);
          } else {
            // Replace data for initial load or new search
            setAllData(result.data);
          }

          // Check if there's more data to load
          const currentPage = result.meta?.page || 1;
          const totalPages = result.meta?.totalPages || 1;
          setHasMore(currentPage < totalPages);
        }
      } catch (err) {
        console.error('Error fetching telepath data:', err);
      } finally {
        if (isLoadingMore) {
          setIsFetchingMore(false);
        } else {
          setIsInitialLoading(false);
        }
      }
    },
    [patientId, isOpen, activeTab, page, limit, getTelepathData]
  );

  // Fetch data when modal opens or dependencies change
  useEffect(() => {
    if (isOpen && patientId) {
      const isLoadingMore = page > 1;
      fetchData(isLoadingMore);
    }
  }, [isOpen, patientId, activeTab, page, fetchData]);

  // Reset page and data when tab changes
  useEffect(() => {
    if (isOpen) {
      setPage(1);
      setAllData([]);
      setHasMore(true);
    }
  }, [activeTab, isOpen]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || isInitialLoading || isFetchingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    // Trigger load more when user is 100px from bottom
    if (scrollHeight - scrollTop - clientHeight < 100) {
      setPage((prev) => prev + 1);
    }
  }, [isInitialLoading, isFetchingMore, hasMore]);

  // Attach scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll, isInitialLoading]);

  const tabs: Tab[] = [
    { value: 'patient-basic', label: 'Patient Info' },
    { value: 'order-listing', label: 'Orders' },
    { value: 'survey-forms', label: 'Survey Forms' },
    { value: 'chart-notes', label: 'Chart Notes' },
    { value: 'messages', label: 'Messages' },
  ];

  // Type guard for messages
  const isMessage = (item: TelepathMessage | TelepathNote): item is TelepathMessage => {
    return 'role' in item && 'message' in item && typeof item === 'object';
  };

  // Filter data based on active tab
  const messages = allData.filter(isMessage);

  // Render all tabs but hide inactive ones to preserve state (including loaded images)
  const renderTabContent = () => {
    return (
      <>
        <div className={activeTab === 'patient-basic' ? '' : 'tw-hidden'}>
          <PatientBasic
            isLoading={isLambdaFetching}
            errorType={lambdaErrorType}
            patient={lambdaData?.patient}
            intakeForms={lambdaData?.intakeForms}
          />
        </div>
        <div className={activeTab === 'order-listing' ? '' : 'tw-hidden'}>
          <OrderListing
            isLoading={isLambdaFetching}
            errorType={lambdaErrorType}
            orders={lambdaData?.orders}
            onOrderClick={handleOrderClick}
          />
        </div>
        <div className={activeTab === 'survey-forms' ? '' : 'tw-hidden'}>
          <SurveyForms isLoading={isLambdaFetching} errorType={lambdaErrorType} intakeForms={lambdaData?.intakeForms} />
        </div>
        <div className={activeTab === 'chart-notes' ? '' : 'tw-hidden'}>
          <LambdaChartNotes isLoading={isLambdaFetching} errorType={lambdaErrorType} notes={lambdaData?.notes} />
        </div>
        <div className={activeTab === 'messages' ? '' : 'tw-hidden'}>
          <Messages
            messages={messages}
            searchTerm=''
            isInitialLoading={isInitialLoading}
            isFetchingMore={isFetchingMore}
            hasMore={hasMore}
            isError={isError}
            error={error}
            onRetry={() => fetchData(false)}
          />
        </div>
      </>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size='xl'
      className='telepath-history-modal-custom'
      bodyClassName='!tw-overflow-hidden !tw-max-h-none !tw-p-0'
    >
      <div className='tw-p-4 tw-flex tw-flex-col tw-min-h-[65vh] tw-max-h-[650px]'>
        <h4 className='tw-mb-4'>Telepath History</h4>

        {/* Tabs Navigation */}
        <ShadowScroll>
          {({ containerProps, nextButtonProps, backButtonProps, hasOverflow }) => (
            <div className='tw-flex tw-items-center tw-gap-2'>
              {hasOverflow && (
                <DividerButton
                  icon={<BsChevronLeft className='tw-bg-transparent' />}
                  onClick={backButtonProps.onClick}
                  className={`${backButtonProps.className} tw-bg-primary tw-rounded-full tw-text-white tw-p-1 bouncing-effect`}
                  shadowDirection='right'
                />
              )}

              <div
                {...containerProps}
                className={
                  'tw-flex-grow tw-flex tw-items-center tw-gap-6 tw-justify-between ' + containerProps?.className
                }
              >
                <Tabs tabs={tabs} activeTab={activeTab} onTabChange={(value) => setActiveTab(value as TabValue)} />
              </div>

              {hasOverflow && (
                <DividerButton
                  icon={<BsChevronRight className='tw-bg-transparent' />}
                  onClick={nextButtonProps.onClick}
                  className={`${nextButtonProps.className} tw-bg-primary tw-rounded-full tw-text-white tw-p-1 bouncing-effect`}
                  shadowDirection='left'
                />
              )}
            </div>
          )}
        </ShadowScroll>

        {/* Tab Content */}
        <div ref={scrollContainerRef} className='mt-4 flex-grow-1 overflow-auto' style={{ scrollBehavior: 'smooth' }}>
          {renderTabContent()}
        </div>
      </div>

      <OrderDetailsModal
        isOpen={orderModalType === 'orderDetails'}
        onClose={() => setOrderModalType(null)}
        onOpenOrderSidebar={(order) => {
          dispatch(setOrder(order));
          setOrderModalType('orderPopup');
        }}
      />

      <OrderPopup
        show={orderModalType === 'orderPopup'}
        onHide={() => setOrderModalType(null)}
        orderUniqueId={order?.orderUniqueId ?? null}
      />
    </Modal>
  );
};
