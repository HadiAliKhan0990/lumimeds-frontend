import React from 'react'


export interface IPaymentMethodDivider extends React.ComponentPropsWithoutRef<'div'> {
  label: string;
}
export const PaymentMethodDivider = ({ label, ...props }: IPaymentMethodDivider) => {
  const { className, ...rest } = props;
  return (
    <div {...rest} className={`${className} d-flex align-items-center align-items-center gap-2`}>
      <div className='flex-grow-1 h-2px bg-gray-light' />
      <span className='text-muted'>{label}</span>
      <div className='flex-grow-1 h-2px bg-gray-light' />
    </div>
  )
}
