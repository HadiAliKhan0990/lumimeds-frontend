'use client';

import { SVGProps } from 'react';

interface Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export default function MonthlyCheckInIcon({ size, width, height, ...props }: Readonly<Props>) {
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
        d='M17.4987 14.1673V6.66732H5.83203V14.1673H17.4987ZM17.4987 2.50065C17.9407 2.50065 18.3646 2.67625 18.6772 2.98881C18.9898 3.30137 19.1654 3.72529 19.1654 4.16732V14.1673C19.1654 14.6093 18.9898 15.0333 18.6772 15.3458C18.3646 15.6584 17.9407 15.834 17.4987 15.834H5.83203C4.90703 15.834 4.16536 15.084 4.16536 14.1673V4.16732C4.16536 3.72529 4.34096 3.30137 4.65352 2.98881C4.96608 2.67625 5.39 2.50065 5.83203 2.50065H6.66536V0.833984H8.33203V2.50065H14.9987V0.833984H16.6654V2.50065H17.4987ZM14.607 9.21732L10.907 12.9173L8.6737 10.684L9.55703 9.80065L10.907 11.1507L13.7237 8.33398L14.607 9.21732ZM2.4987 17.5007H14.1654V19.1673H2.4987C1.5737 19.1673 0.832031 18.4173 0.832031 17.5007V7.50065H2.4987V17.5007Z'
        fill={props.fill || 'black'}
      />
    </svg>
  );
}
