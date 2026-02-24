'use client';

import { Modal } from '@/components/elements';
import InfiniteScroll from 'react-infinite-scroll-component';
import Spinner from '@/components/Spinner';
import { Order } from '@/store/slices/orderSlice';
import { useLazyGetPatientOrdersQuery, useLazyGetPatientOrdersListQuery } from '@/store/slices/ordersApiSlice';
import { useEffect, useState, useCallback } from 'react';
import { User } from '@/store/slices/userSlice';
import { OrderCard } from '@/components/Dashboard/orders/SelectOrderModal/includes/OrderCard';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder: (order: Order) => void;
  userId?: string; // Optional: For admin to specify which patient's orders to fetch
  selectedPatient?: User | null; // Optional: For admin to display patient info
  closeOnSelect?: boolean; // Optional: Whether to close modal after selection (default: true)
  isRefillReq?: boolean; // Optional: Whether this is for a refill request
}

export const SelectOrderModal = ({
  isOpen,
  onClose,
  onSelectOrder,
  userId,
  selectedPatient,
  closeOnSelect = true,
  isRefillReq,
}: Readonly<Props>) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Use different API based on whether userId is provided (admin) or not (patient)
  const [getPatientOrders, { isFetching: isFetchingPatient }] = useLazyGetPatientOrdersQuery();
  const [getPatientOrdersList, { isFetching: isFetchingAdmin }] = useLazyGetPatientOrdersListQuery();

  const isFetching = userId ? isFetchingAdmin : isFetchingPatient;

  const fetchOrders = useCallback(
    async (pageNumber: number, reset: boolean = false) => {
      try {
        // Use admin API if userId is provided, otherwise use patient API
        const { data } = userId
          ? await getPatientOrdersList({
              userId,
              meta: { page: pageNumber, limit: 30 },
              type: 'subscription',
              ...(isRefillReq !== undefined && { isRefillReq }),
            })
          : await getPatientOrders({
              meta: { page: pageNumber, limit: 30 },
              type: 'subscription',
              ...(isRefillReq !== undefined && { isRefillReq }),
            });

        const { orders: newOrders = [], meta } = data || {};

        if (reset) {
          setOrders(newOrders);
        } else {
          setOrders((prev) => [...prev, ...newOrders]);
        }

        setHasMore(pageNumber < (meta?.totalPages || 1));
      } catch (error) {
        console.error('Error fetching orders:', error);
        setHasMore(false);
      }
    },
    [getPatientOrders, getPatientOrdersList, userId, isRefillReq]
  );

  useEffect(() => {
    if (isOpen) {
      setOrders([]);
      setPage(1);
      setHasMore(true);
      fetchOrders(1, true);
    }
  }, [isOpen, fetchOrders]);

  const fetchMoreData = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchOrders(nextPage);
  };

  const handleSelectOrder = (order: Order) => {
    onSelectOrder(order);
    if (closeOnSelect) {
      handleClose();
    }
  };

  const handleClose = () => {
    setOrders([]);
    setPage(1);
    setHasMore(true);
    onClose();
  };

  const footer = (
    <button
      type='button'
      onClick={handleClose}
      className='tw-w-full tw-px-6 tw-py-3 tw-text-gray-700 tw-border-solid tw-bg-white tw-border tw-border-gray-300 tw-rounded-lg hover:tw-bg-gray-50 tw-transition-colors'
    >
      Cancel
    </button>
  );

  // Generate title based on context (admin with patient info, or patient)
  const modalTitle = selectedPatient
    ? `Select Order for ${selectedPatient.firstName} ${selectedPatient.lastName}`
    : 'Select Order for Refill';

  const loadingText = userId ? 'Loading orders...' : 'Loading your orders...';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={modalTitle}
      size='lg'
      headerClassName={selectedPatient ? 'tw-capitalize' : ''}
      footer={footer}
      isLoading={isFetching && orders.length === 0}
      loadingText={loadingText}
      bodyClassName='!tw-p-0'
      closeOnBackdropClick={false}
    >
      {orders.length === 0 && !isFetching ? (
        <div className='tw-p-4'>
          <EmptyState isAdmin={!!userId} />
        </div>
      ) : (
        <div
          id='scrollableOrderList'
          className='tw-max-h-[500px] tw-overflow-auto tw-px-3 tw-py-2 sm:tw-px-4 sm:tw-py-3'
        >
          <InfiniteScroll
            dataLength={orders.length}
            next={fetchMoreData}
            hasMore={hasMore}
            loader={
              <div className='tw-flex tw-justify-center tw-py-3'>
                <Spinner />
              </div>
            }
            scrollableTarget='scrollableOrderList'
          >
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} onSelect={handleSelectOrder} />
            ))}
          </InfiniteScroll>
        </div>
      )}
    </Modal>
  );
};

const EmptyState = ({ isAdmin }: { isAdmin?: boolean }) => (
  <div className='tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-16 tw-px-4'>
    <div className='tw-text-6xl tw-mb-3'>📦</div>
    <h3 className='tw-text-lg tw-font-semibold tw-text-gray-900 tw-mb-2'>No Refillable Orders</h3>
    <p className='tw-text-sm tw-text-gray-500 tw-text-center tw-max-w-sm'>
      {isAdmin
        ? "This patient doesn't have any orders available for refill."
        : "You don't have any orders available for refill."}
    </p>
  </div>
);
