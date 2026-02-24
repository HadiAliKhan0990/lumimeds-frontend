import React from 'react'


export interface ProvidersPageTitleProps extends React.ComponentPropsWithoutRef<'div'> {
  className?: string;
}

export const ProvidersPageTitle = ({ children, className, ...props }: ProvidersPageTitleProps) => {
  return (
    <div {...props} className={`fs-2 fw-medium ${className}`}>
      {children}
    </div>
  )
}
