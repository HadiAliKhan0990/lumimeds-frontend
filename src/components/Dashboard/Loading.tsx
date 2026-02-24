'use client';

import { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

export default function Loading({ size, className, style, ...props }: Props) {
  return (
    <div className={`d-flex w-100 h-100 align-items-center justify-content-center ${className}`} {...props}>
      <div
        style={{
          width: `${size || 75}px !important`,
          height: `${size || 75}px !important`,
          ...style,
        }}
        className={`spinner-border`}
        role='status'
      />
    </div>
  );
}
