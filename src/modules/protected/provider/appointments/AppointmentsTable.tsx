'use client';

import InfiniteScroll from 'react-infinite-scroll-component';
import { useEffect, useState } from 'react';
import { Column, Table } from '@/components/Dashboard/Table';
import { MobileCard } from '@/components/Dashboard/MobileCard';
import { CheckboxInput, CheckboxLabel } from '@/components/Checkbox/Checkbox';
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';
import { Patient, setPatient } from '@/store/slices/patientSlice';
import { setOrder } from '@/store/slices/orderSlice';
import { useDispatch, useSelector } from 'react-redux';
import { PatientSideBar } from '@/components/Dashboard/PatientSideBar';
import { OrderDetailsModal } from '@/components/Common/OrderDetailsModal';
import { OrderPopup } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/OrderPopup';
import { useWindowWidth } from '@/hooks/useWindowWidth';
import { useMounted } from '@/hooks/usemounted';
import { getAppointmentTypeColor } from '@/lib/helper';
import { formatUSDateTime } from '@/helpers/dateFormatter';
import { removeAppointment, setAppointments, decrementTodayCount } from '@/store/slices/appointmentsRealTimeSlice';
import { IPendingrxPatientListInfo } from '@/types/appointment';
import { Modal } from '@/components/elements';
import {
  useRevertOrdersToAdminMutation,
  RevertOrdersToAdminPayload,
  OrderRejectionNotesResponse,
} from '@/store/slices/ordersApiSlice';
import { decrementAppointmentStats } from '@/store/slices/providerSlice';
import { RootState } from '@/store';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';

const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  pending_confirmation: 'Pending',
  scheduled: 'Scheduled',
  rescheduled: 'Rescheduled',
};

const getStatusLabel = (status: string): string => {
  return APPOINTMENT_STATUS_LABELS[status] || status.split('_').join(' ');
};

interface AppointmentsTableProps {
  data: IPendingrxPatientListInfo[];
  checkedPatientMap: Record<string, string>;
  setCheckedPatientMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isFilterNotApplied: boolean;
}

export const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
  data,
  checkedPatientMap,
  setCheckedPatientMap,
  isFilterNotApplied,
}) => {
  const [dataTable, setDataTable] = useState<IPendingrxPatientListInfo[]>([]);

  const [open, setOpen] = useState(false);

  const dispatch = useDispatch();

  const { windowWidth } = useWindowWidth();

  const { mounted } = useMounted();

  const isMobile = mounted && windowWidth <= 476;

  const isMoisSmallerThanLg = mounted && windowWidth < 992;

  const [orderId, setOrderId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedAppointment, setSelectedAppointment] = useState<IPendingrxPatientListInfo | null>(null);

  // Triage modal state
  const [showTriageModal, setShowTriageModal] = useState(false);
  const [orderModalType, setOrderModalType] = useState<'orderDetails' | 'orderPopup' | null>(null);
  const order = useSelector((state: RootState) => state.order);
  const [triageNotes, setTriageNotes] = useState('');
  const [isProcessingTriage, setIsProcessingTriage] = useState(false);
  const [selectedTriageOrderId, setSelectedTriageOrderId] = useState<string | null>(null);

  // Get real-time appointments from store for refetching
  const currentAppointments = useSelector((state: RootState) => state.appointmentsRealTime?.appointments || []);

  // Triage mutation
  const [revertOrders] = useRevertOrdersToAdminMutation();

  useEffect(() => {
    setDataTable(data);
  }, [data]);

  const handleViewButtonClick = (row: IPendingrxPatientListInfo) => {
    setOpen(true);
    setOrderId(row.id as string);
    setSelectedAppointment(row);

    const dispatchedRow: Patient = {
      ...row.patientInfo,
      id: row.patientInfo.id as string,
    };

    dispatch(setPatient(dispatchedRow));

    dispatch(
      setOrder({
        id: row.id as string,
        patient: dispatchedRow,
      })
    );
  };

  const columns: Column<IPendingrxPatientListInfo>[] = [
    {
      header: '',
      renderCell: (row) => {
        // Don't show checkbox if status is completed
        if (row.rxStatus === 'completed') {
          return null;
        }

        return (
          <CheckboxLabel
            className='mt-3 mt-sm-0 d-none d-lg-block'
            htmlFor={`select-${row.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <CheckboxInput
              checked={!!checkedPatientMap?.[row.id ?? '']}
              onChange={() => {
                if (checkedPatientMap?.[row.id ?? '']) {
                  setCheckedPatientMap((prev) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { [row.id ?? '']: _, ...rest } = prev;
                    return rest;
                  });
                } else {
                  setCheckedPatientMap((prev) => ({
                    ...prev,
                    [row.id ?? '']: String(row.id ?? ''),
                  }));
                }
              }}
              onClick={(e) => e.stopPropagation()}
              id={`select-${row.id}`}
            />
          </CheckboxLabel>
        );
      },
    },
    {
      header: 'PATIENT DETAILS',
      renderCell: (row) => {
        return (
          <div
            className={`${
              isMoisSmallerThanLg ? '-mt-1-5' : ''
            } d-flex justify-content-between align-items-start align-items-sm-center `}
          >
            <div className='d-flex flex-column align-items-start'>
              <span className={`${isMoisSmallerThanLg ? 'w-100' : 'w-90px'} text-start text-small fw-normal`}>
                {row.patientInfo.firstName} {row.patientInfo.lastName}
              </span>
              <div className=' d-flex align-items-center gap-1'>
                <span className='text-muted'>{row.patientInfo.age}Y,</span>
                <span className='text-muted'>{row.patientInfo.gender}</span>
              </div>
              <div className='d-flex flex-wrap align-items-center gap-1 mt-1'>
                <span
                  className='rounded px-2 text-xs'
                  style={{ background: '#FFF9EB', color: '#8F6734', border: 'solid 1px #FFE6B1' }}
                >
                  {row.patientInfo.weight || 0} lbs
                </span>
                <span
                  className='rounded px-2 text-xs'
                  style={{ background: '#FFF9EB', color: '#8F6734', border: 'solid 1px #FFE6B1' }}
                >
                  BMI {row.patientInfo.bmi || 'N/A'}
                </span>
              </div>
              <button
                className='btn btn-link text-primary text-decoration-underline p-0 mt-2 text-xs border-0 bg-transparent'
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewButtonClick(row);
                }}
              >
                View Patient
              </button>
            </div>
            <CheckboxLabel
              className='d-lg-none align-self-start h-100'
              htmlFor={`select-${row.id}`}
              onClick={(e) => e.stopPropagation()}
            >
              <CheckboxInput
                disabled={row.rxStatus === 'completed'}
                checked={!!checkedPatientMap?.[row.id ?? '']}
                onChange={() => {
                  if (checkedPatientMap?.[row.id ?? '']) {
                    setCheckedPatientMap((prev) => {
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      const { [row.id ?? '']: _, ...rest } = prev;
                      return rest;
                    });
                  } else {
                    setCheckedPatientMap((prev) => {
                      const newState = { ...prev, [(row.id as string) ?? '']: (row.id as string) ?? '' };
                      return newState;
                    });
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                id={`select-${row.id}`}
              />
            </CheckboxLabel>
          </div>
        );
      },
    },
    {
      header: 'ORDERED',
      renderCell: (row) => {
        return (
          <div className='tw-text-wrap'>
            <p className='tw-line-clamp-3 tw-max-w-60' title={row.orderInfo.drugName}>
              {row.orderInfo.drugName}
            </p>
            <div
              className='text-xs px-2 py-1 rounded  d-flex align-items-center justify-content-center w-fit gap-1 bg-neutral-light fw-medium mt-2'
              style={{
                color: '#364153',
              }}
            >
              <span
                className={`d-inline-block text-truncate ${isMobile ? 'max-w-70px' : 'max-w-120px'}`}
                title={row.orderInfo.orderType}
              >
                {row.orderInfo.orderType}
              </span>
              <div
                className='rounded-circle'
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: getAppointmentTypeColor(row.orderInfo.orderType),
                }}
              />
            </div>

            {row.type ? (
              <div className='tw-mt-2 custom-badge custom-badge-sm custom-badge-gray-neutral'>
                <span>{row.type}</span>
                <span
                  style={{
                    backgroundColor: getAppointmentTypeColor(row.type ?? 'Subscription', row.orderInfo.drugName),
                  }}
                  className='tw-ml-2 tw-w-2 tw-h-2 tw-rounded-full tw-bg-primary'
                ></span>
              </div>
            ) : null}
          </div>
        );
      },
    },
    {
      header: 'CITY/STATE',
      renderCell: (row) => {
        return <div className='text-small'>{row.patientInfo.state}</div>;
      },
    },
    {
      header: 'DATE & TIME',
      renderCell: (row) => {
        const scheduledTime = (row as { scheduledAt?: string | Date })?.scheduledAt;

        if (row.rxStatus === 'completed') {
          return '-';
        }

        if (!scheduledTime) {
          return <span className='text-small text-muted'>Not Scheduled</span>;
        }

        try {
          const date = new Date(scheduledTime ?? '');
          if (isNaN(date.getTime())) {
            return <span className='text-small'>Invalid date</span>;
          }

          return (
            <div className='d-flex flex-column align-items-start align-items-lg-center'>
              <span className='text-small'>{formatUSDateTime(row.scheduledAt)}</span>
            </div>
          );
        } catch (error) {
          console.error('Date parsing error:', error);
          return (
            <div className='d-flex flex-column text-muted'>
              <span className='text-small'>Error parsing date</span>
              <span className='text-small'>-</span>
            </div>
          );
        }
      },
    },
    {
      header: 'Created At',
      renderCell: (row) => {
        const createdAt = (row as { createdAt?: string | Date })?.createdAt;

        if (row.rxStatus === 'completed') {
          return '-';
        }

        if (!createdAt) {
          return <span className='text-small text-muted'>Not Scheduled</span>;
        }

        try {
          const date = new Date(createdAt ?? '');
          if (Number.isNaN(date.getTime())) {
            return <span className='text-small'>Invalid date</span>;
          }

          return <span className='text-small'>{formatUSDateTime(row.createdAt)}</span>;
        } catch (error) {
          console.error('Date parsing error:', error);
          return (
            <div className='d-flex flex-column text-muted'>
              <span className='text-small'>Error parsing date</span>
              <span className='text-small'>-</span>
            </div>
          );
        }
      },
    },
    {
      header: 'STATUS',
      renderCell: (row) => {
        const statusLabel = getStatusLabel(row.rxStatus);
        return (
          <OverlayTrigger placement='top' overlay={<Tooltip>{statusLabel}</Tooltip>}>
            <span
              className={`text-xs fw-normal rounded px-2 py-1 custom-badge custom-badge-${row?.rxStatus?.toLowerCase()}`}
            >
              <span className='tw-truncate'>{statusLabel}</span>
            </span>
          </OverlayTrigger>
        );
      },
    },
    {
      header: 'ACTIONS',
      className: 'text-start',
      renderCell: (row) => {
        if (row.rxStatus === 'completed') {
          return <span className='text-muted text-center v'>N/A</span>;
        }

        // Show status for declined appointments instead of action buttons
        if (row.rxStatus === 'declined') {
          return (
            <div className='tw-flex tw-flex-col tw-gap-1'>
              <span className='badge bg-light text-dark rounded px-2 py-1 tw-text-xs'>Rescheduled</span>
              <span className='text-small text-muted'>You declined</span>
            </div>
          );
        }

        // Show action buttons for other statuses
        const triageDisabled = isTriageDisabled(row);

        return (
          <div className='tw-flex tw-flex-col tw-gap-1 sm:tw-gap-1.5'>
            {/* Reschedule button */}
            {row.rescheduleLink && (
              <button
                className='btn btn-outline-primary btn-sm tw-text-[10px] sm:tw-text-xs tw-py-1.5 sm:tw-py-1 tw-px-2 sm:tw-px-2 tw-whitespace-nowrap tw-w-full sm:tw-w-auto'
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(row.rescheduleLink, '_blank', 'noopener,noreferrer');
                }}
              >
                Reschedule
              </button>
            )}
            {/* Decline button */}
            {row.declineLink && (
              <button
                className='btn btn-outline-danger btn-sm tw-text-[10px] sm:tw-text-xs tw-py-1.5 sm:tw-py-1 tw-px-2 sm:tw-px-2 tw-whitespace-nowrap tw-w-full sm:tw-w-auto'
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(row.declineLink, '_blank', 'noopener,noreferrer');
                }}
              >
                Decline
              </button>
            )}
            {/* Triage button */}
            <button
              className='btn btn-outline-primary btn-sm tw-text-[10px] sm:tw-text-xs tw-py-1.5 sm:tw-py-1 tw-px-2 sm:tw-px-2 tw-whitespace-nowrap tw-w-full sm:tw-w-auto'
              onClick={(e) => {
                e.stopPropagation();
                handleTriageClick(row);
              }}
              disabled={triageDisabled}
            >
              Triage
            </button>
          </div>
        );
      },
    },
  ];

  const fetchMore = () => {
    console.log('fetchMore');
  };

  const resetStateAndRefetch = () => {
    setOpen(false);
    setOrderId(null);

    if (orderId) {
      setDataTable(dataTable.filter((item) => item.id !== orderId));
      dispatch(removeAppointment(orderId));
    }
  };

  const rejectHandler = () => {
    setOpen(false);
    setOrderId(null);

    if (orderId) {
      setDataTable(dataTable.filter((item) => item.id !== orderId));
      dispatch(removeAppointment(orderId));
    }
  };

  const handleCloseModal = () => {
    setOpen(false);
    setOrderId(null);
  };

  // Triage handlers
  const handleTriageClick = (row: IPendingrxPatientListInfo) => {
    setSelectedTriageOrderId(row.id as string);
    setShowTriageModal(true);
  };

  const handleCloseTriageModal = () => {
    setShowTriageModal(false);
    setTriageNotes('');
    setIsProcessingTriage(false);
    setSelectedTriageOrderId(null);
  };

  const handleConfirmTriage = async () => {
    try {
      if (!selectedTriageOrderId) {
        toast.error('Order ID is required');
        return;
      }

      setIsProcessingTriage(true);

      const payload: RevertOrdersToAdminPayload = {
        orderIds: [selectedTriageOrderId],
        notes: triageNotes,
      };

      const result: OrderRejectionNotesResponse = await revertOrders(payload).unwrap();

      // Access the response data with proper typing
      const apiMessage = result.data?.message || result.message || 'Order triaged successfully';

      // Show the API message in toast and close modal
      if (result.data?.revertedOrders && result.data.revertedOrders > 0) {
        toast.success(apiMessage);
      } else {
        toast(apiMessage);
      }

      // Clear selections and close modal
      setShowTriageModal(false);
      setTriageNotes('');
      setIsProcessingTriage(false);

      // Update dashboard stats - decrement for reverted order
      dispatch(decrementAppointmentStats());
      dispatch(decrementTodayCount());

      // Update real-time store to remove the reverted appointment immediately
      const updatedAppointments = currentAppointments.filter((appointment) => appointment.id !== selectedTriageOrderId);
      dispatch(setAppointments(updatedAppointments));

      // Remove from local data table
      setDataTable(dataTable.filter((item) => item.id !== selectedTriageOrderId));
      dispatch(removeAppointment(selectedTriageOrderId));

      setSelectedTriageOrderId(null);
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data?.message
          : (error as { message?: string })?.message || 'Failed to triage order to admin'
      );
      setIsProcessingTriage(false);
    }
  };

  // Check if triage should be disabled based on rxStatus
  const isTriageDisabled = (row: IPendingrxPatientListInfo) => {
    // Get rxStatus - it might be a string or an object with status property
    const rxStatus =
      typeof row.rxStatus === 'string' ? row.rxStatus : (row.rxStatus as { status?: string })?.status || '';

    if (!rxStatus) {
      return false;
    }

    const normalized = rxStatus.trim().toLowerCase();
    return normalized === 'place' || normalized === 'sent_to_pharmacy' || normalized === 'sent to pharmacy';
  };

  return (
    <>
      <div className='d-lg-none'>
        <InfiniteScroll
          dataLength={dataTable.length}
          next={fetchMore}
          hasMore={false}
          loader={
            <div className='d-flex justify-content-center py-4'>
              <Spinner size='sm' />
            </div>
          }
          height={`calc(100vh - 350px)`}
        >
          <MobileCard
            rowOnClick={handleViewButtonClick}
            loading={false}
            data={dataTable}
            columns={columns}
            emptyState={isFilterNotApplied && dataTable.length === 0 ? <EmptyState /> : undefined}
          />
        </InfiniteScroll>
      </div>
      <div className='d-none d-lg-block'>
        <InfiniteScroll
          dataLength={dataTable.length}
          next={fetchMore}
          hasMore={false}
          loader={
            <div className='d-flex justify-content-center py-4'>
              <Spinner size='sm' />
            </div>
          }
          height={'calc(100vh - 276px)'}
        >
          <div className='font-inter' id='invoice-table-top' />
          <Table
            rowOnClick={handleViewButtonClick}
            data={dataTable}
            columns={columns}
            isFetching={false}
            emptyState={isFilterNotApplied && dataTable.length === 0 ? <EmptyState /> : undefined}
          />
        </InfiniteScroll>
      </div>

      {/* Triage Modal */}
      <Modal
        isOpen={showTriageModal}
        onClose={handleCloseTriageModal}
        title='Assign to Admin'
        size='md'
        isLoading={isProcessingTriage}
        loadingText='Processing...'
        footer={
          <div className='tw-flex tw-gap-3 tw-justify-end tw-w-full'>
            <button
              type='button'
              className='btn btn-outline-secondary btn-sm'
              onClick={handleCloseTriageModal}
              disabled={isProcessingTriage}
            >
              Cancel
            </button>
            <button
              type='button'
              className='btn btn-primary btn-sm'
              onClick={handleConfirmTriage}
              disabled={isProcessingTriage}
            >
              Yes, Assign
            </button>
          </div>
        }
        showFooter={true}
      >
        <div className='form-group'>
          <label htmlFor='triage-notes' className='form-label text-start w-100'>
            Notes
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
      </Modal>

      <PatientSideBar
        // showAcceptRejectRXForm={selectedAppointment?.rxStatus === 'scheduled'}
        showAcceptRejectRXForm={true}
        showAcceptRejectRXFormActionButtons
        show={open}
        onAccept={resetStateAndRefetch}
        onReject={rejectHandler}
        onHide={handleCloseModal}
        orderId={orderId ?? ''}
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
    </>
  );
};

const EmptyState = () => {
  return (
    <div className='w-100 d-flex h-100 justify-content-center align-items-center'>
      <div className='d-flex flex-column align-items-center justify-content-center p-4 text-muted my-5'>
        <p className='h5'>No appointments found</p>
        <small>Nothing to display</small>
      </div>
    </div>
  );
};
