'use client';

import { SVGProps } from 'react';

interface Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function UserFeedbackIcon({ size, width, height, ...props }: Readonly<Props>) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      {...props}
      width={size ?? width}
      height={size ?? height}
      viewBox='0 0 24 24'
      fill='none'
    >
      <path
        d='M9 16.4277C9.85038 17.0581 10.8846 17.4277 12 17.4277C13.1154 17.4277 14.1496 17.0581 15 16.4277'
        stroke='white'
        strokeWidth='1.5'
        strokeLinecap='round'
      />
      <ellipse cx='15' cy='10.9277' rx='1' ry='1.5' fill='white' />
      <ellipse cx='9' cy='10.9277' rx='1' ry='1.5' fill='white' />
      <path
        d='M22 14.4277C22 18.199 22 20.0846 20.8284 21.2562C19.6569 22.4277 17.7712 22.4277 14 22.4277'
        stroke='white'
        strokeWidth='1.5'
        strokeLinecap='round'
      />
      <path
        d='M10 22.4277C6.22876 22.4277 4.34315 22.4277 3.17157 21.2562C2 20.0846 2 18.199 2 14.4277'
        stroke='white'
        strokeWidth='1.5'
        strokeLinecap='round'
      />
      <path
        d='M10 2.42773C6.22876 2.42773 4.34315 2.42773 3.17157 3.59931C2 4.77088 2 6.6565 2 10.4277'
        stroke='white'
        strokeWidth='1.5'
        strokeLinecap='round'
      />
      <path
        d='M14 2.42773C17.7712 2.42773 19.6569 2.42773 20.8284 3.59931C22 4.77088 22 6.6565 22 10.4277'
        stroke='white'
        strokeWidth='1.5'
        strokeLinecap='round'
      />
    </svg>
  );
}
