'use client';

import InfiniteScroll from 'react-infinite-scroll-component';
import FilterButton from '@/components/Dashboard/FilterButton';
import StarRatings from 'react-star-ratings';
import { MobileCard } from '@/components/Dashboard/MobileCard';
import { Column, Table } from '@/components/Dashboard/Table';
import { capitalizeFirst, scrollToTop } from '@/lib/helper';
import { formatTableDateTime, formatUSDate, formatUSDateTime } from '@/helpers/dateFormatter';
import { RootState } from '@/store';
import { useLazyGetSubscriptionsQuery } from '@/store/slices/subscriptionsApiSlice';
import { setSubscription, Subscription } from '@/store/slices/subscriptionSlice';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Spinner } from 'react-bootstrap';
import { setSubscriptionsData, appendSubscriptionsData } from '@/store/slices/subscriptionsSlice';
import { MetaPayload } from '@/lib/types';
import { useAdminOrdersPage } from '@/contexts/AdminOrdersPageContext';
import { PlanType } from '@/types/medications';
import { Tooltip } from '@/components/elements';
import { SubscriptionPopup } from '@/modules/protected/admin/AdminOrdersPanel/subscriptions/includes/SubscriptionPopup';
import { PatientOrdersListPopup } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/PatientOrdersListPopup';
import { OrderPopup } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/OrderPopup';
import { OrderDetailsModal } from '@/components/Common/OrderDetailsModal';
import { PatientSideBar } from '@/components/Dashboard/PatientSideBar';
import { useGetSingleOrderQuery } from '@/store/slices/ordersApiSlice';
import { setOrder, Order } from '@/store/slices/orderSlice';
import { setPatient } from '@/store/slices/patientSlice';
import { mapPatientFromOrder } from '@/helpers/orderPatientHelpers';

export default function Subscriptions() {
  const dispatch = useDispatch();

  const orderType = useSelector((state: RootState) => state.sort.orderType);
  const search = useSelector((state: RootState) => state.sort.search);
  const sortOrder = useSelector((state: RootState) => state.sort.sortOrder);
  const sortField = useSelector((state: RootState) => state.sort.sortField);
  const subscriptionStatus = useSelector((state: RootState) => state.sort.subscriptionStatus);
  const subscriptionType = useSelector((state: RootState) => state.sort.subscriptionType);
  const productType = useSelector((state: RootState) => state.sort.productType);
  const dateRange = useSelector((state: RootState) => state.sort.dateRange);
  const [startDate, endDate] = dateRange || [null, null];

  const subscriptionsData = useSelector((state: RootState) => state.subscriptions);
  const { data = [], meta } = subscriptionsData || {};
  const { totalPages = 1, page: currentPage = 1 } = meta || {};
  const [showOrders, setShowOrders] = useState(false);
  const [modalType, setModalType] = useState<
    'subscriptionPopup' | 'orderDetails' | 'orderPopup' | 'patientSidebar' | null
  >(null);

  const subscription = useSelector((state: RootState) => state.subscription);
  const order = useSelector((state: RootState) => state.order);

  const { data: orderData } = useGetSingleOrderQuery(subscription.id || '', {
    refetchOnMountOrArgChange: true,
    skip: !subscription.id,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  const [triggerSubscriptions, { isFetching }] = useLazyGetSubscriptionsQuery();

  const { setSelectedPageFilters } = useAdminOrdersPage();

  const handleUpdateSubscriptions = async ({
    meta,
    search,
    sortField,
    sortOrder,
    subscriptionStatus: incomingSubscriptionStatus,
    append = false,
    subscriptionType,
    productType: incomingProductType,
    startDate: incomingStartDate,
    endDate: incomingEndDate,
  }: MetaPayload) => {
    // Ensure we have default values for subscriptions
    const finalSortField = sortField || 'createdAt';
    const finalSortOrder = sortOrder || 'DESC';
    // Use incoming subscriptionStatus, fallback to Redux state (no default)
    const finalSubscriptionStatus = incomingSubscriptionStatus || subscriptionStatus;
    const finalType = subscriptionType || PlanType.RECURRING;
    // Use incoming productType, fallback to Redux state
    const finalProductType = incomingProductType !== undefined ? incomingProductType : productType;
    // Use incoming dates, fallback to Redux state
    const finalStartDate = incomingStartDate !== undefined ? incomingStartDate : startDate;
    const finalEndDate = incomingEndDate !== undefined ? incomingEndDate : endDate;

    try {
      const { data } = await triggerSubscriptions({
        search,
        page: meta?.page || 1,
        limit: 30,
        ...(finalSubscriptionStatus && { status: finalSubscriptionStatus }),
        sortField: finalSortField,
        sortOrder: finalSortOrder,
        type: finalType,
        ...(finalStartDate && { startDate: finalStartDate }),
        ...(finalEndDate && { endDate: finalEndDate }),
        ...(finalProductType && { productType: finalProductType }),
      }).unwrap();

      const { page, subscriptions: newSubscriptions } = data || {};

      if (append) {
        dispatch(
          appendSubscriptionsData({
            meta: { page: page || 1, total: data.total, totalPages: data.totalPages, limit: 30 },
            data: newSubscriptions,
          })
        );
      } else {
        await scrollToTop('subscription-table-top');
        dispatch(
          setSubscriptionsData({
            data: newSubscriptions,
            meta: { page: page || 1, total: data.total, totalPages: data.totalPages, limit: 30 },
          })
        );
      }
    } catch (error) {
      console.error('Error fetching Subscriptions:', error);
    }
  };

  const fetchMore = () => {
    if (currentPage < totalPages && !isFetching) {
      handleUpdateSubscriptions({
        meta: { page: currentPage + 1, limit: 30 },
        search,
        sortOrder,
        sortField,
        subscriptionStatus,
        append: true,
        subscriptionType,
        productType,
        startDate,
        endDate,
      });
    }
  };

  function handleRowClick(subscription: Subscription) {
    dispatch(setSubscription(subscription));
    setModalType('subscriptionPopup');
  }

  const handleOrderClick = () => {
    setModalType('orderDetails');
  };

  const handleOrderClickFromModal = (order: Order) => {
    dispatch(setOrder(order));
    setModalType('orderPopup');
  };

  const columns: Column<Subscription>[] = [
    {
      header: 'STATUS',
      renderCell: (row) => (
        <span
          className={`custom-badge ${
            row?.status?.toLowerCase() === 'cancel_scheduled' ||
            row?.status?.toLowerCase() === 'update_scheduled' ||
            row?.status?.toLowerCase() === 'renewal_in_progress' ||
            row?.status?.toLowerCase() === 'shipped'
              ? `custom-badge-shipped`
              : `custom-badge-${row?.status?.toLowerCase()}`
          }`}
        >
          {capitalizeFirst(row?.status?.includes('_') ? row?.status.replace(/_/g, ' ') : row?.status)}
        </span>
      ),
    },
    {
      header: 'CUSTOMER',
      className: 'text-nowrap text-capitalize',
      accessor: 'patientName',
    },
    {
      header: 'PRODUCT',
      accessor: 'productName',
    },
    {
      header: 'START DATE',
      renderCell: (o) => formatUSDateTime(o.startDate),
    },
    {
      header: 'END DATE',
      renderCell: (o) => formatUSDateTime(o.endDate),
    },
    {
      header: 'next payment',
      renderCell: (row) => {
        if (
          row?.status?.toLowerCase() === 'cancel_scheduled' ||
          row?.status?.toLowerCase() === 'pause_scheduled' ||
          row?.status?.toLowerCase() === 'canceled'
        )
          return '-';
        return formatUSDate(row.nextPaymentDate);
      },
    },
    { header: 'ORDERS', accessor: 'orderCount' },
    {
      header: 'Resume Date',
      renderCell: (row) => <span>{row?.resumesAt ? formatTableDateTime(row?.resumesAt) : '-'}</span>,
    },
    {
      header: 'CANCELLATION REASON',
      renderCell: (row: Subscription) => {
        if (!row?.cancellationReason) return '-';
        return (
          <Tooltip onClick={(e) => e.stopPropagation()} content={row.cancellationReason} position='bottom'>
            <div className='tw-max-w-[200px] tw-truncate tw-text-sm tw-text-nowrap tw-cursor-help'>
              {row.cancellationReason}
            </div>
          </Tooltip>
        );
      },
    },
    {
      header: 'APP RATING',
      renderCell: (row: Subscription) => {
        if (row?.canceledByRole?.toLowerCase() === 'admin' || !row?.rating) return '-';
        if (row.status?.toLowerCase() === 'canceled' || row.status?.toLowerCase() === 'cancel_scheduled') {
          return (
            <StarRatings
              rating={row.rating}
              numberOfStars={5}
              starDimension='18px'
              starSpacing='2px'
              starRatedColor='#ffc107'
              starEmptyColor='#6c757d'
            />
          );
        }
        return '-';
      },
    },
  ];

  useEffect(() => {
    if (orderType === 'Subscriptions') {
      handleUpdateSubscriptions({ meta: { page: 1, limit: 30 } });

      setSelectedPageFilters(
        <FilterButton
          onFilterChange={handleUpdateSubscriptions}
          visibility={{
            showSubscriptionType: true,
            showSort: true,
            showSearch: true,
            showStatusFilter: true,
            showSubscriptionStatusFilter: true,
            showDateRange: true,
            showProductTypeFilter: true,
            showSearchClassName: 'col-md-6 col-lg-4 col-xl-4',
            showSortClassName: 'col-md-6 col-lg-4 col-xl-4',
            showStatusFilterClassName: 'col-md-6 col-lg-4 col-xl-4',
            showSubscriptionStatusFilterClassName: 'col-md-6 col-lg-4 col-xl-4',
            showSubscriptionTypeClassName: 'col-md-6 col-lg-4 col-xl-4',
            showDateRangeClassName: 'col-md-6 col-lg-4 col-xl-4',
            showProductTypeFilterClassName: 'col-md-6 col-lg-4 col-xl-4',
          }}
        />
      );
    }
  }, [orderType, dispatch]);

  const allSubscriptionsLoaded = currentPage >= totalPages;

  return (
    <>
      <div className='d-lg-none'>
        <InfiniteScroll
          dataLength={data.length}
          next={fetchMore}
          hasMore={!allSubscriptionsLoaded}
          loader={
            <div className='d-flex justify-content-center py-4'>
              <Spinner className='border-2' />
            </div>
          }
          height={`calc(100vh - 9rem)`}
        >
          <MobileCard
            loading={isFetching && data.length === 0}
            data={data}
            columns={columns}
            rowOnClick={handleRowClick}
          />
        </InfiniteScroll>
      </div>

      <div className='d-none d-lg-block'>
        <InfiniteScroll
          dataLength={data.length}
          next={fetchMore}
          hasMore={!allSubscriptionsLoaded}
          loader={
            <div className='d-flex justify-content-center py-4'>
              <Spinner className='border-2' />
            </div>
          }
          height={'calc(100vh - 244px)'}
        >
          <div id='subscription-table-top' />
          <Table
            data={data}
            columns={columns}
            isFetching={isFetching && data.length === 0}
            rowOnClick={handleRowClick}
          />
        </InfiniteScroll>
      </div>

      <SubscriptionPopup
        isOpen={modalType === 'subscriptionPopup'}
        onClose={() => setModalType(null)}
        onShowOrders={() => {
          if (orderData?.patient?.userId) {
            setShowOrders(true);
          }
        }}
      />

      <PatientOrdersListPopup
        show={showOrders}
        onHide={() => setShowOrders(false)}
        userId={orderData?.patient?.userId}
        handleOrderClick={handleOrderClick}
      />

      <OrderDetailsModal
        isOpen={modalType === 'orderDetails'}
        onClose={() => setModalType(null)}
        onOpenOrderSidebar={(order) => {
          handleOrderClickFromModal(order);
        }}
      />

      <OrderPopup
        hidePatientBtn={modalType === 'patientSidebar'}
        orderUniqueId={order?.orderUniqueId ?? null}
        onPatientClick={(orderData) => {
          if (orderData?.patient) {
            const mappedPatient = mapPatientFromOrder(orderData.patient);
            dispatch(setPatient(mappedPatient));
            setModalType('patientSidebar');
          }
        }}
        show={modalType === 'orderPopup'}
        onHide={() => setModalType(null)}
      />

      <PatientSideBar
        show={modalType === 'patientSidebar'}
        onHide={() => setModalType(null)}
        onOrderClick={() => setModalType('orderDetails')}
      />
    </>
  );
}
