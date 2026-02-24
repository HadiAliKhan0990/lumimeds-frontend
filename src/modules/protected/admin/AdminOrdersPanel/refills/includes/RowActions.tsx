import { Dropdown, DropdownItem } from '@/components/elements/Dropdown';
import { RefillSurveyRequest } from '@/store/slices/refillsApiSlice';
import { TfiMoreAlt } from 'react-icons/tfi';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { setOrder } from '@/store/slices/orderSlice';
import { Spinner } from 'react-bootstrap';
import { useSendReminder } from '@/hooks/useSendReminder';

interface Props {
  refill: RefillSurveyRequest;
  setModalType: (modalType: 'details' | 'manage' | 'order' | null) => void;
  setSelectedRefill: (refill: RefillSurveyRequest) => void;
}

export const RowActions = ({ refill, setModalType, setSelectedRefill }: Readonly<Props>) => {
  const dispatch = useDispatch<AppDispatch>();
  const { handleSendEmailReminder, handleSendSMSReminder, isSendingEmailReminder, isSendingSMSReminder } =
    useSendReminder(refill.order?.id);

  const handleActionClick = (action: 'details' | 'manage' | 'order') => {
    setSelectedRefill(refill);

    // For 'order' action, set the order ID in Redux so OrderPopup can fetch it
    if (action === 'order' && refill.order?.id) {
      dispatch(setOrder({ id: refill.order.id }));
    }

    setModalType(action);
  };

  const status = refill.status?.toLowerCase();
  const mainOrderUniqueId = refill.order?.orderUniqueId;
  const mainOrderLabel = mainOrderUniqueId ? `Main Order (#${mainOrderUniqueId})` : 'Main Order';

  // Open or Rejected status: Dropdown with Manage Request + Main Order
  if (status === 'open' || status === 'rejected') {
    return (
      <Dropdown trigger={<TfiMoreAlt size={20} />} align='left'>
        <DropdownItem as='button' onClick={() => handleActionClick('manage')} className='!tw-py-1.5'>
          Manage Request
        </DropdownItem>
        <DropdownItem as='button' onClick={() => handleActionClick('order')} className='!tw-py-1.5'>
          {mainOrderLabel}
        </DropdownItem>
        <DropdownItem
          as='button'
          onClick={handleSendEmailReminder}
          className='!tw-py-1.5 tw-flex tw-items-center tw-justify-between tw-gap-4'
          disabled={isSendingEmailReminder || !refill.order?.id}
        >
          <span>Send Email Reminder</span>
          {isSendingEmailReminder && <Spinner size='sm' />}
        </DropdownItem>
        <DropdownItem
          as='button'
          onClick={handleSendSMSReminder}
          className='!tw-py-1.5 tw-flex tw-items-center tw-justify-between tw-gap-4'
          disabled={isSendingSMSReminder || !refill.order?.id}
        >
          <span>Send SMS Reminder</span>
          {isSendingSMSReminder && <Spinner size='sm' />}
        </DropdownItem>
      </Dropdown>
    );
  }

  // On Hold status: Dropdown with Main Order
  if (status === 'on_hold') {
    return (
      <Dropdown trigger={<TfiMoreAlt size={20} />} align='left'>
        <DropdownItem as='button' onClick={() => handleActionClick('order')} className='!tw-py-1.5'>
          {mainOrderLabel}
        </DropdownItem>
        <DropdownItem
          as='button'
          onClick={handleSendEmailReminder}
          className='!tw-py-1.5 tw-flex tw-items-center tw-justify-between tw-gap-4'
          disabled={isSendingEmailReminder || !refill.order?.id}
        >
          <span>Send Email Reminder</span>
          {isSendingEmailReminder && <Spinner size='sm' />}
        </DropdownItem>
        <DropdownItem
          as='button'
          onClick={handleSendSMSReminder}
          className='!tw-py-1.5 tw-flex tw-items-center tw-justify-between tw-gap-4'
          disabled={isSendingSMSReminder || !refill.order?.id}
        >
          <span>Send SMS Reminder</span>
          {isSendingSMSReminder && <Spinner size='sm' />}
        </DropdownItem>
      </Dropdown>
    );
  }

  // Approved status: Dropdown with Main Order
  if (status === 'approved') {
    return (
      <Dropdown trigger={<TfiMoreAlt size={20} />} align='left'>
        <DropdownItem as='button' onClick={() => handleActionClick('order')} className='!tw-py-1.5'>
          {mainOrderLabel}
        </DropdownItem>
        <DropdownItem
          as='button'
          onClick={handleSendEmailReminder}
          className='!tw-py-1.5 tw-flex tw-items-center tw-justify-between tw-gap-4'
          disabled={isSendingEmailReminder || !refill.order?.id}
        >
          <span>Send Email Reminder</span>
          {isSendingEmailReminder && <Spinner size='sm' />}
        </DropdownItem>
        <DropdownItem
          as='button'
          onClick={handleSendSMSReminder}
          className='!tw-py-1.5 tw-flex tw-items-center tw-justify-between tw-gap-4'
          disabled={isSendingSMSReminder || !refill.order?.id}
        >
          <span>Send SMS Reminder</span>
          {isSendingSMSReminder && <Spinner size='sm' />}
        </DropdownItem>
      </Dropdown>
    );
  }

  // All other statuses: Dropdown with View Refill Order + Main Order
  return (
    <Dropdown trigger={<TfiMoreAlt size={20} />} align='left'>
      <DropdownItem as='button' onClick={() => handleActionClick('details')} className='!tw-py-1.5'>
        View Refill Order
      </DropdownItem>
      <DropdownItem as='button' onClick={() => handleActionClick('order')} className='!tw-py-1.5'>
        {mainOrderLabel}
      </DropdownItem>
      <DropdownItem
        as='button'
        onClick={handleSendEmailReminder}
        className='!tw-py-1.5 tw-flex tw-items-center tw-justify-between tw-gap-4'
        disabled={isSendingEmailReminder || !refill.order?.id}
      >
        <span>Send Email Reminder</span>
        {isSendingEmailReminder && <Spinner size='sm' />}
      </DropdownItem>
      <DropdownItem
        as='button'
        onClick={handleSendSMSReminder}
        className='!tw-py-1.5 tw-flex tw-items-center tw-justify-between tw-gap-4'
        disabled={isSendingSMSReminder || !refill.order?.id}
      >
        <span>Send SMS Reminder</span>
        {isSendingSMSReminder && <Spinner size='sm' />}
      </DropdownItem>
    </Dropdown>
  );
};
