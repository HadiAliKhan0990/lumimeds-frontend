'use client';

import { MobileCard } from '@/components/Dashboard/MobileCard';
import { PatientSideBar } from '@/components/Dashboard/PatientSideBar';
import { Column, Table } from '@/components/Dashboard/Table';
import { Pagination } from '@/components/Dashboard/Table/includes/Pagination';
import { OrderDetailsModal } from '@/components/Common/OrderDetailsModal';
import { ROUTES } from '@/constants';
import { formatUSDateTime } from '@/helpers/dateFormatter';
import { MapPharmacyTypeInOrders } from '@/lib/helper';
import { Error, MetaPayload, PharmacyType } from '@/lib/types';
import { AgentsSelect } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/AgentsSelect';
import { OrderApprovedDosageCell } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/OrderApprovedDosageCell';
import { OrderCustomerInfoCell } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/OrderCustomerInfoCell';
import { OrderListOrderedProductCell } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/OrderListOrderedProductCell';
import { OrderPopup } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/OrderPopup';
import { OrdersRemarksTextArea } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/OrdersRemarksTextArea';
import { OrderStatus } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/OrderStatus';
import { PharmacySelect } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/PharmacySelect';
import { ProcessWith } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/ProcessWith';
import { RootState } from '@/store';
import { PublicPharmacy } from '@/store/slices/adminPharmaciesSlice';
import { Agent, useLazyGetAgentsQuery } from '@/store/slices/agentApiSlice';
import {
  OrderStatusType,
  useLazyGetPendingOrdersQuery,
  useUpdateOrderAgentMutation,
  useRevertOrdersToAdminMutation,
} from '@/store/slices/ordersApiSlice';
import { Order, setOrder } from '@/store/slices/orderSlice';
import { Patient, setPatient } from '@/store/slices/patientSlice';
import { mapPatientFromOrder, SingleOrderPatient } from '@/helpers/orderPatientHelpers';
import { isAxiosError } from 'axios';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import { FaCheckDouble } from 'react-icons/fa6';
import { useDispatch, useSelector } from 'react-redux';

type PendingOrders = {
  data: Order[];
  meta: MetaPayload['meta'];
};

export const DashboardOrders = () => {
  const dispatch = useDispatch();

  const [updateOrderAgent] = useUpdateOrderAgentMutation();
  const [revertOrders] = useRevertOrdersToAdminMutation();

  const [modalType, setModalType] = useState<'orderPopup' | 'patientProfile' | 'orderDetails' | null>(null);
  const [ordersData, setOrdersData] = useState<PendingOrders>();
  const [renderCount, setRenderCount] = useState(0);
  const [isProcessingTriage, setIsProcessingTriage] = useState(false);
  const { totalPages = 1 } = ordersData?.meta || {};

  const [defaultAgentOptions, setDefaultAgentOptions] = useState<Array<{ value: string; label: string; agent: Agent }>>(
    []
  );
  const [defaultAgentOptionsMeta, setDefaultAgentOptionsMeta] = useState<MetaPayload['meta']>({
    page: 1,
    limit: 50,
    totalPages: 1,
  });

  const [triggerOrders, { isFetching }] = useLazyGetPendingOrdersQuery();
  const [getAgents, agentsQuery] = useLazyGetAgentsQuery();

  const order = useSelector((state: RootState) => state.order);

  async function handleUpdateOrders({ meta }: MetaPayload) {
    try {
      const res = await triggerOrders({ meta }).unwrap();
      setOrdersData({ meta: res.meta, data: MapPharmacyTypeInOrders(res.orders) });
    } catch (error) {
      console.log(error);
    }
  }

  function handleClick(row: Order) {
    dispatch(setOrder(row));
    dispatch(setPatient(row.patient as Patient));
    setModalType('orderPopup');
  }

  const handleUpdateStatus = (status: OrderStatusType, orderId: string) => {
    const mappedOrders =
      ordersData?.data?.map((order) => {
        if (order.id === orderId) {
          return { ...order, status };
        }
        return order;
      }) || [];

    setOrdersData({ data: mappedOrders, meta: ordersData?.meta });
  };

  const handleUpdatePharmacy = (pharmacy: PublicPharmacy | PharmacyType, orderId: string) => {
    const mappedOrders =
      ordersData?.data?.map((order) => {
        if (order.id === orderId) {
          return { ...order, pharmacyName: pharmacy.name, pharmacyType: pharmacy.pharmacyType };
        }
        return order;
      }) ?? [];

    setOrdersData({ data: mappedOrders, meta: ordersData?.meta });
  };

  const handleUpdateTrackingNumber = (trackingNumber: string, orderId: string, courierService: string) => {
    const mappedOrders =
      ordersData?.data?.map((order) => {
        if (order.id === orderId) {
          return { ...order, trackingNumber, courierService };
        }
        return order;
      }) ?? [];
    setOrdersData({ data: mappedOrders, meta: ordersData?.meta });
  };

  const handleUpdateAgent = async (agent: Agent | null, orderId: string) => {
    try {
      const { success, message } = await updateOrderAgent({
        id: orderId,
        agentId: agent?.id || '',
        agent,
      }).unwrap();

      if (success) {
        const mappedOrders =
          ordersData?.data?.map((order) => {
            if (order.id === orderId) {
              return { ...order, agent };
            }
            return order;
          }) ?? [];

        setOrdersData({ data: mappedOrders, meta: ordersData?.meta });
      } else {
        toast.error(message || 'Failed to update agent');
      }
    } catch (error) {
      toast.error(
        isAxiosError(error) ? error.response?.data?.message : (error as Error).data?.message || 'Failed to update agent'
      );
    }
  };

  const handleTriageClick = async (order: Order) => {
    if (!order?.id) return;

    try {
      setIsProcessingTriage(true);

      const { success, message } = await revertOrders({
        orderIds: [order.id],
        notes: 'Admin Reverted this order',
      }).unwrap();

      if (success) {
        const mappedOrders =
          ordersData?.data?.map((o) => {
            if (o.id === order.id) {
              return { ...o, assignedProvider: undefined, status: 'Reverted' as OrderStatusType };
            }
            return o;
          }) ?? [];

        setOrdersData({ data: mappedOrders, meta: ordersData?.meta });
        toast.success(message || 'Order reverted successfully');
      } else {
        toast.error(message || 'Failed to revert order');
      }
    } catch (error) {
      toast.error(
        isAxiosError(error) ? error.response?.data?.message : (error as Error).data?.message || 'Failed to revert order'
      );
    } finally {
      setIsProcessingTriage(false);
    }
  };

  const handleUpdateRemarks = (remarks: string, orderId: string) => {
    const mappedOrders =
      ordersData?.data?.map((order) => {
        if (order.id === orderId) {
          return { ...order, remarks };
        }
        return order;
      }) ?? [];
    setOrdersData({ data: mappedOrders, meta: ordersData?.meta });
  };

  const handlePatientNameClick = (order: Order) => {
    if (order.patient) {
      dispatch(setPatient(order.patient));
      dispatch(setOrder(order));
      setModalType('patientProfile');
    }
  };

  const columns: Column<Order>[] = [
    {
      header: 'DATE & TIME',
      renderCell: (o) => {
        return <span>{formatUSDateTime(o?.createdAt)}</span>;
      },
      className: 'align-middle text-start',
    },
    {
      header: 'CUSTOMER',
      renderCell: (o) => <OrderCustomerInfoCell order={o} onClickPatientName={handlePatientNameClick} />,
      className: 'align-middle text-start',
    },
    {
      header: 'ORDERED',
      renderCell: (o) => (
        <OrderListOrderedProductCell
          order={o}
          onUpdateTrackingNumber={(trackingNumber, courierService) =>
            handleUpdateTrackingNumber(trackingNumber, o.id ?? '', courierService)
          }
          showTrackingNumber={false}
          onVialShipmentUpdate={(newShippedVials) => {
            // Optimistically update the local state
            const mappedOrders =
              ordersData?.data?.map((order) => {
                if (order.id === o.id) {
                  return { ...order, shippedVials: newShippedVials };
                }
                return order;
              }) ?? [];
            setOrdersData({ data: mappedOrders, meta: ordersData?.meta });
          }}
        />
      ),
      className: 'align-middle text-start',
    },
    {
      header: 'PLAN',
      renderCell: (o) => {
        if (o.metadata?.intervalCount && o.metadata?.billingInterval) {
          const count = o.metadata.intervalCount;
          const interval = o.metadata.billingInterval;
          return (
            <div className='d-flex align-items-start  flex-column gap-2 min-w-70px'>
              <span>
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
      className: 'align-middle text-start',
    },
    {
      header: 'STATUS',
      renderCell: (o) => (
        <OverlayTrigger placement='top' overlay={<Tooltip>{o.status}</Tooltip>}>
          <div>
            <OrderStatus
              order={o}
              disabled={
                o.pharmacyType === 'manual' && o.hasPharmacyOrder
                  ? false
                  : o.status && o.status !== 'Not Paid'
                  ? true
                  : false
              }
              onOrderStatusChange={(status) => handleUpdateStatus(status as OrderStatusType, o.id ?? '')}
            />
          </div>
        </OverlayTrigger>
      ),
      className: 'align-middle text-start',
    },
    {
      header: 'PROVIDER',
      renderCell: (o) => (
        <ProcessWith
          order={o}
          onProviderChange={() => setRenderCount((prev) => prev + 1)}
          onTriageClick={() => handleTriageClick(o)}
          isProcessingTriage={isProcessingTriage}
        />
      ),
      className: 'align-middle text-start',
    },
    {
      header: 'REMARKS',
      renderCell: (o) => (
        <OrdersRemarksTextArea order={o} onUpdateRemarks={(remarks) => handleUpdateRemarks(remarks, o.id ?? '')} />
      ),
      className: 'align-middle text-start',
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
      className: 'text-nowrap min-w-160px text-start',
    },
    {
      className: 'text-start',
      header: 'Pharmacies',
      renderCell: (row) => (
        <PharmacySelect
          order={row}
          selectedPharmacy={row?.hasPharmacyOrder && row?.pharmacyName ? row?.pharmacyName : undefined}
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
  ];

  const page = ordersData?.meta?.page ?? 1;
  const limit = ordersData?.meta?.limit ?? 10;

  useEffect(() => {
    handleUpdateOrders({ meta: { page, limit } as MetaPayload['meta'] });
  }, [renderCount]);
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
      .catch((err) =>
        toast.error(
          isAxiosError(err) ? err.response?.data?.message : (err as Error).data?.message || 'Error loading agents!'
        )
      );
  }, []);

  return (
    <>
      <div className='d-md-none'>
        <div className='d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4'>
          <span className='text-base fw-semibold'>Latest Orders</span>
          <Link href={ROUTES.ADMIN_ORDERS} className='btn btn-light border border-secondary fw-medium btn-sm'>
            View All Orders
          </Link>
        </div>
        <MobileCard rowOnClick={handleClick} data={ordersData?.data || []} columns={columns} />
        {totalPages > 1 && <Pagination meta={ordersData?.meta} handleUpdatePagination={handleUpdateOrders} />}
      </div>

      <Card body className='rounded-12 d-none d-md-block border-light'>
        <div className='d-flex align-items-center justify-content-between flex-wrap gap-2'>
          <span className='text-2xl fw-semibold'>Latest Orders</span>
          <Link href={ROUTES.ADMIN_ORDERS} className='btn btn-outline-primary fw-medium text-sm'>
            View All Orders
          </Link>
        </div>
        <div className='table-responsive d-none d-md-block mt-5'>
          <Table rowOnClick={handleClick} data={ordersData?.data || []} columns={columns} isFetching={isFetching} />
        </div>
        {totalPages > 1 && <Pagination meta={ordersData?.meta} handleUpdatePagination={handleUpdateOrders} />}
      </Card>

      <OrderPopup
        hidePatientBtn={modalType === 'patientProfile'}
        onUpdateTrackingNumber={(trackingNumber, courierService) =>
          handleUpdateTrackingNumber(trackingNumber, order?.id ?? '', courierService)
        }
        onPatientClick={(orderData) => {
          if (orderData?.patient) {
            const patientData = orderData.patient as SingleOrderPatient;
            const mappedPatient = mapPatientFromOrder(patientData);
            dispatch(setPatient(mappedPatient));
            dispatch(setOrder(orderData as Order));
            setModalType('patientProfile');
          }
        }}
        show={modalType === 'orderPopup'}
        onHide={() => setModalType(null)}
      />

      <PatientSideBar
        show={modalType === 'patientProfile'}
        onHide={() => setModalType(null)}
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
    </>
  );
};
