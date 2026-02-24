'use client';

import ConfirmationModal from '@/components/ConfirmationModal';
import { OrderDetailsModal } from '@/components/Common/OrderDetailsModal';
import InfiniteScroll from 'react-infinite-scroll-component';
import FilterButton from '@/components/Dashboard/FilterButton';
import { MobileCard } from '@/components/Dashboard/MobileCard';
import { PatientSideBar } from '@/components/Dashboard/PatientSideBar';
import { Column, Table } from '@/components/Dashboard/Table';
import { ROUTES } from '@/constants';
import { useAdminOrdersPage } from '@/contexts/AdminOrdersPageContext';
import { formatCustom, formatUSDate, formatUSDateTime, formatUSTime } from '@/helpers/dateFormatter';
import { mapPatientFromOrder, SingleOrderPatient } from '@/helpers/orderPatientHelpers';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
  formatRelativeTime,
  MapPharmacyTypeInOrders,
  scrollToTop,
  deserializeOrderFilters,
  serializeOrderFilters,
} from '@/lib/helper';
import { Error as ErrorType, MetaPayload, PharmacyType } from '@/lib/types';
import { AgentsSelect } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/AgentsSelect';
import { OrderPopup } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/OrderPopup';
import { PharmacySelect } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/PharmacySelect';
import { ProcessWith } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/ProcessWith';
import { RootState } from '@/store';
import { PublicPharmacy } from '@/store/slices/adminPharmaciesSlice';
import { Agent, useLazyGetAgentsQuery } from '@/store/slices/agentApiSlice';
import {
  OrderStatusType,
  useLazyGetOrdersQuery,
  useRevertOrdersToAdminMutation,
  useUpdateOrderMutation,
  useUpdateOrderAgentMutation,
} from '@/store/slices/ordersApiSlice';
import { Order, setOrder } from '@/store/slices/orderSlice';
import { appendOrdersData, setOrdersData } from '@/store/slices/ordersSlice';
import { setPatient } from '@/store/slices/patientSlice';
import {
  setDateRange,
  setNewEmrFilter,
  setPharmacyType,
  setProductType,
  setSearchString,
  setSelectedAgent,
  setSelectedCol,
  setSortField,
  setSortOrder,
  setStatusArray,
  setVisitType,
} from '@/store/slices/sortSlice';
import { isAxiosError } from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import { FaCheckDouble } from 'react-icons/fa6';
import { useDispatch, useSelector } from 'react-redux';
import { OrderApprovedDosageCell } from './includes/OrderApprovedDosageCell';
import { OrderCustomerInfoCell } from './includes/OrderCustomerInfoCell';
import { OrderListOrderedProductCell } from './includes/OrderListOrderedProductCell';
import { OrdersNotesTextArea } from './includes/OrdersNotesTextArea';
import { OrdersRemarksTextArea } from './includes/OrdersRemarksTextArea';
import { OrdersPatientRemarksTextArea } from './includes/OrdersPatientRemarksTextArea';
import { OrderStatus } from './includes/OrderStatus';
import { RowActions } from './includes/RowActions';

interface Props {
  query?: string;
}

export default function Orders({ query = '' }: Readonly<Props>) {
  const dispatch = useDispatch();
  const { push, replace } = useRouter();
  const searchParams = useSearchParams();

  const { savedFilters, setSavedFilters, setSelectedPageFilters } = useAdminOrdersPage();

  const [modalType, setModalType] = useState<
    'orderPopup' | 'patientProfile' | 'patientDetails' | 'orderDetails' | null
  >(null);
  const [selectedPatientOrder, setSelectedPatientOrder] = useState<Order | null>(null);
  const [showTriageModal, setShowTriageModal] = useState(false);
  const [triageNotes, setTriageNotes] = useState('');
  const [isProcessingTriage, setIsProcessingTriage] = useState(false);
  const [orderToTriage, setOrderToTriage] = useState<Order | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isLoadingInitial = useRef(false);
  const hasClearedFilterParams = useRef(false);
  const [defaultAgentOptions, setDefaultAgentOptions] = useState<Array<{ value: string; label: string; agent: Agent }>>(
    []
  );
  const [defaultAgentOptionsMeta, setDefaultAgentOptionsMeta] = useState<MetaPayload['meta']>({
    page: 1,
    limit: 50,
    totalPages: 1,
  });

  const pharmacies = useSelector((state: RootState) => state.adminPharmacies.pharmacies);
  const order: Order | null = useSelector((state: RootState) => state.order);

  const {
    orderType,
    search,
    sortOrder,
    sortField,
    statusArray,
    selectedAgent,
    selectedCol = '',
    pharmacyTagType: pharmacyType,
    dateRange: [startDate, endDate],
    visitType,
    newEmrFilter,
    productType,
  } = useSelector((state: RootState) => state.sort);

  const [updateOrderAgent] = useUpdateOrderAgentMutation();
  const [revertOrders] = useRevertOrdersToAdminMutation();
  const [updateOrder, { isLoading: isUpdatingOrder }] = useUpdateOrderMutation();
  const [selctedOrderId, setSelctedOrderId] = useState('');

  const orders = useSelector((state: RootState) => state.orders);
  const { data = [], meta } = orders || {};
  const { totalPages = 1, page: currentPage = 1 } = meta || {};

  // Use ref to track latest data without causing re-renders
  const dataRef = useRef(data);
  const currentPageRef = useRef(currentPage);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Keep currentPageRef in sync with currentPage
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  const [triggerOrders, { isFetching }] = useLazyGetOrdersQuery();
  const [getAgents, agentsQuery] = useLazyGetAgentsQuery();

  // Load agents once on mount for all AgentsSelect instances
  useEffect(() => {
    getAgents({ page: 1, limit: 50, isActive: true, sortBy: 'name', sortOrder: 'ASC' })
      .unwrap()
      .then(({ agents = [], meta }) => {
        const options = agents.map((agent) => ({
          value: agent.id,
          label: agent.name,
          agent,
        }));
        setDefaultAgentOptions(options);
        setDefaultAgentOptionsMeta(meta);
      })
      .catch((err) => console.error('Failed to load agents:', err));
  }, []); // Run only once on mount - getAgents is not stable

  const changeTelepathStatusHandler = (orderId: string, status: boolean) => {
    const mappedOrders = data.map((order) => {
      if (order.id === orderId) {
        return { ...order, isTelepathOrder: status };
      }
      return order;
    });
    dispatch(setOrdersData({ data: mappedOrders }));
  };

  const handleUpdateOrders = async ({
    meta,
    search,
    sortField,
    sortOrder,
    statusArray,
    append = false,
    pharmacyType,
    selectedAgent,
    orderFilterType,
    startDate,
    endDate,
    searchColumn = selectedCol,
    visitType,
    newEmrFilter,
    productType,
  }: MetaPayload) => {
    // Save filters to context only when not appending (filters haven't changed when appending)
    if (!append) {
      setSavedFilters({
        search,
        sortField,
        sortOrder,
        statusArray,
        pharmacyType,
        selectedAgent,
        startDate: startDate ?? undefined,
        endDate: endDate ?? undefined,
        searchColumn,
        visitType,
        newEmrFilter,
        productType,
      });
    }
    if (search && !searchColumn) {
      toast.error('Please select a column to search');
      return;
    }

    const dates = {
      ...(startDate &&
        endDate && {
          // Dates from presets are already in YYYY-MM-DD format, use directly to avoid timezone issues
          startDate:
            typeof startDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(startDate)
              ? startDate
              : formatCustom(new Date(startDate), 'yyyy-MM-dd'),
          endDate:
            typeof endDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(endDate)
              ? endDate
              : formatCustom(new Date(endDate), 'yyyy-MM-dd'),
        }),
    };

    const statusValues = statusArray?.map((f) => f.value as string) || [];

    // Ensure sortOrder and sortField have defaults (not empty strings)
    const finalSortOrder = sortOrder || 'DESC';
    const finalSortField = sortField || 'updatedAt';

    try {
      const { data: res } = await triggerOrders({
        meta: { page: meta?.page || 1, limit: 30 },
        ...(search && { search, searchColumn: searchColumn as string }),
        sortOrder: finalSortOrder,
        sortField: finalSortField,
        statusArray: statusValues.length > 0 ? statusValues : undefined,
        ...(selectedAgent && { agentId: selectedAgent?.id }),
        ...(pharmacyType && { pharmacyType: pharmacyType === 'manual' ? 'manual' : 'auto' }),
        ...(orderFilterType && { type: orderFilterType }),
        ...(visitType && { visitType }),
        // Only send telepath parameter if filter is explicitly set (not null)
        ...(newEmrFilter === 'newEmr' && { telepath: false }),
        ...(newEmrFilter === 'telepath' && { telepath: true }),
        ...(newEmrFilter === 'both' && { telepath: 'true,false' }),
        ...(productType && { productType }),
        ...dates,
      });

      const { meta: metaData, orders: newOrders, statusCounts } = res || {};

      const mappedOrders = MapPharmacyTypeInOrders(newOrders || []);

      if (append) {
        dispatch(
          appendOrdersData({
            meta: metaData,
            data: mappedOrders,
            statusCounts,
          })
        );
      } else {
        if (currentPageRef.current > 1) {
          await scrollToTop('orders-table-top');
        }
        dispatch(setOrdersData({ meta: metaData, data: mappedOrders, statusCounts }));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchMore = async () => {
    if (currentPage < totalPages && !isFetching && !isRefreshing && !isLoadingInitial.current) {
      try {
        await handleUpdateOrders({
          meta: { page: currentPage + 1, limit: 30 },
          search,
          sortOrder,
          sortField,
          statusArray,
          append: true,
          pharmacyType,
          selectedAgent,
          startDate,
          endDate,
          searchColumn: selectedCol,
          visitType,
          newEmrFilter,
          productType,
        });
      } catch (error) {
        console.error('Error in fetchMore:', error);
      }
    }
  };

  const handleRowClick = useCallback((order: Order) => {
    setModalType('orderPopup');
    dispatch(setOrder(order));
  }, []);

  const handlePatientNameClick = useCallback(
    (order: Order) => {
      if (order.patient) {
        dispatch(setPatient(order.patient));
        dispatch(setOrder(order));
        setModalType('patientProfile');
      }
    },
    [dispatch]
  );

  const handleUpdatePharmacy = useCallback(
    (pharmacy: PublicPharmacy | PharmacyType, orderId: string) => {
      const mappedOrders = dataRef.current.map((order) => {
        if (order.id === orderId) {
          return { ...order, pharmacyName: pharmacy.name, pharmacyType: pharmacy.pharmacyType };
        }
        return order;
      });

      dispatch(setOrdersData({ data: mappedOrders }));
    },
    [dispatch]
  );

  const handleUpdateStatus = useCallback(
    (status: OrderStatusType, orderId: string) => {
      let foundOrder: Order | null = null;

      const mappedOrders = data.map((order) => {
        if (order.id === orderId) {
          foundOrder = order;
          return { ...order, status };
        }
        return order;
      });

      dispatch(setOrdersData({ data: mappedOrders }));

      const protectedOrder: Order | null = foundOrder ? (foundOrder as Order) : null;

      const foundPharmacy = pharmacies.find((p) => p.name === protectedOrder?.pharmacyName);

      const isManualPharmacySelected = foundPharmacy?.pharmacyType === 'manual';

      const shouldRedirect = isManualPharmacySelected && foundPharmacy;

      if (isManualPharmacySelected && shouldRedirect) {
        if (foundPharmacy && protectedOrder) {
          // Get current filter state to preserve
          const currentFilters = {
            search,
            sortField,
            sortOrder,
            statusArray,
            pharmacyType,
            selectedAgent,
            startDate,
            endDate,
            searchColumn: selectedCol,
            visitType,
            newEmrFilter,
            productType,
          };

          // Serialize filters to query params
          const filterParams = serializeOrderFilters({
            ...currentFilters,
            statusArray: currentFilters.statusArray ? [...currentFilters.statusArray] : undefined,
          });

          // Build URL with pharmacy params and filter params
          const baseUrl = `${ROUTES.ADMIN_PHARMACY_FORWARD_PRESCRIPTION}?pharmacyId=${encodeURIComponent(
            foundPharmacy.id ?? ''
          )}&orderId=${encodeURIComponent(protectedOrder.id ?? '')}`;

          const filterQueryString = filterParams.toString();
          const finalUrl = filterQueryString ? `${baseUrl}&${filterQueryString}` : baseUrl;

          startTransition(() => {
            push(finalUrl);
          });
        }
      }
    },
    [
      data,
      dispatch,
      pharmacies,
      push,
      search,
      sortField,
      sortOrder,
      statusArray,
      pharmacyType,
      selectedAgent,
      startDate,
      endDate,
      selectedCol,
      visitType,
      newEmrFilter,
    ]
  );

  const handleUpdateRemarks = useCallback(
    (remarks: string, orderId: string) => {
      const orderIndex = data?.findIndex((order) => order.id === orderId);
      if (orderIndex === undefined || orderIndex === -1) return;

      const mappedOrders = [...(data ?? [])];
      mappedOrders[orderIndex] = { ...mappedOrders[orderIndex], reason: remarks };

      dispatch(setOrdersData({ data: mappedOrders }));
    },
    [data, dispatch]
  );

  const handleUpdatePatientRemarks = useCallback(
    (patientRemarks: string, orderId: string) => {
      const orderIndex = data?.findIndex((order) => order.id === orderId);
      if (orderIndex === undefined || orderIndex === -1) return;

      const mappedOrders = [...(data ?? [])];
      mappedOrders[orderIndex] = { ...mappedOrders[orderIndex], patientRemarks };

      dispatch(setOrdersData({ data: mappedOrders }));
    },
    [data, dispatch]
  );

  const handleUpdateAgent = useCallback(
    async (agent: Agent | null, orderId: string) => {
      try {
        const currentOrder = data.find((o) => o.id === orderId);
        const currentAgentId = currentOrder?.agent?.id || '';
        const payload = agent
          ? { id: orderId, agentId: agent.id, removeCurrentAgentId: false, agent }
          : { id: orderId, agentId: currentAgentId, removeCurrentAgentId: true, agent: null };

        const { success } = await updateOrderAgent(payload).unwrap();

        if (success) {
          const mappedOrders = data.map((order) => {
            if (order.id === orderId) {
              return { ...order, agent };
            }
            return order;
          });
          dispatch(setOrdersData({ data: mappedOrders }));
        }
      } catch (err) {
        toast.error(
          isAxiosError(err)
            ? err?.response?.data?.message
            : (err as ErrorType)?.data?.message || 'Failed to update agents'
        );
      }
    },
    [data, dispatch, updateOrderAgent]
  );

  const handleUpdateTrackingNumber = useCallback(
    (trackingNumber: string, orderId: string, courierService?: string | null) => {
      const mappedOrders = data.map((order) => {
        if (order.id === orderId) {
          const updated = { ...order, trackingNumber };
          if (courierService !== undefined) {
            updated.courierService = courierService;
          }
          return updated;
        }
        return order;
      });
      dispatch(setOrdersData({ data: mappedOrders }));
    },
    [data, dispatch]
  );

  const handleUpdateShippedVials = useCallback(
    (newShippedVials: number, orderId: string) => {
      const mappedOrders = dataRef.current.map((order) => {
        if (order.id === orderId) {
          return { ...order, shippedVials: newShippedVials };
        }
        return order;
      });
      dispatch(setOrdersData({ data: mappedOrders }));
    },
    [dispatch]
  );

  const handleTriageClick = useCallback(
    async (order: Order, showModal = true, autoNotes?: string) => {
      if (!order?.id) return;

      const eligibleStatuses = ['Assigned', 'Approved', 'Pending'];
      if (!eligibleStatuses.includes(order.status as string)) {
        toast.error(`${order.status} orders cannot be reverted!`);
        return;
      }

      if (showModal) {
        setOrderToTriage(order);
        setShowTriageModal(true);
        return;
      }

      try {
        setIsProcessingTriage(true);

        const { success, message } = await revertOrders({
          orderIds: [order.id],
          notes: autoNotes || 'Admin Reverted this order',
        }).unwrap();

        if (success) {
          const orderIndex = data.findIndex((o) => o.id === order.id);
          if (orderIndex !== -1) {
            const mappedOrders = [...data];
            mappedOrders[orderIndex] = {
              ...data[orderIndex],
              assignedProvider: undefined,
              status: 'Reverted',
            };
            dispatch(setOrdersData({ data: mappedOrders }));
          }
          toast.success(message || 'Order reverted successfully');
        } else {
          toast.error(message || 'Failed to revert order');
        }
      } catch (error) {
        toast.error(
          isAxiosError(error)
            ? error.response?.data?.message
            : (error as ErrorType).data?.message || 'Failed to revert order'
        );
      } finally {
        setIsProcessingTriage(false);
      }
    },
    [data, dispatch, revertOrders]
  );

  const handleTableSort = (sortKey: string, direction: 'asc' | 'desc' | null) => {
    // Map the sortKey and direction to the format expected by the API
    const mappedSortField = direction ? String(sortKey) : undefined;
    const mappedSortOrder = direction ? direction.toUpperCase() : undefined;

    // Update Redux state
    dispatch(setSortField(mappedSortField));
    dispatch(setSortOrder(mappedSortOrder));

    toast.promise(
      handleUpdateOrders({
        meta: { page: 1, limit: 30 },
        search,
        sortField: mappedSortField,
        sortOrder: mappedSortOrder,
        statusArray,
        pharmacyType,
        selectedAgent,
        startDate,
        endDate,
        searchColumn: selectedCol,
        visitType,
        newEmrFilter,
        productType,
      }),
      { loading: 'Sorting orders...' }
    );
  };

  const handleConfirmTriage = async () => {
    try {
      if (!orderToTriage?.id) return;

      setIsProcessingTriage(true);

      const { success, message } = await revertOrders({
        orderIds: [orderToTriage.id],
        notes: triageNotes,
      }).unwrap();

      if (success) {
        const orderIndex = data.findIndex((order) => order.id === orderToTriage.id);
        if (orderIndex !== -1) {
          const mappedOrders = [...data];
          mappedOrders[orderIndex] = {
            ...data[orderIndex],
            assignedProvider: undefined,
            status: 'Reverted',
          };
          dispatch(setOrdersData({ data: mappedOrders }));
        }
        toast.success(message);
        setShowTriageModal(false);
        setTriageNotes('');
        setOrderToTriage(null);
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data?.message
          : (error as ErrorType).data?.message || 'Failed to triage order'
      );
    } finally {
      setIsProcessingTriage(false);
    }
  };

  const handleUpdateQueEligible = (isQueueEligible: boolean, orderId: string) => {
    const mappedOrders = data.map((order) => {
      if (order.id === orderId) {
        return { ...order, isQueueEligible };
      }
      return order;
    });

    dispatch(setOrdersData({ data: mappedOrders }));
  };

  const handleUpdateSendToProvider = (provider: Order['assignedProvider'], orderId: string) => {
    const mappedOrders = data.map((order) => {
      if (order.id === orderId) {
        return { ...order, assignedProvider: provider };
      }
      return order;
    });
    dispatch(setOrdersData({ data: mappedOrders }));
  };

  const handleUpdateVisitType = (visitType: 'video' | 'document', orderId: string, updatedOrder: Partial<Order>) => {
    // Update the entire order with fresh data from single order API (includes updated providers list)
    const mappedOrders = data.map((order) => {
      if (order.id === orderId) {
        return { ...order, ...updatedOrder, visitType };
      }
      return order;
    });
    dispatch(setOrdersData({ data: mappedOrders }));
  };

  const updateOrderProviderQueueHandler = async ({
    isQueueEligible,
    orderId,
    disabled,
  }: {
    isQueueEligible: boolean;
    orderId: string;
    disabled: boolean;
  }) => {
    if (isQueueEligible) {
      if (disabled) toast.success('Provider queue is already enabled for this order');
      return;
    }

    try {
      setSelctedOrderId(orderId);
      const response = await updateOrder({ id: orderId ?? '', isQueueEligible: !isQueueEligible }).unwrap();

      if (response.success) {
        toast.success('Provider queue updated successfully');
        handleUpdateQueEligible(!isQueueEligible, orderId);
      } else toast.error(response.message);

      setSelctedOrderId('');
    } catch (error) {
      setSelctedOrderId('');
      toast.error(
        isAxiosError(error)
          ? error.response?.data?.message
          : (error as ErrorType).data?.message || 'Failed to update provider queue'
      );
    }
  };

  const columns: Column<Order>[] = useMemo(
    () => [
      {
        header: 'Action',
        renderCell: (order) => (
          <RowActions
            order={order}
            onTriage={() => handleTriageClick(order)}
            onProviderQueueChange={(isQueueEligible: boolean) =>
              handleUpdateQueEligible(isQueueEligible, order?.id ?? '')
            }
            onTeleHealthChange={(isTeleHealthEnabled: boolean) =>
              changeTelepathStatusHandler(order.id ?? '', isTeleHealthEnabled)
            }
            onSendToProviderChange={(provider: Order['assignedProvider']) =>
              handleUpdateSendToProvider(provider, order?.id ?? '')
            }
            onSyncAppointmentChange={(visitType: 'video' | 'document', orderId: string, updatedOrder: Partial<Order>) =>
              handleUpdateVisitType(visitType, orderId, updatedOrder)
            }
          />
        ),
      },
      {
        header: 'ORDER ID',
        accessor: 'orderUniqueId',
        sortable: true,
        sortKey: 'orderUniqueId',
        renderCell: (o) => <span className='fw-semibold text-nowrap'>{o.orderUniqueId}</span>,
      },
      {
        header: 'DATE & TIME',
        className: 'tw-text-nowrap',
        sortable: true,
        sortKey: 'createdAt',
        renderCell: (o) => (o.createdAt ? `${formatUSDate(o.createdAt)} ${formatUSTime(o.createdAt)}` : '-'),
      },
      {
        header: 'CUSTOMER',
        sortable: true,
        sortKey: 'customer',
        renderCell: (o) => <OrderCustomerInfoCell order={o} onClickPatientName={handlePatientNameClick} />,
      },
      {
        header: 'ORDERED',
        renderCell: (o) => (
          <div className='text-start'>
            <OrderListOrderedProductCell
              order={o}
              onUpdateTrackingNumber={(trackingNumber, courierService) =>
                handleUpdateTrackingNumber(trackingNumber, o.id ?? '', courierService)
              }
              onVialShipmentUpdate={(newShippedVials) => handleUpdateShippedVials(newShippedVials, o.id ?? '')}
            />
          </div>
        ),
      },
      {
        header: 'PLAN',
        sortable: true,
        sortKey: 'amount',
        renderCell: (o) => {
          if (o.metadata?.intervalCount && o.metadata?.billingInterval) {
            const count = o.metadata.intervalCount;
            const interval = o.metadata.billingInterval;
            return (
              <div className='d-flex align-items-start  flex-column gap-2 min-w-70px'>
                <span>
                  {' '}
                  {count} {interval}
                  {count > 1 ? 's' : ''}
                </span>
                <div className='w-fit custom-badge custom-badge-sm bage-success-light badge-oulined d-flex gap-1 align-items-center'>
                  <span>${o?.metadata?.amount ?? 0}</span>
                  <FaCheckDouble size={12} />
                </div>
              </div>
            );
          }
          return '-';
        },
      },
      {
        header: 'STATUS',
        sortable: true,
        sortKey: 'status',
        className: 'tw-min-w-[200px]',
        renderCell: (o) => {
          const isReverted = (o.status || '').toLowerCase() === 'reverted';
          let revertedByDisplay = 'Unknown';
          let shouldCapitalize = false;
          if (o.revertedBy) {
            // Handle null values explicitly (default values don't work for null, only undefined)
            const firstName = o.revertedBy.firstName ?? '';
            const lastName = o.revertedBy.lastName ?? '';
            const email = o.revertedBy.email ?? '';

            const name = `${firstName} ${lastName}`.trim();
            const emailStr = email ? String(email).trim() : '';
            revertedByDisplay = name || emailStr || 'Unknown';
            shouldCapitalize = !!name || revertedByDisplay === 'Unknown';
          }
          return (
            <>
              <div className='tw-min-w-40 md:tw-min-w-24'>
                <OrderStatus
                  order={o}
                  disabled={
                    o.pharmacyType === 'manual' && o.hasPharmacyOrder
                      ? false
                      : o.status && o.status !== 'Drafted'
                      ? true
                      : false
                  }
                  onOrderStatusChange={(status) => handleUpdateStatus(status as OrderStatusType, o.id ?? '')}
                />
              </div>

              {/* Reverted by (temporarily disabled) */}
              {isReverted && o.revertedBy && (
                <div className='tw-text-xs tw-leading-4 tw-text-slate-500 tw-mt-1'>
                  By:{' '}
                  <span className={`tw-font-medium ${shouldCapitalize ? 'tw-capitalize' : ''}`}>
                    {revertedByDisplay}
                  </span>
                </div>
              )}

              {o.assignedProvider && o.assignedAt && (
                <div className='tw-text-xs tw-leading-4 tw-text-slate-500 tw-mt-1'>
                  Assigned : <span className='tw-font-medium'>{formatRelativeTime(o.assignedAt)}</span>
                </div>
              )}
            </>
          );
        },
      },
      {
        header: 'Provider',
        renderCell: (o) => (
          <ProcessWith
            onClick={(disabled) =>
              updateOrderProviderQueueHandler({
                isQueueEligible: o.isQueueEligible ?? false,
                orderId: o.id ?? '',
                disabled,
              })
            }
            loading={isUpdatingOrder && selctedOrderId === o.id}
            order={o}
            onTriageClick={() => handleTriageClick(o, false, 'Admin Reverted this order')}
            isProcessingTriage={isProcessingTriage}
          />
        ),
      },
      {
        header: 'AGENT',
        renderCell: (o) => (
          <AgentsSelect
            selectedAgent={o.agent}
            onAgentChange={(agent) => handleUpdateAgent(agent, o.id ?? '')}
            getAgents={getAgents}
            isLoading={agentsQuery.isFetching}
            defaultAgentOptions={defaultAgentOptions}
            defaultAgentOptionsMeta={defaultAgentOptionsMeta}
          />
        ),
        className: 'tw-text-nowrap tw-min-w-[160px]',
      },
      {
        header: 'REMARKS',
        renderCell: (o) => (
          <OrdersRemarksTextArea
            order={o}
            onUpdateRemarks={(remarks) => {
              handleUpdateRemarks(remarks, o.id ?? '');
            }}
          />
        ),
      },
      {
        header: 'PATIENT REMARKS',
        renderCell: (o) => (
          <OrdersPatientRemarksTextArea
            order={o}
            onUpdatePatientRemarks={(patientRemarks) => {
              handleUpdatePatientRemarks(patientRemarks, o.id ?? '');
            }}
          />
        ),
      },
      // {
      //   header: 'REASON',
      //   renderCell: (o) => {
      //     const isReverted = o?.status?.toLowerCase() === 'reverted';

      //     if (isReverted) {
      //       return (
      //         <a
      //           href='#'
      //           className='text-primary text-decoration-underline'
      //           onClick={(e) => {
      //             e.preventDefault();
      //             e.stopPropagation();
      //             handleRejectionNotesClick(o.id || '');
      //           }}
      //         >
      //           Reason
      //         </a>
      //       );
      //     }

      //     return <span className='text-muted'>N/A</span>;
      //   },
      //   className: 'align-middle text-start',
      // },
      {
        header: 'Pharmacy',
        renderCell: (row) => {
          const pharmacySent = row?.pharmacySent;
          const hasAgentName = pharmacySent?.agentName;
          const hasSentDate = pharmacySent?.sentDate;
          const showPharmacySent = pharmacySent && (hasAgentName || hasSentDate);

          return (
            <div className='d-flex flex-column gap-1'>
              <PharmacySelect
                order={row}
                selectedPharmacy={row?.pharmacyName || ''}
                onPharmacyChange={(pharmacy) => handleUpdatePharmacy(pharmacy, row.id ?? '')}
              />
              {showPharmacySent && (
                <div className='tw-text-xs tw-text-muted tw-mt-1'>
                  {hasAgentName && (
                    <div className='tw-text-nowrap'>
                      <span className='tw-font-medium'>Agent:</span> {pharmacySent.agentName}
                    </div>
                  )}
                  {hasSentDate && (
                    <div className='tw-text-nowrap'>
                      <span className='tw-font-medium'>Sent:</span> {formatUSDateTime(pharmacySent.sentDate)}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        },
      },
      {
        header: 'Approved',
        renderCell: (o) => (
          <OrderApprovedDosageCell
            prescriptionInstructions={o?.prescriptionInstructions ?? []}
            assignedProvider={o?.assignedProvider ?? undefined}
          />
        ),
      } as Column<Order>,
      {
        header: 'Notes',
        renderCell: (order) => <OrdersNotesTextArea order={order} />,
      },
    ],
    [
      handleUpdatePharmacy,
      handleUpdateAgent,
      handleUpdateStatus,
      handleUpdateRemarks,
      handleUpdatePatientRemarks,
      handleUpdateTrackingNumber,
      handleUpdateShippedVials,
      handlePatientNameClick,
      handleTriageClick,
      handleUpdateQueEligible,
      changeTelepathStatusHandler,
      handleUpdateSendToProvider,
      handleUpdateVisitType,
      getAgents,
      agentsQuery.isFetching,
      defaultAgentOptions,
      isProcessingTriage,
      dispatch,
      pharmacies,
      push,
      // data,
    ]
  );

  useEffect(() => {
    if (query && data[0]) {
      dispatch(setOrder(data[0]));
      if (data[0].patient) dispatch(setPatient(data[0].patient));
      setModalType('orderPopup');
    }
  }, [query, data, dispatch]);
  useEffect(() => {
    if (orderType === 'Orders' && !query) {
      isLoadingInitial.current = true;
      setIsRefreshing(true);

      dispatch(setOrdersData({ data: [], meta: { page: 1, limit: 30, totalPages: 1 } }));

      // Normalize filters from context or use defaults
      // const filtersToApply = {
      //   search: savedFilters?.search || '',
      //   sortField: savedFilters?.sortField || sortField || 'updatedAt',
      //   sortOrder: savedFilters?.sortOrder || sortOrder || 'DESC',
      //   statusArray: savedFilters?.statusArray || statusArray || [],
      //   pharmacyType: savedFilters?.pharmacyType || pharmacyType || '',
      //   selectedAgent: savedFilters?.selectedAgent || selectedAgent || null,
      //   startDate: savedFilters?.startDate || startDate || undefined,
      //   endDate: savedFilters?.endDate || endDate || undefined,
      //   searchColumn: savedFilters?.searchColumn || selectedCol || '',
      //   visitType: savedFilters?.visitType || visitType || undefined,
      //   newEmrFilter: savedFilters?.newEmrFilter || newEmrFilter || undefined,
      // };
      // Get filters from query params only (no localStorage fallback)
      const filtersToApply = (() => {
        // Get filters from URL query params
        const urlFilters = deserializeOrderFilters(searchParams.toString());

        // Resolve selectedAgent from URL if agentId is present
        let resolvedAgent = selectedAgent ?? null;
        if (urlFilters.selectedAgentId) {
          const foundAgent = defaultAgentOptions.find((opt) => opt.agent.id === urlFilters.selectedAgentId)?.agent;
          if (foundAgent) {
            resolvedAgent = foundAgent;
          }
        }

        // Use query params if available, otherwise use current Redux state or defaults
        // Ensure sortOrder and sortField always have defaults (not empty strings)
        return {
          search: urlFilters.search ?? search ?? '',
          sortField: urlFilters.sortField || sortField || 'updatedAt',
          sortOrder: urlFilters.sortOrder || sortOrder || 'DESC',
          statusArray: urlFilters.statusArray ?? statusArray ?? [],
          pharmacyType: urlFilters.pharmacyType ?? pharmacyType ?? '',
          selectedAgent: resolvedAgent ?? selectedAgent ?? null,
          startDate: urlFilters.startDate ?? startDate ?? undefined,
          endDate: urlFilters.endDate ?? endDate ?? undefined,
          searchColumn: urlFilters.searchColumn ?? selectedCol ?? '',
          visitType: urlFilters.visitType ?? visitType ?? undefined,
          newEmrFilter: urlFilters.newEmrFilter ?? newEmrFilter ?? undefined,
          productType: urlFilters.productType ?? productType ?? undefined,
        };
      })();

      // Check if there are filter params in URL that need to be cleared
      const urlFilters = deserializeOrderFilters(searchParams.toString());
      const hasFilterParams = Object.keys(urlFilters).length > 0;

      // Update Redux slices with persisted filters
      // Ensure sortField and sortOrder always have valid defaults
      dispatch(setSortField(filtersToApply.sortField || 'updatedAt'));
      dispatch(setSortOrder(filtersToApply.sortOrder || 'DESC'));
      dispatch(setStatusArray(filtersToApply.statusArray));
      dispatch(setSearchString(filtersToApply.search));
      dispatch(setPharmacyType(filtersToApply.pharmacyType));
      // dispatch(setPharmacyTagType(filtersToApply.newEmrFilter));
      dispatch(setSelectedAgent(filtersToApply.selectedAgent));
      dispatch(setDateRange([filtersToApply.startDate ?? null, filtersToApply.endDate ?? null]));
      dispatch(setSelectedCol(filtersToApply.searchColumn ?? null));
      dispatch(setVisitType(filtersToApply.visitType ?? null));
      dispatch(setNewEmrFilter(filtersToApply.newEmrFilter ?? null));
      dispatch(setProductType(filtersToApply.productType ?? null));

      dispatch(setSelectedCol(filtersToApply.searchColumn));

      handleUpdateOrders({
        meta: { page: 1, limit: 30 },
        ...filtersToApply,
      }).finally(() => {
        setIsRefreshing(false);
        isLoadingInitial.current = false;

        // Clear filter query params from URL after filters are applied (only once)
        // This allows filters to remain editable while keeping URL clean
        if (hasFilterParams && !hasClearedFilterParams.current && typeof window !== 'undefined') {
          hasClearedFilterParams.current = true;

          const currentUrl = new URL(window.location.href);
          const filterParamKeys = [
            'search',
            'sortField',
            'sortOrder',
            'status',
            'pharmacyType',
            'agentId',
            'startDate',
            'endDate',
            'searchColumn',
            'visitType',
            'newEmrFilter',
            'productType',
          ];

          // Remove filter params but keep other params like 'tab' and 'q'
          filterParamKeys.forEach((key) => {
            currentUrl.searchParams.delete(key);
          });

          // Update URL without adding to history
          const newUrl = currentUrl.pathname + (currentUrl.search ? currentUrl.search : '');
          replace(newUrl, { scroll: false });
        }
      });

      scrollToTop('orders-table-top');
    }
    // Only include primitive filter values in dependencies to avoid multiple renders
  }, [
    orderType,
    query,
    savedFilters?.search,
    savedFilters?.sortField,
    savedFilters?.sortOrder,
    savedFilters?.statusArray?.length,
    savedFilters?.pharmacyType,
    savedFilters?.selectedAgent?.id,
    savedFilters?.startDate,
    savedFilters?.endDate,
    savedFilters?.searchColumn,
    savedFilters?.visitType,
    savedFilters?.newEmrFilter,
    sortField,
    sortOrder,
    statusArray?.length,
    pharmacyType,
    selectedAgent?.id,
    startDate,
    endDate,
    selectedCol,
    visitType,
    newEmrFilter,
    defaultAgentOptions,
  ]);

  useEffect(() => {
    if (orderType === 'Orders') {
      setSelectedPageFilters(
        <FilterButton
          defaultValues={savedFilters} // <-- apply saved filters to UI
          visibility={{
            showSearch: true,
            showStatusFilter: true,
            showMultiSelect: true,
            showDateRange: true,
            showSelectCol: true,
            showSort: true,
            showSortClassName: 'col-md-6 col-lg-4 col-xl-3',
            showSelectColClassName: 'col-md-6 col-lg-3 col-xl-3',
            showSearchClassName: 'col-md-6 col-lg-3 col-xl-3',
            showMultiSelectClassName: 'col-md-6 col-lg-5 col-xl-5',
            showDateRangeClassName: 'col-md-6 col-lg-4 col-xl-3',
            showNewEmrFilter: true,
            showVisitTypeFilter: true,
            showProductTypeFilter: true,
            showProductTypeFilterClassName: 'col-md-6 col-lg-2 col-xl-3',
          }}
          onFilterChange={handleUpdateOrders}
          onSearchEnter={(params) =>
            handleUpdateOrders({
              search: params.search,
              sortField: params.sortField,
              sortOrder: params.sortOrder,
              statusArray: params.statusArray,
              pharmacyType: params.pharmacyType,
              selectedAgent: params.selectedAgent,
              meta: { page: 1, limit: 30 },
              startDate: params.startDate,
              endDate: params.endDate,
              searchColumn: params.searchColumn,
              visitType: params.visitType,
              newEmrFilter: params.newEmrFilter,
              productType: params.productType,
            })
          }
          extendedSortOptions
        />
      );
    }
  }, [orderType]);

  const allOrdersLoaded = currentPage >= totalPages;

  // Detect screen size - only render one version
  const isDesktop = useMediaQuery('(min-width: 992px)');

  // Create dynamic defaultSort based on Redux state
  const currentSort = useMemo(() => {
    if (sortField && sortOrder) {
      return {
        key: sortField,
        direction: sortOrder.toLowerCase() as 'asc' | 'desc',
      };
    }
    return { key: 'createdAt', direction: 'desc' as const };
  }, [sortField, sortOrder]);

  return (
    <>
      {/* Mobile version - only renders on mobile */}
      {!isDesktop && (
        <InfiniteScroll
          dataLength={data.length}
          next={fetchMore}
          hasMore={!allOrdersLoaded}
          loader={
            <div className='d-flex justify-content-center py-4'>
              <Spinner className='border-2' />
            </div>
          }
          height={`calc(100vh - 9rem)`}
          className='tw-bg-white'
        >
          <MobileCard
            loading={isFetching && data.length === 0}
            data={data}
            columns={columns}
            rowOnClick={handleRowClick}
          />
        </InfiniteScroll>
      )}

      {/* Desktop version - only renders on desktop */}
      {isDesktop && (
        <>
          <style
            dangerouslySetInnerHTML={{
              __html: `
                .c_datatable > :not(caption) > * > * {
                  padding: 0.25rem 0.25rem !important;
                }
              `,
            }}
          />
          <InfiniteScroll
            dataLength={data.length}
            next={fetchMore}
            hasMore={!allOrdersLoaded}
            loader={
              <div className='d-flex justify-content-center py-4'>
                <Spinner className='border-2' />
              </div>
            }
            height={`calc(100vh - 280px)`}
            className='overflow-auto'
          >
            <div id='orders-table-top' />
            <Table
              data={data}
              columns={columns}
              isFetching={isFetching && data.length === 0}
              defaultSort={currentSort}
              onSort={handleTableSort}
              rowOnClick={handleRowClick}
            />
          </InfiniteScroll>
        </>
      )}

      <OrderPopup
        hidePatientBtn={modalType === 'patientDetails' || modalType === 'patientProfile'}
        onPharmacyChange={(pharmacy) => handleUpdatePharmacy(pharmacy as PublicPharmacy, order?.id ?? '')}
        onUpdateOrderAgent={(agent, orderId) => handleUpdateAgent(agent, orderId)}
        onUpdateOrderStatus={(status) => handleUpdateStatus(status as OrderStatusType, order?.id ?? '')}
        onUpdateTrackingNumber={(trackingNumber, courierService) =>
          handleUpdateTrackingNumber(trackingNumber, order?.id ?? '', courierService)
        }
        orderUniqueId={order?.orderUniqueId ?? null}
        onPatientClick={(orderData) => {
          if (orderData?.patient) {
            const patientData = orderData.patient as SingleOrderPatient;
            const mappedPatient = mapPatientFromOrder(patientData);

            dispatch(setPatient(mappedPatient));
            // Also update order state to ensure notes fetch with correct patient ID
            dispatch(setOrder(orderData as Order));
            setSelectedPatientOrder(orderData as Order);
            setModalType('patientDetails');
          }
        }}
        show={modalType === 'orderPopup'}
        onHide={() => setModalType(null)}
      />

      <PatientSideBar
        show={modalType === 'patientProfile'}
        onHide={() => {
          setModalType(null);
        }}
        onOrderClick={() => setModalType('orderDetails')}
      />

      <PatientSideBar
        show={modalType === 'patientDetails'}
        onHide={() => {
          setModalType(null);
          setSelectedPatientOrder(null);
        }}
        orderId={selectedPatientOrder?.id ?? undefined}
        onOrderClick={() => setModalType('orderDetails')}
      />

      <OrderDetailsModal
        isOpen={modalType === 'orderDetails'}
        onClose={() => setModalType(null)}
        onOpenOrderSidebar={(order) => {
          dispatch(setOrder(order));
          setModalType('orderPopup');
        }}
      />

      <ConfirmationModal
        show={showTriageModal}
        onHide={() => {
          setShowTriageModal(false);
          setTriageNotes('');
          setOrderToTriage(null);
        }}
        onConfirm={handleConfirmTriage}
        loading={isProcessingTriage}
        title='Triage Order'
        message={
          <div className='form-group'>
            <label htmlFor='triage-notes' className='form-label text-start w-100'>
              Notes (Optional)
            </label>
            <textarea
              id='triage-notes'
              className='form-control text-start'
              rows={4}
              value={triageNotes}
              onChange={(e) => setTriageNotes(e.target.value)}
              placeholder='Enter notes here...'
            />
          </div>
        }
        confirmLabel='Yes, Triage'
        cancelLabel='Cancel'
      />
    </>
  );
}
