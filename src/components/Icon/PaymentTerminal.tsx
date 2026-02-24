import { SVGProps } from 'react';

interface Props extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function PaymentTerminal({ size, ...props }: Readonly<Props>) {
  return (
    <svg {...props} width={size} height={size} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M19.5 15.75H16.5V10.5H19.5M20.25 9H15.75C15.5511 9 15.3603 9.07902 15.2197 9.21967C15.079 9.36032 15 9.55109 15 9.75V17.25C15 17.4489 15.079 17.6397 15.2197 17.7803C15.3603 17.921 15.5511 18 15.75 18H20.25C20.4489 18 20.6397 17.921 20.7803 17.7803C20.921 17.6397 21 17.4489 21 17.25V9.75C21 9.55109 20.921 9.36032 20.7803 9.21967C20.6397 9.07902 20.4489 9 20.25 9ZM6 7.5H19.5V6H6C5.60218 6 5.22064 6.15804 4.93934 6.43934C4.65804 6.72064 4.5 7.10218 4.5 7.5V15.75H3V18H13.5V15.75H6V7.5Z'
        fill='currentColor'
      />
    </svg>
  );
}
