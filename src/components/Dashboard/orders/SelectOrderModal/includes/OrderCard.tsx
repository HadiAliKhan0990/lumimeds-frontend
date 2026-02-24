import { formatToUSD } from '@/lib/helper';
import { Order } from '@/store/slices/orderSlice';
import { FiChevronRight } from 'react-icons/fi';
import { format } from 'date-fns';
import { formatStatusString } from '@/lib';

interface OrderCardProps {
  order: Order;
  onSelect: (order: Order) => void;
}

export const OrderCard = ({ order, onSelect }: Readonly<OrderCardProps>) => (
  <button
    type='button'
    onClick={() => onSelect(order)}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(order);
      }
    }}
    className='tw-w-full tw-text-left tw-group tw-bg-white tw-border tw-border-gray-200 hover:tw-border-blue-500 tw-rounded-lg tw-p-3 tw-cursor-pointer tw-transition-all tw-duration-150 hover:tw-bg-blue-50 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500'
  >
    <div className='tw-flex tw-items-center tw-justify-between tw-gap-3'>
      <div className='tw-flex-1 tw-min-w-0'>
        <h3 className='tw-font-semibold tw-text-xl'>{order.requestedProductName || order.productName || 'N/A'}</h3>
        <div className='tw-flex tw-flex-wrap tw-items-center tw-gap-x-3 tw-gap-y-1 tw-text-sm tw-text-gray-600'>
          {(order.createdAt || order.dateOrdered) && (
            <span className='tw-text-gray-600 tw-flex-shrink-0'>
              {format(new Date(order.createdAt || order.dateOrdered || ''), 'MMM dd, yyyy h:mm a')}
            </span>
          )}
          {order.amount && (
            <span className='tw-font-medium tw-text-gray-700 tw-flex-shrink-0'>
              {formatToUSD(Number(order.amount) * 100)}
            </span>
          )}
          {order.status && (
            <span className={`status-badge ${order.status.toLowerCase()} tw-text-xs tw-flex-shrink-0`}>
              {formatStatusString(order.status)}
            </span>
          )}
        </div>
      </div>
      <FiChevronRight className='tw-w-5 tw-h-5 tw-text-gray-400 group-hover:tw-text-blue-600 tw-flex-shrink-0 tw-transition-colors' />
    </div>
  </button>
);
