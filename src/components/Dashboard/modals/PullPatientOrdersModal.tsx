'use client';

import { CheckboxInput } from '@/components/Checkbox/Checkbox';
import { Modal } from '@/components/elements';
import Spinner from '@/components/Spinner';
import { formatStatusString, orderStatutsBaackgroundColor, orderStatutsTextColor } from '@/lib';
import { Error, OrderStatus as OrderStatusType } from '@/lib/types';
import {
  PatientOrder,
  useLazyGetPullableOrdersByPatientIdQuery,
  useToggleVisitTypeMutation,
} from '@/store/slices/ordersApiSlice';
import { isAxiosError } from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { toast } from 'react-hot-toast';

interface PullPatientOrdersModalProps {
  show: boolean;
  onHide: () => void;
  patientId: string | null;
  patientName: string | null;
  visitType: 'video' | 'document';
  onPullSelectedOrders: (orderIds: string[], ordersWithOtherProviders: string[]) => void;
  isPulling?: boolean;
  currentProviderId?: string | null;
}

export const PullPatientOrdersModal: React.FC<PullPatientOrdersModalProps> = ({
  show,
  onHide,
  patientId,
  patientName,
  onPullSelectedOrders,
  isPulling = false,
  currentProviderId,
}) => {
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [orders, setOrders] = useState<PatientOrder[]>([]);

  const [getOrders, { isFetching }] = useLazyGetPullableOrdersByPatientIdQuery();

  const fetchOrders = useCallback(async () => {
    if (!patientId) return;

    try {
      const result = await getOrders(patientId).unwrap();
      const filteredOrders = result.orders.filter(
        (order) => !order.providerId || order.providerId !== currentProviderId
      );
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error fetching patient orders:', error);
      toast.error('Failed to fetch patient orders');
      onHide();
    }
  }, [patientId, getOrders, onHide, currentProviderId]);

  useEffect(() => {
    if (show && patientId) {
      setSelectedOrderIds(new Set());
      fetchOrders();
    }
  }, [show, patientId, fetchOrders]);

  const handleCheckboxChange = (orderId: string) => {
    setSelectedOrderIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedOrderIds.size === orders.length) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(orders.map((order) => order.id)));
    }
  };

  const handlePullOrders = () => {
    if (selectedOrderIds.size === 0) {
      toast.error('Please select at least one order');
      return;
    }

    const ordersWithOtherProviders = orders
      .filter((order) => selectedOrderIds.has(order.id) && order.providerId && order.providerId !== currentProviderId)
      .map((order) => order.id);

    onPullSelectedOrders(Array.from(selectedOrderIds), ordersWithOtherProviders);
  };

  const handleClose = () => {
    setSelectedOrderIds(new Set());
    setOrders([]);
    onHide();
  };

  const footer = (
    <div className='tw-flex tw-flex-col sm:tw-flex-row tw-gap-2 sm:tw-gap-3 tw-w-full justify-content-end'>
      <button
        type='button'
        onClick={handleClose}
        className='btn btn-outline-primary tw-w-full sm:tw-w-auto tw-text-sm sm:tw-text-base'
        disabled={isPulling}
      >
        Cancel
      </button>
      <button
        type='button'
        onClick={handlePullOrders}
        className='btn btn-primary tw-w-full sm:tw-w-auto tw-text-sm sm:tw-text-base'
        disabled={isPulling || selectedOrderIds.size === 0}
      >
        {isPulling ? 'Pulling...' : `Pull`}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={show}
      onClose={handleClose}
      title={`Pull Orders for ${patientName || 'Patient'}`}
      size='lg'
      footer={footer}
      bodyClassName='!tw-p-0'
      closeOnBackdropClick={false}
      headerClassName='!tw-text-center tw-relative'
    >
      <div className='tw-relative tw-min-h-[300px] sm:tw-min-h-[400px] md:tw-min-h-[450px]'>
        {isFetching && orders.length === 0 ? (
          <div className='tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-full tw-py-20'>
            <Spinner />
            <p className='tw-mt-3 tw-text-sm tw-text-gray-600'>Loading orders...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className='tw-px-3 sm:tw-px-4 md:tw-px-6 tw-py-3 sm:tw-py-4'>
            <div className='tw-flex tw-items-center tw-pb-2 sm:tw-pb-3 tw-mb-2 sm:tw-mb-3 tw-border-b tw-border-gray-200'>
              <label className='tw-flex tw-items-center tw-cursor-pointer'>
                <CheckboxInput
                  checked={selectedOrderIds.size === orders.length && orders.length > 0}
                  onChange={handleSelectAll}
                  disabled={isPulling}
                />
                <span className='tw-ml-2 tw-text-sm sm:tw-text-base tw-font-medium tw-text-gray-900'>
                  Select All ({orders.length})
                </span>
              </label>
            </div>

            <div className='tw-space-y-2 sm:tw-space-y-3 tw-max-h-[250px] sm:tw-max-h-80 md:tw-max-h-96 tw-overflow-y-auto'>
              {orders.map((order) => {
                const isAssignedToOther = order.providerId && order.providerId !== currentProviderId;
                return (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isSelected={selectedOrderIds.has(order.id)}
                    onCheckboxChange={() => handleCheckboxChange(order.id)}
                    isAssignedToOther={!!isAssignedToOther}
                    isPulling={isPulling}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <div className='tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-full tw-py-20 tw-px-4'>
            <div className='tw-rounded-full tw-bg-gray-100 tw-p-4 tw-mb-4'>
              <svg className='tw-w-12 tw-h-12 tw-text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
            </div>
            <h3 className='tw-text-base sm:tw-text-lg tw-font-medium tw-text-gray-900 tw-mb-2 tw-text-center'>
              No Orders Available
            </h3>
            <p className='tw-text-sm tw-text-gray-600 tw-text-center tw-max-w-sm'>
              There are no orders available to pull for this patient. All orders may already be assigned to you or
              completed.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

const OrderCard = ({
  order,
  isSelected,
  onCheckboxChange,
  isAssignedToOther,
  isPulling,
}: {
  order: PatientOrder;
  isSelected: boolean;
  onCheckboxChange: () => void;
  isAssignedToOther: boolean;
  isPulling: boolean;
}) => {
  const isAppointment = (order?.visitType?.toLowerCase() ?? '') === 'video';

  const [isSync, setIsSync] = useState<boolean>(isAppointment);

  const [toggleVisitType, { isLoading: isUpdatingVisitType }] = useToggleVisitTypeMutation();

  const handleToggleOrderType = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const isSync = e.target.checked;

    await toggleVisitType({ orderId: order.id, visitType: isSync ? 'video' : 'document' })
      .unwrap()
      .then(() => {
        toast.success('Order type updated successfully');

        setIsSync((prev) => !prev);
      })
      .catch((error) => {
        const errorMessage = isAxiosError(error)
          ? error.response?.data?.message
          : (error as Error)?.data?.message || 'Failed to update order type';
        toast.error(errorMessage);
      });
  };

  return (
    <div
      className={`tw-w-full tw-flex tw-flex-col tw-gap-2 tw-p-3 sm:tw-p-4 tw-border tw-border-solid tw-rounded-lg  tw-transition-colors ${
        isSelected
          ? 'tw-border-blue-500 tw-bg-blue-50'
          : isAssignedToOther
          ? 'tw-border-orange-300 tw-bg-orange-50'
          : 'tw-border-gray-200 tw-bg-white'
      }`}
    >
      <div className='tw-flex tw-flex-col sm:tw-flex-row tw-gap-2 sm:tw-gap-0 sm:tw-items-start'>
        <div className='tw-flex tw-items-start tw-flex-1 tw-min-w-0'>
          <CheckboxInput checked={isSelected} onChange={onCheckboxChange} disabled={isPulling} />
          <div className='tw-ml-2 sm:tw-ml-3 tw-flex-1 tw-min-w-0'>
            <h3 className='tw-text-xs sm:tw-text-sm tw-font-medium tw-text-gray-900 tw-truncate'>
              {order.requestedProductName}
            </h3>
            <div className='tw-mt-1.5 sm:tw-mt-2 tw-flex tw-flex-wrap tw-items-center tw-gap-1.5 sm:tw-gap-2'>
              <span
                className='tw-inline-flex tw-items-center tw-px-2 sm:tw-px-2.5 tw-py-0.5 sm:tw-py-1 tw-rounded-md tw-text-[10px] sm:tw-text-xs tw-font-medium'
                style={{
                  backgroundColor: orderStatutsBaackgroundColor(order.status as OrderStatusType),
                  color: orderStatutsTextColor(order.status as OrderStatusType),
                }}
              >
                {formatStatusString(order.status || 'N/A')}
              </span>
              <span className='tw-inline-flex tw-items-center tw-px-2 sm:tw-px-2.5 tw-py-0.5 sm:tw-py-1 tw-rounded-full tw-text-[10px] sm:tw-text-xs tw-font-medium tw-bg-blue-100 tw-text-blue-700'>
                {isSync ? 'Appointment' : 'Pending Encounter'}
              </span>
              {order.type && (
                <span className='tw-inline-flex tw-items-center tw-px-2 sm:tw-px-2.5 tw-py-0.5 sm:tw-py-1 tw-rounded-full tw-text-[10px] sm:tw-text-xs tw-font-medium tw-bg-purple-100 tw-text-purple-700 tw-capitalize'>
                  {order.type}
                </span>
              )}
              {order.orderUniqueId && <span className='text-xs'>order id: {order.orderUniqueId}</span>}
              {isAssignedToOther && (
                <span className='tw-text-[10px] sm:tw-text-xs tw-text-orange-600 tw-font-medium tw-truncate'>
                  • Assigned to: {order.providerName || 'Another Provider'}
                </span>
              )}
            </div>
          </div>
        </div>
        {isAssignedToOther && (
          <div className='tw-ml-8 sm:tw-ml-2 tw-self-start'>
            <span className='tw-inline-flex tw-items-center tw-px-1.5 sm:tw-px-2 tw-py-0.5 sm:tw-py-1 tw-rounded-full tw-text-[10px] sm:tw-text-xs tw-font-medium tw-bg-orange-100 tw-text-orange-800 tw-whitespace-nowrap'>
              ⚠️ Reassignment
            </span>
          </div>
        )}
      </div>
      <div className='tw-mt-4 tw-items-baseline tw-flex  tw-justify-between tw-gap-2'>
        {order?.address?.shippingAddress?.state && (
          <span className=' tw-text-sm tw-text-muted tw-font-medium tw-bg-light-gray tw-px-2 tw-shadow tw-shadow-light-gray-medium  tw-rounded-full tw-text-center tw-w-fit'>
            {order?.address?.shippingAddress?.state}
          </span>
        )}
        <div
          className={`tw-flex-grow tw-justify-end tw-flex tw-flex-shrink-0 tw-gap-6 tw-items-center ${
            isUpdatingVisitType && 'tw-animate-pulse'
          }`}
        >
          <span className=' tw-flex-shrink-0  tw-font-medium'>Sync appointment</span>

          <Form.Check
            className='ps-0 status-toggle  tw-justify-end'
            type='switch'
            checked={isSync}
            onChange={handleToggleOrderType}
            disabled={isUpdatingVisitType}
          />
        </div>
      </div>
    </div>
  );
};
