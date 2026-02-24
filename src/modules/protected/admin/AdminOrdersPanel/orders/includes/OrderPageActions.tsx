import React from 'react';
import { Form } from 'react-bootstrap';
import {
  useAssignToPreviousOrderMutation,
  useChangeTelepathOrderStatusMutation,
  useUpdateOrderMutation,
} from '@/store/slices/ordersApiSlice';
import toast from 'react-hot-toast';
import { Order } from '@/store/slices/orderSlice';
import { canOrderTriage } from '@/lib/helper';

export interface OrderPageActionsProps extends React.ComponentPropsWithoutRef<'div'> {
  ontriage: () => void;
  isTeleHealthEnabled?: boolean;
  isQueueEligible?: boolean;
  orderId?: string;
  order?: Order | null;
  onTeleHealthChange?: (isTeleHealthEnabled: boolean) => void;
  onProviderQueueChange?: (isProviderQueueEnabled: boolean) => void;
  onSentBackToProviderChange?: () => void;
  className?: string;
  visibility?: {
    teleHealth?: boolean;
    triage?: boolean;
    providerQueue?: boolean;
    sendBackToProvider?: boolean;
  };
  classNames?: {
    teleHealth?: string;
    triage?: string;
    providerQueue?: string;
    sendBackToProvider?: string;
  };
}

export const OrderPageActions = ({
  onSentBackToProviderChange,
  ontriage,
  isTeleHealthEnabled = false,
  orderId,
  order,
  isQueueEligible = false,
  onTeleHealthChange,
  onProviderQueueChange,
  className,
  classNames = {
    teleHealth: '',
    triage: '',
    providerQueue: '',
    sendBackToProvider: '',
  },
  visibility,
  ...props
}: OrderPageActionsProps) => {
  const [updateOrder, { isLoading: isUpdatingOrder }] = useUpdateOrderMutation();

  const [changeTelepathStatus, { isLoading: isChangingTelepathStatus }] = useChangeTelepathOrderStatusMutation();

  const [assignToPreviousOrder, { isLoading: isAssigningToPreviousOrder }] = useAssignToPreviousOrderMutation();

  const handleAssignToPreviousOrder = async () => {
    await assignToPreviousOrder(orderId ?? '').unwrap();

    onSentBackToProviderChange?.();

    toast.success('Order assigned to previous provider successfully');
  };

  const handleUpdateOrder = async (isQueueEligible: boolean) => {
    await updateOrder({ id: orderId ?? '', isQueueEligible }).unwrap();

    onProviderQueueChange?.(isQueueEligible);

    toast.success('Order updated successfully');
  };

  const teleHealthChangeHandler = (isTeleHealthEnabled: boolean) => {
    changeTelepathStatus({
      id: orderId ?? '',
      status: isTeleHealthEnabled,
    })
      .unwrap()
      .then(() => {
        onTeleHealthChange?.(isTeleHealthEnabled);

        toast.success('Tele path status updated successfully');
      });
  };

  // Determine triage visibility based on order's assigned provider
  // If order is provided, check eligibility; otherwise default to false
  const isTriageEligible = order ? canOrderTriage(order) : false;

  // Visibility flags with defaults - callers can hide elements but cannot bypass eligibility
  const teleHealth = visibility?.teleHealth ?? true;
  const providerQueue = visibility?.providerQueue ?? true;
  const sendBackToProvider = visibility?.sendBackToProvider ?? true;
  // Triage is only visible if the order is eligible AND not explicitly hidden
  const triage = isTriageEligible && (visibility?.triage ?? true);

  const {
    teleHealth: teleHealthClassName = '',
    triage: triageClassName = '',
    providerQueue: providerQueueClassName = '',
    sendBackToProvider: sendBackToProviderClassName = '',
  } = classNames;
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`tw-grid tw-grid-cols-12 tw-gap-2 tw-min-w-48 ${className}`}
      {...props}
    >
      {teleHealth ? (
        <div
          className={` tw-col-span-6 tw-flex tw-items-center tw-justify-between tw-gap-2  tw-transition-all   tw-p-1  ${
            isChangingTelepathStatus ? 'tw-animate-pulse' : ''
          } ${teleHealthClassName}`}
        >
          <label htmlFor='telePath-switch' className='tw-text-sm tw-font-medium '>
            Tele Path
          </label>
          <Form.Check
            disabled={isChangingTelepathStatus}
            className='ps-0 status-toggle'
            type='switch'
            id='telePath-switch'
            checked={isTeleHealthEnabled}
            onChange={(e) => teleHealthChangeHandler(e.target.checked)}
          />
        </div>
      ) : null}
      <div className={`tw-w-full tw-flex tw-items-center tw-justify-end ${triageClassName}`}>
        {triage ? (
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              ontriage();
            }}
            className={`btn btn-sm btn-outline-primary  text-sm tw-col-span-6 `}
          >
            Triage
          </button>
        ) : null}
      </div>

      {providerQueue ? (
        <div
          className={` tw-col-span-6 tw-flex tw-items-center tw-justify-between tw-gap-2  tw-transition-all   tw-p-1 ${
            isUpdatingOrder ? 'tw-animate-pulse' : ''
          }  ${providerQueueClassName}`}
        >
          <label htmlFor='providerQueue-switch' className='tw-text-sm tw-font-medium  '>
            Provider Queue
          </label>
          <Form.Check
            disabled={isUpdatingOrder}
            className='ps-0 status-toggle'
            type='switch'
            id='providerQueue-switch'
            checked={isQueueEligible}
            onChange={(e) => handleUpdateOrder(e.target.checked)}
          />
        </div>
      ) : null}

      {sendBackToProvider ? (
        <button
          type='button'
          className={`btn text-sm btn-sm btn-primary tw-col-span-12${
            isAssigningToPreviousOrder ? ' tw-animate-pulse text-nowrap' : ''
          } ${sendBackToProviderClassName}`}
          onClick={(e) => {
            e.stopPropagation();
            handleAssignToPreviousOrder();
          }}
        >
          Send Back to Provider
        </button>
      ) : null}
    </div>
  );
};
