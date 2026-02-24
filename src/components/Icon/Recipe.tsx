import { SVGProps } from 'react';

interface Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Recipe({ size, ...props }: Readonly<Props>) {
  return (
    <svg {...props} width={size} height={size} viewBox='0 0 17 17' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M5.39323 4.10417H10.7266M5.39323 6.77083H10.7266M5.39323 9.4375H10.7266M4.0599 1.4375H12.0599C12.7963 1.4375 13.3932 2.03445 13.3932 2.77083V12.6135C13.3932 13.6046 12.3501 14.2493 11.4636 13.806L11.3228 13.7356C10.9475 13.548 10.5056 13.548 10.1303 13.7356L8.65618 14.4727C8.28081 14.6604 7.83898 14.6604 7.46361 14.4727L5.98951 13.7356C5.61414 13.548 5.17231 13.548 4.79694 13.7356L4.65618 13.806C3.76965 14.2493 2.72656 13.6046 2.72656 12.6135V2.77083C2.72656 2.03445 3.32352 1.4375 4.0599 1.4375Z'
        stroke='currentColor'
        strokeWidth={1.2}
        strokeLinecap='round'
      />
    </svg>
  );
}
