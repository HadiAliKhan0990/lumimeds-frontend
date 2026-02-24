'use client';

import AsyncImgLoader from '@/components/AsyncImgLoader';
import { Order } from '@/store/slices/orderSlice';
import { setOrderData, setSelectedOrderId } from '@/store/slices/selectedOrderSlice';
import { useDispatch } from 'react-redux';
import { Blur } from 'transitions-kit';
import { AsyncImage } from 'loadable-image';
import { formatUSDate } from '@/helpers/dateFormatter';
import { usePathname } from 'next/navigation';

interface Props {
  order: Order;
  currentOrderId?: string;
  onOrderClick?: () => void;
}

export const OrderItem = ({ order, currentOrderId, onOrderClick }: Props) => {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const isAdminView = pathname?.startsWith('/admin');
  const isCurrentOrder = order.id === currentOrderId;

  function handleOrderClick() {
    dispatch(setSelectedOrderId(order.id ?? ''));
    dispatch(setOrderData(order));
    onOrderClick?.();
  }

  return (
    <div
      className={`tw-flex tw-justify-between tw-gap-3 tw-p-2 tw-rounded-lg cursor-pointer patient-pop-up-order-list ${
        isCurrentOrder ? 'tw-bg-[#E8F0FF]' : 'tw-bg-[#F7F7F7]'
      }`}
      onClick={handleOrderClick}
    >
      <div className='d-flex gap-3'>
        <div
          className={
            'border rounded-2 w-50px flex-shrink-0 h-50px overflow-hidden' + (order.image ? '' : 'bg-secondary-subtle')
          }
        >
          {order?.image ? (
            <AsyncImage
              src={order?.image}
              Transition={Blur}
              loader={<AsyncImgLoader />}
              alt={order?.requestedProductName ?? ''}
              className='w-100 h-100 async-img'
            />
          ) : (
            ''
          )}
        </div>
        <div>
          {order.orderUniqueId && isAdminView && (
            <div className='text-xs fw-medium'>{`Order ID # ${order.orderUniqueId}`}</div>
          )}
          <div className='text-xs fw-medium'>{order.requestedProductName}</div>
          <div className='text-xs fw-medium'>{order.duration ? `${order.duration}-Month Plan` : 'One Time'}</div>
          <div className='text-xs text-muted'>{order.orderNumber ?? 'No order Number'}</div>
        </div>
      </div>
      <span className='text-xs text-nowrap'>{formatUSDate(order.createdAt)}</span>
    </div>
  );
};
