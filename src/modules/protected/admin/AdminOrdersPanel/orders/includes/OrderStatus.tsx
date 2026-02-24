import { ORDER_STATUSES_ADMIN, ORDER_STATUSES_TABLE } from '@/constants';
import { formatStatusString, orderStatutsBaackgroundColor, orderStatutsTextColor } from '@/lib';
import { OrderStatus as OrderStatusType } from '@/lib/types';
import { useUpdateOrderStatusMutation } from '@/store/slices/ordersApiSlice';
import { Order } from '@/store/slices/orderSlice';
import { useEffect, useState } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import toast from 'react-hot-toast';
import ReactSelect, { GroupBase, OptionsOrGroups } from 'react-select';
import { OnHoldModal } from './OnHoldModal';
import { formatUSDateTime } from '@/helpers/dateFormatter';
import { HiOutlineDocumentText } from 'react-icons/hi';

interface Props {
  order: Order;
  disabled?: boolean;
  onOrderStatusChange?: (status: OrderStatusType) => void;
}

interface OptionValue {
  label: string;
  value: string;
}

export const OrderStatus = ({ order, onOrderStatusChange }: Props) => {
  const [showOnHoldModal, setShowOnHoldModal] = useState(false);

  const formatStatusLabel = (statusValue: string) => {
    const statusConfig = ORDER_STATUSES_ADMIN.find((s) => s.value === statusValue);
    return statusConfig?.label || formatStatusString(statusValue);
  };

  const [status, setStatus] = useState({
    label: formatStatusLabel(order?.status ?? ''),
    value: order?.status,
  });

  const [updateOrderStatusMutation, { isLoading }] = useUpdateOrderStatusMutation();

  const handleOrderStatus = async (option: OptionValue) => {
    if (option.value === 'On_Hold') {
      setShowOnHoldModal(true);
      return;
    }

    try {
      await updateOrderStatusMutation({
        id: order?.id ?? '',
        status: option.value as OrderStatusType,
      }).unwrap();

      setStatus(option);
      onOrderStatusChange?.(option.value as OrderStatusType);
      toast.success('Order status updated successfully');
    } catch (error) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || 'Failed to update order status');
    }
  };

  const handleOnHoldConfirm = async (reminderDate: string, reason?: string) => {
    try {
      await updateOrderStatusMutation({
        id: order?.id ?? '',
        status: 'On_Hold' as OrderStatusType,
        orderHoldReminderDate: reminderDate,
        holdReason: reason,
      }).unwrap();

      setStatus({
        label: 'On Hold',
        value: 'On_Hold',
      });
      onOrderStatusChange?.('On_Hold' as OrderStatusType);
      setShowOnHoldModal(false);
      toast.success('Order placed on hold successfully');
    } catch (error) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || 'Failed to place order on hold');
    }
  };

  useEffect(() => {
    if (order?.status)
      setStatus({
        label: formatStatusLabel(order?.status ?? ''),
        value: order?.status,
      });
  }, [order?.status]);

  const orderStatuses: OptionsOrGroups<unknown, GroupBase<unknown>> = (
    order.status === 'Not_Paid' ? ['Cancelled'] : ORDER_STATUSES_TABLE
  ).map((status) => ({
    label: formatStatusLabel(status),
    value: status,
  }));

  // const isDisabled = disabled ?? (order.status && order.status !== 'Not_Paid') ? true : false;

  // Check if status is "Pending" (which displays as "Paid") or "Pending_Medical_Intake" and latestIntakeForm exists
  const isPendingStatus = order?.status === 'Pending' || order?.status === 'Pending_Medical_Intake';
  const hasIntakeForm = order?.latestIntakeForm && 
                        order.latestIntakeForm.name && 
                        order.latestIntakeForm.submittedAt;
  const showIntakeForm = isPendingStatus && hasIntakeForm;

  return (
    <>
      <div onClick={(event) => event.stopPropagation()}>
        <OverlayTrigger overlay={<Tooltip id='status-tooltip'>{status.label || 'N/A'}</Tooltip>}>
          <div>
            <ReactSelect
              key={order.id}
              id={`${order.id}`}
              options={orderStatuses}
              value={status}
              className='min-w-120px'
              classNamePrefix={'select'}
              onChange={(option) => handleOrderStatus(option as OptionValue)}
              isSearchable={false}
              isLoading={isLoading}
              styles={{
                control: (baseStyles) => ({
                  ...baseStyles,
                  width: '100%',
                  borderRadius: '8px',
                  background: orderStatutsBaackgroundColor(order?.status as OrderStatusType | null),
                  color: orderStatutsTextColor(order?.status as OrderStatusType | null),
                }),
                singleValue: (baseStyles) => ({
                  ...baseStyles,
                  color: orderStatutsTextColor(order?.status as OrderStatusType | null),
                }),
                indicatorSeparator: () => ({
                  display: 'none',
                }),
                dropdownIndicator: (baseStyles) => ({
                  ...baseStyles,
                  color: orderStatutsTextColor(order?.status as OrderStatusType | null),
                  '&:hover': {
                    color: orderStatutsTextColor(order?.status as OrderStatusType | null),
                  },
                }),
                menu: (baseStyles) => ({
                  ...baseStyles,
                  zIndex: 1000,
                  minWidth: 130,
                  textAlign: 'left',
                }),
              }}
            />
          </div>
        </OverlayTrigger>

        {/* Show intake form info below status when status is Pending and latestIntakeForm exists */}
        {showIntakeForm && order.latestIntakeForm && (
          <div className='tw-mt-2 tw-text-xs'>
            <div className='tw-flex tw-items-center tw-gap-1.5 tw-text-gray-700 tw-font-semibold'>
              <span>{order.latestIntakeForm.name || 'Intake Form'}</span>
              <HiOutlineDocumentText size={14} className='tw-text-green-600 tw-flex-shrink-0' />
            </div>
            <div className='tw-text-gray-500 tw-mt-0.5'>
              {order.latestIntakeForm.isCompleted === true
                ? `Submitted on ${formatUSDateTime(order.latestIntakeForm.submittedAt)}`
                : `Partial on ${formatUSDateTime(order.latestIntakeForm.submittedAt)}`
              }
            </div>
          </div>
        )}
      </div>

      <OnHoldModal
        show={showOnHoldModal}
        onHide={() => setShowOnHoldModal(false)}
        onConfirm={handleOnHoldConfirm}
        loading={isLoading}
      />
    </>
  );
};
