import VisaIcon from '@/components/Icon/VisaIcon';
import { PaymentMethod } from '@/store/slices/paymentMethodsSlice';
import { IoMdCheckmark } from 'react-icons/io';
import { FiMinusCircle } from 'react-icons/fi';

interface Props {
  card: PaymentMethod;
  onChange?: (id: string) => void;
  selected: boolean;
  onClickRemove: () => void;
}

export const PaymentMethodCard = ({ card, onChange, selected, onClickRemove }: Props) => {
  return (
    <div className='card card-body border-2 border-c-light payment_card'>
      <div className='d-flex align-items-center gap-2 gap-sm-3'>
        <VisaIcon width={38} height={24} />
        <div className='d-flex flex-column gap-sm-1 flex-grow-1'>
          <span className='fw-medium payment_card_title'>
            Visa {card.last_four_digits ? `ending in ${card.last_four_digits}` : ''}
          </span>
          <span className='text-secondary payment_card_expiry'>
            {card?.expiry ? `Expires ${card?.expiry?.split('-').reverse().join('/')}` : 'No Expiry'}
          </span>
        </div>
        <div className='d-flex flex-column gap-2 align-items-center'>
          {selected ? (
            <div className='d-flex align-items-center gap-2'>
              <span className='badge bg-primary-subtle fw-medium text-primary rounded-pill d-flex align-items-center gap-1 default_pill'>
                <IoMdCheckmark size={16} className='flex-shrink-0' />
                Default
              </span>
            </div>
          ) : (
            <button
              onClick={() => {
                if (!selected && onChange) {
                  onChange(card.id);
                }
              }}
              disabled={selected}
              type='button'
              className={'btn-no-style d-flex text-xs align-items-center gap-2 ' + (selected ? '' : 'text-primary')}
            >
              Set as default →
            </button>
          )}
          <button
            type='button'
            className={'btn-no-style d-flex text-xs align-items-center gap-2 text-danger'}
            onClick={onClickRemove}
          >
            <FiMinusCircle />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};
