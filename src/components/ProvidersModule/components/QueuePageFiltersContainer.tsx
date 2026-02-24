import React from 'react';

export interface QueuePageFiltersWrapperProps extends React.ComponentPropsWithoutRef<'div'> {
  className?: string;
}

export const QueuePageFiltersWrapper = ({ children, className, ...props }: QueuePageFiltersWrapperProps) => {
  return (
    <div
      {...props}
      className={`tw-flex-grow tw-flex tw-gap-2 tw-justify-end tw-items-center tw-flex-wrap ${className}`}
    >
      {children}
    </div>
  );
};
