import { Order } from '@/store/slices/orderSlice';
import { useStates } from '@/hooks/useStates';

export interface OrderCustomerInfoCellProps extends React.ComponentPropsWithoutRef<'div'> {
  order: Order;
  onClickPatientName?: (order: Order) => void;
}

export const OrderCustomerInfoCell = ({ order, onClickPatientName }: OrderCustomerInfoCellProps) => {
  const { nameToCode, codeToName } = useStates();
  const fullName =
    [order.patient?.firstName, order.patient?.lastName]
      .filter((value) => Boolean(value && value.trim()))
      .join(' ')
      .trim() || 'N/A';
  const email = order.patient?.email || 'N/A';

  // Handle state display: convert name to code, or use code directly if already a code
  const stateValue = order.address?.shippingAddress?.state || '';
  const stateCode = nameToCode[stateValue] ?? (codeToName[stateValue] ? stateValue : null);
  const displayState = stateCode ?? 'N/A';

  const handlePatientClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onClickPatientName?.(order);
  };

  const buttonClassNames = 'text-success tw-mb-1 btn btn-link text-sm text-start p-0 tw-cursor-pointer tw-select-none';

  return (
    <div className='d-flex flex-column tw-min-w-fit md:tw-min-w-60'>
      <button type='button' className={buttonClassNames} onClick={handlePatientClick} title={fullName}>
        <span className='tw-line-clamp-1 tw-capitalize'>{fullName}</span>
      </button>
      <button title={email} type='button' className={buttonClassNames} onClick={handlePatientClick}>
        <span className='tw-line-clamp-1'>{email}</span>
      </button>

      <div className='d-flex gap-1 justify-content-start align-items-center'>
        <span className='custom-badge custom-badge-sm badge-gray-light badge-oulined'>{displayState}</span>
        {order.visitType && (
          <span
            className={`custom-badge custom-badge-sm ${
              order.visitType === 'video' ? 'badge-primary-light' : 'badge-warning-light'
            } badge-oulined`}
          >
            {order.visitType.toLowerCase() === 'video' ? 'Video' : 'Document'}
          </span>
        )}
      </div>
    </div>
  );
};
