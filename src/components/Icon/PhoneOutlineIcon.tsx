import React from 'react';

interface Props extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export default function PhoneOutlineIcon({ size, ...props }: Props) {
  return (
    <svg width={size} height={size} {...props} viewBox='0 0 20 21' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M5.4082 1.5791C6.49853 1.28123 7.64306 1.83741 8.07715 2.88574L8.15332 3.06934V3.07129L9.32617 5.88672L9.39062 6.06055C9.65507 6.87712 9.42988 7.77434 8.81152 8.37012L8.67383 8.49316L7.76367 9.23535C8.60154 10.6872 9.81188 11.8973 11.2637 12.7354L12.0107 11.8252C12.6398 11.0526 13.7026 10.7927 14.6162 11.1738L17.6162 12.4238H17.6152C18.6626 12.8584 19.2186 14.002 18.9209 15.0918L18.1709 17.8408L18.1699 17.8438C17.9012 18.8179 17.0158 19.5 16 19.5C7.71656 19.5 1.00015 12.7834 1 4.5C1 3.48423 1.68212 2.59783 2.65625 2.3291H2.65918L5.4082 1.58008V1.5791Z'
        stroke='currentColor'
        strokeWidth={2}
      />
    </svg>
  );
}
