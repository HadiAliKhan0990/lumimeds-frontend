import React from 'react'



export interface QueuePageBulkActionContainerProps extends React.ComponentPropsWithoutRef<'div'> {
  className?: string;
}

export const QueuePageBulkActionContainer = ({ children, className, ...props }: QueuePageBulkActionContainerProps) => {
  return (
    <div {...props} className={`flex gap-2 items-center ${className}`}>
      {children}
    </div>
  )
}
