'use client';

import { SVGProps } from 'react';

interface Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function CurrencyIcon({ size, width, height, ...props }: Readonly<Props>) {
  return (
    <svg
      {...props}
      width={size ?? width}
      height={size ?? height}
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
    >
      <g fill='none' stroke='currentColor' strokeWidth='1.5'>
        <circle cx='12' cy='12' r='10' />
        <path
          strokeLinecap='round'
          d='M12 6v12m3-8.5C15 8.12 13.657 7 12 7S9 8.12 9 9.5s1.343 2.5 3 2.5s3 1.12 3 2.5s-1.343 2.5-3 2.5s-3-1.12-3-2.5'
        />
      </g>
    </svg>
  );
}
