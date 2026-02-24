import { Dropdown, DropdownItem } from '@/components/elements/Dropdown';
import {
  useAssignToPreviousOrderMutation,
  useChangeTelepathOrderStatusMutation,
  useUpdateOrderMutation,
  useLazyGetAdminOrderQuery,
  useToggleVisitTypeMutation,
} from '@/store/slices/ordersApiSlice';
import { Order } from '@/store/slices/orderSlice';
import { Form, Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { TfiMoreAlt } from 'react-icons/tfi';
import { useSendReminder } from '@/hooks/useSendReminder';
import { isAxiosError } from 'axios';
import { Error as ApiError } from '@/lib/types';
import { canOrderTriage } from '@/lib/helper';

interface Props {
  order: Order;
  onTriage: () => void;
  onProviderQueueChange?: (isQueueEligible: boolean) => void;
  onTeleHealthChange?: (isTeleHealthEnabled: boolean) => void;
  onSendToProviderChange?: (data: Order['assignedProvider']) => void;
  onSyncAppointmentChange?: (visitType: 'video' | 'document', orderId: string, updatedOrder: Partial<Order>) => void;
}

export const RowActions = ({
  order,
  onTriage,
  onProviderQueueChange,
  onTeleHealthChange,
  onSendToProviderChange,
  onSyncAppointmentChange,
}: Readonly<Props>) => {
  const [updateOrder, { isLoading: isUpdatingOrder }] = useUpdateOrderMutation();
  const [changeTelepathStatus, { isLoading: isChangingTelepathStatus }] = useChangeTelepathOrderStatusMutation();
  const [assignToPreviousOrder, { isLoading: isAssigningToPreviousOrder }] = useAssignToPreviousOrderMutation();
  const [getAdminOrder] = useLazyGetAdminOrderQuery();
  const [toggleVisitType, { isLoading: isUpdatingVisitType }] = useToggleVisitTypeMutation();
  const { handleSendEmailReminder, handleSendSMSReminder, isSendingEmailReminder, isSendingSMSReminder } =
  useSendReminder(order.id);

  // Check if triage button should be visible (only when order has assigned provider)
  const isTriageVisible = canOrderTriage(order);

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

  const handleSendToProviderToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { data } = await assignToPreviousOrder(order.id ?? '').unwrap();
      onSendToProviderChange?.(data);
      toast.success('Order assigned to previous provider successfully');
      //eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to update send to provider status');
    }
  };

  const handleSyncAppointmentToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const isCurrentlyVideo = order.visitType?.toLowerCase() === 'video';
    const newVisitType = isCurrentlyVideo ? 'document' : 'video';

    try {
      await toggleVisitType({ orderId: order.id ?? '', visitType: newVisitType }).unwrap();

      const result = await getAdminOrder(order.id ?? '').unwrap();

      const updatedOrder = result?.order || {};
      onSyncAppointmentChange?.(newVisitType as 'video' | 'document', order.id ?? '', updatedOrder);

      toast.success(`Order type updated to ${isCurrentlyVideo ? 'Document' : 'Video'} successfully`);
    } catch (error) {
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message
        : (error as ApiError)?.data?.message || 'Failed to update order type';
      toast.error(errorMessage);
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
        onClick={handleSyncAppointmentToggle}
        className={`!tw-py-1.5 tw-flex tw-items-center tw-justify-between tw-gap-4 ${
          isUpdatingVisitType && 'tw-animate-pulse'
        }`}
        disabled={isUpdatingVisitType}
      >
        <span>Sync Appointment</span>
        <Form.Check
          className='ps-0 status-toggle tw-pointer-events-none'
          type='switch'
          checked={order.visitType?.toLowerCase() === 'video'}
          onChange={() => {}}
          disabled={isUpdatingVisitType}
        />
      </DropdownItem>

      <DropdownItem
        as='button'
        onClick={handleSendEmailReminder}
        className='!tw-py-1.5 tw-flex tw-items-center tw-justify-between tw-gap-4'
        disabled={isSendingEmailReminder}
      >
        <span>Send Email Reminder</span>
        {isSendingEmailReminder && <Spinner size='sm' />}
      </DropdownItem>

      <DropdownItem
        as='button'
        onClick={handleSendSMSReminder}
        className='!tw-py-1.5 tw-flex tw-items-center tw-justify-between tw-gap-4'
        disabled={isSendingSMSReminder}
      >
        <span>Send SMS Reminder</span>
        {isSendingSMSReminder && <Spinner size='sm' />}
      </DropdownItem>

      {order?.tag?.toLowerCase() === 'renewal' ? (
        <DropdownItem
          aria-disabled
          as='button'
          onClick={handleSendToProviderToggle}
          className='!tw-py-1.5 tw-flex tw-items-center tw-justify-between tw-gap-4'
          disabled={isChangingTelepathStatus}
        >
          <span>Send back to previous provider</span> {isAssigningToPreviousOrder && <Spinner size='sm' />}
        </DropdownItem>
      ) : null}
    </Dropdown>
  );
};
