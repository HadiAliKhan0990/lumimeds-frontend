'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useLazyGetPatientOrdersListQuery } from '@/store/slices/ordersApiSlice';
import { Pagination } from '@/components/Dashboard/Table/includes/Pagination';
import { MetaPayload } from '@/lib/types';
import { OrderPlaceholder } from '@/components/Dashboard/admin/users/Patients/includes/OrdersList/includes/OrderPlaceholder';
import { OrderItem } from '@/components/Dashboard/admin/users/Patients/includes/OrdersList/includes/OrderItem';
import { Order } from '@/store/slices/orderSlice';

interface OrdersListProps {
  title?: string;
  className?: string;
  currentOrderId?: string;
  onOrderClick?: () => void;
}

type OrdersListState = {
  data: Order[];
  meta: MetaPayload['meta'];
};

export const OrdersList = ({
  title = 'Order History',
  className = '',
  currentOrderId,
  onOrderClick,
}: OrdersListProps) => {
  const [ordersList, setOrdersList] = useState<OrdersListState>({
    data: [],
    meta: {
      page: 1,
      limit: 10,
      totalPages: 1,
    },
  });

  const userId = useSelector((state: RootState) => state.chat.userId);

  const { data, meta } = ordersList;
  const { totalPages = 1 } = meta || {};

  const [triggerGetPatientOrdersList, { isFetching }] = useLazyGetPatientOrdersListQuery();

  async function getPatientOrdersList({ meta }: MetaPayload) {
    if (!userId || isFetching) return;

    try {
      const response = await triggerGetPatientOrdersList({
        userId,
        meta: {
          page: meta?.page || 1,
          limit: 10,
        },
        sortField: 'createdAt',
        sortOrder: 'DESC',
      }).unwrap();

      if (response && response.orders && response.meta) {
        setOrdersList({ data: response.orders, meta: response.meta });
      }
    } catch (error) {
      console.log(error);
    }
  }

  function renderContent() {
    if (isFetching) {
      return Array.from({ length: 4 }).map((_, index) => <OrderPlaceholder key={index} />);
    }

    if (data.length === 0) {
      return <div className='tw-text-center tw-text-muted tw-py-6'>No order history</div>;
    }

    return data.map((order) => (
      <OrderItem onOrderClick={onOrderClick} order={order} currentOrderId={currentOrderId} key={order.id} />
    ));
  }

  useEffect(() => {
    if (userId) {
      getPatientOrdersList({ meta: { page: 1 } });
    }
  }, [userId]);

  return (
    <div className={`rounded-12 p-12 border border-c-light h-100 ${className}`}>
      <div className='tw-flex tw-items-center tw-justify-between tw-gap-2 tw-flex-wrap tw-mb-4'>
        <span className='tw-font-medium tw-flex-grow'>{title}</span>
        {!isFetching && data.length > 0 && totalPages === 1 && (
          <span className='tw-text-xs'>{`${meta?.page || 1} / ${meta?.totalPages || 1}`}</span>
        )}
        {totalPages > 1 && <Pagination meta={meta} handleUpdatePagination={getPatientOrdersList} />}
      </div>
      <div className='tw-space-y-2 tw-max-h-72 tw-overflow-y-auto'>{renderContent()}</div>
    </div>
  );
};
