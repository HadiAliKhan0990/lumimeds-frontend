'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

export const CustomToggle = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => {
  return <button {...props} className='btn-no-style' type='button' ref={ref} />;
});

CustomToggle.displayName = 'CustomToggle';
