import React from 'react'



export interface IExpressCheckoutWidget extends React.ComponentPropsWithoutRef<'button'> {
  icon: React.ReactNode;
  selected: boolean;
}
export const ExpressCheckoutWidget = ({
  icon,
  selected,
  ...props
}: IExpressCheckoutWidget) => {
  const {className, ...rest} = props
  return (
    <button {...rest} className={`${className} px-3 py-2  express-checkout-widget${selected ? '-selected' : ''}  d-flex align-items-center justify-content-center border border-c-light  cursor-pointer tw-rounded-lg`}>
      {icon}
    </button>
  )
}
