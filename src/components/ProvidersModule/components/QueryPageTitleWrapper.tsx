import React from 'react'


export interface QueryPageTitleWrapperProps extends React.ComponentPropsWithoutRef<'div'> {
  className?: string;
}

export const QueryPageTitleWrapper = ({ children, className, ...props }: QueryPageTitleWrapperProps) => {
  return (
    <div {...props} className={`d-flex justify-content-between align-items-center ${className}`}>
      {children}
    </div>
  )
}
