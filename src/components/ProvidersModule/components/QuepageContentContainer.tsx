import React from 'react'


export interface QuepageContentContainerProps extends React.ComponentPropsWithoutRef<'div'> {
  className?: string;
}

export const QuepageContentContainer = ({ children, className, ...props }: QuepageContentContainerProps) => {
  return (
    <div {...props} className={`d-flex flex-column gap-4 ${className}`}>
      {children}
    </div>
  )
}
