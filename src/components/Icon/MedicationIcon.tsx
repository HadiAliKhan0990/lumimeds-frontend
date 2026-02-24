'use client';

import { SVGProps } from 'react';

interface Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export default function MedicationIcon({ size, width, height, ...props }: Readonly<Props>) {
  return (
    <svg
      {...props}
      width={size || width || 20}
      height={size || height || 20}
      viewBox='0 0 20 20'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M4.7513 10.5H2.66797V8H4.7513V5.91667H7.2513V8H9.33464V10.5H7.2513V12.5833H4.7513V10.5ZM11.8346 4.66667V13.8333C11.8346 14.75 11.0846 15.5 10.168 15.5H1.83464C0.917969 15.5 0.167969 14.75 0.167969 13.8333V4.66667C0.167969 3.75 0.917969 3 1.83464 3H10.168C11.0846 3 11.8346 3.75 11.8346 4.66667ZM10.168 4.66667H1.83464V13.8333H10.168V4.66667ZM11.0013 0.5H1.0013V2.16667H11.0013V0.5Z'
        fill={props.fill || 'black'}
      />
    </svg>
  );
}
