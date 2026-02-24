'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

export const FiltersToggle = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => {
  return (
    <button
      {...props}
      className='border bg-transparent p-0 d-flex align-items-center justify-content-center conversations_filters_toggler'
      type='button'
      ref={ref}
    />
  );
});

FiltersToggle.displayName = 'FiltersToggle';
