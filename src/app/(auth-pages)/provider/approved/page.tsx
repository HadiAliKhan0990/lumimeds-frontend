'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from 'react-bootstrap';
import { ProvidersPageContainer } from '@/components/ProvidersModule/components/ProvidersPageContainer';
import { QuepageContentContainer } from '@/components/ProvidersModule/components/QuepageContentContainer';
import { ApprovedFilters, ApprovedHeader, ApprovedTable } from '@/modules/protected/provider/approved';
import { IApprovedRxInfo, IApprovedRxQueryParams, ProductTypeFilter } from '@/types/approved';
import { transformApiResponseToUI } from '@/helpers/approved';
import { useLazyGetApprovedRxOrdersQuery, useRevertOrdersMutation } from '@/store/slices/ordersApiSlice';
import { appendApprovedRxData, setApprovedRxData } from '@/store/slices/approvedRxSlice';
import { RootState } from '@/store';
import { useLazyGetUnreadCountQuery } from '@/store/slices/notificationsApiSlice';
import {
  setUnreadCount,
  setPendingEncountersCount,
  setAppointmentsCount,
  setApprovedCount,
} from '@/store/slices/notificationsSlice';
import { PatientSideBar } from '@/components/Dashboard/PatientSideBar';
import { OrderDetailsModal } from '@/components/Common/OrderDetailsModal';
import { OrderPopup } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/OrderPopup';
import { setSelectedOrderId } from '@/store/slices/selectedOrderSlice';
import { Patient, setPatient } from '@/store/slices/patientSlice';
import { setOrder } from '@/store/slices/orderSlice';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/constants';
import { clearFormData } from '@/store/slices/formDataSlice';
import ConfirmationModal from '@/components/ConfirmationModal';
import toast from 'react-hot-toast';
import { getDatePresetRange, formatDateToUsRangeString } from '@/helpers/datePresets';
import { DatePresetKey } from '@/types/datePresets';
import { useRef } from 'react';

export default function ApprovedPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const [checkedRxMap, setCheckedRxMap] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);
  const [openChangeModal, setOpenChangeModal] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDatePreset, setSelectedDatePreset] = useState<{ label: string; value: string } | null>(null);
  const [customDateRange, setCustomDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [currentDateRange, setCurrentDateRange] = useState<{ startDate?: string; endDate?: string }>({});
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('approvalDate');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC' | ''>('DESC');
  const [productType, setProductType] = useState<{ label: string; value: ProductTypeFilter | '' }>({
    label: 'All Products',
    value: '',
  });
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showTriageModal, setShowTriageModal] = useState(false);
  const [orderModalType, setOrderModalType] = useState<'orderDetails' | 'orderPopup' | null>(null);
  const [triageNotes, setTriageNotes] = useState('');
  const [isProcessingTriage, setIsProcessingTriage] = useState(false);

  const requestCounterRef = useRef(0);

  // Get data from Redux store
  const { data = [], meta } = useSelector((state: RootState) => state.approvedRx);
  const { totalPages = 1, page: currentPage = 1 } = meta || {};

  const order = useSelector((state: RootState) => state.order);

  const searchParams = useSearchParams();

  const orderIdFromParams = searchParams.get('orderId');

  const patientNameFromParams = searchParams.get('patientName');

  const replaceParams = () => {
    if (orderIdFromParams || patientNameFromParams) router.replace(`${ROUTES.PROVIDER_APPROVED}`);
  };

  // RTK Query hook
  const [triggerApprovedRx, { isFetching }] = useLazyGetApprovedRxOrdersQuery();
  const [revertOrders] = useRevertOrdersMutation();
  const [triggerGetUnreadCount] = useLazyGetUnreadCountQuery();

  useEffect(() => {
    if (orderIdFromParams && patientNameFromParams) {
      setSearch(patientNameFromParams);
      handleUpdateApprovedRx({ search: orderIdFromParams });
    }
  }, [orderIdFromParams, patientNameFromParams]);

  // Transform API data to UI format
  const uiData: IApprovedRxInfo[] = data.length > 0 ? transformApiResponseToUI(data) : [];

  const handleUpdateApprovedRx = async (params: IApprovedRxQueryParams, append = false) => {
    try {
      requestCounterRef.current += 1;
      const currentRequestId = requestCounterRef.current;

      const queryParams: IApprovedRxQueryParams = {
        sortBy: params.sortBy || sortBy,
        sortOrder: (params.sortOrder || sortOrder) as 'ASC' | 'DESC' | undefined,
        page: params.page || 1,
        limit: params.limit || 10,
      };

      // Always include search parameter (even if empty to clear search)
      const searchValue = params.search !== undefined ? params.search : search;
      queryParams.search = searchValue;

      if (params.startDate && params.endDate) {
        queryParams.startDate = params.startDate;
        queryParams.endDate = params.endDate;
      }

      const statusesToUse = params.statuses !== undefined ? params.statuses : selectedStatuses;
      if (statusesToUse && statusesToUse.length > 0) {
        queryParams.statuses = statusesToUse;
      }

      // Only use state value if productType wasn't explicitly passed (including empty string to reset)
      const productTypeToUse = 'productType' in params ? params.productType : productType.value;
      if (productTypeToUse) {
        queryParams.productType = productTypeToUse;
      }

      const { data: res } = await triggerApprovedRx(queryParams);

      if (currentRequestId !== requestCounterRef.current) {
        console.log('Ignoring stale response');
        return;
      }

      if (res) {
        if (append) {
          dispatch(
            appendApprovedRxData({
              data: res.orders,
              meta: res.meta,
            })
          );
        } else {
          dispatch(
            setApprovedRxData({
              data: res.orders,
              meta: res.meta,
            })
          );
        }
      }

      // Refetch unread count after successful fetch
      try {
        const unreadCountRes = await triggerGetUnreadCount().unwrap();
        dispatch(setUnreadCount(unreadCountRes.count));
        if (unreadCountRes.pendingEncountersCount !== undefined) {
          dispatch(setPendingEncountersCount(unreadCountRes.pendingEncountersCount));
        }
        if (unreadCountRes.appointmentsCount !== undefined) {
          dispatch(setAppointmentsCount(unreadCountRes.appointmentsCount));
        }
        if (unreadCountRes.approvedCount !== undefined) {
          dispatch(setApprovedCount(unreadCountRes.approvedCount));
        }
      } catch (error) {
        console.error('Failed to refetch unread count:', error);
      }
    } catch (error) {
      console.error('Error fetching approved RX orders:', error);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    handleUpdateApprovedRx({
      search: value,
      startDate: currentDateRange.startDate,
      endDate: currentDateRange.endDate,
      statuses: selectedStatuses,
      productType: productType.value || undefined,
      sortBy,
      sortOrder: sortOrder || undefined,
      page: 1,
      limit: 10,
    });

    replaceParams();
  };

  const handleDatePresetChange = (option: { label: string; value: string } | null) => {
    if (!option || !option.value) {
      setSelectedDatePreset(null);
      setShowCustomDatePicker(false);
      setCustomDateRange([null, null]);
      setCurrentDateRange({});
      handleUpdateApprovedRx({
        search,
        startDate: undefined,
        endDate: undefined,
        statuses: selectedStatuses,
        productType: productType.value || undefined,
        sortBy,
        sortOrder: sortOrder || undefined,
        page: 1,
        limit: 10,
      });
      replaceParams();
      return;
    }

    const presetValue = option.value;

    if (presetValue === 'custom') {
      setSelectedDatePreset(option);
      setShowCustomDatePicker(true);
      setCustomDateRange([null, null]);
      return;
    }

    const range = getDatePresetRange(presetValue as DatePresetKey);
    if (!range) {
      toast.error('Invalid date preset');
      setSelectedDatePreset(null);
      return;
    }

    setSelectedDatePreset(option);
    setShowCustomDatePicker(false);
    setCurrentDateRange({ startDate: range.startDate, endDate: range.endDate });
    handleUpdateApprovedRx({
      search,
      startDate: range.startDate,
      endDate: range.endDate,
      statuses: selectedStatuses,
      productType: productType.value || undefined,
      sortBy,
      sortOrder: sortOrder || undefined,
      page: 1,
      limit: 10,
    });

    replaceParams();
  };

  const handleCustomDateRangeChange = (startDate: Date | null, endDate: Date | null) => {
    setCustomDateRange([startDate, endDate]);

    if (startDate && endDate) {
      const formattedStart = formatDateToUsRangeString(startDate);
      const formattedEnd = formatDateToUsRangeString(endDate);

      setCurrentDateRange({ startDate: formattedStart, endDate: formattedEnd });

      setShowCustomDatePicker(false);

      handleUpdateApprovedRx({
        search,
        startDate: formattedStart,
        endDate: formattedEnd,
        statuses: selectedStatuses,
        productType: productType.value || undefined,
        sortBy,
        sortOrder: sortOrder || undefined,
        page: 1,
        limit: 10,
      });

      replaceParams();
    }
  };

  const handleStatusChange = (statuses: string[]) => {
    setSelectedStatuses(statuses);
    handleUpdateApprovedRx({
      search,
      startDate: currentDateRange.startDate,
      endDate: currentDateRange.endDate,
      statuses,
      productType: productType.value || undefined,
      sortBy,
      sortOrder: sortOrder || undefined,
      page: 1,
      limit: 10,
    });

    replaceParams();
  };

  const handleSortChange = (sortBy?: { label: string; value: string }, sortOrder?: string) => {
    // Parse the sort value which is in format "FIELD:ORDER"
    const splitValue = sortBy?.value?.split(':');

    const finalSortBy = splitValue?.[0] || 'approvalDate';
    const finalSortOrder = (sortOrder as 'ASC' | 'DESC') || 'DESC';

    setSortBy(finalSortBy);
    setSortOrder(finalSortOrder);

    handleUpdateApprovedRx({
      search,
      startDate: currentDateRange.startDate,
      endDate: currentDateRange.endDate,
      statuses: selectedStatuses,
      productType: productType.value || undefined,
      sortBy: finalSortBy,
      sortOrder: finalSortOrder,
      page: 1,
      limit: 10,
    });

    replaceParams();
  };

  const handleProductTypeChange = (option: { label: string; value: ProductTypeFilter | '' } | null) => {
    const newProductType = option || { label: 'All Products', value: '' };
    setProductType(newProductType);

    handleUpdateApprovedRx({
      search,
      startDate: currentDateRange.startDate,
      endDate: currentDateRange.endDate,
      statuses: selectedStatuses,
      productType: (newProductType.value || undefined) as ProductTypeFilter | undefined,
      sortBy,
      sortOrder: sortOrder || undefined,
      page: 1,
      limit: 10,
    });

    replaceParams();
  };

  const fetchMore = () => {
    if (currentPage < totalPages && !isFetching) {
      handleUpdateApprovedRx(
        {
          search,
          startDate: currentDateRange.startDate,
          endDate: currentDateRange.endDate,
          statuses: selectedStatuses,
          productType: productType.value || undefined,
          sortBy,
          sortOrder: sortOrder || undefined,
          page: currentPage + 1,
          limit: 10,
        },
        true
      );
    }
  };

  const handleViewButtonClick = (row: IApprovedRxInfo) => {
    setOpen(true);

    setOrderId(row?.orderId ?? '');

    const dispatchedRow: Patient = {
      ...row.patientDetails,
      id: row?.patientDetails?.id ?? '',
    };

    dispatch(setPatient(dispatchedRow));

    dispatch(setSelectedOrderId(row?.orderId ?? ''));
    dispatch(
      setOrder({
        id: row?.orderId ?? '',
        patient: dispatchedRow,
        rxStatus: row?.rxStatus,
        prescriptionInstructions: row?.prescriptionInstructions,
      })
    );
  };

  const handleChangeButtonClick = (row: IApprovedRxInfo) => {
    setOpenChangeModal(true);

    setOrderId(row?.orderId ?? '');

    const dispatchedRow: Patient = {
      ...row.patientDetails,
      id: row?.patientDetails?.id ?? '',
    };

    dispatch(setPatient(dispatchedRow));

    dispatch(setSelectedOrderId(row?.orderId ?? ''));
    dispatch(
      setOrder({
        id: row?.orderId ?? '',
        patient: dispatchedRow,
        rxStatus: row?.rxStatus,
        prescriptionInstructions: row?.prescriptionInstructions,
      })
    );
  };

  const handleTriageButtonClick = (row: IApprovedRxInfo) => {
    setOrderId(row?.orderId ?? '');
    setShowTriageModal(true);
  };

  const handleCloseTriageModal = () => {
    setShowTriageModal(false);
    setTriageNotes('');
    setIsProcessingTriage(false);
  };

  const handleConfirmTriage = async () => {
    try {
      if (!orderId) {
        toast.error('Order ID is required');
        return;
      }

      setIsProcessingTriage(true);

      const result = await revertOrders({
        orderIds: [orderId],
        notes: triageNotes,
      }).unwrap();

      const responseData = (result as { data?: { message?: string; revertedOrders?: number } })?.data;
      const apiMessage =
        responseData?.message || (result as { message?: string })?.message || 'Order triaged successfully';

      if (responseData?.revertedOrders && responseData.revertedOrders > 0) {
        toast.success(apiMessage);

        handleUpdateApprovedRx({
          sortBy: 'approvalDate',
          sortOrder: 'DESC',
          page: 1,
          limit: 10,
        });
      } else {
        toast.error('Failed to revert order');
      }

      setShowTriageModal(false);
      setTriageNotes('');
      setIsProcessingTriage(false);
      setOrderId(null);
    } catch (error) {
      console.error('Error triaging order:', error);
      toast.error('Failed to triage order to admin');
      setIsProcessingTriage(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    handleUpdateApprovedRx({
      sortBy: 'approvalDate',
      sortOrder: 'DESC',
      page: 1,
      limit: 10,
    });
  }, []);

  const allOrdersLoaded = currentPage >= totalPages;

  const resetStateAndRefetch = () => {
    setOpen(false);
    setOrderId(null);
    dispatch(setOrder({}));
    // Clear form data when closing popup
    dispatch(clearFormData());
    handleUpdateApprovedRx({
      sortBy: 'approvalDate',
      sortOrder: 'DESC',
      page: 1,
      limit: 10,
    });

    replaceParams();
  };

  const resetChangeModalAndRefetch = () => {
    setOpenChangeModal(false);
    setOrderId(null);
    dispatch(setOrder({}));
    // Clear form data when closing modal
    dispatch(clearFormData());
    handleUpdateApprovedRx({
      sortBy: 'approvalDate',
      sortOrder: 'DESC',
      page: 1,
      limit: 10,
    });

    replaceParams();
  };

  return (
    <ProvidersPageContainer>
      <ApprovedHeader />
      <Card body className='rounded-12 border-light'>
        <QuepageContentContainer>
          <ApprovedFilters
            selectedSort={{
              label: sortBy && sortOrder ? `${sortOrder === 'ASC' ? 'Oldest' : 'Newest'}` : 'Sort By',
              value: `${sortBy}:${sortOrder}`,
            }}
            onSearch={handleSearch}
            approvedCount={meta?.todayCount ?? 0}
            onDatePresetChange={handleDatePresetChange}
            onCustomDateRangeChange={handleCustomDateRangeChange}
            onStatusChange={handleStatusChange}
            onSortChange={handleSortChange}
            onProductTypeChange={handleProductTypeChange}
            selectedDatePreset={selectedDatePreset}
            customDateRange={customDateRange}
            showCustomDatePicker={showCustomDatePicker}
            selectedStatuses={selectedStatuses}
            selectedProductType={productType}
            search={search}
          />
          <ApprovedTable
            data={uiData}
            onViewButtonClick={handleViewButtonClick}
            onChangeButtonClick={handleChangeButtonClick}
            onTriageButtonClick={handleTriageButtonClick}
            checkedRxMap={checkedRxMap}
            setCheckedRxMap={setCheckedRxMap}
            isFetching={isFetching}
            hasMore={!allOrdersLoaded}
            fetchMore={fetchMore}
          />
        </QuepageContentContainer>
      </Card>

      {/* Triage Modal */}
      <ConfirmationModal
        show={showTriageModal}
        onHide={handleCloseTriageModal}
        onConfirm={handleConfirmTriage}
        loading={isProcessingTriage}
        title='Assign to Admin'
        message={
          <div className='form-group'>
            <label htmlFor='notes' className='form-label text-start w-100'>
              Notes
            </label>
            <textarea
              id='notes'
              className='form-control text-start'
              rows={4}
              value={triageNotes}
              onChange={(e) => setTriageNotes(e.target.value)}
              placeholder='Enter notes here...'
            />
          </div>
        }
        confirmLabel='Yes, Assign'
        cancelLabel='Cancel'
      />

      <PatientSideBar
        showAcceptRejectRXForm
        showAcceptRejectRXFormActionButtons={false}
        show={open}
        onAccept={resetStateAndRefetch}
        onReject={resetStateAndRefetch}
        onHide={() => {
          setOpen(false);

          setOrderId(null);
          dispatch(setOrder({}));
        }}
        orderId={orderId ?? ''}
        hideTriageButton={false}
        onOrderClick={() => setOrderModalType('orderDetails')}
      />
      <PatientSideBar
        showAcceptRejectRXForm
        showAcceptRejectRXFormActionButtons={true}
        show={openChangeModal}
        allowEdit={true}
        onAccept={resetChangeModalAndRefetch}
        onReject={resetChangeModalAndRefetch}
        onHide={() => {
          setOpenChangeModal(false);

          setOrderId(null);
          // Clear form data when closing modal
          dispatch(clearFormData());
          dispatch(setOrder({}));
        }}
        orderId={orderId ?? ''}
        hideTriageButton={false}
        onOrderClick={() => setOrderModalType('orderDetails')}
      />
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
    </ProvidersPageContainer>
  );
}
