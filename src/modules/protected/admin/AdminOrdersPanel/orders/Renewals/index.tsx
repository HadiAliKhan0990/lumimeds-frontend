'use client';

import ConfirmationModal from '@/components/ConfirmationModal';
import { OrderDetailsModal } from '@/components/Common/OrderDetailsModal';
import FilterButton from '@/components/Dashboard/FilterButton';
import { MobileCard } from '@/components/Dashboard/MobileCard';
import { PatientSideBar } from '@/components/Dashboard/PatientSideBar';
import { Column, Table } from '@/components/Dashboard/Table';
import { ROUTES } from '@/constants';
import { useAdminOrdersPage } from '@/contexts/AdminOrdersPageContext';
import { formatUSDateTime } from '@/helpers/dateFormatter';
import { mapPatientFromOrder, SingleOrderPatient } from '@/helpers/orderPatientHelpers';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { MapPharmacyTypeInOrders, scrollToTop } from '@/lib/helper';
import { Error as ErrorType, MetaPayload, PharmacyType, SingleOrder } from '@/lib/types';
import { AgentsSelect } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/AgentsSelect';
import { OrderCustomerInfoCell } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/OrderCustomerInfoCell';
import { OrderListOrderedProductCell } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/OrderListOrderedProductCell';
import { OrderPopup } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/OrderPopup';
import { OrdersNotesTextArea } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/OrdersNotesTextArea';
import { OrdersRemarksTextArea } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/OrdersRemarksTextArea';
import { OrdersPatientRemarksTextArea } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/OrdersPatientRemarksTextArea';
import { OrderStatus } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/OrderStatus';
import { PharmacySelect } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/PharmacySelect';
import { ProcessWith } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/ProcessWith';
import { RootState } from '@/store';
import { PublicPharmacy } from '@/store/slices/adminPharmaciesSlice';
import { Agent, useLazyGetAgentsQuery } from '@/store/slices/agentApiSlice';
import {
  OrderStatusType,
  useLazyGetOrdersQuery,
  useRevertOrdersToAdminMutation,
  useUpdateOrderAgentMutation,
  useUpdateOrderMutation,
} from '@/store/slices/ordersApiSlice';
import { Order, setOrder } from '@/store/slices/orderSlice';
import { appendOrdersData, setOrdersData } from '@/store/slices/ordersSlice';
import { setPatient } from '@/store/slices/patientSlice';
import {
  setDatePreset,
  setDateRange,
  setPharmacyTagType,
  setSelectedAgent,
  setSortField,
  setSortOrder,
} from '@/store/slices/sortSlice';
import { isAxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaCheckDouble } from 'react-icons/fa6';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDispatch, useSelector } from 'react-redux';
import { OrderApprovedDosageCell } from '../includes/OrderApprovedDosageCell';
import { RowActions } from './RowActions';
interface Props extends React.ComponentPropsWithoutRef<'div'> {
  query?: string;
}

export const Renewals = ({ query = '' }: Props) => {
  const dispatch = useDispatch();
  const { push } = useRouter();
  const { setSelectedPageFilters } = useAdminOrdersPage();

  const [modalType, setModalType] = useState<'orderPopup' | 'patientProfile' | 'orderDetails' | null>(null);
  const [showTriageModal, setShowTriageModal] = useState(false);
  const [triageNotes, setTriageNotes] = useState('');
  const [isProcessingTriage, setIsProcessingTriage] = useState(false);
  const [orderToTriage, setOrderToTriage] = useState<Order | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selctedOrderId, setSelctedOrderId] = useState('');

  const isUnmounted = useRef(false);

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
    productType,
  } = useSelector((state: RootState) => state.sort);

  const [updateOrderAgent] = useUpdateOrderAgentMutation();
  const [revertOrders] = useRevertOrdersToAdminMutation();
  const [updateOrder, { isLoading: isUpdatingOrder }] = useUpdateOrderMutation();

  const ordersState = useSelector((state: RootState) => state.orders);
  const { data = [], meta } = ordersState || {};
  const { totalPages = 1, page: currentPage = 1 } = meta || {};
  const currentPageRef = useRef(currentPage);

  const [triggerOrders, { isFetching }] = useLazyGetOrdersQuery();
  const [getAgents, agentsQuery] = useLazyGetAgentsQuery();

  const [defaultAgentOptions, setDefaultAgentOptions] = useState<Array<{ value: string; label: string; agent: Agent }>>(
    []
  );
  const [defaultAgentOptionsMeta, setDefaultAgentOptionsMeta] = useState<MetaPayload['meta']>({
    page: 1,
    limit: 50,
    totalPages: 1,
  });

  // Keep currentPageRef in sync with currentPage
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizeOrdersResponse = (res: any) => {
    const payload = res && res.data ? res.data : res;
    const metaData = payload?.meta ?? {};
    const newOrders = payload?.orders ?? payload?.data ?? [];
    const statusCounts = payload?.statusCounts ?? payload?.status_counts ?? payload?.status;
    return { metaData, newOrders, statusCounts };
  };

  const changeTelepathStatusHandler = (orderId: string, status: boolean) => {
    const mappedOrders = data.map((order) => {
      if (order.id === orderId) {
        return { ...order, isTelepathOrder: status };
      }
      return order;
    });
    dispatch(setOrdersData({ data: mappedOrders }));
  };

  const handleUpdateOrders = useCallback(
    async ({
      meta,
      search,
      sortField,
      sortOrder,
      append = false,
      pharmacyType,
      selectedAgent,
      orderFilterType,
      startDate,
      endDate,
      searchColumn = selectedCol,
      productType,
    }: MetaPayload) => {
      if (search && !searchColumn) {
        toast.error('Please select a column to search');
        return;
      }

      const dates = {
        ...(startDate &&
          endDate && {
            startDate,
            endDate,
          }),
      };

      try {
        const raw = await triggerOrders({
          type: 'renewal',
          meta: { page: meta?.page || 1, limit: meta?.limit || 30 },
          ...(search && { search, searchColumn: searchColumn as string }),
          ...(sortOrder && { sortOrder }),
          ...(sortField && { sortField }),
          ...(selectedAgent && { agentId: selectedAgent?.id }),
          ...(pharmacyType && { pharmacyType: pharmacyType === 'manual' ? 'manual' : 'auto' }),
          ...(orderFilterType && { type: orderFilterType }),
          ...(productType && { productType }),
          ...dates,
        }).unwrap();

        if (isUnmounted.current) return;

        const { metaData, newOrders, statusCounts } = normalizeOrdersResponse(raw);
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
        toast.error(
          isAxiosError(error)
            ? error.response?.data?.message
            : (error as ErrorType).data.message || 'Failed to fetch orders'
        );
        throw error;
      }
    },
    [triggerOrders, selectedCol, dispatch]
  );

  const fetchMore = useCallback(async () => {
    if (currentPage < totalPages && !isFetching && !isRefreshing) {
      try {
        await handleUpdateOrders({
          meta: { page: currentPage + 1, limit: meta?.limit || 30 },
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
          productType,
        });
      } catch (error) {
        console.error('Error in fetchMore:', error);
      }
    }
  }, [
    currentPage,
    totalPages,
    isFetching,
    isRefreshing,
    handleUpdateOrders,
    search,
    sortOrder,
    sortField,
    statusArray,
    pharmacyType,
    selectedAgent,
    startDate,
    endDate,
    selectedCol,
    productType,
    meta,
  ]);

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

  const handleOrderPopupPatientClick = useCallback(
    (orderData: { patient?: SingleOrder['patient']; id?: string }) => {
      if (orderData?.patient) {
        const patientData = orderData.patient as SingleOrderPatient;
        const mappedPatient = mapPatientFromOrder(patientData);
        dispatch(setPatient(mappedPatient));
        dispatch(setOrder(orderData as Order));
        setModalType('patientProfile');
      }
    },
    [dispatch]
  );

  const handleUpdatePharmacy = (pharmacy: PublicPharmacy | PharmacyType, orderId: string) => {
    const mappedOrders = data.map((order) => {
      if (order.id === orderId) {
        return { ...order, pharmacyName: pharmacy.name, pharmacyType: pharmacy.pharmacyType };
      }
      return order;
    });

    dispatch(setOrdersData({ data: mappedOrders }));
  };

  const handleUpdateStatus = (status: OrderStatusType, orderId: string) => {
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
      if (foundPharmacy)
        startTransition(() => {
          push(
            `${ROUTES.ADMIN_PHARMACY_FORWARD_PRESCRIPTION}?pharmacyId=${encodeURIComponent(
              foundPharmacy?.id ?? ''
            )}&orderId=${encodeURIComponent(foundOrder?.id ?? '')}`
          );
        });
    }
  };

  const handleUpdateRemarks = (remarks: string, orderId: string) => {
    const orderIndex = data?.findIndex((order) => order.id === orderId);
    if (orderIndex === undefined || orderIndex === -1) return;

    const mappedOrders = [...(data ?? [])];
    mappedOrders[orderIndex] = { ...mappedOrders[orderIndex], reason: remarks };

    dispatch(setOrdersData({ data: mappedOrders }));
  };

  const handleUpdatePatientRemarks = (patientRemarks: string, orderId: string) => {
    const orderIndex = data?.findIndex((order) => order.id === orderId);
    if (orderIndex === undefined || orderIndex === -1) return;

    const mappedOrders = [...(data ?? [])];
    mappedOrders[orderIndex] = { ...mappedOrders[orderIndex], patientRemarks };

    dispatch(setOrdersData({ data: mappedOrders }));
  };

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

  const handleUpdateTrackingNumber = (trackingNumber: string, orderId: string, courierService: string) => {
    const mappedOrders = data.map((order) => {
      if (order.id === orderId) {
        return { ...order, trackingNumber, courierService };
      }
      return order;
    });
    dispatch(setOrdersData({ data: mappedOrders }));
  };

  const handleTriageClick = useCallback(
    async (order: Order, showModal = true, autoNotes?: string) => {
      if (!order?.id) return;

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
            : (error as ErrorType).data.message || 'Failed to revert order'
        );
      } finally {
        setIsProcessingTriage(false);
      }
    },
    [data, dispatch, revertOrders]
  );

  const handleTableSort = (sortKey: string, direction: 'asc' | 'desc' | null) => {
    const mappedSortField = direction ? String(sortKey) : undefined;
    const mappedSortOrder = direction ? direction.toUpperCase() : undefined;

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
        productType,
      }),
      { loading: 'Sorting orders...' }
    );
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
          : (error as ErrorType).data.message || 'Failed to triage order'
      );
    } finally {
      setIsProcessingTriage(false);
    }
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

  const columns: Column<Order>[] = [
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
      renderCell: (o) => formatUSDateTime(o.createdAt),
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
            onVialShipmentUpdate={(newShippedVials) => {
              const mappedOrders = data.map((order) => {
                if (order.id === o.id) {
                  return { ...order, shippedVials: newShippedVials };
                }
                return order;
              });
              dispatch(setOrdersData({ data: mappedOrders }));
            }}
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
            {isReverted && o.revertedBy && (
              <div className='tw-text-xs tw-leading-4 tw-text-slate-500 tw-mt-1'>
                By:{' '}
                <span className={`tw-font-medium ${shouldCapitalize ? 'tw-capitalize' : ''}`}>{revertedByDisplay}</span>
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
          order={o}
          onTriageClick={() => handleTriageClick(o, false, 'Admin Reverted this order')}
          isProcessingTriage={isProcessingTriage}
          onClick={(disabled) =>
            updateOrderProviderQueueHandler({
              isQueueEligible: o.isQueueEligible ?? false,
              orderId: o.id ?? '',
              disabled,
            })
          }
          loading={isUpdatingOrder && selctedOrderId === o.id}
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
    {
      header: 'Pharmacy',
      renderCell: (row) => (
        <PharmacySelect
          order={row}
          selectedPharmacy={row?.pharmacyName || ''}
          onPharmacyChange={(pharmacy) => handleUpdatePharmacy(pharmacy, row.id ?? '')}
        />
      ),
    },
    {
      header: 'Approved',
      renderCell: (o) => (
        <OrderApprovedDosageCell
          prescriptionInstructions={o?.prescriptionInstructions ?? []}
          assignedProvider={o?.assignedProvider ?? undefined}
        />
      ),
    },
    {
      header: 'Notes',
      renderCell: (order) => <OrdersNotesTextArea order={order} />,
    },
  ];

  useEffect(() => {
    isUnmounted.current = false;
    return () => {
      isUnmounted.current = true;
    };
  }, []);

  useEffect(() => {
    if (query && data[0]) {
      dispatch(setOrder(data[0]));
      if (data[0].patient) dispatch(setPatient(data[0].patient));
      setModalType('orderPopup');
    }
  }, [query, data, dispatch]);

  useEffect(() => {
    if (orderType !== 'Renewals' || query) return;

    setIsRefreshing(true);
    dispatch(setOrdersData({ data: [], meta: { page: 1, limit: 30, totalPages: 1 } }));

    if (!sortField || !sortOrder) {
      if (!sortField) dispatch(setSortField('createdAt'));
      if (!sortOrder) dispatch(setSortOrder('DESC'));
    }

    (async () => {
      try {
        await handleUpdateOrders({
          meta: { page: 1, limit: 30 },
          sortField: sortField || 'createdAt',
          sortOrder: sortOrder || 'DESC',
          ...(startDate && endDate ? { startDate, endDate } : {}),
          ...(productType ? { productType } : {}),
        });
      } catch (e) {
        toast.error(
          isAxiosError(e) ? e.response?.data?.message : (e as ErrorType)?.data?.message || 'Failed to fetch orders'
        );
      } finally {
        if (!isUnmounted.current) {
          setIsRefreshing(false);
        }
      }
    })();

    scrollToTop('orders-table-top');
  }, [orderType, query, sortField, sortOrder, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(setPharmacyTagType(undefined));
      dispatch(setSelectedAgent(null));
      dispatch(setSortField(undefined));
      dispatch(setSortOrder(undefined));
      setIsRefreshing(false);
      dispatch(setDateRange([null, null]));
      dispatch(setDatePreset(null));
    };
  }, []);

  useEffect(() => {
    if (orderType === 'Renewals') {
      setSelectedPageFilters(
        <FilterButton
          visibility={{
            showSearch: true,
            showDateRange: true,
            showSelectCol: true,
            showSort: true,
            showDatePresetClassName: 'col-md-6 col-lg-3',
            showSortClassName: 'col-md-6 col-lg-3',
            showSelectColClassName: 'col-md-6 col-lg-3',
            showSearchClassName: 'col-md-6 col-lg-3',
            showDateRangeClassName: 'col-md-6 col-lg-3',
            showProductTypeFilter: true,
            showProductTypeFilterClassName: 'col-md-6 col-lg-2 col-xl-3',
          }}
          onFilterChange={handleUpdateOrders}
          onSearchEnter={(params) =>
            handleUpdateOrders({
              search: params.search,
              sortField: params.sortField,
              sortOrder: params.sortOrder,
              sortStatus: params.sortStatus,
              statusArray: params.statusArray,
              pharmacyType: params.pharmacyType,
              selectedAgent: params.selectedAgent,
              meta: { page: 1, limit: 30 },
              startDate: params.startDate,
              endDate: params.endDate,
              searchColumn: params.searchColumn,
              productType: params.productType,
            })
          }
          extendedSortOptions
        />
      );
    }
  }, [orderType, setSelectedPageFilters, handleUpdateOrders]);

  const allOrdersLoaded = currentPage >= totalPages;

  // Detect screen size - only render one version
  const isDesktop = useMediaQuery('(min-width: 992px)');

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
          loader={<div className='d-flex justify-content-center py-4' />}
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
        <InfiniteScroll
          dataLength={data.length}
          next={fetchMore}
          hasMore={!allOrdersLoaded}
          loader={<div className='d-flex justify-content-center py-4' />}
          height={`calc(100vh - 202px)`}
          className='overflow-auto'
        >
          <div id='orders-table-top' />
          <Table
            rowOnClick={handleRowClick}
            data={data}
            columns={columns}
            isFetching={isFetching && data.length === 0}
            defaultSort={currentSort}
            onSort={handleTableSort}
          />
        </InfiniteScroll>
      )}

      <OrderPopup
        onPharmacyChange={(pharmacy) => handleUpdatePharmacy(pharmacy as PublicPharmacy, order?.id ?? '')}
        onUpdateOrderAgent={(agent) => handleUpdateAgent(agent, order?.id ?? '')}
        onUpdateOrderStatus={(status) => handleUpdateStatus(status as OrderStatusType, order?.id ?? '')}
        onUpdateTrackingNumber={(trackingNumber, courierService) =>
          handleUpdateTrackingNumber(trackingNumber, order?.id ?? '', courierService)
        }
        orderUniqueId={order?.orderUniqueId ?? null}
        onPatientClick={handleOrderPopupPatientClick}
        show={modalType === 'orderPopup'}
        onHide={() => setModalType(null)}
      />
      <PatientSideBar
        orderId={order?.id ?? undefined}
        show={modalType === 'patientProfile'}
        onHide={() => {
          setModalType(null);
        }}
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
};
