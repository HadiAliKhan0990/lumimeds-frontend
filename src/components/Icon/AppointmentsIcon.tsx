import React from 'react';

interface AppointmentsIconProps {
  size?: number | string;
  className?: string;
}

export const AppointmentsIcon: React.FC<AppointmentsIconProps> = ({ size = 24, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={className}
    >
      <path
        d='M2 12.002C2 8.23072 2 6.3451 3.17157 5.17353C4.34315 4.00195 6.22876 4.00195 10 4.00195H14C17.7712 4.00195 19.6569 4.00195 20.8284 5.17353C22 6.3451 22 8.23072 22 12.002V14.002C22 17.7732 22 19.6588 20.8284 20.8304C19.6569 22.002 17.7712 22.002 14 22.002H10C6.22876 22.002 4.34315 22.002 3.17157 20.8304C2 19.6588 2 17.7732 2 14.002V12.002Z'
        stroke='currentColor'
        strokeWidth='1.5'
      />
      <path d='M7 4.00195V2.50195' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
      <path d='M17 4.00195V2.50195' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
      <path d='M2.5 9.00195H21.5' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
      <path
        d='M18 17.002C18 17.5542 17.5523 18.002 17 18.002C16.4477 18.002 16 17.5542 16 17.002C16 16.4497 16.4477 16.002 17 16.002C17.5523 16.002 18 16.4497 18 17.002Z'
        fill='currentColor'
      />
      <path
        d='M18 13.002C18 13.5542 17.5523 14.002 17 14.002C16.4477 14.002 16 13.5542 16 13.002C16 12.4497 16.4477 12.002 17 12.002C17.5523 12.002 18 12.4497 18 13.002Z'
        fill='currentColor'
      />
      <path
        d='M13 17.002C13 17.5542 12.5523 18.002 12 18.002C11.4477 18.002 11 17.5542 11 17.002C11 16.4497 11.4477 16.002 12 16.002C12.5523 16.002 13 16.4497 13 17.002Z'
        fill='currentColor'
      />
      <path
        d='M13 13.002C13 13.5542 12.5523 14.002 12 14.002C11.4477 14.002 11 13.5542 11 13.002C11 12.4497 11.4477 12.002 12 12.002C12.5523 12.002 13 12.4497 13 13.002Z'
        fill='currentColor'
      />
      <path
        d='M8 17.002C8 17.5542 7.55228 18.002 7 18.002C6.44772 18.002 6 17.5542 6 17.002C6 16.4497 6.44772 16.002 7 16.002C7.55228 16.002 8 16.4497 8 17.002Z'
        fill='currentColor'
      />
      <path
        d='M8 13.002C8 13.5542 7.55228 14.002 7 14.002C6.44772 14.002 6 13.5542 6 13.002C6 12.4497 6.44772 12.002 7 12.002C7.55228 12.002 8 12.4497 8 13.002Z'
        fill='currentColor'
      />
    </svg>
  );
};
