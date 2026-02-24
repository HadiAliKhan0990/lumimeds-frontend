import React, { ReactNode } from 'react';

export interface CheckboxLabelProps extends React.ComponentPropsWithoutRef<'label'> {
  children: ReactNode;
  className?: string;
}

export const CheckboxLabel = ({ children, className, ...restProps }: CheckboxLabelProps) => {
  return (
    <label {...restProps} className={`tw-flex tw-justify-center tw-items-center tw-gap-2 ${className}`}>
      {children}
    </label>
  );
};

export interface CheckboxInputProps extends React.ComponentPropsWithoutRef<'input'> {
  className?: string;
}

export const CheckboxInput = ({ className, ...restProps }: CheckboxInputProps) => {
  return <input {...restProps} className={`c_checkbox ${className}`} type='checkbox' />;
};

export interface CheckboxTextProps extends React.ComponentPropsWithoutRef<'span'> {
  className?: string;
}

export const CheckboxText = ({ children, className }: CheckboxTextProps) => {
  return <span className={`text-xs text-muted ${className}`}>{children}</span>;
};
