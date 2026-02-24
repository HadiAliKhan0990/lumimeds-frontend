import { Dropdown, DropdownItem } from '@/components/elements/Dropdown';
import {
  useAssignToPreviousOrderMutation,
  useChangeTelepathOrderStatusMutation,
  useUpdateOrderMutation,
} from '@/store/slices/ordersApiSlice';
import { Order } from '@/store/slices/orderSlice';
import { Form, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { TfiMoreAlt } from 'react-icons/tfi';
import { useSendRenewalReminder } from '@/hooks/useSendReminder';
import { canOrderTriage } from '@/lib/helper';

interface Props {
  order: Order;
  onTriage: () => void;
  onProviderQueueChange?: (isQueueEligible: boolean) => void;
  onTeleHealthChange?: (isTeleHealthEnabled: boolean) => void;
  onSendToProviderChange?: (provider: Order['assignedProvider']) => void;
}

export const RowActions = ({
  order,
  onTriage,
  onProviderQueueChange,
  onTeleHealthChange,
  onSendToProviderChange,
}: Readonly<Props>) => {
  const [updateOrder, { isLoading: isUpdatingOrder }] = useUpdateOrderMutation();
  const [changeTelepathStatus, { isLoading: isChangingTelepathStatus }] = useChangeTelepathOrderStatusMutation();
  const [assignToPreviousOrder, { isLoading: isAssigningToPreviousOrder }] = useAssignToPreviousOrderMutation();
  const { handleSendEmailReminder, handleSendSMSReminder, isSendingEmailReminder, isSendingSMSReminder } =
    useSendRenewalReminder(order.subscriptionId);

  // Check if triage button should be visible (only when order has assigned provider)
  const isTriageVisible = canOrderTriage(order);

  const handleAssignToPreviousOrder = async () => {
    try {
      const { data } = await assignToPreviousOrder(order.id ?? '').unwrap();
      onSendToProviderChange?.(data);
      toast.success('Order assigned to previous provider successfully');
      //eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to assign order to previous provider');
    }
  };

  const handleProviderQueueToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = !order.isQueueEligible;
    try {
      await updateOrder({ id: order.id ?? '', isQueueEligible: newValue }).unwrap();
      onProviderQueueChange?.(newValue);
      toast.success('Provider queue updated successfully');
      //eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to update provider queue');
    }
  };

  const handleTeleHealthToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = !order.isTelepathOrder;
    try {
      await changeTelepathStatus({ id: order.id ?? '', status: newValue }).unwrap();
      onTeleHealthChange?.(newValue);
      toast.success('Tele path status updated successfully');
      //eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to update tele path status');
    }
  };


  return (
    <Dropdown trigger={<TfiMoreAlt size={20} />} align='left'>
      {isTriageVisible && (
        <DropdownItem as='button' onClick={() => onTriage()} className='!tw-py-1.5'>
          Triage
        </DropdownItem>
      )}

      <DropdownItem
        as='button'
        onClick={handleProviderQueueToggle}
        className='!tw-py-1.5 tw-flex tw-items-center tw-justify-between tw-gap-4'
        disabled={isUpdatingOrder}
      >
        <span>Provider Queue</span>
        <Form.Check
          className='ps-0 status-toggle tw-pointer-events-none'
          type='switch'
          checked={order.isQueueEligible ?? false}
          onChange={() => {}}
          disabled={isUpdatingOrder}
        />
      </DropdownItem>

      <DropdownItem
        as='button'
        onClick={handleTeleHealthToggle}
        className='!tw-py-1.5 tw-flex tw-items-center tw-justify-between tw-gap-4'
        disabled={isChangingTelepathStatus}
      >
        <span>Tele Path</span>
        <Form.Check
          className='ps-0 status-toggle tw-pointer-events-none'
          type='switch'
          checked={order.isTelepathOrder ?? false}
          onChange={() => {}}
          disabled={isChangingTelepathStatus}
        />
      </DropdownItem>

      <DropdownItem
        as='button'
        onClick={handleAssignToPreviousOrder}
        className='!tw-py-1.5'
        disabled={isAssigningToPreviousOrder}
      >
        Send back to previous provider {isAssigningToPreviousOrder && <Spinner size='sm' />}
      </DropdownItem>

      <DropdownItem
        as='button'
        onClick={handleSendEmailReminder}
        className='!tw-py-1.5 tw-flex tw-items-center tw-justify-between tw-gap-4'
        disabled={isSendingEmailReminder || !order.subscriptionId}
      >
        <span>Send Email Reminder</span>
        {isSendingEmailReminder && <Spinner size='sm' />}
      </DropdownItem>

      <DropdownItem
        as='button'
        onClick={handleSendSMSReminder}
        className='!tw-py-1.5 tw-flex tw-items-center tw-justify-between tw-gap-4'
        disabled={isSendingSMSReminder || !order.subscriptionId}
      >
        <span>Send SMS Reminder</span>
        {isSendingSMSReminder && <Spinner size='sm' />}
      </DropdownItem>
    </Dropdown>
  );
};
