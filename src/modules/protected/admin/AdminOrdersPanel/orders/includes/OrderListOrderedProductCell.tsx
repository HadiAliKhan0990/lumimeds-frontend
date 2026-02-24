'use client';

import ConfirmationModal from '@/components/ConfirmationModal';
import { DecorateWordsHandler } from '@/components/Decorators/DecorateWordsHandler';
import { formatUSDate } from '@/helpers/dateFormatter';
import { renderOrderTag } from '@/lib/helper';
import { RootState } from '@/store';
import { Order } from '@/store/slices/orderSlice';
import { useUpdateOrderTrackingNumberMutation } from '@/store/slices/ordersApiSlice';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiEdit2 } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { VialShipmentModal } from './VialShipmentModal';

export interface OrderListOrderedProductCellProps extends React.ComponentPropsWithoutRef<'div'> {
  order: Order;
  onUpdateTrackingNumber: (trackingNumber: string, courierService: string) => void;
  showTrackingNumber?: boolean;
  onVialShipmentUpdate?: (newShippedVials: number) => void;
}

export const OrderListOrderedProductCell = ({
  order,
  onUpdateTrackingNumber,
  showTrackingNumber = true,
  onVialShipmentUpdate,
}: OrderListOrderedProductCellProps) => {
  const user = useSelector((state: RootState) => state.user);
  const [updateOrderTrackingNumber, { isLoading: isUpdating }] = useUpdateOrderTrackingNumberMutation();

  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierService, setCourierService] = useState('');
  const [showVialShipmentModal, setShowVialShipmentModal] = useState(false);
  const [openedModal, setOpenedModal] = useState<'addTrackingNumber' | 'editTrackingNumber' | null>(null);

  const planCount = order.metadata?.intervalCount || 0;
  const shippedVials = order.shippedVials || 0;
  const canEdit = shippedVials < planCount;
  const showVialShipment = (user.role === 'admin' || user.role === 'provider') && planCount > 0;

  useEffect(() => {
    setTrackingNumber(order.trackingNumber ?? '');
    setCourierService(order.courierService ?? '');
  }, [order.trackingNumber, order.courierService]);

  const handleUpdateTrackingNumber = () => {
    updateOrderTrackingNumber({
      orderId: order.id ?? '',
      trackingNumber,
      courierService,
    })
      .unwrap()
      .then((res) => {
        toast.success(res.message ?? 'Tracking Number Updated Successfully');
        onUpdateTrackingNumber(trackingNumber, courierService);
        setOpenedModal(null);
      })
      .catch((err) => {
        toast.error(err.data.message ?? 'Failed to Update Tracking Number');
      });
  };

  return (
    <>
      {showTrackingNumber && (
        <ConfirmationModal
          onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          show={openedModal === 'addTrackingNumber' || openedModal === 'editTrackingNumber'}
          onHide={() => {
            setOpenedModal(null);
            setTrackingNumber(order?.trackingNumber ?? '');
            setCourierService(order?.courierService ?? '');
          }}
          onConfirm={handleUpdateTrackingNumber}
          title={openedModal === 'addTrackingNumber' ? 'Add Tracking Number' : 'Edit Tracking Number'}
          message={
            <div className='mb-3'>
              <label htmlFor='tracking-number-input' className='form-label text-start d-block'>
                Tracking number
              </label>
              <input
                id='tracking-number-input'
                type='text'
                className='form-control tw-mb-3'
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
              <label htmlFor='courier-service-input' className='form-label text-start d-block'>
                Courier Service
              </label>
              <input
                id='courier-service-input'
                type='text'
                className='form-control'
                value={courierService}
                onChange={(e) => setCourierService(e.target.value)}
                placeholder='e.g., UPS, FedEx, USPS'
              />
            </div>
          }
          confirmLabel={openedModal === 'addTrackingNumber' ? 'Save' : 'Update'}
          cancelLabel='Discard'
          loading={isUpdating}
        />
      )}
      <VialShipmentModal
        latestShipmentReminderDate={order?.latestShipmentReminder?.scheduledDate ?? undefined}
        show={showVialShipmentModal}
        onHide={() => setShowVialShipmentModal(false)}
        orderId={order.id ?? ''}
        currentShippedVials={shippedVials}
        planCount={planCount}
        productName={
          order.metadata?.category && order.metadata?.medicineType
            ? `${order.metadata.category} ${order.metadata.medicineType}`
            : order.requestedProductName || ''
        }
        planDuration={
          order.metadata?.intervalCount && order.metadata?.billingInterval
            ? `${order.metadata.intervalCount} ${order.metadata.billingInterval}${
                order.metadata.intervalCount > 1 ? 's' : ''
              }`
            : undefined
        }
        onSuccess={(newShippedVials) => {
          onVialShipmentUpdate?.(newShippedVials);
        }}
      />
      <div className='d-flex flex-column gap-1'>
        <div className='d-flex flex-column gap-2'>
          <span className='text-truncate'>
            <DecorateWordsHandler
              sentence={order.metadata?.category ? `${order.metadata.category}` : order.requestedProductName ?? ''}
              WrapperTag='span'
              wrapperProps={{ className: 'tw-font-semibold' }}
              words={['tirzepatide', 'semaglutide']}
            />
          </span>
          {order.tag && (
            <span
              className={`${renderOrderTag(
                order.tag
              )} tw-w-fit tw-capitalize tw-rounded tw-px-1 tw-py-0.5  tw-font-medium`}
            >
              {order.tag}
            </span>
          )}
        </div>
        {showTrackingNumber && (
          <div className='tw-flex tw-flex-col tw-gap-1' onClick={(e) => e.stopPropagation()}>
            <div className='tw-flex tw-gap-1 tw-items-center tw-justify-start'>
              {order?.trackingNumber ? (
                <>
                  <span className='tw-text-xs tw-underline tw-text-primary tw-flex-shrink-1 tw-break-words'>
                    {order.trackingNumber}
                  </span>
                  <span
                    className='text-xs tw-underline tw-text-primary tw-flex-shrink-0 tw-whitespace-nowrap'
                    onClick={() => setOpenedModal('editTrackingNumber')}
                  >
                    Edit
                  </span>
                </>
              ) : (
                <button
                  type='button'
                  className='tw-text-xs tw-text-nowrap tw-underline tw-text-primary  !tw-p-0'
                  onClick={() => setOpenedModal('addTrackingNumber')}
                >
                  Add Tracking Number
                </button>
              )}
            </div>
            {order?.courierService && (
              <div className='tw-text-xs tw-text-muted'>
                <span className='tw-font-medium'>Courier: </span>
                <span>{order.courierService}</span>
              </div>
            )}
          </div>
        )}
        {showVialShipment && (
          <div className='d-flex gap-1 justify-content-start' onClick={(e) => e.stopPropagation()}>
            <div className='w-fit custom-badge custom-bage-sm bage-success-light badge-oulined d-flex gap-1 align-items-center'>
              <span>
                {shippedVials} / {planCount}
              </span>
              <span className='text-muted' style={{ fontSize: '10px' }}>
                processed
              </span>
            </div>
            <button
              onClick={() => setShowVialShipmentModal(true)}
              className='btn btn-sm p-0'
              title={canEdit ? 'Edit vial shipment' : 'All vials shipped'}
              style={{ border: 'none', background: 'none' }}
            >
              <FiEdit2 size={12} className='text-success' />
            </button>
          </div>
        )}
        {order?.latestShipmentReminder?.scheduledDate && (
          <div className='tw-text-xs  tw-text-primary '>
            <span className='tw-font-medium'>Next Shipment Date: </span>{' '}
            <span>{formatUSDate(order.latestShipmentReminder.scheduledDate)}</span>
          </div>
        )}
      </div>
    </>
  );
};
