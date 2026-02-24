import { useState } from 'react';
import { TelepathLambdaOrder } from '@/store/slices/telepathApiSlice';

// Product image component with loading state
const ProductImage = ({ src, alt }: { src: string; alt: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className='tw-w-16 tw-h-16 tw-bg-gray-200 tw-rounded tw-flex tw-items-center tw-justify-center tw-flex-shrink-0'>
        <span className='tw-text-[10px] tw-text-gray-400'>No image</span>
      </div>
    );
  }

  return (
    <div className='tw-relative tw-flex-shrink-0 tw-w-16 tw-h-16'>
      {isLoading && (
        <div className='tw-absolute tw-inset-0 tw-bg-gray-100 tw-rounded tw-flex tw-items-center tw-justify-center'>
          <div className='spinner-border spinner-border-sm text-primary' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`tw-w-16 tw-h-16 tw-object-contain tw-rounded tw-border tw-border-gray-200 tw-bg-white ${
          isLoading ? 'tw-opacity-0' : 'tw-opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
};

// Order status mapping
const ORDER_STATUS = {
  2: { label: 'Placed', color: 'tw-bg-yellow-100 tw-text-yellow-800' },
  3: { label: 'Rx-Accepted', color: 'tw-bg-green-100 tw-text-green-800' },
  4: { label: 'Pharmacy order placed', color: 'tw-bg-blue-100 tw-text-blue-800' },
  5: { label: 'Shipped', color: 'tw-bg-purple-100 tw-text-purple-800' },
  6: { label: 'Delivered', color: 'tw-bg-emerald-100 tw-text-emerald-800' },
  7: { label: 'Cancelled', color: 'tw-bg-red-100 tw-text-red-800' },
} as const;

type OrderStatusKey = keyof typeof ORDER_STATUS;

const getOrderStatus = (status: number) => {
  return ORDER_STATUS[status as OrderStatusKey] || { label: 'Unknown', color: 'tw-bg-gray-100 tw-text-gray-800' };
};

interface Props {
  isLoading: boolean;
  errorType: 'not_found' | 'error' | null;
  orders: TelepathLambdaOrder[] | undefined;
  onOrderClick?: (orderId: string) => void;
}

export const OrderListing = ({ isLoading, errorType, orders, onOrderClick }: Props) => {
  if (isLoading) {
    return (
      <div className='tw-p-4'>
        <div className='tw-flex tw-justify-center tw-py-8'>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (errorType === 'not_found') {
    return (
      <div className='tw-p-4'>
        <div className='tw-text-center tw-py-8 tw-text-gray-500'>Record not found</div>
      </div>
    );
  }

  if (errorType === 'error') {
    return (
      <div className='tw-p-4'>
        <div className='tw-text-center tw-py-8 tw-text-red-500'>Error loading orders</div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className='tw-p-4'>
        <div className='tw-text-center tw-py-8 tw-text-gray-500'>No orders available</div>
      </div>
    );
  }

  return (
    <div className='tw-p-4'>
      <div className='tw-space-y-4'>
        <h5 className='tw-font-semibold tw-text-lg tw-mb-4'>Orders ({orders.length})</h5>
        {orders.map((order) => {
          const status = getOrderStatus(order.order_status);
          const patientName = order.users ? `${order.users.first_name} ${order.users.last_name}` : null;
          const assignerName = order.assigner ? `${order.assigner.first_name} ${order.assigner.last_name}` : null;
          const orderDate = new Date(order.created_at).toLocaleDateString();

          return (
            <div
              key={order.order_id}
              className='tw-border tw-rounded-lg tw-p-4 tw-bg-white tw-cursor-pointer hover:tw-shadow-md tw-transition-shadow'
              onClick={() => onOrderClick?.(String(order.order_id))}
            >
              {/* Row 1: Order ID | Status */}
              <p className='tw-font-semibold tw-text-base'>
                Order #{order.order_id} <span className='tw-text-gray-400 tw-font-normal'>|</span>{' '}
                <span className='tw-font-normal tw-text-gray-600'>
                  Status: <span className='tw-font-medium'>{status.label}</span>
                </span>
              </p>

              {/* Row 2: Order Received Date | Patient Name | Assigner Name */}
              <div className='tw-flex tw-flex-wrap tw-gap-x-6 tw-gap-y-1 tw-text-sm tw-text-gray-600 tw-mt-2'>
                <span>
                  <span className='tw-text-blue-600 tw-font-medium'>Order Received:</span> {orderDate}
                </span>
                {patientName && (
                  <span>
                    <span className='tw-text-blue-600 tw-font-medium'>Patient:</span> {patientName}
                  </span>
                )}
                {assignerName && (
                  <span>
                    <span className='tw-text-blue-600 tw-font-medium'>Assigner:</span> {assignerName}
                  </span>
                )}
              </div>

              {/* Row 3: Product Items with Total */}
              {order.order_items?.map((item, idx) => (
                <div key={idx} className='tw-bg-gray-50 tw-p-3 tw-rounded tw-mt-3 tw-flex tw-gap-4 tw-items-start'>
                  {item.formulary?.featured_image && (
                    <ProductImage src={item.formulary.featured_image} alt={item.formulary?.name || 'Product'} />
                  )}
                  <div className='tw-flex-1 tw-min-w-0'>
                    <div className='tw-flex tw-justify-between tw-items-start'>
                      <p className='tw-font-medium tw-text-sm'>{item.formulary?.name}</p>
                      <p className='tw-font-semibold tw-text-sm tw-text-green-600 tw-whitespace-nowrap tw-ml-2'>
                        ${order.total_amount}
                      </p>
                    </div>
                    {item.formulary?.short_description && (
                      <p className='tw-text-xs tw-text-gray-500 tw-mt-1 tw-line-clamp-3'>
                        {item.formulary.short_description.substring(0, 150)}...
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {/* Order Note */}
              <div className='tw-mt-3 tw-text-sm'>
                <span className='tw-text-blue-600 tw-font-medium'>Order Note: </span>
                <span className='tw-text-gray-600'>{order.order_details?.order_note || 'N/A'}</span>
              </div>

              {/* Shipping Address */}
              {(() => {
                const shippingAddress = order.order_details?.order_addresses?.find((addr) => addr.type === 1);
                if (shippingAddress) {
                  return (
                    <div className='tw-mt-3 tw-text-sm'>
                      <span className='tw-text-blue-600 tw-font-medium'>Shipping Address: </span>
                      <span className='tw-text-gray-600'>
                        {shippingAddress.first_name} {shippingAddress.last_name}, {shippingAddress.address?.trim()},{' '}
                        {shippingAddress.city}, {shippingAddress.state_name} {shippingAddress.zipcode}
                      </span>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
};
