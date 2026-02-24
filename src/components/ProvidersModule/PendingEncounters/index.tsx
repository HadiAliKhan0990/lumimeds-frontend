'use client';
import { MobileHeader } from '@/components/Dashboard/MobileHeader';
import React, { useEffect, useMemo, useState } from 'react';
import { QueryPageTitleWrapper } from '../components/QueryPageTitleWrapper';
// import { NotificationIconButton } from '../../appointments/NotificationIconButton';
import { CheckboxInput, CheckboxLabel } from '@/components/Checkbox/Checkbox';
import { MobileCard } from '@/components/Dashboard/MobileCard';
import { PatientSideBar } from '@/components/Dashboard/PatientSideBar';
import { OrderDetailsModal } from '@/components/Common/OrderDetailsModal';
import { OrderPopup } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/OrderPopup';
import { setSelectedOrderId } from '@/store/slices/selectedOrderSlice';
import CalendlyButton from '@/components/Dashboard/provider/CalendlyButton';
import { Column, Table } from '@/components/Dashboard/Table';
import { RenderWRTRecentDate } from '@/components/Dates/RenderWRTRecentDate';
import { VisitsIcon } from '@/components/Icon/VisitsIcon';
import { NotificationBell } from '@/components/Notifications';
import { ROUTES } from '@/constants';
import { abbreviateLocationState } from '@/helpers/stateHelpers';
import { useWindowWidth } from '@/hooks/useWindowWidth';
import { formatDateWithTime, getAppointmentTypeColor, removePlusMinusSigns, scrollToTop } from '@/lib/helper';
import { OrderStatus } from '@/lib/types';
import { RootState } from '@/store';
import {
  resetRefetchFlag,
  setEncounters,
  decrementTodayCount,
  setTodayCount,
} from '@/store/slices/encountersRealTimeSlice';
import { useLazyGetUnreadCountQuery } from '@/store/slices/notificationsApiSlice';
import {
  setAppointmentsCount,
  setApprovedCount,
  setPendingEncountersCount,
  setUnreadCount,
} from '@/store/slices/notificationsSlice';
import {
  EncounterSortField,
  PendingEncounter,
  useAutoAssignOrdersMutation,
  useLazyGetPendingEncountersQuery,
  useRevertOrdersMutation,
} from '@/store/slices/ordersApiSlice';
import { setOrder } from '@/store/slices/orderSlice';
import { Patient, setPatient } from '@/store/slices/patientSlice';
import { decrementEncounterStats } from '@/store/slices/providerSlice';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Spinner } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDispatch, useSelector } from 'react-redux';
import { ProvidersPageContainer } from '../components/ProvidersPageContainer';
import { QuePageBulkActionPallete } from '../components/QuePageBulkActionPallete';
import { QuepageContentContainer } from '../components/QuepageContentContainer';
import {
  QueuePageDateFilter,
  QueuePageProductTypeFilter,
  QueuePageSearchFilter,
  QueuePageSortFilter,
} from '../components/QueuePageFilters';
import { QueuePageFiltersWrapper } from '../components/QueuePageFiltersContainer';
import {
  QueuePageFiltersTitle,
  QueuePageTitleAndFiltersWrapper,
} from '../components/QueuePageTitleAndFiltersContainer';
import { ProductTypeFilter } from '@/types/approved';

interface EncountersState {
  isAllChecked: boolean;
  checkedPatientMap: Record<string, string>;
  isModalOpen: boolean;
  openOrderId: string;
  data: PendingEncounter[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    todayCount: number;
  };
  filters: {
    search: string;
    date?: string;
    status?: { label: string; value: OrderStatus };
    sortBy?: { label: string; value: string };
    sortOrder?: string;
    productType?: { label: string; value: ProductTypeFilter | '' };
  };
}

export const PendingEncountersProvidersModule = () => {
  const initialState: EncountersState = {
    isAllChecked: false,
    checkedPatientMap: {},
    isModalOpen: false,
    openOrderId: '',
    data: [],
    pagination: {
      currentPage: 1,
      totalPages: 0,
      total: 0,
      todayCount: 0,
    },
    filters: {
      search: '',
      sortBy: { label: 'Newest', value: 'assignedAt+' },
      sortOrder: 'DESC',
    },
  };

  const [state, setState] = useState<EncountersState>(initialState);
  const [lastApiDataHash, setLastApiDataHash] = useState<string>('');
  const [orderModalType, setOrderModalType] = useState<'orderDetails' | 'orderPopup' | null>(null);

  const dispatch = useDispatch();

  const { windowWidth } = useWindowWidth();

  const isMoisSmallerThanLg = windowWidth < 992;

  const [getPendingEncounters, { isFetching: isPendingEncountersLoading }] = useLazyGetPendingEncountersQuery();
  const [triggerGetUnreadCount] = useLazyGetUnreadCountQuery();

  const [autoAssignOrders, { isLoading: isAutoAssigningOrders }] = useAutoAssignOrdersMutation();

  const [revertOrders, { isLoading: isRevertingOrders }] = useRevertOrdersMutation();

  const router = useRouter();

  const searchParams = useSearchParams();

  const orderIdFromParams = searchParams.get('orderId');

  const patientNameFromParams = searchParams.get('patientName');
  // Real-time data from Redux
  const realTimeEncounters = useSelector((state: RootState) => state.encountersRealTime.encounters);
  const todayCount = useSelector((state: RootState) => state.encountersRealTime.todayCount);
  const isRealTimeConnected = useSelector((state: RootState) => state.encountersRealTime.isConnected);
  const shouldRefetch = useSelector((state: RootState) => state.encountersRealTime.shouldRefetch);

  const isProviderPaused = useSelector((state: RootState) => state.user.isPaused) === true;
  const order = useSelector((state: RootState) => state.order);

  // Initialize real-time store with API data if empty
  React.useEffect(() => {
    if (state.data.length > 0 && realTimeEncounters.length === 0) {
      dispatch(setEncounters(state.data));
    }
  }, [state.data, realTimeEncounters.length, dispatch]);

  // Listen for Redux trigger to refetch
  useEffect(() => {
    if (shouldRefetch) {
      resetStateAndRefetch();
      // Reset the flag to prevent infinite loops
      dispatch(resetRefetchFlag());
    }
  }, [shouldRefetch, dispatch]);

  const confirmModalConfigs = useMemo(() => {
    const ids = Object.keys(state.checkedPatientMap);

    return {
      shouldAllowConfirmModal: ids.length > 0 || state.isAllChecked,
      isAllSelected: state.isAllChecked || (ids.length > 0 && ids.length === state.pagination.total),
    };
  }, [state.checkedPatientMap, state.isAllChecked, state.pagination.total]);

  const { shouldAllowConfirmModal, isAllSelected: isAllManuallySelected } = confirmModalConfigs;

  const handleUpdateEncounters = async ({
    search = state.filters.search,
    date = state.filters.date,
    status = state.filters.status,
    sortBy = state.filters.sortBy,
    sortOrder = state.filters.sortOrder,
    productType = state.filters.productType,
    page = state.pagination.currentPage,
    append = false,
  }: {
    search?: string;
    date?: string;
    status?: { label: string; value: OrderStatus };
    sortBy?: { label: string; value: string };
    sortOrder?: string;
    productType?: { label: string; value: ProductTypeFilter | '' };
    page?: number;
    append?: boolean;
  }) => {
    try {
      const sortByValue = sortBy?.value ? (removePlusMinusSigns(sortBy.value) as EncounterSortField) : undefined;

      const result = await getPendingEncounters({
        ...(search && { search }),
        ...(date && { date }),
        ...(status?.value && { status: status.value }),
        ...(sortByValue && sortOrder && { sortBy: sortByValue, sortOrder }),
        ...(productType?.value && { productType: productType.value as ProductTypeFilter }),
        page,
        limit: 10,
      }).unwrap();

      const { encounters, meta } = result;

      // Validate that encounters have proper patient data
      const validatedEncounters = encounters.map((encounter) => ({
        ...encounter,
        // Ensure patient data is properly formatted
        patient: encounter.patient
          ? {
              ...encounter.patient,
              firstName: encounter.patient.firstName || 'Unknown',
              lastName: encounter.patient.lastName || 'Unknown',
            }
          : {
              firstName: 'Unknown',
              lastName: 'Unknown',
              id: 'unknown',
              age: 0,
              gender: 'Unknown',
            },
      }));

      setState((prev) => ({
        ...prev,
        data: append ? [...prev.data, ...validatedEncounters] : validatedEncounters,
        pagination: {
          currentPage: meta.page,
          totalPages: meta.totalPages,
          total: meta.total,
          todayCount: meta.todayCount ?? prev.pagination.todayCount,
        },
      }));

      if (!append) {
        const currentHash = JSON.stringify(encounters.map((enc) => enc.id).sort());
        const hasChanged = lastApiDataHash && currentHash !== lastApiDataHash;
        const isFirstLoad = !lastApiDataHash;

        const currentlyHasFilters = !!(search || date || status?.value || sortBy?.value);

        if (hasChanged || isFirstLoad || !currentlyHasFilters) {
          dispatch(setEncounters(validatedEncounters));
          // Sync todayCount from API when data is loaded
          if (meta.todayCount !== undefined) {
            dispatch(setTodayCount(meta.todayCount));
          }
        }
        if (validatedEncounters.length === 0 && realTimeEncounters.length > 0 && lastApiDataHash) {
          dispatch(setEncounters([]));
        }
        setLastApiDataHash(currentHash);
      }

      if (!append) {
        await scrollToTop('encounters-table-top');
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
      console.error('Failed to fetch encounters:', error);
      // Set empty data on error to prevent showing stale data
      setState((prev) => ({
        ...prev,
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          total: 0,
          todayCount: prev.pagination.todayCount,
        },
      }));
    }
  };

  const mergedData: PendingEncounter[] = React.useMemo(() => {
    if (!isRealTimeConnected || realTimeEncounters.length === 0) {
      return state.data;
    }
    if (state.data.length === 0 && realTimeEncounters.length > 0) {
      return realTimeEncounters;
    }
    const mergedData = [...state.data];
    const apiIds = new Set(state.data.map((enc) => enc.id));

    // Iterate in reverse order so the first items in realTimeEncounters stay at the top
    [...realTimeEncounters].reverse().forEach((realTimeEncounter) => {
      const existingIndex = mergedData.findIndex((apiEncounter) => apiEncounter.id === realTimeEncounter.id);
      if (existingIndex !== -1) {
        mergedData[existingIndex] = realTimeEncounter;
      } else {
        if (!apiIds.has(realTimeEncounter.id)) {
          mergedData.unshift(realTimeEncounter);
        }
      }
    });

    return mergedData;
  }, [isRealTimeConnected, realTimeEncounters, state.data]);

  // Initial load
  React.useEffect(() => {
    if (orderIdFromParams && patientNameFromParams) {
      setState((prev) => ({
        ...prev,
        filters: { ...prev.filters, search: patientNameFromParams },
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          total: 0,
          todayCount: prev.pagination.todayCount,
        },
      }));
    }

    handleUpdateEncounters({ ...(orderIdFromParams ? { search: orderIdFromParams } : {}) });
  }, []);

  const handleRowClick = (row: PendingEncounter) => {
    setState((prev) => ({
      ...prev,
      isModalOpen: true,
      openOrderId: row.id ?? '',
    }));

    const dispatchedRow: Patient = {
      ...row.patient,
    };

    dispatch(setPatient(dispatchedRow));

    dispatch(setSelectedOrderId(row.id ?? ''));
    dispatch(setOrder({ id: row.id ?? '', patient: dispatchedRow }));
  };

  const columns: Column<PendingEncounter>[] = [
    {
      header: '',
      renderCell: (row) => {
        return (
          <CheckboxLabel
            onClick={(event) => event.stopPropagation()}
            className='mt-3 mt-sm-0 d-none d-lg-block'
            htmlFor={`select-${row.id}`}
          >
            <CheckboxInput
              onClick={(event) => {
                event.stopPropagation();
              }}
              checked={!!state.checkedPatientMap?.[row.id ?? '']}
              onChange={() => {
                setState((prev) => {
                  if (prev.checkedPatientMap?.[row.id ?? '']) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { [row.id ?? '']: _, ...rest } = prev.checkedPatientMap;
                    return {
                      ...prev,
                      checkedPatientMap: rest,
                    };
                  } else {
                    return {
                      ...prev,
                      checkedPatientMap: {
                        ...prev.checkedPatientMap,
                        [(row.id as string) ?? '']: (row.id as string) ?? '',
                      },
                    };
                  }
                });
              }}
              id={`select-${row.id}`}
            />
          </CheckboxLabel>
        );
      },
    },
    {
      header: 'Patient Details',
      renderCell: (row) => {
        return (
          <div className={`${isMoisSmallerThanLg ? '-mt-1-5' : ''} d-flex`}>
            <div className='w-100 text-break d-flex   align-items-start justify-content-between gap-4'>
              <div className='d-flex flex-column'>
                <span className={`${isMoisSmallerThanLg ? 'w-100' : 'w-100px'} text-small text-start`}>
                  {row.patient.firstName ?? 'N/A'} {row.patient.lastName ?? 'N/A'}
                </span>
                <div className='d-flex flex-wrap gap-1'>
                  <span className='text-muted'>{row.patient.age ? Math.trunc(row.patient.age) : 'N/A'}Y,</span>
                  <span className='text-muted text-capitalize'>{row.patient.gender}</span>
                </div>
              </div>
              <CheckboxLabel className='d-lg-none' htmlFor={`select-${row.id}`}>
                <CheckboxInput
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                  checked={!!state.checkedPatientMap?.[row.id ?? '']}
                  onChange={() => {
                    setState((prev) => {
                      if (prev.checkedPatientMap?.[row.id ?? '']) {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { [row.id ?? '']: _, ...rest } = prev.checkedPatientMap;
                        return {
                          ...prev,
                          checkedPatientMap: rest,
                        };
                      } else {
                        return {
                          ...prev,
                          checkedPatientMap: {
                            ...prev.checkedPatientMap,
                            [(row.id as string) ?? '']: (row.id as string) ?? '',
                          },
                        };
                      }
                    });
                  }}
                  id={`select-${row.id}`}
                />
              </CheckboxLabel>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Ordered',
      renderCell: (row) => {
        return (
          <div className='text-small'>
            <div className='d-flex flex-column align-items-start'>
              {/* <div className='tw-line-clamp-3' title={row.ordered.products.join(', ')}>
                {row.ordered.products.join(', ')}
              </div> */}
              <div className='tw-line-clamp-3 tw-text-wrap tw-max-w-60' title={row.ordered.products.join(', ')}>
                {row.ordered.products.join(', ')}
              </div>
              <div className='text-muted' title={row.ordered.subscription}>
                {row.ordered.subscription ?? ''}
              </div>
              {row.type ? (
                <div className='tw-mt-2 custom-badge custom-badge-sm custom-badge-gray-neutral'>
                  <span>{row.type}</span>
                  <span
                    style={{
                      backgroundColor: getAppointmentTypeColor(row.type ?? 'Subscription', row.ordered?.products),
                    }}
                    className='tw-ml-2 tw-w-2 tw-h-2 tw-rounded-full tw-bg-primary'
                  ></span>
                </div>
              ) : null}
              {/* <DottedChip label={row.ordered.subscription ?? 'N/A'} dotClassName='bg-primary' /> */}
            </div>
          </div>
        );
      },
    },
    {
      header: 'City/State',
      renderCell: (row) => abbreviateLocationState(row.state),
    },
    {
      header: 'Assigned At',
      renderCell: (row) => {
        let finalDate = <span>N/A</span>;

        if (row.assignedAt) {
          const { month, day, year } = formatDateWithTime(row.assignedAt) ?? {};

          finalDate = (
            <div className='d-flex flex-wrap gap-2 text-muted'>
              <span>
                {month} {day}, {year}
              </span>
              <RenderWRTRecentDate className='bg-medium-light-gray px-1 rounded-1' date={row.assignedAt} />
            </div>
          );
        }

        return (
          <div className='d-flex flex-wrap gap-2'>
            {finalDate}

            {row.isExpiring && <span className='rounded-1 px-2 bg-danger-light '>Expiring</span>}

            {row.isNew && <span className='rounded-1 px-2 bg-pastel-blue '>New</span>}
          </div>
        );
      },
    },
    {
      header: 'RX Status',
      renderCell: (row) => {
        return (
          <div className={`text-small custom-badge custom-badge-${row?.rxStatus?.toLowerCase()}`}>
            {row?.rxStatus?.split('_')?.join(' ')}
          </div>
        );
      },
    },
  ];

  const fetchMore = () => {
    if (state.pagination.currentPage < state.pagination.totalPages && !isPendingEncountersLoading) {
      handleUpdateEncounters({
        page: state.pagination.currentPage + 1,
        append: true,
      });
    }
  };

  const replaceParams = () => {
    if (orderIdFromParams || patientNameFromParams) router.replace(`${ROUTES.PROVIDER_PENDING_ENCOUNTERS}`);
  };

  const handleSearch = (searchTerm: string) => {
    setState((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        currentPage: 1,
        totalPages: 0,
        total: 0,
      },
      filters: {
        ...prev.filters,
        search: searchTerm,
      },
      data: [],
    }));

    handleUpdateEncounters({
      search: searchTerm,
      page: 1,
    });

    replaceParams();
  };

  const handleDateChange = (newDate: string) => {
    setState((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        currentPage: 1,
        totalPages: 0,
        total: 0,
      },
      filters: {
        ...prev.filters,
        date: newDate,
      },
      data: [],
    }));
    handleUpdateEncounters({ date: newDate, page: 1 });

    replaceParams();
  };

  const handleSortChange = (newSortBy?: { label: string; value: string }, newSortOrder?: string) => {
    setState((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        currentPage: 1,
        totalPages: 0,
        total: 0,
      },
      filters: {
        ...prev.filters,
        sortBy: newSortBy,
        sortOrder: newSortOrder,
      },
      data: [],
    }));
    handleUpdateEncounters({ sortBy: newSortBy, sortOrder: newSortOrder, page: 1 });

    replaceParams();
  };

  const handleProductTypeChange = (newProductType: { label: string; value: string } | null) => {
    const typedProductType = {
      label: newProductType?.label || 'All Products',
      value: (newProductType?.value || '') as ProductTypeFilter | '',
    };
    setState((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        currentPage: 1,
        totalPages: 0,
        total: 0,
      },
      filters: {
        ...prev.filters,
        productType: typedProductType,
      },
      data: [],
    }));
    // Pass the new value explicitly, don't rely on state
    handleUpdateEncounters({
      productType: typedProductType,
      page: 1,
      // Explicitly pass other filter values to avoid stale closure
      search: state.filters.search,
      date: state.filters.date,
      status: state.filters.status,
      sortBy: state.filters.sortBy,
      sortOrder: state.filters.sortOrder,
    });

    replaceParams();
  };

  const handleSelectAll = () => {
    setState((prev) => ({
      ...prev,
      isAllChecked: !prev.isAllChecked,
      checkedPatientMap: !prev.isAllChecked
        ? mergedData.reduce((acc, curr) => ({ ...acc, [curr.id ?? '']: curr.id ?? '' }), {})
        : {},
    }));
  };

  const resetStateAndRefetch = async () => {
    setState(initialState);

    // Clear RTK Query cache for pending encounters to ensure fresh data
    try {
      // Force refetch with cache invalidation
      await getPendingEncounters({
        page: 1,
        limit: 10,
      }).unwrap();
    } catch (error) {
      console.error('Error refetching encounters:', error);
    }

    // Refetch encounters with reset state
    await handleUpdateEncounters({
      page: 1,
      append: false,
      date: '',
      status: { label: '', value: '' as OrderStatus },
      sortBy: { label: '', value: '' as string },
      sortOrder: '',
      search: '',
      productType: { label: '', value: '' },
    });

    replaceParams();
  };
  const handleRevertOrders = async ({ notes, callBack }: { notes: string; callBack: () => void }) => {
    if (shouldAllowConfirmModal) {
      try {
        // Immediately remove the selected entries from the UI to prevent "Unknown" display
        const selectedOrderIds = Object.keys(state.checkedPatientMap);
        setState((prev) => ({
          ...prev,
          data: prev.data.filter((encounter) => !selectedOrderIds.includes(encounter.id || '')),
          checkedPatientMap: {},
          isAllChecked: false,
        }));

        const result = await revertOrders({ orderIds: selectedOrderIds, notes }).unwrap();

        toast.success('Orders assigned to admin successfully');

        // Update dashboard stats - decrement for each reverted order
        const responseData = (result as { data?: { revertedOrders?: number } })?.data;
        const revertedCount = responseData?.revertedOrders || selectedOrderIds.length;
        for (let i = 0; i < revertedCount; i++) {
          dispatch(decrementEncounterStats());
          dispatch(decrementTodayCount());
        }

        // Update real-time store to remove the entries
        dispatch(setEncounters(state.data.filter((encounter) => !selectedOrderIds.includes(encounter.id || ''))));

        // Close modal and call callback immediately
        callBack();

        // Refetch data in background to ensure consistency
        setTimeout(async () => {
          await resetStateAndRefetch();
        }, 100);
      } catch (error) {
        console.error('Failed to revert orders:', error);
        toast.error('Failed to revert orders');

        // Restore data on error
        await resetStateAndRefetch();
      }
    } else {
      toast.error('Kindly select at least one order to assign');
    }
  };

  const handleAutoAssignOrders = async () => {
    await autoAssignOrders()
      .unwrap()
      .then(() => {
        toast.success('Orders auto assigned successfully');

        resetStateAndRefetch();
      })
      .catch(() => {
        toast.error('Failed to auto assign orders');
      });
  };

  const hasActiveFilters = useMemo(() => {
    const hasSearch = state.filters.search && state.filters.search.trim() !== '';
    const hasDate = state.filters.date && state.filters.date.trim() !== '';
    const hasStatus = state.filters.status && state.filters.status.value && state.filters.status.value.trim() !== '';
    const hasSortBy =
      state.filters.sortBy &&
      state.filters.sortBy.value &&
      state.filters.sortBy.value.trim() !== '' &&
      state.filters.sortBy.value !== 'assignedAt+';
    const hasProductType =
      state.filters.productType && state.filters.productType.value && state.filters.productType.value.trim() !== '';

    return hasSearch || hasDate || hasStatus || hasSortBy || hasProductType;
  }, [state.filters]);

  const isFilterNotApplied = !hasActiveFilters;

  const removeFromEncountersHandler = () => {
    setState((prev) => ({
      ...prev,
      data: prev.data.filter((encounter) => encounter.id !== state.openOrderId),
    }));

    dispatch(setEncounters(state.data.filter((encounter) => encounter.id !== state.openOrderId)));

    setState((prev) => ({ ...prev, isModalOpen: false, openOrderId: '' }));
  };

  return (
    <ProvidersPageContainer id='encounters-table-top'>
      <QueryPageTitleWrapper>
        <MobileHeader title='Pending Encounters' />
        {/* <NotificationIconButton /> */}
        <div className='d-flex flex-column flex-md-row-reverse align-items-md-center align-items-end gap-2'>
          <NotificationBell />
          <CalendlyButton />
        </div>
      </QueryPageTitleWrapper>
      <Card body className='rounded-12  border-light'>
        <QuepageContentContainer>
          <QueuePageTitleAndFiltersWrapper>
            <QueuePageFiltersTitle
              pageTitle={
                <div className='tw-flex tw-flex-wrap tw-gap-x-2 tw-gap-y-0 tw-items-center'>
                  <span>Pending Encounters</span>
                  {todayCount !== undefined ? (
                    <span className='text-muted fw-normal fs-6'>({todayCount} Today)</span>
                  ) : null}
                </div>
              }
              icon={
                <span className='tw-self-start sm:tw-self-center tw-mt-1.5 sm:tw-mt-0'>
                  <VisitsIcon className='text-muted' size={24} />
                </span>
              }
            />
            <QueuePageFiltersWrapper>
              <QueuePageSearchFilter onSearch={handleSearch} value={state.filters.search ?? ''} />
              <QueuePageDateFilter onDateChange={handleDateChange} value={state.filters.date ?? ''} />
              <QueuePageProductTypeFilter
                onProductTypeChange={handleProductTypeChange}
                value={state.filters.productType}
              />
              <QueuePageSortFilter
                onSortChange={handleSortChange}
                value={
                  {
                    label: state.filters.sortOrder
                      ? state.filters.sortOrder === 'DESC'
                        ? 'Newest'
                        : 'Oldest'
                      : 'Sort By',
                    value: state.filters.sortBy?.value ?? '',
                  } as { label: string; value: string }
                }
              />
            </QueuePageFiltersWrapper>
            <div className='tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-w-full'>
              <div className='tw-w-full'>
                <QuePageBulkActionPallete
                  isAssigningToAdmin={isRevertingOrders}
                  onSelectAll={handleSelectAll}
                  isAllChecked={state.isAllChecked || isAllManuallySelected}
                  onAssign={handleRevertOrders}
                  shoudAlloConfirmModal={shouldAllowConfirmModal}
                />
              </div>
              <div className='tw-flex gap-2 mt-2 tw-w-full xl:tw-w-[240px] md:mt-0 justify-content-end overflow-x-auto'>
                <span className='d-inline-block'>
                  <button
                    disabled={isAutoAssigningOrders || isProviderPaused}
                    className='btn btn-primary d-flex gap-2 align-items-center text-nowrap tw-w-full'
                    onClick={handleAutoAssignOrders}
                    style={isProviderPaused ? { pointerEvents: 'none' } : {}}
                  >
                    Load More Encounters
                    {isAutoAssigningOrders && <Spinner size='sm' />}
                  </button>
                </span>
              </div>
            </div>
          </QueuePageTitleAndFiltersWrapper>
          <div className='d-lg-none'>
            <InfiniteScroll
              dataLength={mergedData.length}
              next={fetchMore}
              hasMore={state.pagination.currentPage < state.pagination.totalPages}
              loader={
                <div className='d-flex justify-content-center py-4'>
                  <Spinner size='sm' />
                </div>
              }
              height={`calc(100vh - 350px)`}
            >
              <MobileCard
                rowOnClick={handleRowClick}
                loading={isPendingEncountersLoading && mergedData.length === 0}
                data={mergedData}
                columns={columns}
                emptyState={isFilterNotApplied ? <EmptyState /> : undefined}
              />
            </InfiniteScroll>
          </div>

          <div className='d-none d-lg-block'>
            <InfiniteScroll
              dataLength={mergedData.length}
              next={fetchMore}
              hasMore={state.pagination.currentPage < state.pagination.totalPages}
              loader={
                <div className='d-flex justify-content-center py-4'>
                  <Spinner size='sm' />
                </div>
              }
              height={'calc(100vh - 272px)'}
            >
              <Table
                rowOnClick={handleRowClick}
                data={mergedData}
                columns={columns}
                isFetching={isPendingEncountersLoading && mergedData.length === 0}
                emptyState={isFilterNotApplied ? <EmptyState /> : undefined}
              />
            </InfiniteScroll>
          </div>
        </QuepageContentContainer>
      </Card>

      <PatientSideBar
        showAcceptRejectRXForm
        show={state.isModalOpen}
        onHide={() => setState((prev) => ({ ...prev, isModalOpen: false, openOrderId: '' }))}
        onAccept={resetStateAndRefetch}
        onReject={removeFromEncountersHandler}
        orderId={state.openOrderId}
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
};

// interface EmptyStateProps extends React.ComponentPropsWithoutRef<'div'> {
//   isAutoAssigningOrders: boolean;
//   handleAutoAssignOrders: () => void;
// }
const EmptyState = () => {
  return (
    <div className='w-100 d-flex h-100 justify-content-center align-items-center'>
      {/* <div className='w-25rem h-25rem rounded-circle w-fit bg-light d-flex flex-column gap-3 justify-content-center align-items-center'>
        <span className='d-flex text-muted max-w-320px text-center'>
          There are no more Encounters, Press the button to load more Pending Encounters
        </span>
        <button
          disabled={isAutoAssigningOrders}
          className='btn btn-primary d-flex gap-2 align-items-center'
          onClick={handleAutoAssignOrders}
        >
          Load More Encounters
          {isAutoAssigningOrders && <Spinner size='sm' />}
        </button>
      </div> */}
      <div className='d-flex flex-column align-items-center justify-content-center p-4 text-muted my-5'>
        <p className='h5'>No orders found</p>
        <small>Nothing to display</small>
      </div>
    </div>
  );
};
