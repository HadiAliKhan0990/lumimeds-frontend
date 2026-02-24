'use client';

import Link from 'next/link';
import toast from 'react-hot-toast';
import ConfirmationModal from '@/components/ConfirmationModal';
import StarRatings from 'react-star-ratings';
import { ordinalSuffix } from '@/lib';
import { RootState } from '@/store';
import { useMemo, useState } from 'react';
import { MdOutlineHistory } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { VscAccount } from 'react-icons/vsc';
import { useGetSingleOrderQuery } from '@/store/slices/ordersApiSlice';
import { capitalizeFirst } from '@/lib/helper';
import { SubscriptionDetailGroup } from '@/modules/protected/admin/AdminOrdersPanel/subscriptions/includes/SubscriptionDetailGroup';
import { Column, Table } from '@/components/Dashboard/Table';
import { Subscription } from '@/store/slices/subscriptionSlice';
import { Button, Modal } from 'react-bootstrap';
import {
  useCancelSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useLazyGetSubscriptionsQuery,
} from '@/store/slices/subscriptionsApiSlice';
import { setPopup } from '@/store/slices/popupSlice';
import { setSubscriptionsData } from '@/store/slices/subscriptionsSlice';
import { formatUSDate, formatUSDateTime } from '@/helpers/dateFormatter';
import { Error } from '@/lib/types';
import { isAxiosError } from 'axios';
import { Offcanvas } from '@/components/elements';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onShowOrders?: () => void;
}

export function SubscriptionPopup({ isOpen, onClose, onShowOrders }: Readonly<Props>) {
  const dispatch = useDispatch();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [cancelType, setCancelType] = useState<'now' | 'billing_end' | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');

  const subscription = useSelector((state: RootState) => state.subscription);
  const search = useSelector((state: RootState) => state.sort.search);
  const sortOrder = useSelector((state: RootState) => state.sort.sortOrder);
  const sortField = useSelector((state: RootState) => state.sort.sortField);
  const sortStatus = useSelector((state: RootState) => state.sort.sortStatus);
  const subscriptionType = useSelector((state: RootState) => state.sort.subscriptionType);

  const [cancelSubscription, { isLoading: isCancelling }] = useCancelSubscriptionMutation();
  const [updateSubscription, { isLoading: isUpdating }] = useUpdateSubscriptionMutation();
  const [triggerSubscriptions] = useLazyGetSubscriptionsQuery();

  const { data, isFetching } = useGetSingleOrderQuery(subscription.id || '', {
    refetchOnMountOrArgChange: true,
    skip: !subscription.id,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  const orderIndex = useMemo(() => {
    return subscription.orderCount;
  }, [subscription]);

  const qValue = data?.patient.firstName
    ? `${data?.patient.firstName} ${data?.patient.lastName}`
    : data?.patient.email ?? '';

  const rValue = data?.patient.role || 'patient';

  const patientFullName = data?.patient?.firstName ? `${data.patient.firstName} ${data.patient.lastName}` : '';

  const handleCancelTypeSelect = (type: 'now' | 'billing_end') => {
    setCancelType(type);
    setCancellationReason('');
    setShowCancelModal(false);
    setShowConfirmation(true);
  };

  const handleConfirmCancel = async () => {
    if (cancelType === 'now') {
      const { success, message } = await cancelSubscription({
        subscriptionId: subscription.subscriptionId || '',
        ...(cancellationReason && { cancellationReason }),
      }).unwrap();
      if (success) {
        toast.success('Subscription cancelled successfully');
        try {
          const { data: res } = await triggerSubscriptions({
            search,
            page: 1,
            limit: 30,
            ...(sortStatus && { status: sortStatus }),
            sortOrder,
            sortField,
            type: subscriptionType,
          }).unwrap();
          const { page, total, totalPages, subscriptions: newSubscriptions } = res || {};
          dispatch(
            setSubscriptionsData({ data: newSubscriptions, meta: { page: page || 1, total, totalPages, limit: 30 } })
          );
        } catch (error) {
          toast.error(
            isAxiosError(error)
              ? error.response?.data.message
              : (error as Error).data.message || 'Failed to cancel subscription'
          );
        }

        setShowConfirmation(false);
        setCancelType(null);
        setCancellationReason('');
        setShowCancelModal(false);
        dispatch(setPopup(false));
      } else {
        toast.error(message || 'Failed to cancel subscription');
      }
    } else if (cancelType === 'billing_end') {
      const { success, message } = await updateSubscription({
        subscriptionId: subscription.subscriptionId || '',
        cancel_at_end: true,
        ...(cancellationReason && { cancellationReason }),
      }).unwrap();
      if (success) {
        toast.success('Subscription will be cancelled at the end of the billing period');
        try {
          const { data: res } = await triggerSubscriptions({
            search,
            page: 1,
            limit: 30,
            ...(sortStatus && { status: sortStatus }),
            sortOrder,
            sortField,
            type: subscriptionType,
          }).unwrap();
          const { page, total, totalPages, subscriptions: newSubscriptions } = res || {};
          dispatch(
            setSubscriptionsData({ data: newSubscriptions, meta: { page: page || 1, total, totalPages, limit: 30 } })
          );
        } catch (error) {
          toast.error(
            isAxiosError(error)
              ? error.response?.data.message
              : (error as Error).data.message || 'Failed to schedule cancellation'
          );
        }

        setShowConfirmation(false);
        setCancelType(null);
        setCancellationReason('');
        setShowCancelModal(false);
        dispatch(setPopup(false));
      } else {
        toast.error(message || 'Failed to schedule cancellation');
      }
    }
  };

  const getConfirmationMessage = () => {
    const productName = data?.patient?.firstName
      ? `${data.patient.firstName} ${data.patient.lastName}'s subscription`
      : 'this subscription';

    if (cancelType === 'now') {
      return `Are you sure you want to cancel ${productName} immediately?`;
    } else {
      return `Are you sure you want to cancel ${productName} at billing period end?`;
    }
  };

  const cancelButton = useMemo(() => {
    if (subscription.status === 'canceled') {
      return (
        <div className='tw-py-1 tw-px-3 tw-rounded-full tw-text-red-600 tw-opacity-50 tw-border-solid tw-border tw-border-red-600 tw-pointer-events-none tw-select-none'>
          Cancelled
        </div>
      );
    } else if (subscription.status === 'cancel_scheduled') {
      return (
        <div className='tw-py-1 tw-px-3 tw-rounded-full tw-text-green-600 tw-opacity-50 tw-border-solid tw-border tw-border-green-600 tw-pointer-events-none tw-select-none'>
          Cancel Scheduled
        </div>
      );
    }

    return (
      <Button
        variant='outline-danger'
        className='rounded-pill px-3'
        onClick={(e) => {
          e.stopPropagation();
          setShowCancelModal(true);
        }}
      >
        Cancel Subscription
      </Button>
    );
  }, [subscription.canceledById, subscription.status]);

  return (
    <>
      <Offcanvas
        isOpen={isOpen}
        onClose={onClose}
        position='right'
        size='popup'
        showCloseButton={true}
        closeOnBackdropClick={true}
        closeOnEscape={true}
        disabledBodyPadding={false}
        bodyClassName='tw-space-y-4'
      >
        <div>
          <div className='d-flex align-items-center justify-content-between flex-wrap mb-3 gap-3 tw-pr-4'>
            <div className='d-flex align-items-center flex-wrap gap-3'>
              <div className='text-capitalize text-xl fw-medium'>
                {data?.patient?.firstName + ' ' + data?.patient?.lastName}
              </div>
              {orderIndex && orderIndex >= 1 && (
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    padding: '2px 6px',
                    borderRadius: '222px',
                    background: '#E9E9E9',
                  }}
                >
                  {ordinalSuffix(orderIndex)} Order
                </div>
              )}
            </div>

            {cancelButton}
          </div>

          <div className='d-flex align-items-center flex-column flex-sm-row flex-wrap g-2 tw-gap-3'>
            {/* <button className='subscription-pop-up-button btn btn-primary mb-3 mb-sm-0'>
            <FaPen className='mr-2' />
            Edit
          </button> */}
            <Link
              href={{
                pathname: '/admin/users',
                query: { q: qValue, r: rValue, from: 'subscriptions' },
              }}
              className='subscription-pop-up-button btn btn-outline-primary d-flex align-items-center justify-content-center gap-2 mb-3 mb-sm-0'
            >
              <VscAccount size={16} className='tw-flex-shrink-0' />
              Customer Profile
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (data?.patient?.userId && onShowOrders) {
                  onShowOrders();
                }
              }}
              className='subscription-pop-up-button btn btn-outline-primary d-flex align-items-center justify-content-center gap-2'
            >
              <MdOutlineHistory size={16} className='tw-flex-shrink-0' />
              Order History
            </button>
            {/* <button className="btn-outline">
						<IoPrintOutline className="mr-2" />
						Generate Invoice
					</button> */}
            {/* <button className="btn-danger">
						<RiDeleteBin5Line className="mr-2" />
						Delete
					</button> */}
          </div>
        </div>
        <SubscriptionDetailGroup data={data} title='General' />
        <SubscriptionDetailGroup data={data} title='Billing' />
        {(subscription.canceledByRole || subscription.cancellationReason) && (
          <div className='rounded-12 p-12 border border-c-light'>
            <div className='mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2'>
              <span className='fw-medium'>Cancellation Details</span>
            </div>
            <div className='row gy-3'>
              {subscription.canceledByRole && (
                <div className='col-md-6'>
                  <div className='row g-3'>
                    <div className='text-placeholder col-6 fw-medium text-xs'>Cancelled By</div>
                    <div className='col-6'>
                      <div className='fw-medium text-xs'>
                        {subscription.canceledByName
                          ? `${subscription.canceledByName} (${subscription.canceledByRole})`
                          : '-'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {subscription.cancellationReason && (
                <div className='col-md-6'>
                  <div className='row g-3'>
                    <div className='text-placeholder col-6 fw-medium text-xs'>Cancellation Reason</div>
                    <div className='col-6'>
                      <div className='fw-medium text-xs'>{subscription.cancellationReason}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <div className='rounded-12 p-12 border border-c-light'>
          <p className='mb-4 text-base fw-medium'>Subscriptions</p>
          <div className='table-responsive'>
            <Table data={[subscription]} columns={columns} isFetching={isFetching} />
          </div>
        </div>
        <SubscriptionDetailGroup
          data={data}
          fullWidth
          title='Tracking and Shipping'
          // actionButton={
          //   <button className='btn-outline' style={{ display: 'flex', alignItems: 'center', columnGap: '8px' }}>
          //     <GoPin />
          //     <p className='m-0'>Add Tracking Number</p>
          //   </button>
          // }
        />
        <SubscriptionDetailGroup
          data={data}
          title='Order Details'
          // actionButton={
          //   <button className='btn-outline' style={{ display: 'flex', alignItems: 'center', columnGap: '8px' }}>
          //     <BsCoin />
          //     <p className='m-0'>Refund</p>
          //   </button>
          // }
        />
        <SubscriptionDetailGroup
          data={data}
          title='Coupon Affiliate'
          fullWidth
          // actionButton={
          //   <button className='btn-outline' style={{ display: 'flex', alignItems: 'center', columnGap: '8px' }}>
          //     <VscGraph />
          //     <p className='m-0'>View Affiliate Dashboard</p>
          //   </button>
          // }
        />
        <SubscriptionDetailGroup
          data={data}
          title='Remarks'
          fullWidth
          // actionButton={
          //   <button className='btn-outline' style={{ display: 'flex', alignItems: 'center', columnGap: '8px' }}>
          //     <CgNotes />
          //     <p className='m-0'>Add Note</p>
          //   </button>
          // }
        />
      </Offcanvas>
      <Modal
        show={showCancelModal}
        onHide={() => setShowCancelModal(false)}
        centered
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        contentClassName='rounded-12'
      >
        <Modal.Header closeButton className='border-0 pb-0' />
        <Modal.Body className='pt-0'>
          <h5 className='mb-3 fw-bold'>Cancel {subscription?.productName || 'Subscription'}</h5>
          <p className='mb-3'>
            Choose how you want to cancel {patientFullName ? `${patientFullName}'s ` : ''}subscription.
          </p>
          <div className='row g-2'>
            <div className='col-12 col-sm-6'>
              <Button
                variant='danger'
                className='w-100 d-flex align-items-center justify-content-center gap-2'
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelTypeSelect('now');
                }}
              >
                Cancel Now
              </Button>
            </div>
            <div className='col-12 col-sm-6'>
              <Button
                variant='outline-danger'
                className='w-100 d-flex align-items-center justify-content-center gap-2'
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelTypeSelect('billing_end');
                }}
              >
                Cancel at Billing End
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <ConfirmationModal
        show={showConfirmation}
        onHide={() => {
          setShowConfirmation(false);
          setCancelType(null);
          setCancellationReason('');
        }}
        onConfirm={handleConfirmCancel}
        title='Confirm Cancellation'
        message={getConfirmationMessage()}
        confirmLabel='Yes, Cancel'
        cancelLabel='No'
        loading={isCancelling || isUpdating}
        showReasonInput={true}
        onReasonChange={setCancellationReason}
        reasonPlaceholder='Enter cancellation reason (optional)'
        reasonLabel='Cancellation Reason'
      />
    </>
  );
}

const columns: Column<Subscription>[] = [
  {
    header: 'STATUS',
    renderCell: (row) => (
      <span
        className={`status-badge ${
          row?.status?.toLowerCase() === 'cancel_scheduled' ||
          row?.status?.toLowerCase() === 'pause_scheduled' ||
          row?.status?.toLowerCase() === 'update_scheduled' ||
          row?.status?.toLowerCase() === 'renewal_in_progress'
            ? 'active'
            : row?.status?.toLowerCase()
        }`}
      >
        {capitalizeFirst(
          row?.status?.includes('_')
            ? row?.status?.toLowerCase() === 'cancel_scheduled' ||
              row?.status?.toLowerCase() === 'pause_scheduled' ||
              row?.status?.toLowerCase() === 'update_scheduled' ||
              row?.status?.toLowerCase() === 'renewal_in_progress'
              ? 'Active'
              : row?.status.replace('_', ' ')
            : row?.status
        )}
      </span>
    ),
  },
  {
    header: 'CUSTOMER',
    accessor: 'patientName',
    className: 'text-nowrap text-capitalize',
  },
  {
    header: 'PRODUCT',
    accessor: 'productName',
    className: 'text-nowrap text-capitalize',
  },
  {
    header: 'START DATE',
    renderCell: (o) => {
      return formatUSDateTime(o?.startDate);
    },
  },

  {
    header: 'END DATE',
    renderCell: (o) => {
      return formatUSDateTime(o?.endDate);
    },
  },
  {
    header: 'next payment',
    renderCell: (row) =>
      row?.status?.toLowerCase() === 'cancel_scheduled' ||
      row?.status?.toLowerCase() === 'pause_scheduled' ||
      row?.status?.toLowerCase() === 'canceled'
        ? '-'
        : formatUSDate(row?.nextPaymentDate),
  },
  { header: 'ORDERS', accessor: 'orderCount' },
  {
    header: 'CANCELLATION REASON',
    renderCell: (row) => {
      if (!row?.cancellationReason) return '-';
      return (
        <span className='text-truncate d-inline-block' style={{ maxWidth: '200px' }} title={row.cancellationReason}>
          {row.cancellationReason}
        </span>
      );
    },
    className: 'text-nowrap',
  },
  {
    header: 'APP RATING',
    renderCell: (row) => {
      if (row?.canceledByRole?.toLowerCase() === 'admin') return '-';
      if (!row?.rating) return '-';
      return (
        <StarRatings
          rating={row.rating}
          numberOfStars={5}
          starDimension='18px'
          starSpacing='2px'
          starRatedColor='#ffc107'
          starEmptyColor='#6c757d'
        />
      );
    },
  },
];
