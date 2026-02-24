import React from 'react';

export interface DottedChipProps extends React.ComponentPropsWithoutRef<'div'> {
  label: string;
  dotClassName?: string;
}

export const DottedChip = ({ label, dotClassName, ...restProps }: DottedChipProps) => {
  return (
    <span
      {...restProps}
      className={`w-fit text-small d-flex justify-content-center align-items-center gap-2 px-2 bg-medium-gray rounded-4 ${restProps?.className}`}
    >
      {label}
      <span className={`w-7 h-7 rounded-5 ${dotClassName}`}></span>
    </span>
  );
};
