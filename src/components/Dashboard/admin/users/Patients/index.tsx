'use client';

import InfiniteScroll from 'react-infinite-scroll-component';
import toast from 'react-hot-toast';
import { Patient, setPatient } from '@/store/slices/patientSlice';
import { Column, Table } from '@/components/Dashboard/Table';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getAge } from '@/lib';
import { SortState } from '@/store/slices/sortSlice';
import { useEffect, useState } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { UsersMobileCards } from '@/components/Dashboard/admin/users/UsersMobileCards';
import { PatientSideBar } from '@/components/Dashboard/PatientSideBar';
import { FilterGroup } from '@/components/Dashboard/Table/includes/FilterGroup';
import { useLazyGetPatientsQuery, useUpdatePatientStatusMutation } from '@/store/slices/patientsApiSlice';
import { MetaPayload, Error as ApiError } from '@/lib/types';
import { Spinner } from 'react-bootstrap';
import { RowActions } from './includes/RowActions';
import { useSyncPatientWithOpenPayByCustomerIdMutation } from '@/store/slices/patientPaymentApiSlice';
import { scrollToTop } from '@/lib/helper';
import { BanModal } from './includes/BanModal';
import { UnbanModal } from './includes/UnbanModal';
import { ViewBanReasonModal } from './includes/ViewBanReasonModal';
import { PatientOrdersListPopup } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/PatientOrdersListPopup';
import { formatUSDate } from '@/helpers/dateFormatter';
import { PATIENT_STATUSES } from '@/constants';
import { isAxiosError } from 'axios';
import { OrderPopup } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/OrderPopup';
import { Order, setOrder } from '@/store/slices/orderSlice';
import { mapPatientFromOrder } from '@/helpers/orderPatientHelpers';
import { OrderDetailsModal } from '@/components/Common/OrderDetailsModal';

type PatientsType = {
  data: Patient[];
  meta: SortState['meta'];
};

interface Props {
  role?: string;
  query?: string;
}

export const Patients = ({ role, query }: Readonly<Props>) => {
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showUnbanModal, setShowUnbanModal] = useState(false);
  const [showBanReasonModal, setShowBanReasonModal] = useState(false);
  const [selectedPatientForAction, setSelectedPatientForAction] = useState<Patient | null>(null);
  const [showOrdersPopup, setShowOrdersPopup] = useState(false);
  const [selectedPatientForOrders, setSelectedPatientForOrders] = useState<Patient | null>(null);
  const [modal, setModal] = useState<'orderDetails' | 'orderPopup' | null>(null);

  const sortStatus = useSelector((state: RootState) => state.sort.sortStatus);
  const search = useSelector((state: RootState) => state.sort.search);
  const sortField = useSelector((state: RootState) => state.sort.sortField);
  const sortOrder = useSelector((state: RootState) => state.sort.sortOrder);
  const userType = useSelector((state: RootState) => state.sort.userType);
  const isSuperAdmin = useSelector((state: RootState) => state.user.isSuperAdmin);
  const userRole = useSelector((state: RootState) => state.user.role);
  const order = useSelector((state: RootState) => state.order);

  const [patientsData, setPatientsData] = useState<PatientsType>({
    data: [] as Patient[],
    meta: { page: 1, limit: 30 },
  });

  const { data = [], meta } = patientsData || {};
  const { totalPages = 1, page: currentPage = 1 } = meta || {};

  const [triggerPatients, { isFetching }] = useLazyGetPatientsQuery();
  const [updatePatientStatus, { isLoading: isUpdatingPatientStatus }] = useUpdatePatientStatusMutation();
  const [syncOpenPay] = useSyncPatientWithOpenPayByCustomerIdMutation();
  const [syncingCustomerId, setSyncingCustomerId] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const handleShowOrderHistory = (patient: Patient) => {
    setSelectedPatientForOrders({ ...patient });
    setShowOrdersPopup(true);
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

  function handleRowClick(row: Patient) {
    dispatch(setPatient(row));
    setOpen(true);
  }

  const handleBanClick = (patient: Patient) => {
    setSelectedPatientForAction(patient);
    setShowBanModal(true);
  };

  const handleUnbanClick = (patient: Patient) => {
    setSelectedPatientForAction(patient);
    setShowUnbanModal(true);
  };

  const handleViewBanReasonClick = (patient: Patient) => {
    setSelectedPatientForAction(patient);
    setShowBanReasonModal(true);
  };

  const handlePatientUpdate = (patientId: string, updates: Partial<Patient>) => {
    setPatientsData((prev) => ({
      ...prev,
      data: prev.data.map((patient) => (patient.id === patientId ? { ...patient, ...updates } : patient)),
    }));
  };

  const handleStatusToggle = async (patient: Patient, targetStatus: 'disputed' | 'unresponsive', enabled: boolean) => {
    if (!patient.userId) {
      toast.error('Patient is missing a user ID');
      return;
    }

    const currentStatus = patient.status?.toLowerCase() || '';
    const previousStatus = patient.previousStatus?.toLowerCase() || null;
    const specialStatuses = ['disputed', 'unresponsive'];

    if ((enabled && currentStatus === targetStatus) || (!enabled && !specialStatuses.includes(currentStatus))) {
      return;
    }

    const basePreviousStatus = specialStatuses.includes(currentStatus) ? previousStatus || 'pending' : currentStatus;

    const nextStatus = enabled ? targetStatus : basePreviousStatus || 'pending';

    const updatingKey = patient.id ?? patient.userId;
    setStatusUpdatingId(updatingKey || null);

    try {
      const res = await updatePatientStatus({ userId: patient.userId, status: nextStatus }).unwrap();
      const { success, message, data } = res;

      if (!success) {
        toast.error(message || 'Failed to update patient status');
        return;
      }

      const updatedStatus = data?.status || nextStatus;
      const normalizedStatus = typeof updatedStatus === 'string' ? updatedStatus.toLowerCase() : updatedStatus;
      const updatedPrevious =
        data?.previousStatus ??
        (specialStatuses.includes(normalizedStatus as string) ? basePreviousStatus || null : null);

      if (patient.id) {
        handlePatientUpdate(patient.id, { status: updatedStatus, previousStatus: updatedPrevious });
      }
      toast.success(message || 'Patient status updated');
    } catch (error: unknown) {
      const message = isAxiosError(error)
        ? error.response?.data?.message
        : (error as ApiError | undefined)?.data?.message;
      toast.error(message || 'Failed to update patient status');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleCloseBanUnbanModals = (success: boolean, updates?: Partial<Patient>) => {
    if (success && selectedPatientForAction?.id && updates) {
      handlePatientUpdate(selectedPatientForAction.id, updates);
    }
    setShowBanModal(false);
    setShowUnbanModal(false);
    setSelectedPatientForAction(null);
  };

  async function handleSyncWithOpenPay(customerId: string) {
    try {
      setSyncingCustomerId(customerId);
      const res = await syncOpenPay({ customer_id: customerId }).unwrap();
      toast.success(res?.message || 'Sync with OpenPay completed.');
    } catch (error: unknown) {
      let message = 'Failed to sync with OpenPay.';
      if (error && typeof error === 'object' && 'data' in error) {
        const err = error as { data?: { message?: string } };
        message = err.data?.message || message;
      } else if (error instanceof Error) {
        message = error.message || message;
      }
      toast.error(message);
    } finally {
      setSyncingCustomerId(null);
    }
  }

  const handleOrderClick = (order: Order) => {
    dispatch(setOrder(order));
    setModal('orderPopup');
  };

  const columns: Column<Patient>[] = [
    // {
    //   header: <TableCheckbox data={data} isHeader className='tw-mr-2 -tw-mt-2 md:tw-mt-0 md:tw-mr-0' />,
    //   renderCell: (o: Patient) => <TableCheckbox item={o} className='tw-mr-2 -tw-mt-2 md:tw-mt-0 md:tw-mr-0' />,
    // },
    {
      header: 'PATIENT',
      renderCell: (o) => `${o?.firstName} ${o?.lastName}`,
      className: 'text-nowrap text-capitalize',
    },
    {
      header: 'EMAIL',
      renderCell: (o) => o?.email?.toLowerCase(),
      className: 'text-nowrap',
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
        <RowActions
          patient={o}
          onBanClick={handleBanClick}
          onUnbanClick={handleUnbanClick}
          onViewBanReasonClick={handleViewBanReasonClick}
          isSuperAdmin={isSuperAdmin ?? false}
          isAdmin={userRole === 'admin'}
          onToggleStatus={handleStatusToggle}
          statusUpdatingId={statusUpdatingId}
          isUpdatingStatus={isUpdatingPatientStatus}
        />
      ),
    },
    {
      header: <span className='d-none' />,
      renderCell: (o) =>
        o?.customerId ? (
          <button
            onClick={(event) => {
              event.stopPropagation();
              handleSyncWithOpenPay(o.customerId as string);
            }}
            disabled={syncingCustomerId === o.customerId}
            className='btn btn-outline-dark btn-sm rounded-pill d-flex align-items-center gap-2'
          >
            {syncingCustomerId === o.customerId && <Spinner size='sm' />}
            Sync with OpenPay
          </button>
        ) : (
          ''
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
    if (userType === 'Patient') {
      handleUpdatePatients({
        meta: { page: 1, limit: 30 } as MetaPayload['meta'],
        search,
        sortField,
        sortOrder,
        sortStatus,
      });
    }
  }, [userType, search, sortField, sortOrder, sortStatus]);

  // Detect screen size - only render one version
  const isDesktop = useMediaQuery('(min-width: 992px)');

  const allPatientsLoaded = currentPage >= totalPages;
  return (
    <>
      <div className='row align-items-center mb-3'>
        {isDesktop && <span className='text-lg fw-medium col-lg-4 col-xl-6'>Patients</span>}
        <div className={`col-lg-8 col-xl-6 text-end`}>
          <FilterGroup
            handleChange={handleUpdatePatients}
            visibility={{
              showSearch: true,
              showSort: true,
              showStatusFilter: true,
              showSearchClassName: 'col-md-6 col-lg-4 col-xl-3',
              showStatusFilterClassName: 'col-md-6 col-lg-4 col-xl-3',
              showSortClassName: 'col-md-6 col-lg-4 col-xl-3',
            }}
            filters={PATIENT_STATUSES}
            defaultFilterValue='Status'
          />
        </div>
      </div>
      {/* {selectedPatients.length > 0 && (
        <div className='d-flex align-items-center archived-card justify-content-md-between gap-3 flex-wrap mb-4'>
          <span className='text-sm d-none d-md-inline text-black'>Manage Patients</span>
          <div className={'d-flex align-items-center users-count-wrapper gap-3'}>
            <span className='text-sm users-count text-primary'>{selectedPatients.length} Selected</span>
            <button
              onClick={() => {
                dispatch(setModal({ modalType: 'Archive User' }));
              }}
              className='btn btn-primary d-flex align-items-center gap-2 justify-content-center'
            >
              <ArchiveArrowDown className='flex-shrink-0' size={18} />
              Archive Patients
            </button>
            <TableCheckbox data={data} isHeader className='d-md-none' />
          </div>
        </div>
      )} */}

      {/* Mobile version - only renders on mobile */}
      {!isDesktop && (
        <div className='user-mobile-cards'>
          <InfiniteScroll
            dataLength={data.length}
            next={fetchMore}
            hasMore={!allPatientsLoaded}
            loader={
              <div className='d-flex justify-content-center py-4'>
                <Spinner size='sm' />
              </div>
            }
            height={`calc(100vh - 256px)`}
          >
            <UsersMobileCards
              loading={isFetching && data.length === 0}
              data={data || []}
              columns={columns}
              rowOnClick={handleRowClick}
            />
          </InfiniteScroll>
        </div>
      )}

      {/* Desktop version - only renders on desktop */}
      {isDesktop && (
        <div className='table-responsive'>
          <InfiniteScroll
            dataLength={data.length}
            next={fetchMore}
            hasMore={!allPatientsLoaded}
            loader={
              <div className='d-flex justify-content-center py-4'>
                <Spinner size='sm' />
              </div>
            }
            height={'calc(100vh - 252px)'}
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
      )}

      {/* Sidebar */}

      <PatientSideBar show={open} onHide={() => setOpen(false)} onOrderClick={() => setModal('orderDetails')} />

      {/* Modals */}
      <BanModal
        isOpen={showBanModal}
        onClose={() => handleCloseBanUnbanModals(false)}
        onSuccess={(updates: Partial<Patient>) => handleCloseBanUnbanModals(true, updates)}
        patient={selectedPatientForAction}
      />

      <UnbanModal
        isOpen={showUnbanModal}
        onClose={() => handleCloseBanUnbanModals(false)}
        onSuccess={(updates: Partial<Patient>) => handleCloseBanUnbanModals(true, updates)}
        patient={selectedPatientForAction}
      />

      <ViewBanReasonModal
        isOpen={showBanReasonModal}
        onClose={() => setShowBanReasonModal(false)}
        patient={selectedPatientForAction}
      />

      <PatientOrdersListPopup
        key={selectedPatientForOrders?.userId || 'no-patient'}
        show={showOrdersPopup}
        onHide={() => {
          setShowOrdersPopup(false);
          setSelectedPatientForOrders(null);
        }}
        userId={selectedPatientForOrders?.userId || undefined}
        handleOrderClick={() => setModal('orderDetails')}
      />

      <OrderDetailsModal
        isOpen={modal === 'orderDetails'}
        onClose={() => setModal(null)}
        onOpenOrderSidebar={(order) => {
          setModal('orderPopup');
          handleOrderClick(order);
        }}
      />

      <OrderPopup
        hidePatientBtn={open}
        orderUniqueId={order?.orderUniqueId ?? null}
        onPatientClick={(orderData) => {
          if (orderData?.patient) {
            const mappedPatient = mapPatientFromOrder(orderData.patient);
            dispatch(setPatient(mappedPatient));
            setOpen(true);
          }
        }}
        show={modal === 'orderPopup'}
        onHide={() => setModal(null)}
      />
    </>
  );
};
