import React from 'react'


export interface ProvidersPageContainerProps extends React.ComponentPropsWithoutRef<'div'> {
  className?: string;
}

export const ProvidersPageContainer = ({ children, className, ...props }: ProvidersPageContainerProps) => {
  return (
    <div {...props} className={`d-flex flex-column gap-4 ${className}`}>
      {children}
    </div>
  )
}
