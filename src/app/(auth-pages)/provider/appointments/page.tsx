'use client';

import { ProvidersPageContainer } from '@/components/ProvidersModule/components/ProvidersPageContainer';
import { QuepageContentContainer } from '@/components/ProvidersModule/components/QuepageContentContainer';
import { ROUTES } from '@/constants';
import { AppointmentsFilters, AppointmentsHeader, AppointmentsTable } from '@/modules/protected/provider/appointments';
import { transformApiResponseToUI } from '@/modules/protected/provider/appointments/AppointmentsData';
import { RootState } from '@/store';
import { setAppointments, resetRefetchFlag, setTodayCount, decrementTodayCount } from '@/store/slices/appointmentsRealTimeSlice';
import { useLazyGetUnreadCountQuery } from '@/store/slices/notificationsApiSlice';
import {
  setAppointmentsCount,
  setApprovedCount,
  setPendingEncountersCount,
  setUnreadCount,
} from '@/store/slices/notificationsSlice';
import { useRevertOrdersToAdminMutation } from '@/store/slices/ordersApiSlice';
import { AppointmentsQueryParams, useGetPatientsWithOrdersQuery } from '@/store/slices/patientsApiSlice';
import { decrementAppointmentStats } from '@/store/slices/providerSlice';
import { IPendingrxPatientListInfo, StatusLabel } from '@/types/appointment';
import { ProductTypeFilter } from '@/types/approved';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Card } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Error } from '@/lib/types';
import { isAxiosError } from 'axios';
import { CircularProgress } from '@/components/elements';

export default function AppointmentsPage() {
  const [checkedPatientMap, setCheckedPatientMap] = useState<Record<string, string>>({});

  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [status, setStatus] = useState<{ label: string; value: keyof StatusLabel }>({
    label: 'Status',
    value: '' as keyof StatusLabel,
  });
  const [sortBy, setSortBy] = useState<'status' | 'firstName' | 'dateReceived'>('dateReceived');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [productType, setProductType] = useState<{ label: string; value: ProductTypeFilter | '' }>({
    label: 'All Products',
    value: '',
  });
  const [queryParams, setQueryParams] = useState<AppointmentsQueryParams>({});
  const [isClient, setIsClient] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const searchParams = useSearchParams();

  const orderIdFromParams = searchParams.get('orderId');

  const patientNameFromParams = searchParams.get('patientName');

  const replaceParams = () => {
    if (orderIdFromParams || patientNameFromParams) router.replace(`${ROUTES.PROVIDER_APPOINTMENTS}`);
  };

  useEffect(() => {
    if (orderIdFromParams && patientNameFromParams) {
      setSearch(patientNameFromParams);
      updateQueryParams({ search: orderIdFromParams });
    }
  }, [orderIdFromParams, patientNameFromParams]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: apiData, refetch } = useGetPatientsWithOrdersQuery(queryParams, { refetchOnMountOrArgChange: true });

  const [revertOrders, { isLoading: isRevertingOrders }] = useRevertOrdersToAdminMutation();
  const [triggerGetUnreadCount] = useLazyGetUnreadCountQuery();

  // Get real-time appointments from store
  const realTimeAppointments = useSelector((state: RootState) => state.appointmentsRealTime.appointments);
  const todayCount = useSelector((state: RootState) => state.appointmentsRealTime.todayCount);
  const shouldRefetchAppointments = useSelector((state: RootState) => state.appointmentsRealTime.shouldRefetch);

  const apiDataTransformed: IPendingrxPatientListInfo[] = apiData ? transformApiResponseToUI(apiData) : [];

  const hasActiveFilters = !!(
    search ||
    selectedDate ||
    status.value ||
    sortBy !== 'dateReceived' ||
    sortOrder !== 'desc' ||
    productType.value
  );

  useEffect(() => {
    if (!hasActiveFilters && apiData !== undefined) {
      const transformedData = transformApiResponseToUI(apiData);
      dispatch(setAppointments(transformedData));
      // Sync todayCount from API when data is loaded
      if (apiData.todayCount !== undefined) {
        dispatch(setTodayCount(apiData.todayCount));
      }
    }
  }, [apiData, hasActiveFilters, dispatch]);

  useEffect(() => {
    if (shouldRefetchAppointments) {
      refetch();
      dispatch(resetRefetchFlag());
    }
  }, [shouldRefetchAppointments, refetch, dispatch]);

  // Refetch unread count after successful appointments fetch
  useEffect(() => {
    if (apiData !== undefined) {
      triggerGetUnreadCount()
        .unwrap()
        .then((res) => {
          dispatch(setUnreadCount(res.count));
          if (res.pendingEncountersCount !== undefined) {
            dispatch(setPendingEncountersCount(res.pendingEncountersCount));
          }
          if (res.appointmentsCount !== undefined) {
            dispatch(setAppointmentsCount(res.appointmentsCount));
          }
          if (res.approvedCount !== undefined) {
            dispatch(setApprovedCount(res.approvedCount));
          }
        })
        .catch((error) => {
          console.error('Failed to refetch unread count:', error);
        });
    }
  }, [apiData, triggerGetUnreadCount, dispatch]);

  // Final deduplication safety check to prevent duplicate keys in React
  const data: IPendingrxPatientListInfo[] = useMemo(() => {
    // When filters are active, use filtered API data but prefer real-time versions for matching items
    if (hasActiveFilters) {
      // Create a map of real-time appointments for quick lookup
      const realTimeMap = new Map<string | number, IPendingrxPatientListInfo>();
      realTimeAppointments.forEach((item) => {
        if (item.id) {
          realTimeMap.set(item.id, item);
        }
      });

      // Use filtered API results, but prefer real-time data if available (for fresher updates)
      const uniqueMap = new Map<string | number, IPendingrxPatientListInfo>();
      apiDataTransformed.forEach((item) => {
        if (item.id && !uniqueMap.has(item.id)) {
          // Use real-time version if available, otherwise use API version
          const realTimeItem = realTimeMap.get(item.id);
          uniqueMap.set(item.id, realTimeItem || item);
        }
      });
      return Array.from(uniqueMap.values());
    }

    // When no filters, use real-time appointments from Redux store
    const uniqueMap = new Map<string | number, IPendingrxPatientListInfo>();
    realTimeAppointments.forEach((item) => {
      if (item.id && !uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
      }
    });
    return Array.from(uniqueMap.values());
  }, [hasActiveFilters, apiDataTransformed, realTimeAppointments]);

  // Calculate if all items are checked
  const allChecked = data.length > 0 && data.every((item) => item.id && checkedPatientMap[item.id as string]);

  const confirmModalConfigs = useMemo(() => {
    const ids = Object.keys(checkedPatientMap);

    return {
      shouldAllowConfirmModal: ids.length > 0 || allChecked,
      isAllSelected: allChecked || (ids.length > 0 && ids.length === apiDataTransformed.length),
    };
  }, [checkedPatientMap, allChecked, apiDataTransformed.length]);

  const { shouldAllowConfirmModal } = confirmModalConfigs;

  const updateQueryParams = (params: Partial<AppointmentsQueryParams> = {}) => {
    const newParams: AppointmentsQueryParams = {
      search: params.search !== undefined ? params.search : search,
      status: params.status !== undefined ? params.status : status.value,
      dateFrom: params.dateFrom !== undefined ? params.dateFrom : selectedDate,
      dateTo: params.dateTo !== undefined ? params.dateTo : undefined,
      sortBy: params.sortBy !== undefined ? params.sortBy : sortBy,
      sortOrder: params.sortOrder !== undefined ? params.sortOrder : sortOrder,
      // Only use state value if productType wasn't explicitly passed (including undefined to reset)
      productType: 'productType' in params ? params.productType : (productType.value || undefined),
    };

    Object.keys(newParams).forEach((key) => {
      const value = newParams[key as keyof AppointmentsQueryParams];
      if (value === '' || value === undefined) {
        delete newParams[key as keyof AppointmentsQueryParams];
      }
    });

    setQueryParams(newParams);
  };


  const handleCreateAppointment = () => {
    // ignore
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    updateQueryParams({ search: value });

    replaceParams();
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    updateQueryParams({ dateFrom: date });

    replaceParams();
  };

  const handleStatusChange = (statusValue: { label: string; value: keyof StatusLabel }) => {
    setStatus(statusValue);
    updateQueryParams({ status: statusValue.value });

    replaceParams();
  };

  const handleSortChange = (sortValue: string) => {
    const [field, order] = sortValue.split('-');
    setSortBy(field as 'status' | 'firstName' | 'dateReceived');
    setSortOrder(order as 'asc' | 'desc');
    updateQueryParams({ sortBy: field as 'status' | 'firstName' | 'dateReceived', sortOrder: order as 'asc' | 'desc' });

    replaceParams();
  };

  const handleProductTypeChange = (option: { label: string; value: ProductTypeFilter | '' } | null) => {
    const newProductType = option || { label: 'All Products', value: '' };
    setProductType(newProductType);
    updateQueryParams({ productType: (newProductType.value || undefined) as ProductTypeFilter | undefined });

    replaceParams();
  };

  // Handle select all functionality
  const handleSelectAll = () => {
    if (allChecked) {
      // Uncheck all
      setCheckedPatientMap({});
    } else {
      // Check all
      const allCheckedMap: Record<string, string> = {};
      data.forEach((item) => {
        if (item.id) {
          allCheckedMap[item.id as string] = item.id as string;
        }
      });
      setCheckedPatientMap(allCheckedMap);
    }
  };

  const handleConfirmAssign = async (notes: string, callBack: () => void) => {
    try {
      const orderIds = Object.keys(checkedPatientMap);

      if (orderIds.length === 0) {
        toast.error('Please select at least one order to revert');
        return;
      }

      const result = await revertOrders({ orderIds, notes }).unwrap();

      callBack();

      // Access the response data with proper typing
      const responseData = (result as { data?: { message?: string; revertedOrders?: number } })?.data;
      const apiMessage =
        responseData?.message || (result as { message?: string })?.message || 'Orders processed successfully';

      // Show the API message in toast and close modal
      if (responseData?.revertedOrders && responseData.revertedOrders > 0) {
        toast.success(apiMessage);
      } else {
        toast(apiMessage);
      }

      // Clear selections and refresh data
      setCheckedPatientMap({});

      // Update dashboard stats - decrement for each reverted order
      const revertedCount = responseData?.revertedOrders || orderIds.length;
      for (let i = 0; i < revertedCount; i++) {
        dispatch(decrementAppointmentStats());
        dispatch(decrementTodayCount());
      }

      const freshData = await refetch();
      if (freshData.data) {
        const transformedData = transformApiResponseToUI(freshData.data);
        dispatch(setAppointments(transformedData));
        // Sync todayCount from API after refetch
        if (freshData.data.todayCount !== undefined) {
          dispatch(setTodayCount(freshData.data.todayCount));
        }
      }

      replaceParams();
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data?.message
          : (error as Error).data.message || 'Failed to revert orders to admin'
      );
    }
  };


  const isFilterNotApplied = !hasActiveFilters;

  // Prevent hydration mismatch by not rendering until client-side

  if (!isClient) {
    return (
      <ProvidersPageContainer>
        <div className='d-flex justify-content-center align-items-center' style={{ height: '400px' }}>
          <CircularProgress className='!tw-w-10 !tw-h-10' />
        </div>
      </ProvidersPageContainer>
    );
  }

  return (
    <ProvidersPageContainer>
      <AppointmentsHeader onCreateAppointment={handleCreateAppointment} />
      <Card body className='rounded-12 border-light'>
        <QuepageContentContainer>
          <AppointmentsFilters
            isRevertingOrders={isRevertingOrders}
            onSearch={handleSearch}
            onDateChange={handleDateChange}
            onStatusChange={(status: { label: string; value: keyof StatusLabel }) => handleStatusChange(status)}
            onSortChange={handleSortChange}
            onProductTypeChange={handleProductTypeChange}
            appointmentCount={todayCount}
            onAssignToAdmin={handleConfirmAssign}
            onSelectAll={handleSelectAll}
            isAllChecked={allChecked}
            selectedDate={selectedDate}
            selectedStatus={status as { label: string; value: keyof StatusLabel }}
            selectedSort={`${sortBy}-${sortOrder}`}
            selectedProductType={productType}
            search={search}
            shouldAllowConfirmModal={shouldAllowConfirmModal}
          />
          <AppointmentsTable
            data={data}
            checkedPatientMap={checkedPatientMap}
            setCheckedPatientMap={setCheckedPatientMap}
            isFilterNotApplied={isFilterNotApplied}
          />
        </QuepageContentContainer>
      </Card>
    </ProvidersPageContainer>
  );
}
