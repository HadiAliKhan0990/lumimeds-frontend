import { Order } from '@/store/slices/orderSlice';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

export interface Props {
  prescriptionInstructions: Order['prescriptionInstructions'];
  assignedProvider: Order['assignedProvider'];
}

export const OrderApprovedDosageCell = ({ prescriptionInstructions = [], assignedProvider }: Props) => {
  const medication = prescriptionInstructions?.[0]?.medication;
  const staffNotes = prescriptionInstructions?.[0]?.notesToStaff;
  const route = prescriptionInstructions?.[0]?.route;
  const dosage = prescriptionInstructions?.[0]?.dosage;

  return prescriptionInstructions?.length > 0 ? (
    <div className={`tw-min-w-52  tw-flex tw-flex-col tw-gap-1`}>
      <div
        title={medication}
        className='tw-w-fit tw-text-sm tw-bg-primary/10 tw-border tw-border-primary/50 tw-rounded-full tw-line-clamp-1 tw-px-2 '
      >
        {medication ? <span className='tw-capitalize'>{medication}</span> : 'No medication found.'}
      </div>
      {route && (
        <OverlayTrigger placement='top' overlay={<Tooltip id='staff-notes-tooltip'>{route}</Tooltip>}>
          <div className='tw-w-fit tw-flex tw-items-center tw-py-0.5 tw-px-2 tw-justify-center tw-leading-4 tw-text-sm tw-bg-light-yellow tw-border tw-border-gray-200 tw-rounded-full'>
            <span className='tw-w-fit tw-line-clamp-2 tw-break-words'>{route}</span>
          </div>
        </OverlayTrigger>
      )}
      <div className='tw-px-2 tw-font-medium tw-rounded-full tw-bg-light-gray/40 tw-border tw-border-gray-300 tw-w-fit'>
        {dosage ? `${dosage}mg weekly` : 'No dosage found.'}
      </div>
      <OverlayTrigger
        placement='top'
        overlay={<Tooltip id='staff-notes-tooltip'>{staffNotes || 'No Staff Notes Found.'}</Tooltip>}
      >
        <div className='tw-w-fit tw-flex tw-items-center tw-py-0.5 tw-px-2 tw-justify-center tw-leading-4 tw-text-sm tw-bg-light-yellow tw-border tw-border-gray-200 tw-rounded-full'>
          <span className='tw-w-fit tw-line-clamp-2 tw-break-words'>{staffNotes || 'No Staff Notes Found.'}</span>
        </div>
      </OverlayTrigger>
      <div className='tw-px-2 tw-italic'>
        {assignedProvider?.name && (
          <div className='tw-flex tw-items-center tw-gap-1'>
            {' '}
            <span className='tw-flex-shrink-0'>By</span>{' '}
            <span title={assignedProvider?.name} className='tw-flex-grow tw-capitalize tw-line-clamp-1'>
              {assignedProvider?.name}
            </span>
          </div>
        )}
      </div>
    </div>
  ) : (
    <div>N/A</div>
  );
};
