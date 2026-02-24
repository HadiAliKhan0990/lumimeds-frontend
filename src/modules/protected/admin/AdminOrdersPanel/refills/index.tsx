'use client';

import InfiniteScroll from 'react-infinite-scroll-component';
import FilterButton from '@/components/Dashboard/FilterButton';
import { Column, Table } from '@/components/Dashboard/Table';
import { MobileCard } from '@/components/Dashboard/MobileCard';
import { useEffect, useState } from 'react';
import { RootState } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { RefillSurveyRequest, useLazyGetRefillSurveyRequestsQuery } from '@/store/slices/refillsApiSlice';
import { Spinner } from 'react-bootstrap';
import { RefillPopup } from '@/modules/protected/admin/AdminOrdersPanel/refills/includes/RefillPopup';
import { ManageRefillModal } from '@/modules/protected/admin/AdminOrdersPanel/refills/includes/ManageRefillModal';
import { RemarksModal } from '@/modules/protected/admin/AdminOrdersPanel/refills/includes/RemarksModal';
import { OrderPopup } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/OrderPopup';
import { scrollToTop } from '@/lib/helper';
import { MetaPayload, SingleOrder } from '@/lib/types';
import { REFILL_STATUSES } from '@/constants';
import { updateArrayObjectByIdDeep } from '@/helpers/arrayUpdate';
import { RowActions } from '@/modules/protected/admin/AdminOrdersPanel/refills/includes/RowActions';
import { PatientSideBar } from '@/components/Dashboard/PatientSideBar';
import { OrderDetailsModal } from '@/components/Common/OrderDetailsModal';
import { setPatient } from '@/store/slices/patientSlice';
import { setOrder } from '@/store/slices/orderSlice';
import { formatUSDateTime } from '@/helpers/dateFormatter';
import { useAdminOrdersPage } from '@/contexts/AdminOrdersPageContext';
import { mapPatientFromOrder, SingleOrderPatient } from '@/helpers/orderPatientHelpers';

interface Props {
  query?: string;
  newRefill?: RefillSurveyRequest | null;
  onRefillAdded?: () => void;
}

export default function Refills({ query = '', newRefill, onRefillAdded }: Readonly<Props>) {
  const dispatch = useDispatch();

  const [selectedRefill, setSelectedRefill] = useState<RefillSurveyRequest | null>(null);
  const [modalType, setModalType] = useState<
    'details' | 'manage' | 'order' | 'remarks' | 'patient' | 'orderDetails' | null
  >(null);
  const [refillData, setRefillData] = useState<RefillSurveyRequest[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const orderType = useSelector((state: RootState) => state.sort.orderType);
  const search = useSelector((state: RootState) => state.sort.search);
  const sortOrder = useSelector((state: RootState) => state.sort.sortOrder);
  const sortStatus = useSelector((state: RootState) => state.sort.sortStatus);
  const productType = useSelector((state: RootState) => state.sort.productType);
  const order = useSelector((state: RootState) => state.order);

  const { setSelectedPageFilters } = useAdminOrdersPage();

  const [triggerRefills, { isFetching }] = useLazyGetRefillSurveyRequestsQuery();

  const handleUpdateRefills = async ({
    meta,
    append = false,
    search,
    sortOrder,
    sortStatus,
    productType,
  }: MetaPayload) => {
    try {
      const { data: res } = await triggerRefills({
        page: meta?.page || 1,
        limit: 30,
        ...(search && { search }),
        ...(sortStatus && { status: sortStatus }),
        ...(sortOrder && { sortOrder }),
        ...(productType && { productType }),
      });

      const { data } = res || {};
      const { requests = [], totalPages: totalPagesCount = 1, page: currentPageNum = 1 } = data || {};

      if (append) {
        setRefillData((prev) => {
          const existingIds = new Set(prev.map((item) => item.id));
          const newItems = requests.filter((item) => !existingIds.has(item.id));
          return [...prev, ...newItems];
        });
      } else {
        await scrollToTop('refills-table-top');
        setRefillData(requests);
      }

      setCurrentPage(currentPageNum);
      setHasMore(currentPageNum < totalPagesCount);
    } catch (error) {
      console.error('Error fetching refills:', error);
    }
  };

  const fetchMore = () => {
    if (hasMore && !isFetching) {
      handleUpdateRefills({
        meta: { page: currentPage + 1, limit: 30 },
        append: true,
        search,
        sortOrder,
        sortStatus,
        productType,
      });
    }
  };

  const handleRowClick = (refill: RefillSurveyRequest) => {
    setSelectedRefill(refill);
    setModalType('details');
  };

  const handleUpdateRefillsSuccess = (refill: RefillSurveyRequest) => {
    const updatedRefillData = updateArrayObjectByIdDeep(refillData, refill);
    // Ensure refillOrderUniqueId is properly set after merge
    const finalRefillData = updatedRefillData.map((item) => {
      if (item.id === refill.id) {
        return {
          ...item,
          refillOrderUniqueId: refill.refillOrderUniqueId ?? item.refillOrderUniqueId ?? null,
        };
      }
      return item;
    });
    setRefillData(finalRefillData);
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedRefill(null);
  };

  const handleClosePopup = () => {
    setModalType(null);
    setSelectedRefill(null);
  };

  const handlePatientNameClick = (refill: RefillSurveyRequest, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (refill.patient) {
      dispatch(setPatient(refill.patient));
      if (refill.order) {
        dispatch(setOrder({ id: refill.order.id ?? '', patient: refill.patient }));
      }
      setModalType('patient');
    }
  };

  const handleOrderPopupPatientClick = (order: { patient?: SingleOrder['patient']; id?: string }) => {
    if (order.patient) {
      const patientData = order.patient as SingleOrderPatient;
      const mappedPatient = mapPatientFromOrder(patientData);
      dispatch(setPatient(mappedPatient));
      dispatch(setOrder({ id: order.id ?? '', patient: mappedPatient }));
      setModalType('patient');
    }
  };

  const handleRefillIdClick = (refill: RefillSurveyRequest, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setSelectedRefill(refill);
    setModalType('details');
  };

  const handleOrderIdClick = (refill: RefillSurveyRequest, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const status = refill.status?.toLowerCase();

    // For approved status: open refill order details using refillOrderId
    if (status === 'approved' && refill.refillOrderId) {
      setSelectedRefill(refill);
      dispatch(setOrder({ id: refill.refillOrderId }));
      setModalType('order');
    } else {
      // For other statuses, open refill details popup
      setSelectedRefill(refill);
      setModalType('details');
    }
  };

  const columns: Column<RefillSurveyRequest>[] = [
    {
      header: 'ACTIONS',
      renderCell: (refill) => (
        <RowActions refill={refill} setModalType={setModalType} setSelectedRefill={setSelectedRefill} />
      ),
    },
    {
      header: 'Refill ID',
      renderCell: (refill) => (
        <button
          onClick={(e) => handleRefillIdClick(refill, e)}
          className='btn btn-link p-0 text-sm tw-cursor-pointer fw-semibold'
        >
          {refill.uniqueRefillId || '-'}
        </button>
      ),
      className: 'align-middle',
    },
    {
      header: 'Refill Order ID',
      renderCell: (refill) => {
        const status = refill.status?.toLowerCase();

        // For approved status: show refill order's orderUniqueId from API response
        // If not available, show 'refill-order' as fallback
        if (status === 'approved' && refill.refillOrderId) {
          const displayId = refill.refillOrderUniqueId ?? 'refill-order';
          return (
            <button
              onClick={(e) => handleOrderIdClick(refill, e)}
              className='btn btn-link p-0 text-sm tw-cursor-pointer fw-semibold'
            >
              {displayId}
            </button>
          );
        }

        // For all other statuses (open, rejected, on_hold, etc.): show '-'
        // because refill order is not created yet
        return '-';
      },
      className: 'align-middle',
    },
    {
      header: 'PATIENT',
      renderCell: (refill) => (
        <button
          onClick={(e) => handlePatientNameClick(refill, e)}
          className='text-capitalize text-nowrap btn btn-link p-0 text-sm'
        >{`${refill.patient?.firstName} ${refill.patient?.lastName}`}</button>
      ),
    },
    {
      header: 'Product Name',
      renderCell: (refill) => {
        const productName =
          refill.order?.category && refill.order?.medicineType && refill.order?.dosageType
            ? `${refill.order?.category} ${refill.order?.medicineType} ${refill.order?.dosageType}`
            : refill.order?.productName ?? '-';
        return <span className='tw-capitalize text-nowrap'>{productName}</span>;
      },
      className: 'tw-capitalize text-nowrap',
    },
    {
      header: 'STATUS',
      renderCell: (refill) => {
        if (!refill.status) return '-';
        return <span className={`custom-badge custom-badge-${refill.status}`}>{refill.status.replace('_', ' ')}</span>;
      },
    },
    {
      header: 'REMARKS',
      renderCell: (refill) => (
        <button
          className='btn btn-link text-sm text-nowrap p-0'
          onClick={(e) => {
            e.stopPropagation();
            setSelectedRefill(refill);
            setModalType('remarks');
          }}
        >
          {refill.remarks ? 'View/Edit Remarks' : 'Add Remarks'}
        </button>
      ),
    },
    {
      header: 'Created at',
      renderCell: (refill) => {
        if (!refill.createdAt) return '-';
        return <span className='tw-text-wrap sm:tw-text-nowrap'>{formatUSDateTime(refill.createdAt)}</span>;
      },
    },
    {
      header: 'Last updated at',
      renderCell: (refill) => {
        if (!refill.updatedAt) return '-';
        return <span className='tw-text-wrap sm:tw-text-nowrap'>{formatUSDateTime(refill.updatedAt)}</span>;
      },
    },
    {
      header: 'Refills count',
      accessor: 'vialsRequested',
    },
    {
      header: 'Replacement Price',
      renderCell: (refill) => (refill.replacementPrice?.amount ? `$${refill.replacementPrice?.amount}` : '-'),
    },
    {
      header: 'Approved at',
      renderCell: (refill) => {
        if (
          refill.statusInfo?.status === refill.status &&
          refill.statusInfo?.status === 'approved' &&
          refill.status === 'approved' &&
          refill.statusInfo?.statusUpdatedAt
        ) {
          return (
            <span className='tw-text-wrap sm:tw-text-nowrap'>
              {formatUSDateTime(refill.statusInfo.statusUpdatedAt)}
            </span>
          );
        }
        return '-';
      },
    },
    {
      header: 'Rejected at',
      renderCell: (refill) => {
        if (
          refill.statusInfo?.status === refill.status &&
          refill.statusInfo?.status === 'rejected' &&
          refill.status === 'rejected' &&
          refill.statusInfo?.statusUpdatedAt
        ) {
          return (
            <span className='tw-text-wrap sm:tw-text-nowrap'>
              {formatUSDateTime(refill.statusInfo.statusUpdatedAt)}
            </span>
          );
        }
        return '-';
      },
    },
  ];

  useEffect(() => {
    if (orderType === 'Refills') {
      setSelectedPageFilters(
        <FilterButton
          onFilterChange={handleUpdateRefills}
          defaultFilterValue='Status'
          visibility={{
            showSearch: true,
            showStatusFilter: true,
            showMultiSelect: true,
            showSort: true,
            showSortClassName: 'col-md-6 col-lg-3',
            showProductTypeFilter: true,
            showProductTypeFilterClassName: 'col-md-6 col-lg-3',
            showSearchClassName: 'col-md-6 col-lg-3',
            showStatusFilterClassName: 'col-md-6 col-lg-3',
            showMultiSelectClassName: 'col-md-6 col-lg-3',
          }}
          filters={REFILL_STATUSES}
        />
      );
    }
  }, [orderType]);

  useEffect(() => {
    if (orderType === 'Refills' && !query) {
      handleUpdateRefills({
        meta: { page: 1, limit: 30 },
        ...(productType && { productType }),
      });
      scrollToTop('refills-table-top');
    }
  }, [orderType, query]);

  // Handle newly created refill from parent component
  useEffect(() => {
    if (newRefill) {
      setRefillData([newRefill, ...refillData]);
      onRefillAdded?.();
    }
  }, [newRefill]);

  const allRefillsLoaded = !hasMore;

  return (
    <>
      <div className='d-lg-none'>
        <InfiniteScroll
          dataLength={refillData.length}
          next={fetchMore}
          hasMore={!allRefillsLoaded}
          loader={
            <div className='d-flex justify-content-center py-4'>
              <Spinner className='border-2' />
            </div>
          }
          height={'calc(100vh - 200px)'}
        >
          <MobileCard
            loading={isFetching && refillData.length === 0}
            data={refillData}
            columns={columns}
            rowOnClick={handleRowClick}
          />
        </InfiniteScroll>
      </div>

      <div className={'d-none d-lg-block'}>
        <InfiniteScroll
          dataLength={refillData.length}
          next={fetchMore}
          hasMore={!allRefillsLoaded}
          loader={
            <div className='d-flex justify-content-center py-4'>
              <Spinner className='border-2' />
            </div>
          }
          height={'calc(100vh - 206px)'}
        >
          <div id='refills-table-top' />
          <Table
            data={refillData}
            columns={columns}
            isFetching={isFetching && refillData.length === 0}
            rowOnClick={handleRowClick}
          />
        </InfiniteScroll>
      </div>

      {/* Sidebar/Popup */}

      <RefillPopup show={modalType === 'details'} onHide={handleClosePopup} refill={selectedRefill} />
      <OrderPopup
        show={modalType === 'order'}
        onHide={handleCloseModal}
        onPatientClick={handleOrderPopupPatientClick}
        orderUniqueId={
          // If viewing refill order (order.id matches refillOrderId), use refill order unique ID
          selectedRefill?.refillOrderId && order.id === selectedRefill.refillOrderId
            ? selectedRefill?.refillOrderUniqueId ?? null
            : // Otherwise, use parent order unique ID
              selectedRefill?.order?.orderUniqueId ?? null
        }
      />
      <PatientSideBar
        show={modalType === 'patient'}
        onHide={() => setModalType(null)}
        onOrderClick={() => setModalType('orderDetails')}
      />

      {/* Modals */}

      <OrderDetailsModal
        isOpen={modalType === 'orderDetails'}
        onClose={() => setModalType(null)}
        onOpenOrderSidebar={(order) => {
          dispatch(setOrder(order));
          setModalType('order');
        }}
      />

      <ManageRefillModal
        onSuccess={handleUpdateRefillsSuccess}
        isOpen={modalType === 'manage'}
        onClose={handleCloseModal}
        refill={selectedRefill}
      />
      <RemarksModal
        onSuccess={handleUpdateRefillsSuccess}
        isOpen={modalType === 'remarks'}
        onClose={handleCloseModal}
        refill={selectedRefill}
      />
    </>
  );
}
