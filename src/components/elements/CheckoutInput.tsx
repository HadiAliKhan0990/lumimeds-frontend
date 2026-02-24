
import Select, { Props as SelectProps } from 'react-select';
import { InputHTMLAttributes } from 'react';

interface CheckoutInputProps extends InputHTMLAttributes<HTMLInputElement> {
  openPayId?: string;
}

export default function CheckoutInput({ openPayId, className, ...props }: Readonly<CheckoutInputProps>) {
  return (
    <input className={`form-control dark-input bg-white border-black ${className}`} {...props} data-opid={openPayId} />
  );
}

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  openPayId?: string;
  label?: string;
  required?: boolean;
}

export const CheckoutFormInput = ({ openPayId, className, label, id, ...props }: Readonly<Props>) => {
  const inputId = id || `checkout-input-${Math.random().toString(36).substr(2, 9)}`;

  const { disabled } = props

  return (
    <div className={`form-control checkout-input-wrapper`} aria-disabled={disabled}>
      {label && (
        <label htmlFor={inputId} className="text-sm form-label mb-0 text-sm d-block text-muted">
          {label}

        </label>
      )}
      <input
        disabled={disabled}
        id={inputId}
        className={`checkout-input dark-input bg-white border-black rounded-1 ${className}`}
        {...props}
        data-opid={openPayId}
      />
    </div>
  );
}






interface CheckoutReactSelectProps extends SelectProps {
  width?: string;
  customClassNames?: SelectProps['classNames'];
  label?: string;
  required?: boolean;
}

export const CheckoutReactSelect = ({ customClassNames, className, label, isDisabled, ...props }: CheckoutReactSelectProps) => {
  const inputId = `checkout-input-${Math.random().toString(36).substr(2, 9)}`;

  const defaultClassNames = {
    control: () => `w-100 rounded z-3 checkout-select ${isDisabled ? 'checkout-input-disabled' : ''} `,
    indicatorSeparator: () => 'd-none',
    placeholder: () => 'text-nowrap p-0',
    singleValue: () => 'p-0',
  
  };

  const mergedClassNames = {
    ...defaultClassNames,
    ...customClassNames,
  };

  return (
    <div className='form-control checkout-input-wrapper' aria-disabled={isDisabled}>
      {label && (
        <label htmlFor={inputId} className="text-sm form-label mb-0 text-sm d-block text-muted">
          {label}
        
        </label>
      )}
      <Select {...props}
        isDisabled={isDisabled}
        className={`tw-text-left tw-z-10 ${className}`}
        classNames={{...mergedClassNames}}
      
      styles={{
        control: (base) => ({
          ...base,
          border: '0 !important',
          padding: '0 !important',
          // This line disable the blue border
          boxShadow: '0 !important',
          '&:hover': {
              border: '0 !important'
           }
       
        }),
        }}
      />
    </div>
  )



    ;
};
