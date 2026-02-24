'use client';

import toast from 'react-hot-toast';
import InfiniteScroll from 'react-infinite-scroll-component';
import { UsersMobileCards } from '@/components/Dashboard/admin/users/UsersMobileCards';
import { MobileHeader } from '@/components/Dashboard/MobileHeader';
import { OrderReassignConfirmModal } from '@/components/Dashboard/modals/OrderReassignConfirmModal';
import { PullPatientOrdersModal } from '@/components/Dashboard/modals/PullPatientOrdersModal';
import { PatientSideBar } from '@/components/Dashboard/PatientSideBar';
import { Column, Table } from '@/components/Dashboard/Table';
import { FilterGroup } from '@/components/Dashboard/Table/includes/FilterGroup';
import { ProvidersPageContainer } from '@/components/ProvidersModule/components/ProvidersPageContainer';
import { QuepageContentContainer } from '@/components/ProvidersModule/components/QuepageContentContainer';
import { QueryPageTitleWrapper } from '@/components/ProvidersModule/components/QueryPageTitleWrapper';
import {
  QueuePageFiltersTitle,
  QueuePageTitleAndFiltersWrapper,
} from '@/components/ProvidersModule/components/QueuePageTitleAndFiltersContainer';
import { PATIENT_STATUSES } from '@/constants';
import { formatUSDate } from '@/helpers/dateFormatter';
import { getAge } from '@/lib';
import { scrollToTop } from '@/lib/helper';
import { MetaPayload } from '@/lib/types';
import { PatientOrdersListPopup } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/PatientOrdersListPopup';
import { OrderDetailsModal } from '@/components/Common/OrderDetailsModal';
import { OrderPopup } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/OrderPopup';
import { RootState } from '@/store';
import { usePullSelectedOrdersMutation, useLazyGetOrdersByPatientIdQuery } from '@/store/slices/ordersApiSlice';
import { useLazyGetPatientsQuery } from '@/store/slices/patientsApiSlice';
import { Patient, setPatient } from '@/store/slices/patientSlice';
import { setOrder } from '@/store/slices/orderSlice';
import { SortState } from '@/store/slices/sortSlice';
import { useEffect, useState } from 'react';
import { Card, Spinner } from 'react-bootstrap';
import { FaUsers } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

type PatientsType = {
  data: Patient[];
  meta: SortState['meta'];
};

interface Props {
  role?: string;
  query?: string;
}

export const ViewAllPatients = ({ role, query }: Readonly<Props>) => {
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [showOrdersPopup, setShowOrdersPopup] = useState(false);
  const [selectedPatientForOrders, setSelectedPatientForOrders] = useState<Patient | null>(null);
  const [orderModalType, setOrderModalType] = useState<'orderDetails' | 'orderPopup' | null>(null);
  const order = useSelector((state: RootState) => state.order);
  const [pullOrdersModal, setPullOrdersModal] = useState({
    isOpen: false,
    selectedPatientId: null as string | null,
    selectedPatientName: null as string | null,
  });
  const [reassignConfirmModal, setReassignConfirmModal] = useState({
    isOpen: false,
    orderIds: [] as string[],
    ordersWithOtherProviders: [] as string[],
  });

  const sortStatus = useSelector((state: RootState) => state.sort.sortStatus);
  const search = useSelector((state: RootState) => state.sort.search);
  const sortField = useSelector((state: RootState) => state.sort.sortField);
  const sortOrder = useSelector((state: RootState) => state.sort.sortOrder);

  const [patientsData, setPatientsData] = useState<PatientsType>({
    data: [] as Patient[],
    meta: { page: 1, limit: 30 },
  });

  const { data = [], meta } = patientsData || {};
  const { totalPages = 1, page: currentPage = 1 } = meta || {};

  const [triggerPatients, { isFetching }] = useLazyGetPatientsQuery();
  const [pullSelectedOrders, { isLoading: isPullingSelectedOrders }] = usePullSelectedOrdersMutation();
  const [getOrdersByPatientId] = useLazyGetOrdersByPatientIdQuery();

  const user = useSelector((state: RootState) => state.user);
  const currentProviderId = user?.id;
  const isProviderPaused = user?.isPaused === true;

  const handleShowOrderHistory = (patient: Patient) => {
    setSelectedPatientForOrders({ ...patient });
    setShowOrdersPopup(true);
  };

  const handleOrderClick = () => {
    setOrderModalType('orderDetails');
  };

  const appendPatientsDataLocally = (currentData: PatientsType, newData: PatientsType): PatientsType => {
    if (currentData?.data) {
      const existingIds = new Set(currentData.data.map((patient) => patient.id));
      const uniqueNewPatients = (newData?.data || []).filter((patient) => !existingIds.has(patient.id));

      return {
        data: [...currentData.data, ...uniqueNewPatients],
        meta: newData?.meta || currentData.meta,
      };
    } else {
      // If no existing data, return the new data
      return {
        data: newData?.data || [],
        meta: newData?.meta,
      };
    }
  };

  async function handleUpdatePatients({ meta, search, sortField, sortOrder, sortStatus, append = false }: MetaPayload) {
    try {
      const { data: res } = await triggerPatients({
        meta: {
          page: meta?.page || 1,
          limit: 30,
        },
        sortField,
        sortOrder,
        ...(search && { search }),
        ...(sortStatus && { status: sortStatus.toLowerCase() }),
      });
      const { patients: newPatients } = res?.data || {};
      if (append) {
        setPatientsData((prev) =>
          appendPatientsDataLocally(prev, {
            data: newPatients || [],
            meta: res?.data.meta,
          })
        );
      } else {
        await scrollToTop('patients-table-top');
        setPatientsData({ data: newPatients || [], meta: res?.data.meta });
      }
    } catch (error) {
      console.log(error);
    }
  }

  const fetchMore = () => {
    if (currentPage < totalPages && !isFetching) {
      handleUpdatePatients({
        meta: { page: currentPage + 1, limit: 30 },
        search,
        sortField,
        sortOrder,
        sortStatus,
        append: true,
      });
    }
  };

  async function handleRowClick(row: Patient) {
    if (!row?.id) {
      toast.error(`Patient ID is missing`);
      return;
    }

    dispatch(setPatient(row));
    setOpen(true);

    // Fetch patient's orders and set the first/most recent order
    try {
      const ordersResponse = await getOrdersByPatientId(row.id).unwrap();
      const orders = ordersResponse?.orders || [];

      if (orders.length > 0) {
        // Set the first order (most recent, as they're typically sorted by date DESC)
        const firstOrder = orders[0];
        dispatch(
          setOrder({
            id: firstOrder.id,
            patient: row,
          })
        );
      } else {
        // No orders found, just set patient without order ID
        dispatch(setOrder({ patient: row }));
      }
    } catch (error) {
      // If fetching orders fails, just set patient without order ID
      console.log('Error fetching patient orders:', error);
      dispatch(setOrder({ patient: row }));
    }
  }

  const handleSelectPatient = (patient: Patient) => {
    if (isProviderPaused) {
      toast.error('Your account is paused. You cannot pull new patients.');
      return;
    }

    const patientName = `${patient.firstName} ${patient.lastName}`;
    const patientId = patient.id || patient.userId;

    if (!patientId) {
      toast.error(`Patient ID is missing`);
      return;
    }

    dispatch(setPatient(patient));

    // Open PullPatientOrdersModal directly
    setPullOrdersModal({
      isOpen: true,
      selectedPatientId: patientId,
      selectedPatientName: patientName,
    });
  };

  const handleClosePullOrdersModal = () => {
    setPullOrdersModal({
      isOpen: false,
      selectedPatientId: null,
      selectedPatientName: null,
    });
  };

  const handlePullSelectedOrders = (orderIds: string[], ordersWithOtherProviders: string[]) => {
    if (ordersWithOtherProviders.length > 0) {
      setPullOrdersModal((prev) => ({
        ...prev,
        isOpen: false,
      }));
      setReassignConfirmModal({
        isOpen: true,
        orderIds,
        ordersWithOtherProviders,
      });
    } else {
      executePullSelectedOrders(orderIds);
    }
  };

  const handleCloseReassignConfirmModal = () => {
    setPullOrdersModal((prev) => ({
      isOpen: true,
      selectedPatientId: prev.selectedPatientId,
      selectedPatientName: prev.selectedPatientName,
    }));
    setReassignConfirmModal({
      isOpen: false,
      orderIds: [],
      ordersWithOtherProviders: [],
    });
  };

  const handleConfirmReassign = () => {
    executePullSelectedOrders(reassignConfirmModal.orderIds);
  };

  const executePullSelectedOrders = async (orderIds: string[]) => {
    if (!pullOrdersModal.selectedPatientId) return;

    try {
      const result = await pullSelectedOrders({
        patientId: pullOrdersModal.selectedPatientId,
        visitType: 'document',
        orderIds,
      }).unwrap();

      if (result?.data?.success) {
        toast.success('Orders pulled successfully');
        handleClosePullOrdersModal();
        setReassignConfirmModal({
          isOpen: false,
          orderIds: [],
          ordersWithOtherProviders: [],
        });
        // Refresh the patients list
        handleUpdatePatients({
          meta: { page: currentPage, limit: 30 } as MetaPayload['meta'],
          search,
          sortField,
          sortOrder,
          sortStatus,
        });
      } else {
        toast.error('Failed to pull orders');
      }
    } catch (error) {
      console.log('Error pulling orders:', error);
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || 'Failed to pull orders';
      toast.error(errorMessage);
    }
  };

  const handleViewPatient = async (patient: Patient) => {
    if (!patient?.id) {
      toast.error(`Patient ID is missing`);
      return;
    }

    dispatch(setPatient(patient));
    setOpen(true);

    // Fetch patient's orders and set the first/most recent order
    try {
      const ordersResponse = await getOrdersByPatientId(patient.id).unwrap();
      const orders = ordersResponse?.orders || [];

      if (orders.length > 0) {
        // Set the first order (most recent, as they're typically sorted by date DESC)
        const firstOrder = orders[0];
        dispatch(
          setOrder({
            id: firstOrder.id,
            patient: patient,
          })
        );
      } else {
        // No orders found, just set patient without order ID
        dispatch(setOrder({ patient: patient }));
      }
    } catch (error) {
      // If fetching orders fails, just set patient without order ID
      console.log('Error fetching patient orders:', error);
      dispatch(setOrder({ patient: patient }));
    }
  };

  const columns: Column<Patient>[] = [
    {
      header: 'PATIENT',
      renderCell: (o) => `${o?.firstName} ${o?.lastName}`,
      className: 'text-nowrap text-capitalize',
    },
    {
      header: 'EMAIL',
      accessor: 'email',
      className: 'text-nowrap text-lowercase',
    },
    {
      header: 'DOB',
      renderCell: (o) => formatUSDate(o?.dob),
      className: 'text-nowrap',
    },
    {
      header: 'STATUS',
      renderCell: (col) => {
        const isBanned = col.isBanned === true;
        const statusClass = isBanned ? 'banned' : col.status?.toLowerCase();
        const statusText = isBanned
          ? 'Banned'
          : col?.status?.toLowerCase() === 'pending_submission'
          ? 'Pending Intake'
          : col?.status?.replace('_', ' ');

        return <span className={`status-badge ${statusClass}`}>{statusText}</span>;
      },
    },
    {
      header: 'AGE',
      renderCell: (o) => getAge(o?.dob),
    },
    { header: 'GENDER', accessor: 'gender', className: 'text-nowrap text-capitalize' },
    { header: 'STATE', accessor: 'state', className: 'text-nowrap text-capitalize' },
    {
      header: 'ORDERS',
      renderCell: (o) => (
        <button
          type='button'
          onClick={(event) => {
            event.stopPropagation();
            handleShowOrderHistory(o);
          }}
          className='text-xs fw-bold btn btn-link p-0'
        >
          Order History
        </button>
      ),
    },
    {
      header: 'ACTIONS',
      renderCell: (o) => (
        <div className='d-flex gap-2 align-items-center'>
          <button
            type='button'
            onClick={(event) => {
              event.stopPropagation();
              handleViewPatient(o);
            }}
            className='btn btn-primary btn-sm'
          >
            View Patient
          </button>
          <button
            type='button'
            onClick={(event) => {
              event.stopPropagation();
              handleSelectPatient(o);
            }}
            className='btn btn-outline-primary btn-sm'
            disabled={isProviderPaused}
            title={isProviderPaused ? 'Your account is paused.' : ''}
          >
            Select Patient
          </button>
        </div>
      ),
      className: 'text-nowrap',
    },
  ];

  useEffect(() => {
    if (query) {
      if (
        role === 'patient' &&
        data &&
        (data[0]?.email?.toLowerCase() === query.toLowerCase() ||
          query.includes(data[0]?.firstName ?? '') ||
          query.includes(data[0]?.lastName ?? ''))
      ) {
        dispatch(setPatient(data[0]));
        setOpen(true);
      }
    }
  }, [data, query, role]);

  useEffect(() => {
    handleUpdatePatients({
      meta: { page: 1, limit: 30 } as MetaPayload['meta'],
      search,
      sortField,
      sortOrder,
      sortStatus,
    });
  }, [search, sortField, sortOrder, sortStatus]);

  const allPatientsLoaded = currentPage >= totalPages;
  return (
    <ProvidersPageContainer>
      <QueryPageTitleWrapper>
        <MobileHeader title='Patients' />
      </QueryPageTitleWrapper>
      <Card body className='rounded-12 border-light'>
        <QuepageContentContainer>
          <QueuePageTitleAndFiltersWrapper className='!tw-items-start'>
            <QueuePageFiltersTitle
              pageTitle={
                <div className='tw-flex tw-flex-wrap tw-gap-x-2 tw-gap-y-0 tw-items-center'>
                  <span>Patients</span>
                  {meta?.total ? <span className='text-muted fw-normal fs-6'>({meta.total} Total)</span> : null}
                </div>
              }
              icon={
                <span className='tw-self-start sm:tw-self-center tw-mt-1.5 sm:tw-mt-0'>
                  <FaUsers className='text-muted' size={24} />
                </span>
              }
            />
            <div className='tw-flex-grow'>
              <FilterGroup
                handleChange={handleUpdatePatients}
                visibility={{
                  showSearch: true,
                  showSort: true,
                  showStatusFilter: true,
                  showSearchClassName: 'col-md-6 col-lg-3 ',
                  showStatusFilterClassName: 'col-md-6 col-lg-3 ',
                  showSortClassName: 'col-md-6 col-lg-3 ',
                }}
                filters={PATIENT_STATUSES}
                defaultFilterValue='Status'
              />
            </div>
          </QueuePageTitleAndFiltersWrapper>

          {/* Mobile version - only renders on mobile */}
          <div className='d-lg-none'>
            <InfiniteScroll
              dataLength={data.length}
              next={fetchMore}
              hasMore={!allPatientsLoaded}
              loader={
                <div className='d-flex justify-content-center py-4'>
                  <Spinner size='sm' />
                </div>
              }
              height={`calc(100vh - 250px)`}
            >
              <UsersMobileCards
                loading={isFetching && data.length === 0}
                data={data || []}
                columns={columns}
                rowOnClick={handleRowClick}
              />
            </InfiniteScroll>
          </div>

          {/* Desktop version - only renders on desktop */}
          <div className='d-none d-lg-block'>
            <InfiniteScroll
              dataLength={data.length}
              next={fetchMore}
              hasMore={!allPatientsLoaded}
              loader={
                <div className='d-flex justify-content-center py-4'>
                  <Spinner size='sm' />
                </div>
              }
              height={'calc(100vh - 200px)'}
            >
              <div id='patients-table-top' />
              <Table
                data={data}
                columns={columns}
                isFetching={isFetching && data.length === 0}
                rowOnClick={handleRowClick}
              />
            </InfiniteScroll>
          </div>
        </QuepageContentContainer>
      </Card>

      {/* Sidebar */}
      <PatientSideBar
        show={open}
        hideTriageButton={true}
        onHide={() => setOpen(false)}
        onOrderClick={() => setOrderModalType('orderDetails')}
      />

      {/* Modals */}
      <PatientOrdersListPopup
        key={selectedPatientForOrders?.userId || 'no-patient'}
        show={showOrdersPopup}
        onHide={() => {
          setShowOrdersPopup(false);
          setSelectedPatientForOrders(null);
        }}
        userId={selectedPatientForOrders?.userId || undefined}
        handleOrderClick={handleOrderClick}
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

      <PullPatientOrdersModal
        show={pullOrdersModal.isOpen}
        onHide={handleClosePullOrdersModal}
        patientId={pullOrdersModal.selectedPatientId}
        patientName={pullOrdersModal.selectedPatientName}
        visitType='document'
        onPullSelectedOrders={handlePullSelectedOrders}
        isPulling={isPullingSelectedOrders}
        currentProviderId={currentProviderId}
      />
      <OrderReassignConfirmModal
        show={reassignConfirmModal.isOpen}
        onHide={handleCloseReassignConfirmModal}
        onConfirm={handleConfirmReassign}
        isPulling={isPullingSelectedOrders}
        orderCount={reassignConfirmModal.orderIds.length}
        patientName={pullOrdersModal.selectedPatientName || 'this patient'}
        visitType='document'
      />
    </ProvidersPageContainer>
  );
};
