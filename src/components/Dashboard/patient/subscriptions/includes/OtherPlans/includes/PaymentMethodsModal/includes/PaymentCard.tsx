import { motion } from 'framer-motion';
import { IoMdCheckmark } from 'react-icons/io';
import { PaymentMethod } from '@/store/slices/paymentMethodsSlice';
import VisaIcon from '@/components/Icon/VisaIcon';

interface Props {
  paymentMethod: PaymentMethod;
  handlePaymentMethodSelect: (paymentMethod: PaymentMethod) => void;
  isSelected: boolean;
}

export const PaymentCard = ({ paymentMethod, isSelected, handlePaymentMethodSelect }: Readonly<Props>) => {
  return (
    <motion.button
      key={paymentMethod.id}
      type='button'
      className={`tw-w-full tw-p-4 tw-rounded-lg tw-border-2 tw-text-left tw-transition-all tw-duration-300 hover:tw-shadow-custom ${
        isSelected
          ? 'tw-border-primary tw-bg-primary-light tw-shadow-sm'
          : 'tw-border-gray-200 tw-bg-white hover:tw-bg-blue-50 hover:tw-border-gray-300'
      }`}
      onClick={() => handlePaymentMethodSelect(paymentMethod)}
    >
      <div className='tw-flex tw-items-center tw-gap-3'>
        <VisaIcon width={38} height={24} />
        <div className='tw-flex tw-flex-col tw-flex-grow-1 tw-min-w-0 tw-flex-grow'>
          <span className='tw-font-medium tw-text-gray-900 tw-text-sm sm:tw-text-base tw-truncate'>
            {paymentMethod.brand} ending in {paymentMethod.last_four_digits}
          </span>
          <span className='tw-text-gray-500 tw-text-xs sm:tw-text-sm'>
            Expires {`${paymentMethod?.expiry?.split('-').reverse().join('/')}`}
          </span>
        </div>
        <div className='tw-flex tw-items-center tw-justify-center tw-flex-shrink-0'>
          {isSelected ? (
            <motion.div
              className='tw-w-6 tw-h-6 tw-rounded-full tw-bg-blue-500 tw-text-white tw-flex tw-items-center tw-justify-center'
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                damping: 15,
                stiffness: 400,
              }}
            >
              <IoMdCheckmark size={16} />
            </motion.div>
          ) : (
            <div className='tw-w-6 tw-h-6 tw-rounded-full tw-border-2 tw-border-gray-300' />
          )}
        </div>
      </div>
    </motion.button>
  );
};
