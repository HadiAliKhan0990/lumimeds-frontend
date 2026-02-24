'use client';

import { RootState } from '@/store';
import { Fragment, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { SingleOrder } from '@/lib/types';
import { formatUSPhoneWithoutPlusOne } from '@/lib/helper';

type SubscriptionDetails =
  | 'General'
  | 'Order Details'
  | 'Remarks'
  | 'Latest Treatment'
  | 'Billing'
  | 'Medical History'
  | 'Body Metrics'
  | 'Tracking and Shipping'
  | 'Contact Details'
  | 'Address'
  | 'Coupon Affiliate';

interface Item {
  key?: string | undefined | null;
  value?: string | React.ReactNode | undefined | null;
  element?: React.ReactNode | undefined | null;
  direction?: 'row' | 'column';
}

interface SubscriptionDetailGroupProps {
  title: SubscriptionDetails;
  fullWidth?: boolean;
  actionButton?: React.ReactNode;
  data: SingleOrder | undefined;
}

export const SubscriptionDetailGroup = ({ title, fullWidth, actionButton, data }: SubscriptionDetailGroupProps) => {
  const order = useSelector((state: RootState) => state.order);
  const subscription = useSelector((state: RootState) => state.subscription);

  const items = useMemo<Item[] | undefined>(() => {
    switch (title) {
      case 'General':
        return [
          {
            key: 'Date Created',
            value: new Date(Date.parse((order.createdAt ?? new Date()).toString())).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            }),
          },
          {
            key: 'Total Order(s)',
            value: `${subscription.orderCount || 0}`,
          },
          {
            key: '',
            value: '',
          },
          {
            key: 'Total Revenue',
            value: '-',
          },
          {
            key: '',
            value: '',
          },
          {
            key: 'Device Type',
            value: '-',
          },
          {
            key: '',
            value: '',
          },
          {
            key: 'Session Page Views',
            value: '-',
          },
        ];
      case 'Billing':
        return [
          {
            key: 'Name',
            value: `${data?.patient?.firstName} ${data?.patient?.lastName}`,
          },
          {
            key: 'Address Line 1',
            value: data?.patient.address?.billingAddress?.street || '-',
          },
          {
            key: 'Email',
            value: data?.patient?.email,
          },
          {
            key: 'Address Line 2',
            value: data?.patient.address?.billingAddress?.street2 || '-',
          },
          {
            key: 'City',
            value: `${data?.patient?.address?.billingAddress?.city ?? '-'}`,
          },
          {
            key: 'State',
            value: `${data?.patient?.address?.billingAddress?.state ?? '-'}`,
          },
          {
            key: 'Zip',
            value: `${data?.patient?.address?.billingAddress?.zip ?? '-'}`,
          },
          {
            key: 'Phone No.',
            value: formatUSPhoneWithoutPlusOne(data?.patient.phone ?? ''),
          },
        ];
      case 'Order Details':
        return [
          {
            element: (
              <div className='row'>
                <div className='col-lg-6'>
                  <div className='row text-xs gy-3'>
                    <div className='col-6 text-placeholder'>Order Placed</div>
                    <div className='col-6'>
                      {data?.order?.dateOrdered
                        ? new Date(data?.order?.dateOrdered).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true,
                          })
                        : '-'}
                    </div>
                    <div className='col-6 text-placeholder'>Product</div>
                    <div className='col-6'>{data?.order.productName ?? '-'}</div>
                    <div className='col-6 text-placeholder'>Dosage</div>
                    <div className='col-6'>-</div>
                    <div className='col-6 text-placeholder'>Pharmacy</div>
                    <div className='col-6 text-capitalize'>{data?.order.pharmacyName ?? '-'}</div>
                    <div className='col-6 text-placeholder'>Status</div>
                    <div className='col-6'>{data?.order.status ?? '-'}</div>
                    <div className='col-6 text-placeholder'>Tracking</div>
                    <div className='col-6'>{data?.order?.trackingNumber ?? '-'}</div>
                    <div className='col-6 text-placeholder'>Date Received</div>
                    <div className='col-6'>
                      {data?.order?.dateReceived
                        ? new Date(data?.order?.dateReceived).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '-'}
                    </div>
                    <div className='col-6 text-placeholder'>Next Refillment Date</div>
                    <div className='col-6'>
                      {data?.order?.nextRefillDate
                        ? new Date(data?.order?.nextRefillDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '-'}
                    </div>
                  </div>
                </div>
                <div className='col-lg-6'>
                  <div className='row g-0 border-bottom pb-3 my-3'>
                    <div className='col-4'>
                      <p className='text-sm fw-medium'>Cost</p>
                      <span className='text-xs'>{data?.order?.orderTotal ? `$${data?.order?.orderTotal}` : '-'}</span>
                    </div>
                    <div className='col-4'>
                      <p className='text-sm fw-medium'>Qty</p>
                      <span className='text-xs'>{data?.order.quantity ?? '-'}</span>
                    </div>
                    <div className='col-4 pe-0'>
                      <p className='text-sm fw-medium'>Total</p>
                      <span className='text-xs'>
                        {data?.order?.orderTotal
                          ? `$${(Number(data.order.orderTotal) - Number(data.order.couponsAmount || 0)).toFixed(2)}`
                          : '-'}
                      </span>
                    </div>
                  </div>
                  <div className='row g-0 border-bottom pb-3 mb-3'>
                    <div className='col-4'>
                      <p className='text-sm fw-medium text-placeholder'>Items Subtotal</p>
                    </div>
                    <div className='col-8'>
                      <p className='text-sm'>{data?.order.orderTotal ? `$${data?.order?.orderTotal}` : '-'}</p>
                    </div>
                    <div className='col-4'>
                      <p className='text-sm fw-medium text-placeholder'>Coupon(s)</p>
                    </div>
                    <div className='col-8'>
                      <p className={`text-sm ${Number(data?.order.couponsAmount) === 0 ? '' : 'coupon-adjust'}`}>
                        {data?.order.couponsAmount && Number(data.order.couponsAmount) !== 0
                          ? `-$${data.order.couponsAmount}`
                          : '-'}
                      </p>
                    </div>
                    <div className='col-4'>
                      <p className='text-sm fw-medium text-placeholder'>Order Total</p>
                    </div>
                    <div className='col-8'>
                      <p className='text-sm'>
                        {data?.order?.orderTotal
                          ? `$${(Number(data.order.orderTotal) - Number(data.order.couponsAmount || 0)).toFixed(2)}`
                          : '-'}
                      </p>
                    </div>
                  </div>
                  <div className='row g-0'>
                    <div className='col-4'>
                      <p className='text-sm fw-medium text-dark'>Paid</p>
                      <span className='text-xs'>
                        {data?.order?.orderTotal ? `$${Number(data?.order?.paidAmount).toFixed(2)}` : '-'}
                      </span>
                    </div>
                    <div className='col-4'>
                      <p className='text-sm fw-medium text-dark'>Date Paid</p>
                      <span className='text-xs'>
                        {data?.order?.paymentDate
                          ? new Date(data?.order?.paymentDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: 'numeric',
                              hour12: true,
                            })
                          : '-'}
                      </span>
                    </div>
                    <div className='col-4 pe-0'>
                      <p className='text-sm fw-medium text-dark'>via</p>
                      <span className='text-xs'>{data?.order.paymentMethod}</span>
                    </div>
                  </div>
                </div>
              </div>
            ),
          },
        ];
      case 'Remarks':
        // const { orderNote } = patient.remarks;
        return [
          {
            key: 'Order Note',
            value: '-',
          },
        ];
      case 'Tracking and Shipping':
        // const { orderNote } = patient.remarks;
        return [
          {
            key: 'Address Line 1',
            value: data?.patient.address?.shippingAddress?.street || '-',
          },
          {
            key: 'Address Line 2',
            value: data?.patient.address?.shippingAddress?.street2 || '-',
          },
          {
            key: 'City',
            value: `${data?.patient?.address?.shippingAddress?.city ?? '-'}`,
          },
          {
            key: 'State',
            value: `${data?.patient?.address?.shippingAddress?.state ?? '-'}`,
          },
          {
            key: 'Zip',
            value: `${data?.patient?.address?.shippingAddress?.zip ?? '-'}`,
          },
          {
            key: 'Tracking Number',
            value: data?.order.trackingNumber || '-',
          },
        ];
      case 'Coupon Affiliate':
        // const { orderNote } = patient.remarks;
        return [
          {
            key: 'Referral Code',
            value: '-',
          },
          {
            key: 'Commission',
            value: `-`,
          },
          {
            key: 'Affiliate Referrer Coupon',
            value: '-',
          },
        ];
    }
  }, [order, data]);

  return (
    <div className='rounded-12 p-12 border border-c-light'>
      <div className='mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2'>
        <span className='fw-medium'>{title}</span>
        {actionButton && actionButton}
      </div>
      <div className='row gy-3'>
        {items?.map((item, index) =>
          item.element && !item.key ? (
            <Fragment key={index}>{item.element}</Fragment>
          ) : (
            <div className={fullWidth ? 'col-12' : 'col-md-6'} key={index}>
              <div className={fullWidth ? 'row' : ''}>
                <div className={fullWidth ? 'col-md-6' : ''}>
                  <div
                    className={
                      (item.direction === 'column' ? 'flex-column' : 'flex-row align-items-center') + ' row g-3 '
                    }
                  >
                    <div className='text-placeholder col-6 fw-medium text-xs'>{item.key}</div>
                    <div className='col-6'>
                      {item.key && item.element ? (
                        item.element
                      ) : (
                        <div className='fw-medium text-xs'>{item.value && item.value}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
