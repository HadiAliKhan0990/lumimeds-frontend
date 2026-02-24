'use client';

import InfiniteScroll from 'react-infinite-scroll-component';
import { useEffect, useState } from 'react';
import { Offcanvas, CircularProgress } from '@/components/elements';
import { useLazyGetPatientOrdersListQuery } from '@/store/slices/ordersApiSlice';
import { MetaPayload } from '@/lib/types';
import { Order } from '@/store/slices/orderSlice';
import { OrderItem } from '@/components/Dashboard/admin/users/Patients/includes/OrdersList/includes/OrderItem';
import { OrderPlaceholder } from '@/components/Dashboard/admin/users/Patients/includes/OrdersList/includes/OrderPlaceholder';

interface Props {
  show?: boolean;
  onHide?: () => void;
  order?: Order | null;
  userId?: string;
  handleOrderClick: () => void;
}

type OrdersListState = {
  data: Order[];
  meta: MetaPayload['meta'];
};

export const PatientOrdersListPopup = ({ show = false, onHide, order, userId, handleOrderClick }: Readonly<Props>) => {
  const [ordersList, setOrdersList] = useState<OrdersListState>({
    data: [],
    meta: {
      page: 1,
      limit: 10,
      totalPages: 1,
    },
  });

  const [triggerGetPatientOrdersList, { isFetching }] = useLazyGetPatientOrdersListQuery();

  const { data, meta } = ordersList;
  const { totalPages = 1, page: currentPage = 1 } = meta || {};

  async function getPatientOrdersList({ meta, append = false }: MetaPayload) {
    if (isFetching) return;

    try {
      const response = await triggerGetPatientOrdersList({
        userId: order?.patient?.userId || userId || '',
        meta: {
          page: meta?.page || 1,
          limit: 10,
        },
        sortField: 'createdAt',
        sortOrder: 'DESC',
      }).unwrap();

      if (append) {
        // Append new orders, avoiding duplicates
        setOrdersList((prev) => {
          const existingIds = new Set(prev.data.map((order) => order.id));
          const uniqueNewOrders = (response.orders || []).filter((order) => !existingIds.has(order.id));
          return {
            data: [...prev.data, ...uniqueNewOrders],
            meta: response.meta || prev.meta,
          };
        });
      } else {
        setOrdersList({
          data: response.orders || [],
          meta: response.meta || meta,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  const fetchMore = () => {
    if (currentPage < totalPages && !isFetching) {
      getPatientOrdersList({
        meta: { page: currentPage + 1, limit: 10 },
        append: true,
      });
    }
  };

  function renderContent() {
    if (isFetching && data.length === 0) {
      return (
        <div className='tw-space-y-5'>
          {Array.from({ length: 4 }).map((_, index) => (
            <OrderPlaceholder key={index + 1} />
          ))}
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className='tw-flex tw-justify-center tw-items-center tw-h-full'>
          <span className='tw-text-muted'>No order history</span>
        </div>
      );
    }

    return (
      <InfiniteScroll
        dataLength={data.length}
        next={fetchMore}
        hasMore={currentPage < totalPages}
        loader={
          <div className='tw-flex tw-justify-center tw-py-6'>
            <CircularProgress className='!tw-w-8 !tw-h-8' />
          </div>
        }
        scrollableTarget='patient-orders-scrollable'
        className='tw-space-y-4'
      >
        {data.map((orderItem) => (
          <OrderItem order={orderItem} key={orderItem.id} onOrderClick={handleOrderClick} />
        ))}
      </InfiniteScroll>
    );
  }

  useEffect(() => {
    if (show && (order || userId)) {
      setOrdersList({
        data: [],
        meta: {
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
      getPatientOrdersList({ meta: { page: 1 } });
    }
  }, [show, order, userId]);

  return (
    <Offcanvas
      isOpen={show}
      onClose={onHide}
      title='Order History'
      position='right'
      size='lg'
      showCloseButton={true}
      closeOnBackdropClick={true}
      closeOnEscape={true}
      bodyClassName='!tw-pt-0 !tw-px-0'
    >
      <div id='patient-orders-scrollable' className='tw-h-full tw-overflow-y-auto tw-px-4'>
        {renderContent()}
      </div>
    </Offcanvas>
  );
};
